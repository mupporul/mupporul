# Mupporul Frontend (100% Free Tier)

Modern React + Vite + Tailwind CSS single-page web app for **Mupporul - Sacred Temples & Navagraha Pariharam**.

Designed to be hosted on **GitHub Pages Free Tier** (or **Vercel / Netlify / Cloudflare Pages Free Tiers**).

---

## 🚀 Free Tier Deployment to GitHub Pages ($0.00 / Month)

GitHub Pages hosts static websites directly from your GitHub repository for free forever.

### Automated GitHub Actions deployment (recommended)

The repository workflow at `.github/workflows/deploy.yml` builds the frontend from the repository root and deploys it to GitHub Pages when changes are pushed to `main`.

1. In the repository, open **Settings** > **Pages** and select **GitHub Actions** as the build and deployment source.
2. In **Settings** > **Secrets and variables** > **Actions** > **Variables**, add `VITE_API_URL` with the deployed Render API URL, including `/api` (for example, `https://<your-render-service>.onrender.com/api`). This is a public URL, not a secret.
3. Push to `main` or run the workflow manually from the **Actions** tab. The workflow runs the test suite, builds the frontend, and deploys the `dist` artifact.

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

For local development, set `VITE_API_URL` in `frontend/.env`:
```env
VITE_API_URL=https://<your-render-app>.onrender.com/api
```
The deployment workflow reads the same setting from the GitHub Actions repository variable. If it is unset, the frontend retains its existing default backend URL.
