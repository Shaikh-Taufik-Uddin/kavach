import React, { useState } from 'react';
import { Shield, AlertTriangle, Mail, Key, Lock, User, Briefcase } from 'lucide-react';

interface AuthCardsProps {
  onLoginSubmit: (email: string, password: string, requestedRole: 'VICTIM_STUDENT' | 'HR_ADMIN') => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function AuthCards({ onLoginSubmit, isLoading, errorMessage }: AuthCardsProps) {
  const [victimEmail, setVictimEmail] = useState('');
  const [victimPassword, setVictimPassword] = useState('');

  const [hrEmail, setHrEmail] = useState('');
  const [hrPassword, setHrPassword] = useState('');

  const handleVictimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(victimEmail, victimPassword, 'VICTIM_STUDENT');
  };

  const handleHrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSubmit(hrEmail, hrPassword, 'HR_ADMIN');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans">
      {errorMessage && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-center font-medium backdrop-blur-md shadow-lg flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* LEFT CARD: Victim / Reporter Portal */}
        <div className="flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:bg-black/50 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Victim / Reporter Portal</h2>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mt-1">Zero-Knowledge Evidence Protection</p>
            </div>
          </div>
          
          <p className="text-white/70 text-sm leading-relaxed mb-8 flex-grow font-light">
            Access your secure vault to submit sensitive evidence with complete confidentiality. 
            Your identity and files are protected utilizing end-to-end encryption.
          </p>
          
          <form onSubmit={handleVictimSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/60 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={victimEmail}
                  onChange={(e) => setVictimEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="name@student.edu"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/60 ml-1">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Key className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  value={victimPassword}
                  onChange={(e) => setVictimPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Authenticating...' : 'Access Secure Portal'}
            </button>
          </form>
        </div>

        {/* RIGHT CARD: ICC / HR Administration */}
        <div className="flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:bg-black/50 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500 opacity-80" />
          
          <div className="mb-6 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">Restricted — Authorized Personnel Only</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-red-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">ICC / HR Administration</h2>
                <p className="text-xs font-semibold tracking-widest uppercase text-red-400 mt-1">Mandate-Ready Compliance Vault</p>
              </div>
            </div>
          </div>
          
          <p className="text-white/70 text-sm leading-relaxed mb-8 flex-grow font-light">
            Authorized portal for managing decrypted case files, generating compliance reports, and overseeing the investigation timeline.
          </p>
          
          <form onSubmit={handleHrSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/60 ml-1">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-sm"
                  placeholder="admin@institution.edu"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/60 ml-1">Admin Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Key className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  value={hrPassword}
                  onChange={(e) => setHrPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-sm"
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Authenticating...' : 'Access Admin Console'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
