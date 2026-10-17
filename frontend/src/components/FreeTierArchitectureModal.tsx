import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Server, Database, Globe, CheckCircle2, Copy, 
  ExternalLink, Layers, Sparkles, Terminal, ShieldCheck 
} from 'lucide-react';

export const FreeTierArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setIsArchitectureModalOpen, backendStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'backend' | 'frontend' | 'database'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [serverStats, setServerStats] = useState<any>(null);

  useEffect(() => {
    if (isArchitectureModalOpen) {
      fetch('/api/stats')
        .then(res => res.json())
        .then(json => setServerStats(json.data))
        .catch(() => {});
    }
  }, [isArchitectureModalOpen]);

  if (!isArchitectureModalOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f111e] border border-[#26293f] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2238] bg-[#141628]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f5a623]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Full-Stack Free Tier Architecture</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  $0.00 / Month
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Frontend (GitHub Pages) + Backend (Render) + Database (Supabase / SQLite)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsArchitectureModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#20233c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="px-6 py-2.5 bg-[#0b0d18] border-b border-[#1b1e2f] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-gray-300 font-medium">
              API Status: {backendStatus === 'connected' ? 'Connected to REST Backend (/api)' : 'Local Storage Mode (Online Fallback)'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <span>DB: <strong className="text-amber-400">{serverStats?.databaseType || 'Persistent JSON / Supabase Ready'}</strong></span>
            <span>Total Temples: <strong className="text-white">{serverStats?.totalTemples || 8}</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1f2238] bg-[#121424] px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#f5a623] text-[#f5a623]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview & Folders
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'backend'
                ? 'border-[#f5a623] text-[#f5a623]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Backend Folder (`backend/`)
          </button>
          <button
            onClick={() => setActiveTab('frontend')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'frontend'
                ? 'border-[#f5a623] text-[#f5a623]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Frontend Folder (`frontend/`)
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-[#f5a623] text-[#f5a623]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Database Choice
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#14172a] border border-[#232742]">
                  <div className="flex items-center gap-2 mb-2 text-[#f5a623] font-semibold text-sm">
                    <Globe className="w-4 h-4" />
                    Frontend
                  </div>
                  <p className="text-gray-400 text-[11px] mb-2 leading-relaxed">
                    React 19, Vite, Tailwind CSS, Tamil fonts, mobile frame.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Deploy: <strong>GitHub Pages (Free)</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Directory: <code>frontend/</code></div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#14172a] border border-[#232742]">
                  <div className="flex items-center gap-2 mb-2 text-sky-400 font-semibold text-sm">
                    <Server className="w-4 h-4" />
                    Backend API
                  </div>
                  <p className="text-gray-400 text-[11px] mb-2 leading-relaxed">
                    Node.js + Express REST API with CRUD, auth, review workflow, analytics.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Deploy: <strong>Render.com Web Service (Free)</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">Directory: <code>backend/</code></div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#14172a] border border-[#232742]">
                  <div className="flex items-center gap-2 mb-2 text-violet-400 font-semibold text-sm">
                    <Database className="w-4 h-4" />
                    Database
                  </div>
                  <p className="text-gray-400 text-[11px] mb-2 leading-relaxed">
                    Zero-config persistent store OR Supabase PostgreSQL with schema.sql.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Deploy: <strong>Supabase Free Tier (500MB)</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">File: <code>backend/src/db/schema.sql</code></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#131526] border border-[#20233b] space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Why this setup is 100% Free Forever:
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                  <li><strong>GitHub Pages:</strong> Completely free hosting for static frontends, unlimited bandwidth for personal/org sites, custom domain support.</li>
                  <li><strong>Render.com Free Tier:</strong> 750 free instance hours per month, automatically spins up when users make requests.</li>
                  <li><strong>Supabase Free Tier:</strong> Free PostgreSQL instance with 500 MB database storage, daily backups, and REST APIs.</li>
                  <li><strong>Zero Lock-in:</strong> Can also run as a single combined container locally or on Railway / Fly.io with <code>npm start</code>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b]">
                <h3 className="font-bold text-white text-sm mb-1">Backend Folder Structure (`backend/`)</h3>
                <p className="text-gray-400 text-[11px] mb-3">
                  Self-contained Express application with full TypeScript configuration and production scripts.
                </p>
                <div className="p-3 bg-[#0a0c14] rounded-lg font-mono text-[11px] text-gray-300 space-y-1">
                  <div>backend/</div>
                  <div>├── package.json          # Express, cors, dotenv, tsx</div>
                  <div>├── tsconfig.json          # NodeNext module configuration</div>
                  <div>├── .env.example           # Port, FRONTEND_URL, DATABASE_URL</div>
                  <div>├── README.md              # Step-by-step Render deployment tutorial</div>
                  <div>└── src/</div>
                  <div>    ├── server.ts          # Standalone server entry point</div>
                  <div>    ├── app.ts             # Express app & route mounting</div>
                  <div>    ├── routes/            # temples.ts, submissions.ts, users.ts, bookmarks.ts, meta.ts</div>
                  <div>    └── db/                # database.ts (CRUD engine), schema.sql (Supabase DDL)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">How to deploy backend to Render Free Tier:</span>
                  <button
                    onClick={() => handleCopy(`git push origin main`, 'gitpush')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    {copiedText === 'gitpush' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy command
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-400 text-[11px]">
                  <li>Log in to <strong className="text-gray-200">dashboard.render.com</strong> and click <strong>New +</strong> &gt; <strong>Web Service</strong>.</li>
                  <li>Connect your GitHub repo.</li>
                  <li>Set <strong>Root Directory</strong> to <code>backend</code> (or leave root for monorepo).</li>
                  <li>Set <strong>Build Command</strong>: <code>npm install && npm run build</code></li>
                  <li>Set <strong>Start Command</strong>: <code>npm run start</code></li>
                  <li>Select <strong>Free Instance</strong>. Render will generate a live URL (e.g. <code>https://mupporul-backend.onrender.com</code>).</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b]">
                <h3 className="font-bold text-white text-sm mb-1">Frontend Folder Structure (`frontend/`)</h3>
                <p className="text-gray-400 text-[11px] mb-3">
                  Standalone React 19 SPA preconfigured with relative paths (<code>base: './'</code>) for GitHub Pages compatibility.
                </p>
                <div className="p-3 bg-[#0a0c14] rounded-lg font-mono text-[11px] text-gray-300 space-y-1">
                  <div>frontend/</div>
                  <div>├── package.json          # React 19, Vite, Tailwind CSS 4, Lucide</div>
                  <div>├── vite.config.ts         # Configured with base: './' and proxy</div>
                  <div>├── .env.example           # VITE_API_URL=https://your-backend.onrender.com/api</div>
                  <div>├── README.md              # GitHub Actions deploy workflow</div>
                  <div>└── src/                   # Components, context, data, services, types</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b] space-y-2">
                <span className="font-semibold text-white">How to deploy frontend to GitHub Pages:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-400 text-[11px]">
                  <li>In your GitHub repo, go to <strong>Settings</strong> &gt; <strong>Pages</strong>.</li>
                  <li>Set <strong>Source</strong> to <strong>GitHub Actions</strong>.</li>
                  <li>Add <code>.github/workflows/deploy.yml</code> (full copy-paste workflow in <code>frontend/README.md</code>).</li>
                  <li>Set secret or variable <code>VITE_API_URL</code> to your Render backend API URL.</li>
                  <li>Commit & push. GitHub automatically builds and deploys to <code>https://&lt;username&gt;.github.io/&lt;repo&gt;/</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b]">
                <h3 className="font-bold text-white text-sm mb-1">Database Choice: Supabase Free Tier vs Built-in</h3>
                <p className="text-gray-400 text-[11px] mb-3">
                  The backend features a dual-engine database architecture that supports both options seamlessly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-[#0c0e1a] border border-[#1f2238]">
                    <div className="font-bold text-amber-400 mb-1">Option 1: Built-in Store (Default)</div>
                    <p className="text-gray-400 mb-2">
                      Zero setup. Saves directly to <code>backend/data/mupporul_db.json</code>. No account, no keys, works out of the box anywhere.
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold">100% Free • Zero Configuration</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0c0e1a] border border-[#1f2238]">
                    <div className="font-bold text-sky-400 mb-1">Option 2: Supabase PostgreSQL (Free)</div>
                    <p className="text-gray-400 mb-2">
                      500 MB cloud PostgreSQL database with relational tables, foreign keys, and indexes. Run <code>schema.sql</code> and pass <code>DATABASE_URL</code>.
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold">100% Free • Production Scalable</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131526] border border-[#20233b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Supabase Schema Location:</span>
                  <span className="text-[11px] text-gray-400 font-mono">backend/src/db/schema.sql</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  To activate Supabase, create a project at <strong>supabase.com</strong>, open the SQL Editor, paste the contents of <code>backend/src/db/schema.sql</code>, and copy your connection string into Render's <code>DATABASE_URL</code> environment variable.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1f2238] bg-[#121424] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready for 100% Free Tier Hosting</span>
          </div>
          <button
            onClick={() => setIsArchitectureModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#f5a623] hover:bg-amber-400 text-black font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
