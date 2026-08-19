'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Lock, Settings, HelpCircle, LogOut, X } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-taupe-dark/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="w-full lg:w-96 bg-white h-full relative shadow-2xl z-10 animate-in slide-in-from-right duration-300 flex flex-col pt-12 pb-6 px-6 lg:pt-6">
        
        {/* Mobile handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-sand rounded-full lg:hidden" />
        
        {/* Close button for desktop */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-taupe hover:text-taupe-dark hidden lg:block"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col gap-2 mt-4 lg:mt-8 mb-8">
          <h2 className="text-2xl font-bold text-taupe-dark">Profile</h2>
          {user && (
            <p className="text-taupe font-medium">{user.name || user.uid}</p>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <a href="#" className="flex items-center gap-3 p-4 rounded-2xl text-taupe-dark hover:bg-sand-light transition-colors font-medium">
            <User size={20} /> Edit Profile
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-2xl text-taupe-dark hover:bg-sand-light transition-colors font-medium">
            <Shield size={20} /> Role & Permissions
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-2xl text-taupe-dark hover:bg-sand-light transition-colors font-medium">
            <Lock size={20} /> Privacy
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-2xl text-taupe-dark hover:bg-sand-light transition-colors font-medium">
            <Settings size={20} /> Settings
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-2xl text-taupe-dark hover:bg-sand-light transition-colors font-medium">
            <HelpCircle size={20} /> Help & Support
          </a>
        </nav>

        <div className="mt-auto pt-6">
          <PrimaryButton 
            onClick={() => {
              onClose();
              signOut();
            }} 
            className="w-full bg-sand-light text-taupe-dark hover:bg-sand/50"
          >
            <LogOut size={20} className="mr-2 inline" />
            Logout
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
