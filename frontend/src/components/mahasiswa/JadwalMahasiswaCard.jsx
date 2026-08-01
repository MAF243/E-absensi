import { CheckCircle2, Clock, Lock, MapPin, MonitorPlay, QrCode, User } from 'lucide-react';

const JadwalMahasiswaCard = ({ jadwal, isLoadingGPS, onOpenScanner, onJoinOnline }) => {
  const tipeKelas = jadwal.sesi_aktif_id ? jadwal.sesi_tipe : (jadwal.sesi_tipe || 'offline');
  const statusSesi = jadwal.sesi_aktif_id ? 'berlangsung' : 'menunggu';

  return (
    <div className={`p-4 rounded-2xl border bg-slate-50 relative overflow-hidden group transition-all ${statusSesi === 'berlangsung' ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}>
      <div className={`absolute top-0 right-0 px-3 py-1.5 text-[9px] font-bold tracking-wider rounded-bl-xl uppercase flex items-center gap-1 ${tipeKelas === 'offline' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
        {tipeKelas === 'offline' ? <><MapPin size={10} /> Tatap Muka</> : <><MonitorPlay size={10} /> E-Learning</>}
      </div>

      <h4 className="text-sm md:text-base font-bold text-slate-800 pr-24 leading-snug">{jadwal.nama_mk}</h4>
      <p className="text-[11px] font-bold text-slate-500 mt-1.5 flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> {jadwal.jam_mulai} - {jadwal.jam_selesai} WIB</p>
      <p className="text-[10px] font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5"><User size={12} /> {jadwal.dosen_nama || 'Belum ada dosen'}</p>

      <div className="mt-4 pt-4 border-t border-slate-200/60">
        {jadwal.status_absen === 'hadir' ? (
          <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs text-center border border-emerald-100 flex items-center justify-center gap-2 shadow-sm"><CheckCircle2 size={16} /> Anda Tercatat Hadir</div>
        ) : tipeKelas === 'offline' && statusSesi === 'berlangsung' ? (
          <button onClick={onOpenScanner} disabled={isLoadingGPS} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-blue-600/20 active:scale-[0.98]">
            {isLoadingGPS ? <span className="animate-pulse">Mengunci Kordinat GPS...</span> : <><QrCode size={16} /> Scan QR Ruangan</>}
          </button>
        ) : statusSesi === 'menunggu' ? (
          <button disabled className="w-full py-3 bg-slate-200 text-slate-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300"><Lock size={14} /> Menunggu Dosen Memulai Kelas</button>
        ) : (
          <button onClick={() => onJoinOnline(jadwal.id, jadwal.link_meet)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.98]"><MonitorPlay size={16} /> Masuk Kelas & Absen</button>
        )}
      </div>
    </div>
  );
};

export default JadwalMahasiswaCard;
