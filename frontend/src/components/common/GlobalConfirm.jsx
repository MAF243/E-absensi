import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import useUiStore from '../../store/useUiStore';

const GlobalConfirm = () => {
  const { confirm } = useUiStore();

  // Prevent scroll when modal is open
  useEffect(() => {
    if (confirm.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [confirm.show]);

  if (!confirm.show) return null;

  const isDanger = confirm.type === 'danger';

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[32px] p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <button 
          onClick={confirm.onCancel}
          className="absolute top-4 right-4 p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className={`p-4 rounded-3xl mb-5 ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            {isDanger ? <AlertTriangle size={36} strokeWidth={2.5} /> : <Info size={36} strokeWidth={2.5} />}
          </div>
          
          <h3 id="confirm-title" className="text-xl font-black text-slate-800 tracking-tight">
            {confirm.title}
          </h3>
          
          <p className="text-sm font-medium text-slate-500 mt-2 mb-8 leading-relaxed px-2">
            {confirm.message}
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={confirm.onCancel}
              className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-colors active:scale-95"
            >
              {confirm.cancelText}
            </button>
            <button 
              onClick={confirm.onConfirm}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm transition-colors active:scale-95 text-white shadow-lg ${
                isDanger 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {confirm.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalConfirm;
