import React from 'react';
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
import { AddUserModal } from './components/AddUserModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav } from './components/BottomNav';

const MainAppContent: React.FC = () => {
  const { activeTab, isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="bg-[#07090f] text-gray-100 flex flex-col items-center w-full h-[100dvh] overflow-hidden">
      {/* Main Responsive Full-Width / Max-7xl Container */}
      <div className="w-full max-w-7xl flex-1 flex flex-col bg-[#0d0f18] shadow-2xl relative overflow-hidden min-h-0 border-x border-[#1a1c2b]/60">
        {/* Sticky Header Section (Header + Chevron Planets Bar) */}
        <div className="shrink-0 w-full bg-[#0d0f18]/98 backdrop-blur-md border-b border-[#1f2233] shadow-md shadow-black/40 z-30">
          <Header />
          {activeTab === 'temples' && <PlanetPillBar />}
        </div>

        {/* Tab Content */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {activeTab === 'temples' && <TemplesList />}
          {activeTab === 'review' && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <ReviewTab />
            </div>
          )}
          {activeTab === 'quiz' && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <QuizTab />
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <ProfileTab />
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <AdminAnalytics />
            </div>
          )}
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
