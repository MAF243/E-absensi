import React, { useState, useEffect } from 'react';
import { CalendarDays, Edit, Printer, X, CheckCircle2, AlertCircle, Clock, Search, RotateCcw, Filter, PlayCircle, StopCircle, Radio, FileText, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';

const isKelompok = (name) => {
  if (!name) return false;
  const n = String(name).toUpperCase();
  if (n.includes('INFORMATIKA') || n.includes('INROMATIKA')) return false;
  return true;
};

// 1. MODAL ATUR JADWAL (DITAMBAH INPUT RUANGAN)
const ModalAturJadwal = ({ isOpen, onClose, onSave, matkul }) => {
  const [formData, setFormData] = useState({ hari: '', jam_mulai: '', jam_selesai: '', target_pertemuan: 16, ruangan: '' });

  useEffect(() => {
    if (isOpen && matkul) {
      setFormData({
        hari: matkul.hari || '',
        jam_mulai: matkul.jam_mulai || '',
        jam_selesai: matkul.jam_selesai || '',
        target_pertemuan: matkul.target_pertemuan || 16,
        ruangan: matkul.ruangan || ''
      });
    }
  }, [isOpen, matkul]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">Atur Jadwal Kuliah <br /><span className="text-sm font-semibold text-indigo-600">{matkul?.kode_mk} - {matkul?.nama_mk}</span></h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Hari *</label>
              <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm font-semibold" value={formData.hari} onChange={e => setFormData({ ...formData, hari: e.target.value })}>
                <option value="">Pilih Hari...</option>
                <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-indigo-600 mb-1.5 block">Target Sesi *</label>
              <input required type="number" min="1" max="24" className="w-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-center text-sm" value={formData.target_pertemuan} onChange={e => setFormData({ ...formData, target_pertemuan: e.target.value })} title="Atur total pertemuan (misal: 16 untuk reguler)" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1"><label className="text-xs font-bold text-slate-600 mb-1.5 block">Waktu Mulai *</label><input required type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm font-semibold" value={formData.jam_mulai} onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })} /></div>
            <div className="flex-1"><label className="text-xs font-bold text-slate-600 mb-1.5 block">Waktu Selesai *</label><input required type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm font-semibold" value={formData.jam_selesai} onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })} /></div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ruangan Kelas (Opsional)</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input type="text" placeholder="Cth: Lab Komputer 1, Ruang 302..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold transition-colors" value={formData.ruangan} onChange={e => setFormData({ ...formData, ruangan: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-colors">Simpan Jadwal</button>
        </form>
      </div>
    </div>
  );
};

// 2. MODAL CETAK QR (DITAMBAH RUANGAN)
const ModalCetakQR = ({ isOpen, onClose, matkul }) => {
  if (!isOpen || !matkul) return null;
  const qrValue = `stikomabsen://sesi/MATKUL-${matkul.id}-${matkul.kode_mk}`;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in print:bg-white print:p-0 print:block" onClick={onClose}>
      <div className="bg-white w-full max-w-lg print:max-w-none rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 print:shadow-none print:w-full print:h-screen print:rounded-none flex flex-col items-center justify-center print:justify-start print:pt-24" onClick={e => e.stopPropagation()}>
        <div className="absolute top-6 right-6 flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-2 px-4 shadow-sm"><Printer size={18} /> Cetak</button>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 hover:text-rose-600 rounded-lg"><X size={20} /></button>
        </div>
        <div className="text-center w-full max-w-2xl mx-auto mt-4 print:mt-0">
          <h1 className="text-3xl print:text-5xl font-black text-slate-900 uppercase print:mb-3">E-Absensi</h1>
          <p className="text-lg print:text-2xl font-bold text-slate-500 mb-8 print:mb-12 border-b-2 print:border-b-4 pb-4">STIKOM Elrahma Bogor</p>
          <div className="p-4 print:p-6 border-[6px] print:border-[10px] border-slate-900 rounded-2xl inline-block bg-white shadow-xl print:shadow-none mb-8 print:mb-16">
            <div className="print:scale-[1.8] print:m-10 origin-center"><QRCode value={qrValue} size={220} level="H" /></div>
          </div>
          <div className="bg-slate-50 print:bg-white rounded-2xl p-6 print:p-8 border-2 print:border-4 print:border-slate-800">
            <h2 className="text-2xl print:text-4xl font-black text-slate-800 print:mb-3">{matkul.nama_mk}</h2>
            <h3 className="text-lg print:text-2xl font-bold text-indigo-600 mb-4 print:mb-6">{matkul.kode_mk} • Smstr {matkul.semester}</h3>
            <p className="font-bold text-slate-600 print:text-2xl flex justify-center gap-2 items-center"><Clock className="w-5 h-5 print:w-8 print:h-8" /> {matkul.hari}, {matkul.jam_mulai} WIB</p>
            {matkul.ruangan && (
              <p className="font-bold text-emerald-600 print:text-2xl flex justify-center gap-2 items-center mt-3"><MapPin className="w-5 h-5 print:w-8 print:h-8" /> Ruangan: {matkul.ruangan}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. MODAL BUKA SESI DARURAT
const ModalBukaSesi = ({ isOpen, onClose, onSave, matkul }) => {
  const [tipe, setTipe] = useState('offline');
  const [linkMeet, setLinkMeet] = useState('');
  const [agenda, setAgenda] = useState('');
  const [jenisSesi, setJenisSesi] = useState('Reguler');
  const [bobotSesi, setBobotSesi] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setTipe('offline'); setLinkMeet(''); setAgenda(''); setJenisSesi('Reguler'); setBobotSesi(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">Buka Sesi Darurat <br /><span className="text-sm font-medium text-emerald-600">Admin Bypass Override</span></h3>

        <form onSubmit={(e) => { e.preventDefault(); onSave(matkul.id, matkul.dosen_id, tipe, linkMeet, agenda, jenisSesi, bobotSesi); }} className="space-y-4">

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <label className="text-xs font-bold text-emerald-800 mb-2 block">Pilih Jenis Pertemuan <span className="text-rose-500">*</span></label>
            <select
              className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 font-semibold text-sm text-slate-700 cursor-pointer"
              value={`${jenisSesi}|${bobotSesi}`}
              onChange={(e) => {
                const [jenis, bobot] = e.target.value.split('|');
                setJenisSesi(jenis); setBobotSesi(Number(bobot));
              }}
            >
              <option value="Reguler|1">Reguler Biasa (Terhitung 1x)</option>
              <option value="Kelas Sabtu|2">Kelas Sabtu / Double (Terhitung 2x)</option>
              <option value="UTS|1">Ujian Tengah Semester - UTS (Terhitung 1x)</option>
              <option value="UAS|1">Ujian Akhir Semester - UAS (Terhitung 1x)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2"><FileText size={14} className="text-slate-400" /> Agenda / Topik Materi <span className="text-rose-500">*</span></label>
            <textarea required rows="2" placeholder="Ketik topik materi..." className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white text-sm text-slate-700 resize-none" value={agenda} onChange={e => setAgenda(e.target.value)}></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Tipe Perkuliahan</label>
            <div className="flex gap-2">
              <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer font-bold text-sm transition-colors ${tipe === 'offline' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" className="hidden" checked={tipe === 'offline'} onChange={() => setTipe('offline')} /> Tatap Muka
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer font-bold text-sm transition-colors ${tipe === 'online' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                <input type="radio" className="hidden" checked={tipe === 'online'} onChange={() => setTipe('online')} /> E-Learning
              </label>
            </div>
          </div>

          {tipe === 'online' && (
            <div className="animate-in fade-in duration-300">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Link Zoom / Google Meet *</label>
              <input required type="url" placeholder="https://zoom.us/..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 text-sm bg-slate-50 focus:bg-white transition-colors" value={linkMeet} onChange={e => setLinkMeet(e.target.value)} />
            </div>
          )}

          <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex justify-center items-center gap-2 transition-colors mt-2">
            <Radio size={18} /> Buka Sesi Kelas Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. HALAMAN UTAMA ADMIN
const JadwalSesi = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [search, setSearch] = useState('');

  const [filterSemester, setFilterSemester] = useState('');
  const [filterHari, setFilterHari] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modalEdit, setModalEdit] = useState({ isOpen: false, data: null });
  const [modalQR, setModalQR] = useState({ isOpen: false, data: null });
  const [modalBuka, setModalBuka] = useState({ isOpen: false, data: null });

  const BASE_URL = 'http://localhost:5000';
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchJadwal = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/jadwal`).then(r => r.json());
      if (res.success) setJadwalList(res.data);
    } catch (err) { }
  };

  useEffect(() => {
    fetchJadwal();
    const interval = setInterval(() => { fetchJadwal(); }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveJadwal = async (formData) => {
    try {
      const res = await fetch(`${BASE_URL}/api/jadwal/${modalEdit.data.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }).then(r => r.json());
      if (res.success) { showToast(res.message, "success"); setModalEdit({ isOpen: false }); fetchJadwal(); } else showToast(res.message, "error");
    } catch (err) { }
  };

  const handleResetJadwal = async (id, namaMk) => {
    if (!window.confirm(`Yakin mengosongkan jadwal matkul ${namaMk}?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/jadwal/reset/${id}`, { method: 'PUT' }).then(r => r.json());
      if (res.success) { showToast(res.message, "success"); fetchJadwal(); }
    } catch (err) { }
  };

  const handleBukaSesiSubmit = async (mk_id, dosen_id, tipe, link_meet, agenda, jenis_sesi, bobot) => {
    try {
      const res = await fetch(`${BASE_URL}/api/jadwal/buka-sesi`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mk_id, dosen_id, tipe, link_meet, agenda, jenis_sesi, bobot })
      }).then(r => r.json());
      if (res.success) { showToast(res.message, "success"); setModalBuka({ isOpen: false }); fetchJadwal(); }
      else showToast(res.message, "error");
    } catch (err) { }
  };

  const handleTutupSesi = async (sesi_id, matkul_nama) => {
    if (!window.confirm(`Hentikan kelas ${matkul_nama} sekarang?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/jadwal/tutup-sesi/${sesi_id}`, { method: 'PUT' }).then(r => r.json());
      if (res.success) { showToast(res.message, "success"); fetchJadwal(); }
    } catch (err) { }
  };

  const getJurusanDisplay = (item) => {
    if (item.jenis_kelas === 'kelompok' && item.kelompok_jurusan) return item.kelompok_jurusan;
    if (item.angkatan_id && item.kelompok_jurusan) return item.kelompok_jurusan;
    return '';
  };

  const allJurusans = jadwalList.flatMap(item => {
    const j = getJurusanDisplay(item);
    if (!j) return [];
    return j.split(',').map(s => s.trim());
  });
  const uniqueJurusan = [...new Set(allJurusans)].filter(Boolean);
  const uniqueAngkatan = [...new Set(jadwalList.map(item => item.nama_angkatan).filter(Boolean))];

  const filteredJadwal = jadwalList.filter(item => {
    const matchesSearch = String(item.nama_mk).toLowerCase().includes(search.toLowerCase()) || String(item.kode_mk).toLowerCase().includes(search.toLowerCase());
    const matchesSemester = filterSemester === '' || String(item.semester).toLowerCase() === filterSemester.toLowerCase();
    const matchesHari = filterHari === '' || item.hari === filterHari;
    const displayJrs = getJurusanDisplay(item).toLowerCase();
    const matchesJurusan = filterJurusan === '' || displayJrs.includes(filterJurusan.toLowerCase());
    const matchesAngkatan = filterAngkatan === '' || item.nama_angkatan === filterAngkatan;

    return matchesSearch && matchesSemester && matchesHari && matchesJurusan && matchesAngkatan;
  });

  return (
    <div className="animate-in fade-in duration-500 font-sans p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen pb-10">

      {toast.show && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[9999] animate-in slide-in-from-top-8 duration-300">
          <div className={`flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 tracking-tight">{toast.type === 'success' ? 'Berhasil!' : 'Peringatan!'}</span>
              <span className="text-xs font-medium text-slate-500">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0"><CalendarDays size={24} /></div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Jadwal & Sesi</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Pantau kelas berjalan dan bantu kontrol sesi darurat.</p>
            </div>
          </div>
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Cari kode atau nama matkul..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium shadow-sm transition-colors" />
          </div>
        </div>

        <div className="bg-white p-2.5 md:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 px-2 border-r border-slate-200 hidden sm:flex">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-2">Filter</span>
          </div>

          <select className="flex-1 min-w-[130px] px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs md:text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
            <option value="">Semua Semester</option><option value="Ganjil">Semester Ganjil</option><option value="Genap">Semester Genap</option>
          </select>

          <select className="flex-1 min-w-[130px] px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs md:text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none" value={filterHari} onChange={(e) => setFilterHari(e.target.value)}>
            <option value="">Semua Hari</option>
            <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option>
          </select>

          <select className="flex-1 min-w-[130px] px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs md:text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none uppercase" value={filterJurusan} onChange={(e) => setFilterJurusan(e.target.value)}>
            <option value="">Semua Jurusan</option>
            {uniqueJurusan.map((jrs, idx) => <option key={idx} value={jrs}>{jrs}</option>)}
          </select>

          <select className="flex-1 min-w-[130px] px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs md:text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}>
            <option value="">Semua Angkatan/Kelompok</option>
            {uniqueAngkatan.map((angkatan, idx) => <option key={idx} value={angkatan}>{angkatan}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold uppercase text-slate-500">Mata Kuliah & Angkatan</th>
                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold uppercase text-slate-500">Dosen & Jadwal</th>
                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold uppercase text-slate-500 text-center">Status Sesi Live</th>
                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold uppercase text-slate-500 text-right">Kontrol Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJadwal.length > 0 && filteredJadwal.map((item) => {
                const finalJurusan = getJurusanDisplay(item);
                const target = item.target_pertemuan || 16;
                const progressPercent = Math.min(((item.total_pertemuan || 0) / target) * 100, 100);

                let displayBadge = '';
                if (item.jenis_kelas === 'kelompok') {
                  const jurusanKrs = finalJurusan || 'BELUM ADA PESERTA';
                  displayBadge = <div className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase w-fit mt-1.5">KRS: <span className="font-bold">{jurusanKrs}</span></div>;
                } else if (item.nama_angkatan) {
                  const isKlp = isKelompok(item.nama_angkatan);
                  displayBadge = (
                    <div className={`mt-1.5 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase w-fit ${isKlp ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {isKlp ? `KLP: ${item.nama_angkatan}` : item.nama_angkatan}
                    </div>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-bold text-slate-800 text-xs md:text-sm">{item.nama_mk}</div>
                      <div className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">{item.kode_mk} • Smstr {item.semester}</div>
                      {displayBadge}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-xs md:text-sm font-semibold text-slate-700">{item.dosen_nama || <span className="text-rose-400 italic text-[11px] md:text-xs">Dosen Kosong</span>}</div>
                      <div className="mt-1 space-y-1">
                        {item.hari ? (
                          <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-indigo-600"><Clock size={12} /> {item.hari}, {item.jam_mulai}-{item.jam_selesai} WIB</span>
                        ) : (
                          <span className="text-[9px] md:text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Jadwal Belum Diatur</span>
                        )}

                        {item.ruangan && (
                          <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-emerald-600"><MapPin size={12} /> {item.ruangan}</span>
                        )}
                      </div>
                      {item.hari && (
                        <div className="mt-2.5 w-32 md:w-36">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Progress Sesi</span>
                            <span className="text-[10px] font-bold text-indigo-600">{item.total_pertemuan || 0}/{target}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div></div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      {item.sesi_aktif_id ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold shadow-sm animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> AKTIF ({item.sesi_tipe.toUpperCase()})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div> Menunggu Dosen
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 md:gap-2">
                        {item.hari && (
                          <button onClick={() => handleResetJadwal(item.id, item.nama_mk)} className="p-1.5 md:p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors shadow-sm bg-white border border-slate-200" title="Kosongkan Jadwal">
                            <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                        )}
                        <button onClick={() => setModalEdit({ isOpen: true, data: item })} className="p-1.5 md:p-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Edit Jadwal & Target"><Edit size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        <button onClick={() => { if (!item.hari) return showToast("Atur jadwal dulu!", "error"); setModalQR({ isOpen: true, data: item }); }} className={`p-1.5 md:p-2 rounded-lg transition-colors shadow-sm ${item.hari ? 'bg-slate-800 text-white hover:bg-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'}`} title="Cetak QR"><Printer size={16} className="md:w-[18px] md:h-[18px]" /></button>

                        <div className="w-px h-8 bg-slate-200 mx-1 md:mx-2"></div>

                        {item.sesi_aktif_id ? (
                          <button onClick={() => handleTutupSesi(item.sesi_aktif_id, item.nama_mk)} className="px-2 md:px-3 py-1.5 md:py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold text-[10px] md:text-xs hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-colors">
                            <StopCircle size={14} className="md:w-[16px] md:h-[16px] shrink-0" /> <span className="hidden sm:inline">Tutup Paksa</span>
                          </button>
                        ) : (
                          <button onClick={() => setModalBuka({ isOpen: true, data: item })} disabled={!item.hari} className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center gap-1.5 shadow-sm transition-colors ${item.hari ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'}`}>
                            <PlayCircle size={14} className="md:w-[16px] md:h-[16px] shrink-0" /> <span className="hidden sm:inline">Buka Darurat</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredJadwal.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium text-xs md:text-sm bg-slate-50/50">Tidak ada jadwal yang sesuai dengan filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalAturJadwal isOpen={modalEdit.isOpen} matkul={modalEdit.data} onClose={() => setModalEdit({ isOpen: false })} onSave={handleSaveJadwal} />
      <ModalCetakQR isOpen={modalQR.isOpen} matkul={modalQR.data} onClose={() => setModalQR({ isOpen: false })} />
      <ModalBukaSesi isOpen={modalBuka.isOpen} matkul={modalBuka.data} onClose={() => setModalBuka({ isOpen: false })} onSave={handleBukaSesiSubmit} />

    </div>
  );
};

export default JadwalSesi;