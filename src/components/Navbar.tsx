import React from 'react';
import {
  FileText,
  BarChart3,
  Sliders,
  Mail,
  LogOut,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface Props {
  activeTab: 'survey' | 'admin' | 'responses';
  setActiveTab: (tab: 'survey' | 'admin' | 'responses') => void;
  user: User | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  responseCount: number;
  targetEmail: string;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  user,
  isAuthenticated,
  isAuthenticating,
  onGoogleSignIn,
  onLogout,
  responseCount,
  targetEmail,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-base tracking-tight">Vexlora</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Survey Hub
                </span>
              </div>
              <div className="text-[11px] text-gray-500 hidden sm:flex items-center gap-1">
                <span>Direct routing to</span>
                <span className="font-medium text-gray-700">{targetEmail}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'survey'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Fill Survey</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Google Integrations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('responses')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'responses'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Responses ({responseCount})</span>
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 text-right hidden md:block">
                  <div className="text-xs font-semibold text-gray-800 leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onGoogleSignIn}
                isLoading={isAuthenticating}
                size="sm"
                text="Sign in"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
