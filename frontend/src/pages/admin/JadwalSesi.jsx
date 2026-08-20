import React, { useState, useEffect } from 'react';
import { CalendarDays, Edit, Printer, X, CheckCircle2, AlertCircle, Clock, Search, RotateCcw, Filter, PlayCircle, StopCircle, Radio, FileText, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';
import DataTable from '../../components/common/DataTable';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5}/></button>
        
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-6">
          Atur Jadwal Kuliah <br />
          <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mt-2 inline-block">
            {matkul?.kode_mk} - {matkul?.nama_mk}
          </span>
        </h3>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Hari *</label>
              <select required className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer appearance-none" value={formData.hari} onChange={e => setFormData({ ...formData, hari: e.target.value })}>
                <option value="">Pilih Hari...</option>
                <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-blue-400 block mb-2">Target Sesi *</label>
              <input required type="number" min="1" max="24" className="w-full bg-blue-50/50 text-blue-700 font-bold border border-blue-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-center text-sm transition-all" value={formData.target_pertemuan} onChange={e => setFormData({ ...formData, target_pertemuan: e.target.value })} title="Atur total pertemuan (misal: 16 untuk reguler)" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1"><label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Waktu Mulai *</label><input required type="time" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer" value={formData.jam_mulai} onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })} /></div>
            <div className="flex-1"><label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Waktu Selesai *</label><input required type="time" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer" value={formData.jam_selesai} onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })} /></div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ruangan Kelas (Opsional)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} strokeWidth={2.5} />
              <input type="text" placeholder="Cth: Lab Komputer 1, Ruang 302..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" value={formData.ruangan} onChange={e => setFormData({ ...formData, ruangan: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="w-full mt-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"><CheckCircle2 size={18} strokeWidth={2.5}/> Simpan Jadwal</button>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in print:bg-white print:p-0 print:block" onClick={onClose}>
      <div className="bg-white w-full max-w-lg print:max-w-none rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 print:shadow-none print:w-full print:h-screen print:rounded-none flex flex-col items-center justify-center print:justify-start print:pt-24" onClick={e => e.stopPropagation()}>
        <div className="absolute top-6 right-6 flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 flex items-center gap-2.5 px-5 shadow-sm transition-all active:scale-95"><Printer size={18} strokeWidth={2.5} /> Cetak</button>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 hover:text-rose-600 rounded-2xl transition-all active:scale-95"><X size={20} strokeWidth={2.5} /></button>
        </div>
        <div className="text-center w-full max-w-2xl mx-auto mt-4 print:mt-0">
          <h1 className="text-3xl print:text-5xl font-black text-slate-900 uppercase tracking-widest print:mb-3">E-Absensi</h1>
          <p className="text-lg print:text-2xl font-black text-slate-400 uppercase tracking-widest mb-8 print:mb-12 border-b-2 print:border-b-4 pb-4">STIKOM Elrahma Bogor</p>
          <div className="p-6 print:p-8 border-4 print:border-[10px] border-slate-100 print:border-slate-900 rounded-[32px] inline-block bg-white shadow-xl shadow-slate-200/50 print:shadow-none mb-8 print:mb-16">
            <div className="print:scale-[1.8] print:m-10 origin-center"><QRCode value={qrValue} size={240} level="H" /></div>
          </div>
          <div className="bg-slate-50 print:bg-white rounded-[24px] p-6 print:p-8 border border-slate-200 print:border-4 print:border-slate-800">
            <h2 className="text-2xl print:text-4xl font-black text-slate-800 print:mb-3 tracking-tight">{matkul.nama_mk}</h2>
            <h3 className="text-[11px] print:text-2xl font-black uppercase tracking-widest text-blue-600 mb-5 print:mb-6 mt-1">{matkul.kode_mk} • Smstr {matkul.semester}</h3>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5} /></button>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-6 border-b border-slate-100 pb-5">
          Buka Sesi Darurat <br />
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg mt-2 inline-block">
            Admin Bypass Override
          </span>
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); onSave(matkul.id, matkul.dosen_id, tipe, linkMeet, agenda, jenisSesi, bobotSesi); }} className="space-y-5">

          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/60">
            <label className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-2 block flex items-center gap-2">Pilih Jenis Pertemuan <span className="text-rose-500">*</span></label>
            <select
              className="w-full bg-white border border-emerald-200/60 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-sm text-slate-700 cursor-pointer transition-all"
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
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2"><FileText size={16} strokeWidth={2.5} className="text-slate-400" /> Agenda / Topik Materi <span className="text-rose-500">*</span></label>
            <textarea required rows="2" placeholder="Ketik topik materi..." className="w-full border border-slate-200/60 bg-slate-50 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-sm font-bold text-slate-700 resize-none transition-all placeholder:font-medium placeholder:text-slate-400" value={agenda} onChange={e => setAgenda(e.target.value)}></textarea>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Tipe Perkuliahan</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 cursor-pointer font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm ${tipe === 'offline' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-blue-500/10' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                <input type="radio" className="hidden" checked={tipe === 'offline'} onChange={() => setTipe('offline')} /> Tatap Muka
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 cursor-pointer font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm ${tipe === 'online' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-amber-500/10' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                <input type="radio" className="hidden" checked={tipe === 'online'} onChange={() => setTipe('online')} /> E-Learning
              </label>
            </div>
          </div>

          {tipe === 'online' && (
            <div className="animate-in fade-in duration-300">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Link Zoom / Google Meet *</label>
              <input required type="url" placeholder="https://zoom.us/..." className="w-full border border-slate-200/60 bg-slate-50 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" value={linkMeet} onChange={e => setLinkMeet(e.target.value)} />
            </div>
          )}

          <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 flex justify-center items-center gap-2.5 transition-all mt-4">
            <Radio size={18} strokeWidth={2.5} /> Buka Sesi Kelas Sekarang
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

  const { showToast, showConfirm } = useUiStore();

  const fetchJadwal = async () => {
    try {
      const res = await axiosClient.get(`/jadwal`).then(r => r.data);
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
      const res = await axiosClient.put(`/jadwal/${modalEdit.data.id}`, formData).then(r => r.data);
      if (res.success) { showToast(res.message, "success"); setModalEdit({ isOpen: false }); fetchJadwal(); } else showToast(res.message, "error");
    } catch (err) { }
  };

  const handleResetJadwal = async (id, namaMk) => {
    const isConfirmed = await showConfirm({ title: "Kosongkan Jadwal", message: `Apakah Anda yakin ingin mengosongkan jadwal untuk mata kuliah ${namaMk}?`, type: "warning", confirmText: "Kosongkan" });
    if (!isConfirmed) return;
    try {
      const res = await axiosClient.put(`/jadwal/reset/${id}`).then(r => r.data);
      if (res.success) { showToast(res.message, "success"); fetchJadwal(); }
    } catch (err) { }
  };

  const handleBukaSesiSubmit = async (mk_id, dosen_id, tipe, link_meet, agenda, jenis_sesi, bobot) => {
    try {
      const res = await axiosClient.post(`/jadwal/${mk_id}/sesi`, { dosen_id, tipe, link_meet, agenda, jenis_sesi, bobot }).then(r => r.data);
      if (res.success) { showToast(res.message, "success"); setModalBuka({ isOpen: false }); fetchJadwal(); }
      else showToast(res.message, "error");
    } catch (err) { }
  };

  const handleTutupSesi = async (sesi_id, matkul_nama) => {
    const isConfirmed = await showConfirm({ title: "Tutup Sesi Kelas", message: `Tutup paksa sesi kelas untuk mata kuliah ${matkul_nama} sekarang?`, type: "warning", confirmText: "Tutup Paksa" });
    if (!isConfirmed) return;
    try {
      const res = await axiosClient.patch(`/jadwal/sesi/${sesi_id}/status`).then(r => r.data);
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

  const columns = [
    {
      header: 'Mata Kuliah & Angkatan',
      render: item => {
        const finalJurusan = getJurusanDisplay(item);
        let displayBadge = '';
        if (item.jenis_kelas === 'kelompok') {
          const jurusanKrs = finalJurusan || 'BELUM ADA PESERTA';
          displayBadge = <div className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest w-fit mt-2">KRS: <span className="text-amber-500">{jurusanKrs}</span></div>;
        } else if (item.nama_angkatan) {
          const isKlp = isKelompok(item.nama_angkatan);
          displayBadge = (
            <div className={`mt-2 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest w-fit ${isKlp ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
              {isKlp ? `KLP: ${item.nama_angkatan}` : item.nama_angkatan}
            </div>
          );
        }
        return (
          <>
            <div className="font-bold text-slate-800 text-xs md:text-sm">{item.nama_mk}</div>
            <div className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">{item.kode_mk} • Smstr {item.semester}</div>
            {displayBadge}
          </>
        );
      }
    },
    {
      header: 'Dosen & Jadwal',
      render: item => {
        const target = item.target_pertemuan || 16;
        const progressPercent = Math.min(((item.total_pertemuan || 0) / target) * 100, 100);
        return (
          <>
            <div className="text-xs md:text-sm font-bold text-slate-700">{item.dosen_nama || <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">Dosen Kosong</span>}</div>
            <div className="mt-1 space-y-1.5">
              {item.hari ? (
                <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-blue-600"><Clock size={14} strokeWidth={2.5}/> {item.hari}, {item.jam_mulai}-{item.jam_selesai} WIB</span>
              ) : (
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 inline-block">Jadwal Belum Diatur</span>
              )}
              {item.ruangan && (
                <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-emerald-600"><MapPin size={14} strokeWidth={2.5}/> {item.ruangan}</span>
              )}
            </div>
            {item.hari && (
              <div className="mt-3 w-32 md:w-40">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress Sesi</span>
                  <span className="text-[10px] font-black text-blue-600">{item.total_pertemuan || 0}/{target}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner"><div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 shadow-sm shadow-blue-500/50" style={{ width: `${progressPercent}%` }}></div></div>
              </div>
            )}
          </>
        );
      }
    },
    {
      header: 'Status Sesi Live',
      className: 'text-center',
      tdClassName: 'text-center',
      render: item => {
        if (item.sesi_aktif_id) {
          return (
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> AKTIF ({item.sesi_tipe})
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 text-slate-400 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Menunggu Dosen
            </span>
          );
        }
      }
    },
    {
      header: 'Kontrol Admin',
      className: 'text-center',
      tdClassName: 'text-center',
      render: item => (
        <div className="flex justify-center gap-1.5 md:gap-2">
          {item.hari && (
            <button onClick={() => handleResetJadwal(item.id, item.nama_mk)} className="p-2 md:p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all active:scale-95 shadow-sm bg-white border border-slate-200/60" title="Kosongkan Jadwal">
              <RotateCcw size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
            </button>
          )}
          <button onClick={() => setModalEdit({ isOpen: true, data: item })} className="p-2 md:p-2.5 bg-white text-slate-500 border border-slate-200/60 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 shadow-sm" title="Edit Jadwal & Target"><Edit size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" /></button>
          <button onClick={() => { if (!item.hari) return showToast("Atur jadwal dulu!", "error"); setModalQR({ isOpen: true, data: item }); }} className={`p-2 md:p-2.5 rounded-xl transition-all active:scale-95 shadow-sm border ${item.hari ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-900' : 'bg-slate-50 border-slate-200/60 text-slate-300 cursor-not-allowed'}`} title="Cetak QR"><Printer size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" /></button>

          <div className="w-px h-10 bg-slate-200/60 mx-1 md:mx-2"></div>

          {item.sesi_aktif_id ? (
            <button onClick={() => handleTutupSesi(item.sesi_aktif_id, item.nama_mk)} className="px-3 md:px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-[10px] md:text-xs hover:bg-rose-100 flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <StopCircle size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] shrink-0" /> <span className="hidden sm:inline">Tutup Paksa</span>
            </button>
          ) : (
            <button onClick={() => setModalBuka({ isOpen: true, data: item })} disabled={!item.hari} className={`px-3 md:px-4 py-2 rounded-xl font-bold text-[10px] md:text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 ${item.hari ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed'}`}>
              <PlayCircle size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] shrink-0" /> <span className="hidden sm:inline">Buka Darurat</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 font-sans p-4 md:p-6 lg:p-8 min-h-screen pb-10 relative">

      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm shrink-0">
            <CalendarDays size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Jadwal & Sesi</h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Pantau kelas berjalan dan bantu kontrol sesi darurat.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 md:p-6 animate-in fade-in duration-300">
        <DataTable 
          data={filteredJadwal}
          columns={columns}
          emptyMessage="Tidak ada jadwal yang sesuai dengan filter."
          headerContent={
            <>
              <div className="relative w-full xl:w-80 shrink-0">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} strokeWidth={2.5} />
                <input type="text" placeholder="Cari kode atau nama matkul..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" />
              </div>

              <select className="flex-1 min-w-[130px] px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                <option value="">Semua Semester</option><option value="Ganjil">Semester Ganjil</option><option value="Genap">Semester Genap</option>
              </select>

              <select className="flex-1 min-w-[130px] px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none" value={filterHari} onChange={(e) => setFilterHari(e.target.value)}>
                <option value="">Semua Hari</option>
                <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option>
              </select>

              <select className="flex-1 min-w-[130px] px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none uppercase" value={filterJurusan} onChange={(e) => setFilterJurusan(e.target.value)}>
                <option value="">Semua Jurusan</option>
                {uniqueJurusan.map((jrs, idx) => <option key={idx} value={jrs}>{jrs}</option>)}
              </select>

              <select className="flex-1 min-w-[130px] px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl text-xs md:text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}>
                <option value="">Semua Angkatan/Klp</option>
                {uniqueAngkatan.map((angkatan, idx) => <option key={idx} value={angkatan}>{angkatan}</option>)}
              </select>
            </>
          }
        />
      </div>

      <ModalAturJadwal isOpen={modalEdit.isOpen} matkul={modalEdit.data} onClose={() => setModalEdit({ isOpen: false })} onSave={handleSaveJadwal} />
      <ModalCetakQR isOpen={modalQR.isOpen} matkul={modalQR.data} onClose={() => setModalQR({ isOpen: false })} />
      <ModalBukaSesi isOpen={modalBuka.isOpen} matkul={modalBuka.data} onClose={() => setModalBuka({ isOpen: false })} onSave={handleBukaSesiSubmit} />

    </div>
  );
};

export default JadwalSesi;