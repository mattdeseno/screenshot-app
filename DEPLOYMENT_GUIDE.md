# Deployment Guide

Your screenshot app is now on GitHub! Follow these steps to complete the deployment.

## ✅ What's Already Done

- ✅ GitHub repository created: https://github.com/mattdeseno/screenshot-app
- ✅ Code pushed to GitHub
- ✅ GitHub Pages enabled for frontend
- ✅ GitHub Actions workflow configured
- ✅ Frontend will be live at: https://mattdeseno.github.io/screenshot-app/

## 🚀 Next Steps: Deploy Backend to Leapcell

### Step 1: Connect Leapcell to GitHub

1. Go to your Leapcell dashboard: https://leapcell.io/workspace
2. Click **"+ Create Service"** button (yellow button on the left)
3. Select **"Deploy from GitHub"**
4. If prompted, click **"Authorize Leapcell"** to connect your GitHub account
5. Select the repository: **`mattdeseno/screenshot-app`**
6. Click **"Continue"** or **"Deploy"**

### Step 2: Configure the Service

Leapcell will auto-detect your Node.js app. Configure these settings:

**Build Settings:**
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx playwright install chromium`
- **Start Command**: `node server.js`

**Runtime Settings:**
- **Runtime**: Node.js 20
- **Port**: `4000` (or `8080` if Leapcell requires it - update server.js accordingly)

**Environment Variables** (if needed):
- `NODE_ENV`: `production`

### Step 3: Deploy

1. Click **"Deploy"** or **"Create Service"**
2. Wait for deployment to complete (2-5 minutes)
3. Copy your Leapcell service URL (e.g., `https://screenshot-app-xxxxx.leapcell.app`)

### Step 4: Update Frontend with Backend URL

1. Go to your GitHub repository: https://github.com/mattdeseno/screenshot-app
2. Open `index.html` in the browser
3. Click the **"Edit"** button (pencil icon)
4. Find this line (around line 236):
   ```javascript
   : 'REPLACE_WITH_YOUR_LEAPCELL_URL/screenshot';
   ```
5. Replace with your actual Leapcell URL:
   ```javascript
   : 'https://your-app-name.leapcell.app/screenshot';
   ```
6. Scroll down and click **"Commit changes"**
7. Add commit message: "Update backend URL"
8. Click **"Commit changes"**

### Step 5: Test Your App

1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Visit: https://mattdeseno.github.io/screenshot-app/
3. Enter a URL (e.g., `https://www.google.com`)
4. Click **"Generate Screenshot"**
5. You should see the screenshot!

## 📝 Important Notes

### Backend Port Configuration

If Leapcell requires port 8080 instead of 4000, update `backend/server.js`:

```javascript
// Change this line:
const PORT = 4000;

// To this:
const PORT = process.env.PORT || 8080;
```

Then commit and push:
```bash
git add backend/server.js
git commit -m "Use PORT environment variable"
git push
```

Leapcell will auto-deploy the update.

### CORS Configuration

The backend already has CORS enabled for all origins. If you want to restrict it to only your frontend:

```javascript
// In backend/server.js, replace:
app.use(cors());

// With:
app.use(cors({
  origin: 'https://mattdeseno.github.io'
}));
```

### Custom Domain (Optional)

**For Frontend (GitHub Pages):**
1. Go to repo Settings → Pages
2. Add your custom domain
3. Update DNS records as instructed

**For Backend (Leapcell):**
1. Go to Leapcell service settings
2. Add custom domain
3. Update DNS records as instructed

## 🔧 Troubleshooting

### Frontend shows "Cannot connect to backend"

**Cause**: Backend URL not configured or backend not deployed

**Solution**:
1. Check that backend is deployed on Leapcell
2. Verify the backend URL in `index.html` is correct
3. Test backend directly: `curl https://your-backend-url.leapcell.app/health`

### Backend deployment fails on Leapcell

**Cause**: Playwright installation might fail or timeout

**Solution**:
1. Check Leapcell build logs
2. Ensure build command includes: `npx playwright install chromium`
3. If timeout, try deploying again (Playwright download can be slow)

### Screenshots are blank

**Cause**: Playwright browser not installed

**Solution**:
1. Verify build command includes: `npx playwright install chromium`
2. Check Leapcell logs for Playwright errors
3. Redeploy if needed

### GitHub Pages shows 404

**Cause**: GitHub Pages still building

**Solution**:
1. Wait 2-3 minutes for initial deployment
2. Check repo Settings → Pages for status
3. Verify `index.html` exists in root directory

## 📊 Monitoring

### Check Backend Health

```bash
curl https://your-backend-url.leapcell.app/health
```

Should return:
```json
{"status":"ok","message":"Screenshot service is running"}
```

### Test Screenshot Endpoint

```bash
curl -X POST https://your-backend-url.leapcell.app/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  --output test.png
```

Should create `test.png` with a screenshot.

## 🎉 You're Done!

Your app is now fully deployed:

- **Frontend**: https://mattdeseno.github.io/screenshot-app/
- **Backend**: https://your-app-name.leapcell.app
- **Repository**: https://github.com/mattdeseno/screenshot-app

### Auto-Deployment

Every time you push to GitHub:
- Frontend auto-updates on GitHub Pages
- Backend auto-deploys on Leapcell (if connected)

## 📚 Additional Resources

- [Leapcell Documentation](https://docs.leapcell.io)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Playwright Documentation](https://playwright.dev)

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Leapcell build logs
3. Test backend health endpoint
4. Verify frontend backend URL configuration
