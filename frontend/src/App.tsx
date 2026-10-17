import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PlanetPillBar } from './components/PlanetPillBar';
import { TemplesList } from './components/TemplesList';
import { ReviewTab } from './components/ReviewTab';
import { QuizTab } from './components/QuizTab';
import { ProfileTab } from './components/ProfileTab';
import { AdminAnalytics } from './components/AdminAnalytics';
import { FilterModal } from './components/FilterModal';
import { AddEditTempleModal } from './components/AddEditTempleModal';
import { TempleDetailModal } from './components/TempleDetailModal';
import { VideoModal } from './components/VideoModal';
import { LoginModal } from './components/LoginModal';
import { FreeTierArchitectureModal } from './components/FreeTierArchitectureModal';
import { AddUserModal } from './components/AddUserModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav } from './components/BottomNav';
import { Smartphone, Monitor } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, isMobileFrame, setIsMobileFrame, isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className={`bg-[#07090f] text-gray-100 flex flex-col items-center w-full ${
      isMobileFrame ? 'h-[100dvh] overflow-y-auto' : 'h-[100dvh] overflow-hidden'
    }`}>
      {/* Top Device Mode Bar (Optional toggle to see exact phone frame vs full responsive) */}
      <div className="w-full bg-[#0b0d17] border-b border-[#1b1e2f] px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-gray-300">Mupporul Live Demo</span>
          <span className="hidden sm:inline text-gray-500">• Navagraha & Hindu Temples of Tamil Nadu</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-gray-500">Preview Layout:</span>
          <div className="flex items-center bg-[#141624] p-0.5 rounded-lg border border-[#26293f]">
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                isMobileFrame ? 'bg-[#f5a623] text-black font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Mobile Device Frame"
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile View</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                !isMobileFrame ? 'bg-[#f5a623] text-black font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Responsive Wide View"
            >
              <Monitor className="w-3 h-3" />
              <span>Fluid Wide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Full Responsive */}
      <div
        className={`w-full flex-1 flex flex-col bg-[#0d0f18] transition-all duration-300 min-h-0 ${
          isMobileFrame
            ? 'max-w-sm sm:max-w-md my-2 sm:my-4 h-[844px] max-h-[calc(100vh-3.5rem)] rounded-3xl sm:rounded-[44px] border-2 sm:border-4 border-[#2b2f47] shadow-2xl shadow-black/80 overflow-hidden relative'
            : 'w-full max-w-7xl border-x border-[#1a1c2b] shadow-2xl relative overflow-hidden'
        }`}
      >
        {/* Mobile Device Status Bar (Matches Screenshot 1 top: "06:56", signal, wifi, 99%) */}
        {isMobileFrame && (
          <div className="pt-3 px-7 pb-1 flex items-center justify-between text-xs font-semibold text-gray-200 select-none shrink-0 bg-[#0d0f18]">
            <span>06:56</span>
            {/* Notch / Dynamic Island indicator */}
            <div className="w-20 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-[11px]">
              {/* Signal bars */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="2" y="16" width="3" height="6" rx="1" />
                <rect x="7" y="12" width="3" height="10" rx="1" />
                <rect x="12" y="8" width="3" height="14" rx="1" />
                <rect x="17" y="4" width="3" height="18" rx="1" />
              </svg>
              {/* Battery indicator */}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold">99</span>
                <div className="w-4 h-2 border border-current rounded-xs p-0.5 flex items-center">
                  <div className="w-full h-full bg-current rounded-xs" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Header Section (Header + Chevron Planets Bar stick together on Desktop, Fluid Wide, and Mobile) */}
        <div className="shrink-0 w-full bg-[#0d0f18]/98 backdrop-blur-md border-b border-[#1f2233] shadow-md shadow-black/40 z-30">
          <Header />
          {activeTab === 'temples' && <PlanetPillBar />}
        </div>

        {/* Tab Content (With comfortable bottom padding for in-flow BottomNav) */}
        <main className={`flex-1 min-h-0 ${isMobileFrame ? 'pb-6 overflow-y-auto no-scrollbar' : 'overflow-hidden flex flex-col'}`}>
          {activeTab === 'temples' && <TemplesList />}
          {activeTab === 'review' && <div className="flex-1 overflow-y-auto no-scrollbar pb-6"><ReviewTab /></div>}
          {activeTab === 'quiz' && <div className="flex-1 overflow-y-auto no-scrollbar pb-6"><QuizTab /></div>}
          {activeTab === 'profile' && <div className="flex-1 overflow-y-auto no-scrollbar pb-6"><ProfileTab /></div>}
          {activeTab === 'analytics' && <div className="flex-1 overflow-y-auto no-scrollbar pb-6"><AdminAnalytics /></div>}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Interactive Modals */}
      <FilterModal />
      <AddEditTempleModal />
      <TempleDetailModal />
      <VideoModal />
      <LoginModal />
      <FreeTierArchitectureModal />
      <AddUserModal />
      <ChangePasswordModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
