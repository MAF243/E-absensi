import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import useUiStore from '../../store/useUiStore';

const GlobalToast = () => {
  const { toast, hideToast } = useUiStore();

  if (!toast.show) return null;

  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[99999] animate-in slide-in-from-top-8 fade-in duration-300">
      <div className={`flex items-start gap-3 px-4 md:px-5 py-4 rounded-[24px] shadow-2xl border bg-white max-w-sm ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
        <div className={`p-2.5 rounded-2xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <AlertCircle size={24} strokeWidth={2.5} />}
        </div>
        <div className="flex flex-col pr-2 pt-0.5 flex-1">
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            {toast.type === 'success' ? 'Berhasil!' : 'Peringatan!'}
          </span>
          <span className="text-xs font-medium text-slate-500 max-w-[200px] md:max-w-[280px] break-words leading-relaxed mt-0.5">
            {toast.message}
          </span>
        </div>
        <button 
          onClick={hideToast}
          className="ml-1 mt-0.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default GlobalToast;
