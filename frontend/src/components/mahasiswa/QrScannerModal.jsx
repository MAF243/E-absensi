import { Scanner } from '@yudiel/react-qr-scanner';
import { MapPin, X } from 'lucide-react';

const QrScannerModal = ({ isOpen, onClose, onScan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="p-5 flex justify-between items-center bg-slate-900 text-white relative z-10 shadow-lg">
        <div>
          <h3 className="font-bold text-base tracking-wide">Scan QR Kehadiran</h3>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1"><MapPin size={10} /> Lokasi Sesuai Radius</p>
        </div>
        <button onClick={onClose} className="p-2.5 bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors" aria-label="Tutup pemindai QR">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        <Scanner
          onResult={onScan}
          onError={(error) => console.log(error?.message)}
          options={{ delayBetweenScanSuccess: 2000, delayBetweenScanAttempts: 200 }}
          styles={{ container: { width: '100%', height: '100%', objectFit: 'cover' } }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div className="w-full max-w-[280px] aspect-square border-2 border-emerald-500 rounded-3xl relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.7)] backdrop-blur-[1px]">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_3px_#34d399]" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900 text-center relative z-10 pb-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <p className="text-xs font-medium text-slate-400 leading-relaxed">Arahkan kamera ke QR Code<br />yang ditampilkan Dosen atau di dinding kelas.</p>
      </div>
    </div>
  );
};

export default QrScannerModal;
