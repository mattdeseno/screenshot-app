const express = require('express');
const { chromium } = require('playwright');
const url = require('url');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

// Global browser instance (lazy loaded)
let browser = null;

/**
 * Initialize the Chromium browser instance
 * Called once on first request, then reused for performance
 */
async function initializeBrowser() {
  if (!browser) {
    console.log('Initializing Chromium browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser initialized successfully');
  }
  return browser;
}

/**
 * Validate that a URL is safe to screenshot
 * - Must be HTTP or HTTPS
 * - Must not be a local/private network address
 * - Must not be a file:// URL
 */
function validateUrl(urlString) {
  try {
    const parsedUrl = new url.URL(urlString);

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }

    const hostname = parsedUrl.hostname;

    // Block localhost and 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        valid: false,
        error: 'Local addresses (localhost, 127.0.0.1) are not allowed'
      };
    }

    // Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // Link-local addresses
      /^::1$/, // IPv6 loopback
      /^fc00:/i, // IPv6 private
      /^fe80:/i // IPv6 link-local
    ];

    if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
      return {
        valid: false,
        error: 'Private network addresses are not allowed (SSRF protection)'
      };
    }

    // Block 0.0.0.0 and other reserved addresses
    if (hostname === '0.0.0.0' || hostname === '::') {
      return {
        valid: false,
        error: 'Reserved addresses are not allowed'
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid URL format: ${err.message}`
    };
  }
}

/**
 * POST /screenshot
 * Takes a screenshot of the provided URL
 * 
 * Request body: { "url": "https://example.com" }
 * Response: PNG image data with Content-Type: image/png
 */
app.post('/screenshot', async (req, res) => {
  const { url: targetUrl } = req.body;

  // Validate request body
  if (!targetUrl) {
    return res.status(400).json({
      error: 'Missing required field: url'
    });
  }

  // Validate the URL for security
  const validation = validateUrl(targetUrl);
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error
    });
  }

  let page = null;
  try {
    // Initialize browser if needed
    const browserInstance = await initializeBrowser();

    // Create a new page context
    page = await browserInstance.newPage();

    // Set a reasonable timeout (30 seconds)
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log(`Taking screenshot of: ${targetUrl}`);

    // Navigate to the URL and wait for network to be idle
    // This ensures all resources are loaded
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Take a full-page screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    // Return the PNG with correct content type
    res.type('image/png');
    res.send(screenshotBuffer);

    console.log(`Screenshot successful for: ${targetUrl}`);
  } catch (error) {
    // Handle specific error types
    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return res.status(400).json({
        error: 'Domain not found or cannot be resolved'
      });
    }

    if (error.message.includes('Timeout')) {
      return res.status(504).json({
        error: 'Page load timeout - the website took too long to respond'
      });
    }

    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      return res.status(400).json({
        error: 'Connection refused - the server rejected the connection'
      });
    }

    // Generic error response
    console.error(`Screenshot error for ${targetUrl}:`, error.message);
    return res.status(500).json({
      error: `Failed to take screenshot: ${error.message}`
    });
  } finally {
    // Clean up the page (but keep browser running for next request)
    if (page) {
      await page.close();
    }
  }
});

/**
 * GET /health
 * Simple health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Screenshot service is running' });
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`\n✓ Screenshot backend running on http://localhost:${PORT}`);
  console.log(`✓ POST /screenshot - Submit a URL to get a screenshot`);
  console.log(`✓ GET /health - Check service status\n`);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
