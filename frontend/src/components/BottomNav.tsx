import React from 'react';
import { Home, ClipboardList, HelpCircle, User, BarChart3, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    submissions,
    currentUser,
    openAddModal,
  } = useApp();

  const pendingReviewCount = submissions.filter(s => s.status === 'pending').length;
  const isContributorOrAdmin = currentUser.role === 'contributor' || currentUser.role === 'admin';

  return (
    <div className="sticky bottom-0 shrink-0 w-full z-40 bg-[#0d0f18]/95 backdrop-blur-lg border-t border-[#1f2233] px-1 sm:px-2 py-1">
      <nav className="flex items-center justify-between w-full">
        {/* Temples Tab */}
        <button
          onClick={() => setActiveTab('temples')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'temples' ? 'text-[#f5a623]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight truncate max-w-full text-center">Temples</span>
          {activeTab === 'temples' && (
            <span className="w-6 h-0.5 bg-[#f5a623] rounded-full absolute bottom-0" />
          )}
        </button>

        {/* Review Tab (With Badge Count) */}
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'review' ? 'text-[#f5a623]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative shrink-0">
            <ClipboardList className="w-5 h-5 mb-0.5" />
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#f5a623] text-black text-[9px] font-extrabold flex items-center justify-center ring-1 ring-black">
                {pendingReviewCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight truncate max-w-full text-center">Review</span>
          {activeTab === 'review' && (
            <span className="w-6 h-0.5 bg-[#f5a623] rounded-full absolute bottom-0" />
          )}
        </button>

        {/* Floating Quick Add Button for Contributors & Admins */}
        {isContributorOrAdmin && (
          <button
            onClick={openAddModal}
            className="w-9 h-9 sm:w-10 sm:h-10 mx-0.5 rounded-full bg-[#f5a623] hover:bg-[#e69818] text-black flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Add Temple"
          >
            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </button>
        )}

        {/* Quiz Tab */}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'quiz' ? 'text-[#f5a623]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight truncate max-w-full text-center">Quiz</span>
          {activeTab === 'quiz' && (
            <span className="w-6 h-0.5 bg-[#f5a623] rounded-full absolute bottom-0" />
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'profile' ? 'text-[#f5a623]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight truncate max-w-full text-center">Profile</span>
          {activeTab === 'profile' && (
            <span className="w-6 h-0.5 bg-[#f5a623] rounded-full absolute bottom-0" />
          )}
        </button>

        {/* Admin Dashboard Analytics Tab */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'analytics' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight truncate max-w-full text-center">Analytics</span>
            {activeTab === 'analytics' && (
              <span className="w-6 h-0.5 bg-purple-500 rounded-full absolute bottom-0" />
            )}
          </button>
        )}
      </nav>
    </div>
  );
};
