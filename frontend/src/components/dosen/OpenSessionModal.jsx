const OpenSessionModal = ({ selectedClass, agenda, setAgenda, jenisSesi, bobotSesi, setJenisSesi, setBobotSesi, onClose, onSubmit }) => {
  if (!selectedClass) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="font-bold text-xl mb-1">Buka Sesi Kelas</h3>
        <p className="text-sm font-medium text-slate-500 mb-5 border-b pb-4">{selectedClass.kode_mk} - {selectedClass.nama_mk}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Jenis Sesi Pertemuan</label>
            <select className="w-full border border-indigo-200 rounded-xl p-3 text-sm font-bold bg-indigo-50 text-indigo-800 outline-none" value={`${jenisSesi}|${bobotSesi}`} onChange={(event) => { const [jenis, bobot] = event.target.value.split('|'); setJenisSesi(jenis); setBobotSesi(Number(bobot)); }}>
              <option value="Reguler|1">Reguler Biasa (Terhitung 1x)</option>
              <option value="Kelas Sabtu|2">Kelas Sabtu / Double (Terhitung 2x)</option>
              <option value="UTS|1">Ujian Tengah Semester (1x)</option>
              <option value="UAS|1">Ujian Akhir Semester (1x)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Agenda / Topik Materi</label>
            <textarea required rows="3" placeholder="Ketik topik materi pertemuan hari ini..." className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:border-indigo-500 resize-none" value={agenda} onChange={(event) => setAgenda(event.target.value)} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-colors mt-2">Buka Sesi & Mulai Presensi</button>
        </form>
      </div>
    </div>
  );
};

export default OpenSessionModal;
