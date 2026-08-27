"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield, Lock, FileText, CheckCircle2, ChevronRight, FileSearch, Layers, ShieldCheck, Database, FileKey, Activity, Link, Briefcase, Upload, ChevronDown } from 'lucide-react';
import AuthCards from '@/components/ui/AuthCards';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-6 pb-12 px-6 md:px-12 pointer-events-none">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-white" />
          <span className="font-bold text-xl tracking-widest uppercase text-white drop-shadow-md">KAVACH</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide uppercase drop-shadow-md">
          <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="text-white/70 hover:text-white transition-colors">Security</a>
          <a href="#compliance" className="text-white/70 hover:text-white transition-colors">Compliance</a>
        </div>

        <div className="flex items-center gap-6 text-[13px] tracking-wide uppercase drop-shadow-md">
          <a href="#" className="font-medium text-white/70 hover:text-white transition-colors hidden sm:block">Sign In</a>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <div className="flex flex-col items-center text-center mt-20 md:mt-32 px-4 max-w-[900px] mx-auto min-h-[60vh] justify-center relative z-10">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8">
        <Lock className="w-4 h-4 text-white" />
        <span className="text-[11px] font-semibold tracking-widest uppercase text-white">ZERO-KNOWLEDGE EVIDENCE PROTECTION</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-lg">
        Protect the Evidence.<br />
        Preserve the Truth.
      </h1>
      
      <p className="text-lg md:text-[21px] text-white/90 leading-relaxed max-w-[700px] mb-10 font-medium drop-shadow-md">
        KAVACH transforms fragmented digital evidence into a structured, verifiable, and protected POSH case while keeping sensitive information under the user's control.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <button onClick={onAuthClick} className="bg-white text-black px-8 py-4 rounded font-bold text-sm hover:bg-gray-100 transition-colors w-full sm:w-auto tracking-widest uppercase">
          Enter KAVACH
        </button>
        <button className="bg-black/40 border border-white/30 text-white px-8 py-4 rounded font-bold text-sm hover:bg-white/10 transition-colors w-full sm:w-auto tracking-widest uppercase flex items-center justify-center gap-2 backdrop-blur-md">
          See How It Works <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs tracking-widest uppercase text-white/70 flex-wrap font-medium">
        <span>Client-Side Processing</span>
        <span className="w-1 h-1 rounded-full bg-white/50"></span>
        <span>Evidence Integrity</span>
        <span className="w-1 h-1 rounded-full bg-white/50"></span>
        <span>Secure Case Protection</span>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative border-t border-white/10 bg-[#050505]/40 backdrop-blur-sm mt-32">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-16 max-w-[800px] mx-auto">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-white/70 mb-4">THE EVIDENCE FRAGMENTATION PROBLEM</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            The truth is rarely stored in one place.
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-light">
            A single incident can leave behind WhatsApp conversations, screenshots, images, timestamps, and other digital fragments. Finding the complete story means bringing those fragments together without exposing sensitive information along the way. KAVACH is designed to turn fragmented evidence into one coherent case.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-[800px] mx-auto mt-12">
          {['WhatsApp TXT', 'Screenshots', 'OCR Evidence', 'Timestamps', 'Metadata'].map((label, i) => (
            <div key={i} className="px-6 py-3 border border-white/20 rounded bg-black/60 backdrop-blur-md text-sm text-white/90 flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 opacity-70" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'INGEST', desc: 'Upload WhatsApp exports and screenshot evidence.', icon: <Database className="w-6 h-6 text-white/70" /> },
    { num: '02', title: 'EXTRACT', desc: 'Parse messages and extract information from image evidence.', icon: <FileSearch className="w-6 h-6 text-white/70" /> },
    { num: '03', title: 'FUSE', desc: 'Combine heterogeneous evidence into one chronological timeline.', icon: <Layers className="w-6 h-6 text-white/70" /> },
    { num: '04', title: 'VERIFY', desc: 'Preserve evidence integrity through cryptographic verification.', icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" /> },
    { num: '05', title: 'PROTECT', desc: 'Secure the resulting case for controlled access and review.', icon: <ShieldCheck className="w-6 h-6 text-indigo-400" /> },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="mb-16">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-white/70 mb-4">FROM FRAGMENTED EVIDENCE TO A STRUCTURED CASE</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Chaos becomes chronology.
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-light max-w-[600px]">
            KAVACH brings multiple evidence sources together, extracts relevant information, and organizes them into a chronological evidence trail for review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="p-6 border border-white/20 bg-black/60 backdrop-blur-md rounded flex flex-col relative group hover:bg-white/10 transition-colors">
              <div className="mb-6">{step.icon}</div>
              <div className="text-[10px] font-bold tracking-widest text-white/60 mb-2">{step.num}</div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-3">{step.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-24 md:py-32 px-4 relative border-t border-white/10 bg-[#050505]/40 backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1">
            <div className="text-[11px] font-semibold tracking-widest uppercase text-white/70 mb-4">PRIVACY BY DESIGN</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Protection without exposure.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-light mb-12">
              Sensitive evidence should not become more vulnerable simply because it is being processed. KAVACH is designed around client-side processing, cryptographic integrity, and encrypted protection so that sensitive case information can remain protected throughout its lifecycle.
            </p>
            <div className="text-xs font-medium tracking-widest uppercase text-white/60 border-l border-white/30 pl-4">
              What matters most should remain protected.
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            {[
              { title: 'CLIENT-SIDE PROCESSING', desc: 'Sensitive evidence can be processed in the browser before protected storage.', icon: <Activity className="w-5 h-5 text-white/90" /> },
              { title: 'AES-GCM ENCRYPTION', desc: 'Case payloads are encrypted before being stored.', icon: <FileKey className="w-5 h-5 text-indigo-400" /> },
              { title: 'SHA-256 INTEGRITY', desc: 'Evidence integrity can be verified against a cryptographic hash.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> }
            ].map((pillar, i) => (
              <div key={i} className="p-6 border border-white/20 bg-black/60 backdrop-blur-md rounded flex gap-4 items-start">
                <div className="mt-1">{pillar.icon}</div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalOutcomeSection({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <section id="compliance" className="py-24 md:py-32 px-4 relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto text-center relative z-10">
        <div className="text-[11px] font-semibold tracking-widest uppercase text-white/70 mb-4">ACTIONABLE COMPLIANCE</div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Protection is only the beginning.
        </h2>
        <p className="text-lg text-white/80 leading-relaxed font-light max-w-[700px] mx-auto mb-16">
          KAVACH transforms protected evidence into a structured compliance report designed for review by the appropriate institutional authority.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-16 text-left">
          {[
            { title: 'CHRONOLOGICAL EVIDENCE', desc: 'A structured timeline of the collected evidence.', icon: <Layers className="w-5 h-5 text-white/70" /> },
            { title: 'EVIDENCE SUMMARY', desc: 'Clear visibility into sources, counts, and date ranges.', icon: <FileSearch className="w-5 h-5 text-white/70" /> },
            { title: 'LEGAL REFERENCES', desc: 'Structured references to applicable POSH, BNS, and IT Act provisions where supported by the report.', icon: <Link className="w-5 h-5 text-white/70" /> },
            { title: 'INTEGRITY RECORD', desc: 'Cryptographic integrity information associated with the protected case.', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> }
          ].map((item, i) => (
            <div key={i} className="p-6 border border-white/20 bg-black/60 backdrop-blur-md rounded flex gap-4 items-start">
              <div className="mt-1">{item.icon}</div>
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onAuthClick} className="bg-white text-black px-10 py-4 rounded font-bold text-sm hover:bg-gray-100 transition-colors tracking-widest uppercase mb-8">
          Enter KAVACH
        </button>
        
        <div className="text-sm tracking-widest uppercase text-white/70 font-light flex flex-col gap-1">
          <span>Secure the evidence.</span>
          <span>Make the truth actionable.</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="pt-40 pb-12 px-8 bg-gradient-to-t from-black via-black/90 to-transparent mt-20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            <span className="font-bold tracking-widest uppercase text-white drop-shadow-md">KAVACH</span>
          </div>
          <p className="text-xs text-white/60 font-light max-w-[300px] text-center md:text-left drop-shadow-md">
            Zero-Knowledge evidence protection for sensitive POSH compliance workflows.
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-xs tracking-widest uppercase font-medium text-white/60 flex-wrap justify-center drop-shadow-md">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string, requestedRole: 'VICTIM_STUDENT' | 'HR_ADMIN') => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const tenantDomain = email.split('@')[1].toLowerCase();
      
      if (email === 'hr@sit.ac.in') {
        router.push('/admin/dashboard');
      } else if (email === 'student@sit.ac.in') {
        router.push('/student/submit');
      } else {
        setAuthError('Unauthorized Domain or Role');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const frameCount = 300;
    const currentFrame = (index: number) =>
      `/assets/frame_${index.toString().padStart(4, "0")}.jpg`;

    const preloadImages = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
      }
    };

    const img = new Image();
    img.src = currentFrame(1);

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
    };

    const updateImage = (index: number) => {
      img.src = currentFrame(index);
      context.drawImage(img, 0, 0);
    };

    const handleScroll = () => {
      const scrollTop = html.scrollTop;
      const maxScrollTop = html.scrollHeight - window.innerHeight;
      const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );

      requestAnimationFrame(() => updateImage(frameIndex + 1));
    };

    window.addEventListener("scroll", handleScroll);
    preloadImages();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full flex flex-col font-sans selection:bg-white/30 overflow-x-hidden min-h-[500vh]">
      {/* Background Cinematic Canvas */}
      <div className="fixed inset-0 w-full h-full z-0 bg-black">
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100dvh",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col w-full text-white">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Hero onAuthClick={() => setShowAuthOverlay(true)} />
          {/* Spacer to push problem section down if needed, or margin */}
          <ProblemSection />
          <HowItWorksSection />
          <SecuritySection />
          <LegalOutcomeSection onAuthClick={() => setShowAuthOverlay(true)} />
        </main>
        <Footer />
      </div>

      {showAuthOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl px-4">
            <button 
              onClick={() => setShowAuthOverlay(false)} 
              className="absolute -top-12 right-4 text-white hover:text-gray-300 tracking-wider text-sm font-semibold uppercase flex items-center gap-2 transition-colors"
            >
              Close ✕
            </button>
            <AuthCards 
              onLoginSubmit={handleLogin}
              isLoading={authLoading}
              errorMessage={authError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
