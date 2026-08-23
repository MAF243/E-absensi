import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 px-6 text-center border-t border-slate-100 bg-transparent">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} E-Absensi University
        </p>
        <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
          Dibuat dengan <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" /> untuk pendidikan yang lebih baik
        </p>
      </div>
    </footer>
  );
};

export default Footer;