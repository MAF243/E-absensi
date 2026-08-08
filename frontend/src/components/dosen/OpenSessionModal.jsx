import React from 'react';
import { X, ChevronDown, PlayCircle } from 'lucide-react';

const OpenSessionModal = ({ selectedClass, agenda, setAgenda, jenisSesi, bobotSesi, setJenisSesi, setBobotSesi, onClose, onSubmit }) => {
  if (!selectedClass) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100" onClick={(event) => event.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Tutup">
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-5 pr-8">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Buka Sesi Kelas</h3>
          <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
            {selectedClass.kode_mk} - {selectedClass.nama_mk}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Jenis Sesi Pertemuan</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" 
                value={`${jenisSesi}|${bobotSesi}`} 
                onChange={(event) => { 
                  const [jenis, bobot] = event.target.value.split('|'); 
                  setJenisSesi(jenis); 
                  setBobotSesi(Number(bobot)); 
                }}
              >
                <option value="Reguler|1">Reguler Biasa (Terhitung 1x)</option>
                <option value="Kelas Sabtu|2">Kelas Sabtu / Double (Terhitung 2x)</option>
                <option value="UTS|1">Ujian Tengah Semester (1x)</option>
                <option value="UAS|1">Ujian Akhir Semester (1x)</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Agenda / Topik Materi <span className="text-rose-500">*</span></label>
            <textarea 
              required 
              rows="4" 
              placeholder="Ketik topik materi pertemuan hari ini..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 resize-none custom-scrollbar" 
              value={agenda} 
              onChange={(event) => setAgenda(event.target.value)} 
            />
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <PlayCircle size={20} strokeWidth={2.5} />
              Buka Sesi & Mulai Presensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenSessionModal;
