# Mupporul Frontend (100% Free Tier)

Modern React + Vite + Tailwind CSS single-page web app for **Mupporul - Sacred Temples & Navagraha Pariharam**.

Designed to be hosted on **GitHub Pages Free Tier** (or **Vercel / Netlify / Cloudflare Pages Free Tiers**).

---

## 🚀 Free Tier Deployment to GitHub Pages ($0.00 / Month)

GitHub Pages hosts static websites directly from your GitHub repository for free forever.

### Method A: Automated GitHub Actions (Recommended)

1. Push this code to a GitHub repository (e.g. `https://github.com/your-username/mupporul-temples`).

2. In your repo, go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

3. Create the workflow file at `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy Frontend to GitHub Pages

   on:
     push:
       branches: ['main']

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build with Backend API URL
           env:
             VITE_API_URL: https://mupporul-backend.onrender.com/api
           run: npm run build

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

4. Push to `main`, and your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`!

---

### Method B: Manual Build & Deploy (`gh-pages`)

1. Install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```

2. Add script to `package.json`:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```

3. Run:
   ```bash
   npm run deploy
   ```

---

## ⚙️ Connecting to Backend API

In `frontend/.env`:
```env
VITE_API_URL=https://<your-render-app>.onrender.com/api
```
When `VITE_API_URL` is omitted, the frontend automatically proxies requests to `/api` on the current host.
