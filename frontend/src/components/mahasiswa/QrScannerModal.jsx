import { Scanner } from '@yudiel/react-qr-scanner';
import { MapPin, X, ScanLine } from 'lucide-react';

const QrScannerModal = ({ isOpen, onClose, onScan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <div className="p-5 md:p-6 flex justify-between items-center bg-slate-900/90 text-white relative z-10 shadow-2xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <ScanLine size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tight text-white">Scan Kehadiran</h3>
            <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={3} /> Mencatat Lokasi GPS
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-3.5 bg-white/10 rounded-full text-slate-300 hover:text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg border border-white/10" aria-label="Tutup pemindai QR">
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black/60">
        <Scanner
          onResult={onScan}
          onError={(error) => console.log(error?.message)}
          options={{ delayBetweenScanSuccess: 2000, delayBetweenScanAttempts: 200 }}
          styles={{ container: { width: '100%', height: '100%', objectFit: 'cover' } }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div className="w-full max-w-[280px] aspect-square border-[4px] border-emerald-500/80 rounded-[32px] relative overflow-hidden shadow-[0_0_0_1000px_rgba(15,23,42,0.85)] backdrop-blur-[2px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-[scan_2.5s_ease-in-out_infinite] shadow-[0_0_24px_6px_#34d399]" />
            
            {/* Corner Indicators */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-emerald-400 rounded-tl-[28px]" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-emerald-400 rounded-tr-[28px]" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-emerald-400 rounded-bl-[28px]" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-emerald-400 rounded-br-[28px]" />
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 bg-slate-900 text-center relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
        <div className="max-w-sm mx-auto bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-inner">
          <p className="text-sm font-bold text-slate-300 leading-relaxed tracking-wide">
            Arahkan kamera HP Anda ke <span className="text-emerald-400">QR Code</span> yang ditampilkan Dosen di proyektor kelas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
