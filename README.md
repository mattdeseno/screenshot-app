# Website Screenshot Generator

A simple, secure web application that captures full-page screenshots of any public website. Built with Node.js/Express backend using Playwright and a clean, responsive HTML frontend.

## Features

- **Full-page screenshots**: Captures the entire page, not just the viewport
- **Security-first design**: Blocks SSRF attacks by preventing local/private network access
- **URL validation**: Rejects invalid URLs and non-HTTP(S) protocols
- **Error handling**: Clear error messages for timeouts, DNS failures, and connection issues
- **Responsive UI**: Works on desktop and mobile devices
- **Example buttons**: Quick access to test with popular websites
- **Download support**: Save screenshots as PNG files with automatic naming

## Project Structure

```
screenshot-app/
├── backend/
│   ├── server.js          # Express server with Playwright integration
│   ├── package.json       # Backend dependencies
│   └── node_modules/      # Installed packages (created after npm install)
├── frontend/
│   └── index.html         # Single-page HTML application
└── README.md              # This file
```

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Installation

### Step 1: Clone or download the project

```bash
# If you have the files, navigate to the project directory
cd screenshot-app
```

### Step 2: Install backend dependencies

```bash
cd backend
npm install
```

This will install:
- **express**: Web framework for the API
- **playwright**: Headless browser automation
- **cors**: Cross-origin resource sharing middleware

### Step 3: Install Playwright browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser that Playwright will use to take screenshots. This is a one-time setup step.

## Running the Application

### Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see output like:

```
✓ Screenshot backend running on http://localhost:4000
✓ POST /screenshot - Submit a URL to get a screenshot
✓ GET /health - Check service status
```

The backend is now listening on **http://localhost:4000**.

### Open the Frontend

Open another terminal (or browser tab) and navigate to the frontend:

```bash
# Option 1: Open the file directly in your browser
open frontend/index.html
# or on Linux:
xdg-open frontend/index.html
# or on Windows:
start frontend/index.html

# Option 2: Use a simple HTTP server (optional)
cd frontend
python3 -m http.server 8000
# Then visit http://localhost:8000 in your browser
```

## Usage

1. **Enter a URL**: Type or paste a website URL in the input field (e.g., `https://www.google.com`)
2. **Generate Screenshot**: Click the "Generate Screenshot" button or press Enter
3. **Wait**: The page will show a loading message while the screenshot is being captured
4. **View Result**: The screenshot appears below the input field
5. **Download**: Click "Download PNG" to save the screenshot to your computer

### Quick Test with Examples

The frontend includes example buttons for popular websites:
- Google
- GitHub
- Wikipedia
- BBC News

Click any of these to instantly test the application.

## API Reference

### POST /screenshot

Takes a screenshot of the provided URL.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Successful Response (200 OK):**
- Content-Type: `image/png`
- Body: PNG image bytes

**Error Response (400 Bad Request):**
```json
{
  "error": "Error description"
}
```

**Error Response (504 Gateway Timeout):**
```json
{
  "error": "Page load timeout - the website took too long to respond"
}
```

### GET /health

Simple health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Screenshot service is running"
}
```

## Security Features

### SSRF Protection

The backend prevents Server-Side Request Forgery attacks by blocking:
- **Localhost addresses**: `localhost`, `127.0.0.1`
- **Private IP ranges**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- **Link-local addresses**: `169.254.0.0/16`
- **IPv6 private/loopback**: `::1`, `fc00::/7`, `fe80::/10`
- **Reserved addresses**: `0.0.0.0`, `::`

### Protocol Validation

Only HTTP and HTTPS URLs are accepted. Other protocols (FTP, file://, etc.) are rejected.

### URL Validation

All URLs are validated for proper format before processing.

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Only HTTP and HTTPS URLs are allowed" | Invalid protocol (FTP, file://, etc.) | Use a URL starting with `http://` or `https://` |
| "Local addresses (localhost, 127.0.0.1) are not allowed" | Trying to screenshot local server | Use a public website URL |
| "Private network addresses are not allowed" | Trying to access private IP (192.168.x.x, etc.) | Use a public website URL |
| "Domain not found or cannot be resolved" | DNS lookup failed | Check the domain spelling and internet connection |
| "Connection refused" | Server rejected the connection | The website may be down or blocking requests |
| "Page load timeout" | Website took too long to load | Try a different website or check your internet connection |
| "Cannot connect to backend" | Backend server not running | Make sure to run `npm start` in the backend directory |

## Troubleshooting

### Backend won't start

**Problem**: "Cannot find module 'express'" or similar error

**Solution**: Make sure you ran `npm install` in the backend directory:
```bash
cd backend
npm install
```

### Playwright browser not found

**Problem**: "Executable doesn't exist at /home/ubuntu/.cache/ms-playwright/..."

**Solution**: Install Playwright browsers:
```bash
cd backend
npx playwright install chromium
```

### Frontend can't connect to backend

**Problem**: "Cannot connect to backend. Make sure the server is running on port 4000."

**Solution**: 
1. Verify the backend is running: `curl http://localhost:4000/health`
2. Check if port 4000 is in use: `lsof -i :4000` (macOS/Linux)
3. If port is in use, kill the process or change the PORT in `server.js`

### Screenshots are blank or incomplete

**Problem**: Screenshot shows a blank page or incomplete content

**Solution**: 
- Some websites may block headless browsers. Try a different website.
- The website may require JavaScript to render. Playwright waits for "networkidle" which handles most cases.
- Try increasing the timeout by modifying `page.setDefaultTimeout(30000)` in `server.js` to a higher value (in milliseconds).

### Port 4000 already in use

**Problem**: "Error: listen EADDRINUSE: address already in use :::4000"

**Solution**: Either kill the existing process or change the port:

```bash
# Option 1: Kill the process using port 4000
lsof -i :4000 | grep node | awk '{print $2}' | xargs kill -9

# Option 2: Change the port in server.js
# Edit the line: const PORT = 4000;
# Change to: const PORT = 4001; (or any available port)
```

## Development Notes

### Code Structure

**Backend (server.js):**
- Middleware setup (Express, CORS)
- Browser initialization (lazy-loaded on first request)
- URL validation function with SSRF protection
- POST /screenshot endpoint with error handling
- Graceful shutdown handling

**Frontend (index.html):**
- Self-contained HTML/CSS/JavaScript
- Responsive design with gradient background
- Fetch API for backend communication
- URL normalization (adds https:// if missing)
- Image blob handling and download functionality

### Customization

**Change backend port:**
Edit `backend/server.js`:
```javascript
const PORT = 4000; // Change this number
```

**Adjust screenshot timeout:**
Edit `backend/server.js`:
```javascript
page.setDefaultTimeout(30000); // Change to desired milliseconds
```

**Modify frontend styling:**
Edit `frontend/index.html` - all CSS is in the `<style>` tag.

**Add more example buttons:**
Edit `frontend/index.html` - add more buttons in the "example-urls" div:
```html
<button class="example-btn" data-url="https://example.com">Example</button>
```

## Performance Notes

- First screenshot takes longer (5-10 seconds) as Chromium initializes
- Subsequent screenshots are faster (2-5 seconds) as the browser is reused
- Full-page screenshots of complex websites may take longer
- Large screenshots consume memory; the browser is kept alive for performance

## Limitations

- Cannot screenshot websites that require authentication
- Some websites may block headless browser access
- JavaScript-heavy sites may not render correctly if they require user interaction
- Very large pages may take longer to screenshot
- Some websites may have CORS restrictions preventing requests from the frontend

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review error messages carefully - they provide specific guidance
3. Test with different websites to isolate the problem
4. Verify the backend is running with `curl http://localhost:4000/health`

## Future Enhancements

Possible improvements:
- Add authentication for the API
- Support for custom viewport sizes
- Screenshot cropping/editing
- Batch screenshot processing
- Screenshot history/caching
- Custom user agent support
- PDF export option
- Mobile device emulation
