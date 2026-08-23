import { MapPin, PlayCircle, Users } from 'lucide-react';

const DosenClassCard = ({ kelas, todayName, currentHourMin, onOpenSession, onEndSession }) => {
  const isToday = kelas.hari?.toLowerCase() === todayName.toLowerCase();
  let isStartable = false;
  let buttonMsg = 'Mulai Kuliah & Presensi';
  let statusWarna = 'bg-slate-100 text-slate-500 border';

  if (kelas.sesi_aktif_id) isStartable = true;
  else if (!kelas.hari || !kelas.jam_mulai) buttonMsg = 'Menunggu Jadwal Admin';
  else if (!isToday) buttonMsg = 'Bukan Jadwal Hari Ini';
  else if (currentHourMin < kelas.jam_mulai) {
    buttonMsg = 'Belum Waktunya';
    statusWarna = 'bg-amber-50 text-amber-600 border border-amber-200';
  } else if (currentHourMin > kelas.jam_selesai) {
    buttonMsg = 'Sesi Berakhir';
    statusWarna = 'bg-rose-50 text-rose-500 border border-rose-200';
  } else isStartable = true;

  const targetPertemuan = kelas.target_pertemuan || 16;
  const progressPercent = Math.min(((kelas.total_pertemuan || 0) / targetPertemuan) * 100, 100);
  const displayBadge = kelas.jenis_kelas === 'kelompok'
    ? `KRS: ${kelas.kelompok_jurusan || 'Belum Ada Mhs'}`
    : kelas.nama_angkatan ? `Paket: ${kelas.nama_angkatan}` : 'Belum Ada Angkatan';

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 ${kelas.sesi_aktif_id ? 'border-emerald-400 ring-4 ring-emerald-50' : isToday ? 'border-blue-400 shadow-md' : 'border-slate-200 shadow-sm'}`}>
      {isToday && !kelas.sesi_aktif_id && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-xl shadow-sm z-10">Kelas Hari Ini</div>}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm">{kelas.kode_mk}</span></div>
        <h4 className="font-bold text-lg text-slate-800 mb-2">{kelas.nama_mk}</h4>
        <div className="space-y-2 mb-6 border-l-[3px] border-slate-100 pl-3">
          <div className="text-xs font-semibold text-slate-600">SMT {kelas.semester}</div>
          <div className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>{kelas.hari ? `${kelas.hari}, ${kelas.jam_mulai} WIB` : 'Belum Diatur'}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mt-1"><MapPin size={14} className="text-slate-400" /> {kelas.ruangan || <span className="italic text-slate-400 font-medium">Ruangan belum di-set</span>}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-1"><Users size={14} className="text-emerald-500" /> {displayBadge}</div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-1"><span>Progress Sesi</span><span>{kelas.total_pertemuan || 0}/{targetPertemuan}</span></div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} /></div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        {kelas.sesi_aktif_id ? (
          <button onClick={() => onEndSession(kelas.sesi_aktif_id, kelas.nama_mk)} className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm border border-rose-200 hover:bg-rose-100 active:scale-[0.98] transition-all shadow-sm animate-pulse">Akhiri Sesi</button>
        ) : !isStartable ? (
          <button disabled className={`w-full py-3.5 rounded-xl font-bold text-sm cursor-not-allowed ${statusWarna}`}>{buttonMsg}</button>
        ) : (
          <button onClick={() => onOpenSession(kelas)} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.98] hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><PlayCircle size={16} /> {buttonMsg}</button>
        )}
      </div>
    </div>
  );
};

export default DosenClassCard;
