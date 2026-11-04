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
   - `SUPABASE_URL`: the Project URL from Supabase > Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY`: the server-side service role key from Supabase > Project Settings > API
   - `SUPABASE_STORAGE_BUCKET`: `temple-images` (optional; this is the default)

   Keep the service role key in Render's backend environment only. Do not add it to GitHub Pages,
   any `VITE_*` setting, or a committed file. `DATABASE_URL` alone does not configure this API.

4. Click **Deploy Web Service**.
   Your backend will be live at: `https://mupporul-backend.onrender.com`!

---

## Supabase setup

The backend uses the Supabase REST API. It does not connect through `DATABASE_URL`.

1. Create a project at [supabase.com](https://supabase.com), or select an existing project.
2. In the Supabase dashboard, open **SQL Editor** and choose **New query**.
3. Open `backend/src/db/schema.sql` from this repository, copy the complete SQL script, and paste it into the SQL Editor.
4. Click **Run**. The script creates or updates the backend tables, enables row-level security without public table policies, creates the public temple-image bucket, and seeds the deity list. It does not create an administrator or add credentials.
5. In **Project Settings > API**, copy the **Project URL** and server-side **service role** key. In Render's backend service **Environment** settings, add them as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. For local development, copy `backend/.env.example` to `backend/.env` and set those same values there.
6. Restart/redeploy the backend and check `GET /api/health` and `GET /api/stats`; the stats response should report `isSupabase: true`.

Never expose or commit `SUPABASE_SERVICE_ROLE_KEY`. It bypasses row-level security and must only be available to the backend. The schema deliberately does not grant anonymous clients read/write access to the application tables; use the backend API.

### Optional: apply the SQL with psql

If PostgreSQL's `psql` client is installed, copy the database connection string from the Supabase dashboard and set it locally as `SUPABASE_DB_URL` (do not commit it). From the repository root run:

```sh
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f backend/src/db/schema.sql
```

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
- `GET /api/stats` - Admin overview analytics
