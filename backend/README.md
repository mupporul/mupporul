# Mupporul Backend (100% Free Tier)

Express REST API for **Mupporul - Sacred Temples & Navagraha Pariharam**.

Designed to be hosted on **Render.com Free Tier** or **Railway / Fly.io / Glitch / Local**, with zero ongoing costs.

---

## 🚀 Free Tier Architecture

| Component | Free Provider | Free Tier Limits | Cost |
| :--- | :--- | :--- | :--- |
| **Backend API** | [Render.com](https://render.com) Web Service | 750 free hours/month (enough for 24/7 single web service) | **$0.00** |
| **Relational Database** | [Supabase](https://supabase.com) (PostgreSQL) | 500 MB storage, 50,000 monthly active users, automated daily backups | **$0.00** |
| **Default Database** | Built-in Persistent JSON Store | Zero configuration, runs anywhere without third-party services | **$0.00** |

---

## 🛠️ Local Development

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test endpoints:
   - Health check: `http://localhost:5000/api/health`
   - Temples list: `http://localhost:5000/api/temples`
   - Stats: `http://localhost:5000/api/stats`

---

## 🌐 Deploy to Render.com (100% Free)

1. **Push to GitHub**:
   Push this repository to your GitHub account.

2. **Create New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** > **Web Service**.
   - Connect your GitHub repository.
   - Configure the following settings:
     - **Name**: `mupporul-backend`
     - **Root Directory**: `backend` (or leave empty if separate repo)
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start` (or `node dist/server.js`)
     - **Instance Type**: **Free** (0.1 CPU, 512 MB RAM)

3. **Environment Variables**:
   Under the **Environment** tab on Render, add:
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://<your-username>.github.io` (your GitHub Pages URL)
   - *(Optional for Supabase)* `DATABASE_URL`: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

4. Click **Deploy Web Service**.
   Your backend will be live at: `https://mupporul-backend.onrender.com`!

---

## 🗄️ Supabase Free Tier Setup (Optional)

If you wish to use Supabase PostgreSQL instead of the built-in storage:
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project (e.g. `mupporul-db`).
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy and paste the contents of `src/db/schema.sql` and click **Run**.
5. Copy your connection string from **Project Settings** > **Database** > **URI**.
6. Set `DATABASE_URL` in your `.env` or Render environment variables!

---

## 📡 API Endpoints

- `GET /api/temples` - List temples with filtering (`?planets=sani,suri&planetMatchMode=exact&deity=amman&search=melmalayanoor`)
- `GET /api/temples/:id` - Fetch single temple & increment views
- `POST /api/temples` - Direct create temple (Admin)
- `PUT /api/temples/:id` - Update temple
- `DELETE /api/temples/:id` - Remove temple
- `GET /api/submissions` - List submissions (`?status=pending`)
- `POST /api/submissions` - Submit new temple or correction
- `PUT /api/submissions/:id/review` - Approve or reject submission (`action=approved|rejected`)
- `GET /api/users` - User directory
- `POST /api/users/login` - Authenticate (`username`, `password`)
- `GET /api/bookmarks?userId=...` - Get user bookmarks
- `POST /api/bookmarks/toggle` - Toggle bookmark (`userId`, `templeId`)
- `GET /api/stats` - Admin overview analytics
