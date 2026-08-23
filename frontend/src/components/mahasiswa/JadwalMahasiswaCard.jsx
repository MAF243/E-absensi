import { CheckCircle2, Clock, Lock, MapPin, MonitorPlay, QrCode, User } from 'lucide-react';

const JadwalMahasiswaCard = ({ jadwal, isLoadingGPS, onOpenScanner, onJoinOnline }) => {
  const tipeKelas = jadwal.sesi_aktif_id ? jadwal.sesi_tipe : (jadwal.sesi_tipe || 'offline');
  const statusSesi = jadwal.sesi_aktif_id ? 'berlangsung' : 'menunggu';

  return (
    <div className={`p-6 md:p-7 rounded-[32px] border relative overflow-hidden group transition-all duration-300 ${statusSesi === 'berlangsung' ? 'border-blue-200 bg-white shadow-xl shadow-blue-900/5 hover:-translate-y-1 ring-4 ring-blue-500/5' : 'border-slate-200/60 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-md'}`}>
      <div className={`absolute top-0 right-0 px-4 py-2 text-[10px] font-black tracking-widest rounded-bl-[24px] uppercase flex items-center gap-1.5 transition-colors ${tipeKelas === 'offline' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
        {tipeKelas === 'offline' ? <><MapPin size={12} strokeWidth={3} /> Tatap Muka</> : <><MonitorPlay size={12} strokeWidth={3} /> E-Learning</>}
      </div>

      <h4 className="text-lg md:text-xl font-black text-slate-800 pr-28 leading-snug tracking-tight line-clamp-2">{jadwal.nama_mk}</h4>
      <div className="mt-3 space-y-2">
        <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><Clock size={16} className="text-blue-500" strokeWidth={2.5} /> {jadwal.jam_mulai} - {jadwal.jam_selesai} WIB</p>
        <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><User size={16} strokeWidth={2.5} /> {jadwal.dosen_nama || 'Belum ada dosen'}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        {jadwal.status_absen === 'hadir' ? (
          <div className="w-full py-3.5 px-6 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm text-center border border-emerald-100 flex items-center justify-center gap-2 shadow-sm"><CheckCircle2 size={18} strokeWidth={2.5} /> Anda Tercatat Hadir</div>
        ) : tipeKelas === 'offline' && statusSesi === 'berlangsung' ? (
          <button onClick={onOpenScanner} disabled={isLoadingGPS} className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 shadow-lg shadow-blue-600/20 active:scale-95">
            {isLoadingGPS ? <span className="animate-pulse flex items-center gap-2"><MapPin size={18} strokeWidth={2.5} /> Mengunci Kordinat GPS...</span> : <><QrCode size={18} strokeWidth={2.5} /> Scan QR Ruangan</>}
          </button>
        ) : statusSesi === 'menunggu' ? (
          <button disabled className="w-full py-3.5 px-6 bg-slate-100 text-slate-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200/50"><Lock size={16} strokeWidth={2.5} /> Menunggu Kelas Dimulai</button>
        ) : (
          <button onClick={() => onJoinOnline(jadwal.id, jadwal.link_meet)} className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"><MonitorPlay size={18} strokeWidth={2.5} /> Masuk Kelas & Absen</button>
        )}
      </div>
    </div>
  );
};

export default JadwalMahasiswaCard;
