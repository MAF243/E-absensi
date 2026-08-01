import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Edit, BookOpen, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, UserPlus, RefreshCw, UploadCloud, Download, Info, Users, Library, CheckSquare, Eye, Filter, ChevronDown, Check } from 'lucide-react';

const isKelompok = (name) => {
  if (!name) return false;
  const n = String(name).toUpperCase();
  if (n.includes('INFORMATIKA') || n.includes('INROMATIKA')) return false;
  return true;
};

// ==========================================
// CUSTOM SEARCHABLE DROPDOWN
// ==========================================
const SearchableSelect = ({ options, value, onChange, placeholder, groups = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let selectedLabel = placeholder;
  if (groups) {
    for (const g of groups) {
      const found = g.options.find(o => String(o.id) === String(value));
      if (found) { selectedLabel = found.label; break; }
    }
  } else {
    const found = options.find(o => String(o.id) === String(value));
    if (found) selectedLabel = found.label;
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs md:text-sm font-semibold cursor-pointer flex justify-between items-center transition-colors ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500 bg-white' : 'border-slate-200 hover:bg-white text-slate-700'}`}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>{selectedLabel}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input 
              autoFocus type="text" placeholder="Ketik untuk mencari..." 
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm outline-none focus:border-indigo-500 font-medium text-slate-700"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
            <div onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }} className="px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-slate-400 hover:bg-slate-100 cursor-pointer">
              -- Kosongkan Pilihan --
            </div>

            {groups ? (
              groups.map((group, idx) => {
                const filteredOpts = group.options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
                if (filteredOpts.length === 0) return null;
                return (
                  <div key={idx} className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 rounded mt-1 mb-1 flex items-center gap-1.5">
                       {group.icon} {group.label}
                    </div>
                    {filteredOpts.map(opt => (
                      <div key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }} className={`px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer flex items-center justify-between transition-colors ${String(value) === String(opt.id) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                        {opt.label} {String(value) === String(opt.id) && <Check size={16}/>}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())).map(opt => (
                <div key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }} className={`px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer flex items-center justify-between transition-colors ${String(value) === String(opt.id) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                  {opt.label} {String(value) === String(opt.id) && <Check size={16}/>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. KOMPONEN MODAL: MASTER MATKUL
// ==========================================
const ModalMasterMatkul = ({ isOpen, onClose, onSave, editData, mahasiswaList }) => {
  const [formData, setFormData] = useState({ kode_mk: '', nama_mk: '', sks: 2, jurusan: '', semester: 'Ganjil' });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Ambil jurusan dari DB sebagai fallback awal
        let syncJurusan = editData.jurusan && editData.jurusan !== '-' ? editData.jurusan : '';
        
        // PAKSA JALANKAN LOGIKA CERDAS: Override/Timpa data jurusan lama di database
        if (editData.jenis_kelas === 'kelompok' && editData.kelompok_jurusan) {
          syncJurusan = editData.kelompok_jurusan;
        } else if (editData.jenis_kelas === 'paket' && editData.angkatan_id && mahasiswaList) {
          const mhsInAngkatan = mahasiswaList.filter(m => 
            String(m.angkatan_id) === String(editData.angkatan_id) || 
            (m.list_kelompok_id && String(m.list_kelompok_id).split(',').includes(String(editData.angkatan_id)))
          );
          const uniqueJrs = [...new Set(mhsInAngkatan.map(m => m.jurusan ? String(m.jurusan).toUpperCase() : '').filter(Boolean))];
          
          // Jika di angkatan tsb ada mahasiswa, PAKSA timpa jurusan lama dengan yang baru
          if (uniqueJrs.length > 0) {
             syncJurusan = uniqueJrs.join(', ');
          }
        }

        setFormData({ ...editData, jurusan: syncJurusan, semester: editData.semester || 'Ganjil' });
      } else {
        setFormData({ kode_mk: '', nama_mk: '', sks: 2, jurusan: '', semester: 'Ganjil' });
      }
    }
  }, [isOpen, editData, mahasiswaList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={20}/></button>
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-5 md:mb-6 border-b border-slate-100 pb-4">{editData ? 'Edit Master Matkul' : 'Tambah Master Matkul'}</h3>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 md:space-y-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-[2]">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kode MK *</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 uppercase text-sm" value={formData.kode_mk} onChange={e => setFormData({...formData, kode_mk: e.target.value.toUpperCase()})} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">SKS *</label>
              <input required type="number" min="1" max="6" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-center text-sm" value={formData.sks} onChange={e => setFormData({...formData, sks: e.target.value})} />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-[2]">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nama Mata Kuliah *</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm" value={formData.nama_mk} onChange={e => setFormData({...formData, nama_mk: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Semester *</label>
              <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target Jurusan Utama</label>
            <input type="text" placeholder="Cth: APQ, ADM, ITK" className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 outline-none uppercase font-bold text-indigo-700 bg-indigo-50/50 text-sm" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value.toUpperCase()})} />
            <p className="text-[10px] md:text-[11px] text-slate-500 mt-2 italic leading-relaxed">* Terisi otomatis dan menyesuaikan dengan daftar mahasiswa jika kelas telah di-plot.</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 sm:py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 text-sm w-full sm:w-auto">Batal</button>
            <button type="submit" className="px-6 py-3 sm:py-2.5 rounded-xl font-semibold bg-indigo-600 text-white text-sm w-full sm:w-auto flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. KOMPONEN MODAL: PLOTTING MATKUL
// ==========================================
const ModalAssignMatkul = ({ isOpen, onClose, onSave, mkData, dosenList, angkatanList, mahasiswaList }) => {
  const [formData, setFormData] = useState({ dosen_id: '', angkatan_id: '', jenis_kelas: 'paket', peserta: [] });
  const [filterJurusan, setFilterJurusan] = useState('');
  const [searchMhs, setSearchMhs] = useState('');

  const activeMhs = mahasiswaList.filter(m => String(m.status_akademik).toLowerCase() !== 'cuti' && String(m.status_akademik).toLowerCase() !== 'tidak aktif');
  const uniqueJurusan = [...new Set(activeMhs.map(item => String(item.jurusan).toUpperCase()).filter(Boolean))];

  const dosenOptions = dosenList.filter(d => String(d.status_akademik).toLowerCase() === 'aktif').map(d => ({ id: d.id, label: d.nama_lengkap }));
  
  const angkatanGroups = [
    { icon: '🎓', label: 'Angkatan Reguler', options: angkatanList.filter(a => !isKelompok(a.nama_angkatan)).map(a => ({ id: a.id, label: a.nama_angkatan })) },
    { icon: '🧩', label: 'Kelompok Kelas (Gabungan)', options: angkatanList.filter(a => isKelompok(a.nama_angkatan)).map(a => ({ id: a.id, label: a.nama_angkatan })) }
  ];

  useEffect(() => {
    if (!isOpen) { setSearchMhs(''); setFilterJurusan(''); return; }
    setFormData({ dosen_id: mkData?.dosen_id || '', angkatan_id: mkData?.angkatan_id || '', jenis_kelas: mkData?.jenis_kelas || 'paket', peserta: [] });

    if (mkData?.jenis_kelas === 'kelompok') {
      fetch(`http://localhost:5000/api/matkul/${mkData.id}/peserta`)
        .then(r => r.json())
        .then(data => { if (data.success && data.data.length > 0) setFormData(prev => ({...prev, peserta: data.data})); }).catch(e => {});
    }
  }, [isOpen, mkData]);

  if (!isOpen) return null;

  const filteredMhsList = activeMhs.filter(m => (filterJurusan === '' || String(m.jurusan).toUpperCase() === filterJurusan) && (String(m.nama_lengkap).toLowerCase().includes(searchMhs.toLowerCase()) || String(m.nomor_induk).includes(searchMhs)));
  const togglePeserta = (id) => setFormData(prev => ({ ...prev, peserta: prev.peserta.includes(id) ? prev.peserta.filter(pid => pid !== id) : [...prev.peserta, id] }));
  const isAllFilteredSelected = filteredMhsList.length > 0 && filteredMhsList.every(mhs => formData.peserta.includes(mhs.id));

  const handleSelectAllFiltered = (e) => {
    if (e.target.checked) {
      const newPeserta = [...formData.peserta];
      filteredMhsList.forEach(mhs => { if (!newPeserta.includes(mhs.id)) newPeserta.push(mhs.id); });
      setFormData({...formData, peserta: newPeserta});
    } else {
      const filteredIds = filteredMhsList.map(m => m.id);
      setFormData({...formData, peserta: formData.peserta.filter(id => !filteredIds.includes(id))});
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl relative animate-in zoom-in-95 min-h-[65vh] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20}/></button>
        
        <div className="mb-4 border-b border-slate-100 pb-4 pr-8 shrink-0">
           <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600"/> Plotting Dosen & Kelas</h3>
           <p className="text-xs md:text-sm font-bold text-indigo-600 mt-1">{mkData?.kode_mk} - {mkData?.nama_mk}</p>
        </div>
        
        <div className="overflow-y-auto pr-1 md:pr-2 flex-1 space-y-5 pb-20">
          <div className="relative z-20">
            <label className="text-xs md:text-sm font-bold text-slate-700 block mb-2">Dosen Pengampu</label>
            <SearchableSelect options={dosenOptions} value={formData.dosen_id} onChange={(id) => setFormData({...formData, dosen_id: id})} placeholder="-- Cari dan Pilih Dosen --" />
          </div>

          <div className="relative z-10">
            <label className="text-xs md:text-sm font-bold text-slate-700 block mb-2">Jenis Kelas</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`flex-1 flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.jenis_kelas === 'paket' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}>
                <input type="radio" name="jenis_kelas" value="paket" checked={formData.jenis_kelas === 'paket'} onChange={() => setFormData({...formData, jenis_kelas: 'paket', peserta: []})} className="w-4 h-4 text-indigo-600 shrink-0" />
                <div><p className="font-bold text-xs md:text-sm">Kelas Paket (Reguler)</p><p className="text-[10px] md:text-xs opacity-70 mt-0.5">Plot ke Angkatan/Kelompok.</p></div>
              </label>
              <label className={`flex-1 flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.jenis_kelas === 'kelompok' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}>
                <input type="radio" name="jenis_kelas" value="kelompok" checked={formData.jenis_kelas === 'kelompok'} onChange={() => setFormData({...formData, jenis_kelas: 'kelompok'})} className="w-4 h-4 text-indigo-600 shrink-0" />
                <div><p className="font-bold text-xs md:text-sm">Kelas Lintas (KRS)</p><p className="text-[10px] md:text-xs opacity-70 mt-0.5">Pilih mahasiswa manual.</p></div>
              </label>
            </div>
          </div>

          {formData.jenis_kelas === 'paket' && (
            <div className="animate-in fade-in duration-300 relative z-[5]">
              <label className="text-xs md:text-sm font-bold text-slate-700 block mb-2">Pilih Angkatan / Kelompok Target</label>
              <SearchableSelect groups={angkatanGroups} value={formData.angkatan_id} onChange={(id) => setFormData({...formData, angkatan_id: id})} placeholder="-- Cari dan Pilih Angkatan/Kelompok --" />
            </div>
          )}

          {formData.jenis_kelas === 'kelompok' && (
            <div className="border border-slate-200 rounded-2xl p-4 md:p-5 bg-indigo-50/30 animate-in fade-in duration-300">
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs md:text-sm font-bold text-indigo-800 uppercase flex items-center gap-1.5"><CheckSquare size={16}/> Pilih Peserta KRS</label>
                <div className="flex items-center gap-2">
                  {formData.peserta.length > 0 && <button type="button" onClick={() => setFormData({...formData, peserta: []})} className="text-[10px] md:text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-md transition-colors border border-rose-200">Reset</button>}
                  <span className="text-[10px] md:text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded shadow-sm">{formData.peserta.length} Dipilih</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input type="text" placeholder="Cari Nama/NIM..." className="flex-1 text-xs md:text-sm border rounded-xl px-3 py-2 bg-white outline-none focus:border-indigo-500" value={searchMhs} onChange={e=>setSearchMhs(e.target.value)} />
                <select className="w-full sm:w-40 text-xs md:text-sm border rounded-xl px-2 py-2 bg-white uppercase font-semibold" value={filterJurusan} onChange={e=>setFilterJurusan(e.target.value)}>
                  <option value="">SEMUA JURUSAN</option>
                  {uniqueJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="flex justify-between items-center mb-2 px-1 pb-2 border-b border-indigo-100 border-dashed">
                <label className="flex items-center gap-2 cursor-pointer text-[10px] md:text-xs font-bold text-indigo-700">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={isAllFilteredSelected} onChange={handleSelectAllFiltered} disabled={filteredMhsList.length === 0} />
                  PILIH SEMUA {filterJurusan ? `JURUSAN ${filterJurusan}` : 'HASIL PENCARIAN'} ({filteredMhsList.length})
                </label>
              </div>
              <div className="bg-white border rounded-xl h-48 overflow-y-auto p-2 space-y-1 shadow-inner">
                {filteredMhsList.map(mhs => (
                  <label key={mhs.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${formData.peserta.includes(mhs.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={formData.peserta.includes(mhs.id)} onChange={() => togglePeserta(mhs.id)} className="w-4 h-4 rounded text-indigo-600 shrink-0" />
                    <div className="min-w-0"><p className="text-xs md:text-sm font-bold text-slate-800 truncate">{mhs.nama_lengkap}</p><p className="text-[10px] text-slate-500 truncate">{mhs.nomor_induk} • <span className="text-indigo-600 uppercase">{mhs.jurusan}</span></p></div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 mt-5 border-t border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 sm:py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors">Batal</button>
          <button onClick={() => onSave(formData)} className="px-8 py-3 sm:py-2.5 rounded-xl font-semibold bg-indigo-600 text-white text-sm shadow-sm hover:bg-indigo-700 transition-colors">Simpan Penugasan</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN MODAL: LIHAT PESERTA
// ==========================================
const ModalLihatPeserta = ({ isOpen, onClose, mkData, onRefresh }) => {
  const [peserta, setPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mkData) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/matkul/${mkData.id}/peserta-detail`)
        .then(r => r.json()).then(data => { if(data.success) { setPeserta(data.data); } setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, mkData]);

  if (!isOpen) return null;

  const hapusPeserta = async (mhs_id, mhs_nama) => {
    if(!window.confirm(`Yakin ingin MENGHAPUS ${mhs_nama}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/matkul/${mkData.id}/peserta/${mhs_id}`, { method: 'DELETE' }).then(r=>r.json());
      if (res.success) { setPeserta(prev => prev.filter(p => p.id !== mhs_id)); onRefresh(); } 
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20}/></button>
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> Daftar Mahasiswa</h3>
        <p className="text-xs md:text-sm font-bold text-indigo-600 mb-4">{mkData?.kode_mk} - {mkData?.nama_mk}</p>

        <div className="bg-slate-50 border rounded-xl h-64 md:h-80 overflow-y-auto">
          {isLoading ? <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">Memuat data...</div> : peserta.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {peserta.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 md:p-4 hover:bg-white transition-colors">
                  <div><p className="text-xs md:text-sm font-bold text-slate-800">{p.nama_lengkap}</p><p className="text-[10px] text-slate-500">{p.nomor_induk} • <span className="text-indigo-600 uppercase font-bold">{p.jurusan}</span></p></div>
                  <button onClick={() => hapusPeserta(p.id, p.nama_lengkap)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors" title="Hapus"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada peserta.</div>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. KOMPONEN MODAL: IMPORT CSV (DITAMBAH PANDUAN)
// ==========================================
const ModalCSVMatkul = ({ isOpen, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const content = "kode_mk;nama_mk;sks;jurusan;semester\nTIF101;Algoritma Pemrograman;3;ITK;Ganjil\n";
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Template_Matkul.csv'; a.click();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = event.target.result.split('\n').map(r => r.trim()).filter(r => r);
      if (rows.length < 2) return alert("File kosong.");
      const headers = rows[0].split(rows[0].includes(';') ? ';' : ',').map(h => h.trim().toLowerCase());
      const parsed = [];
      for (let i = 1; i < rows.length; i++) {
        const val = rows[i].split(rows[i].includes(';') ? ';' : ',');
        let rowData = {};
        headers.forEach((h, idx) => rowData[h] = val[idx] || '');
        parsed.push(rowData);
      }
      setCsvData(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/matkul/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: csvData }) 
      }).then(r => r.json());
      if (res.success) { onSuccess(); onClose(); setCsvData([]); } else alert(res.message);
    } catch (err) { alert("Error koneksi."); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 rounded-lg"><X size={20}/></button>
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Import CSV Mata Kuliah</h3>
        
        {csvData.length === 0 ? (
          <div className="space-y-4">
            <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"><Download size={16}/> Unduh Template CSV</button>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFile} className="hidden" />
            <div onClick={() => fileInputRef.current.click()} className="py-12 border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 transition-colors rounded-2xl flex flex-col items-center justify-center cursor-pointer">
              <UploadCloud size={36} className="text-indigo-400 mb-3" />
              <p className="font-bold text-slate-600 text-sm">Klik di sini untuk upload file CSV</p>
            </div>

            {/* PANDUAN CSV */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
               <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1.5"><Info size={16}/> Panduan Format CSV</h4>
               <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-4 font-medium">
                  <li>Pastikan file berformat <b>.csv</b> (Comma Separated Values).</li>
                  <li>Baris pertama harus berisi header: <br/><b className="bg-blue-100 px-1 rounded text-[10px]">kode_mk, nama_mk, sks, jurusan, semester</b></li>
                  <li><b>kode_mk</b> harus bersifat unik (belum pernah dipakai).</li>
                  <li>Isi <b>semester</b> cukup dengan "Ganjil" atau "Genap".</li>
               </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
               <CheckCircle2 className="text-emerald-500" size={24}/>
               <div>
                  <p className="font-bold text-emerald-800 text-sm">File Berhasil Dibaca</p>
                  <p className="text-xs text-emerald-600 font-semibold">{fileName} ({csvData.length} Baris Data)</p>
               </div>
            </div>
            <div className="flex justify-end gap-3">
               <button onClick={() => {setCsvData([]); setFileName('');}} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Batal</button>
               <button onClick={handleUpload} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md">Proses Import</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. HALAMAN UTAMA: DATA MATKUL
// ==========================================
const DataMatkul = () => {
  const [activeTab, setActiveTab] = useState('master'); 
  const [matkulList, setMatkulList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [angkatanList, setAngkatanList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState(''); 
  const [selectedIds, setSelectedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isMasterOpen, setMasterOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isPesertaOpen, setPesertaOpen] = useState(false);
  const [isCsvOpen, setCsvOpen] = useState(false);
  const [selectedMatkul, setSelectedMatkul] = useState(null); 
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (msg, type = 'success') => { setToast({ show: true, message: msg, type }); setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000); };

  const BASE_URL = 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const [rMatkul, rDosen, rAngkatan, rMhs] = await Promise.all([
        fetch(`${BASE_URL}/api/matkul`).then(r => r.json()).catch(()=>({data:[]})),
        fetch(`${BASE_URL}/api/dosen`).then(r => r.json()).catch(()=>({data:[]})),
        fetch(`${BASE_URL}/api/angkatan`).then(r => r.json()).catch(()=>({data:[]})),
        fetch(`${BASE_URL}/api/mahasiswa`).then(r => r.json()).catch(()=>({data:[]}))
      ]);
      setMatkulList(rMatkul.data || []); setDosenList(rDosen.data || []); setAngkatanList(rAngkatan.data || []); setMahasiswaList(rMhs.data || []);
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = matkulList.filter(m => {
    const matchesSearch = String(m.nama_mk).toLowerCase().includes(search.toLowerCase()) || String(m.kode_mk).toLowerCase().includes(search.toLowerCase());
    const matchesSemester = filterSemester === '' || String(m.semester).toLowerCase() === filterSemester.toLowerCase();
    return matchesSearch && matchesSemester;
  });

  useEffect(() => { setCurrentPage(1); }, [search, filterSemester, activeTab, itemsPerPage]);

  const totalItems = filteredData.length;
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'All' ? totalItems : startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = (e) => setSelectedIds(e.target.checked ? paginatedData.map(d => d.id) : []);

  const saveMaster = async (data) => {
    const url = selectedMatkul ? `${BASE_URL}/api/matkul/${selectedMatkul.id}` : `${BASE_URL}/api/matkul`;
    const res = await fetch(url, { method: selectedMatkul ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r=>r.json());
    if (res.success) { showToast(res.message); setMasterOpen(false); fetchData(); }
  };

  const saveAssign = async (data) => {
    const res = await fetch(`${BASE_URL}/api/matkul/${selectedMatkul.id}/assign`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r=>r.json());
    if (res.success) { showToast(res.message); setAssignOpen(false); fetchData(); }
  };

  const deleteSingle = async (id) => {
    if(!window.confirm("Hapus mata kuliah ini?")) return;
    const res = await fetch(`${BASE_URL}/api/matkul/${id}`, { method: 'DELETE' }).then(r=>r.json());
    if (res.success) { showToast(res.message); fetchData(); }
  };

  const bulkDelete = async () => {
    if(!window.confirm(`Hapus ${selectedIds.length} mata kuliah?`)) return;
    const res = await fetch(`${BASE_URL}/api/matkul/bulk-delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) }).then(r=>r.json());
    if (res.success) { showToast(res.message); setSelectedIds([]); fetchData(); }
  };

  const resetSemester = async () => {
    if(!window.confirm(`Kosongkan penugasan ${selectedIds.length} mata kuliah?`)) return;
    const res = await fetch(`${BASE_URL}/api/matkul/reset-penugasan`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) }).then(r=>r.json());
    if (res.success) { showToast(res.message); setSelectedIds([]); fetchData(); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans animate-in duration-500 pb-10">
      
      {toast.show && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[9999] animate-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border bg-white border-emerald-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={20}/></div>
            <span className="text-xs md:text-sm font-bold text-slate-800">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md"><Library size={24} /></div>
          <div><h2 className="text-xl md:text-2xl font-bold text-slate-800">Manajemen Kurikulum</h2><p className="text-xs md:text-sm text-slate-500">Kelola data mata kuliah dan penugasan dosen.</p></div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border shadow-sm w-full md:w-fit">
          <button onClick={() => setActiveTab('master')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${activeTab === 'master' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><BookOpen size={16} className="inline mr-1"/> Master Data</button>
          <button onClick={() => setActiveTab('plotting')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${activeTab === 'plotting' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><Users size={16} className="inline mr-1"/> Plotting Kelas</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border flex flex-col">
        <div className="p-4 md:p-6 border-b flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64"><Search className="absolute left-3.5 top-3 text-slate-400" size={18} /><input type="text" placeholder="Cari Matkul..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl outline-none text-xs md:text-sm" value={search} onChange={e=>setSearch(e.target.value)} /></div>
            <select className="px-3 py-2 bg-slate-50 border rounded-xl text-xs md:text-sm font-bold text-slate-600 outline-none" value={filterSemester} onChange={e=>setFilterSemester(e.target.value)}>
              <option value="">Semua Semester</option><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
            </select>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            {activeTab === 'master' ? (
              <>
                {selectedIds.length > 0 && <button onClick={bulkDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold">Hapus ({selectedIds.length})</button>}
                <button onClick={() => setCsvOpen(true)} className="border px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50">Import CSV</button>
                <button onClick={() => { setSelectedMatkul(null); setMasterOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"><Plus size={16} className="inline mr-1"/> Tambah MK</button>
              </>
            ) : (
              <>{selectedIds.length > 0 && <button onClick={resetSemester} className="bg-amber-50 text-amber-600 border px-4 py-2 rounded-xl text-xs font-bold">Reset ({selectedIds.length})</button>}</>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full min-h-[300px]">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-4 w-12 text-center"><input type="checkbox" onChange={toggleAll} checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length} className="w-4 h-4 text-indigo-600 rounded" /></th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">Kode MK</th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">Nama Mata Kuliah</th>
                {activeTab === 'master' ? (
                  <><th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">Semester</th><th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">SKS</th><th className="px-4 py-4 text-xs font-bold uppercase text-indigo-500">JURUSAN / KELOMPOK / ANGKATAN</th></>
                ) : (
                  <><th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">Dosen Pengampu</th><th className="px-4 py-4 text-xs font-bold uppercase text-indigo-500">JURUSAN / KELOMPOK / ANGKATAN</th></>
                )}
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map(m => {
                let displayBadge = '';
                if (m.jenis_kelas === 'kelompok') {
                  const jurusanKrs = m.kelompok_jurusan || 'BELUM ADA PESERTA';
                  displayBadge = <div className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit">KRS: <span className="font-bold">{jurusanKrs}</span></div>;
                } else if (m.nama_angkatan) {
                  const isKlp = isKelompok(m.nama_angkatan);
                  displayBadge = <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${isKlp ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>{isKlp ? `KLP: ${m.nama_angkatan}` : m.nama_angkatan}</div>;
                } else {
                  displayBadge = <div className="text-xs text-slate-400 italic">Belum di-plot</div>;
                }

                return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center"><input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleSelect(m.id)} className="w-4 h-4 text-indigo-600 rounded" /></td>
                  <td className="px-4 py-3 font-semibold text-slate-600 text-xs md:text-sm">{m.kode_mk}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 text-xs md:text-sm">{m.nama_mk}</td>
                  
                  {activeTab === 'master' ? (
                    <>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${m.semester === 'Ganjil' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{m.semester || 'Ganjil'}</span></td>
                      <td className="px-4 py-3 font-bold text-slate-600 text-xs md:text-sm">{m.sks}</td>
                      <td className="px-4 py-3">{displayBadge}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={()=>{setSelectedMatkul(m); setPesertaOpen(true);}} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg" title="Lihat Peserta"><Eye size={16}/></button>
                          <button onClick={()=>{setSelectedMatkul(m); setMasterOpen(true);}} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"><Edit size={16}/></button>
                          <button onClick={()=>deleteSingle(m.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-slate-700 text-xs md:text-sm">{m.nama_dosen || <span className="text-rose-400 italic text-xs">Belum ada dosen</span>}</td>
                      <td className="px-4 py-3">{displayBadge}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={()=>{setSelectedMatkul(m); setAssignOpen(true);}} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs rounded-lg hover:bg-indigo-100 flex items-center gap-1 ml-auto"><UserPlus size={14}/> Plotting</button>
                      </td>
                    </>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-4 border-t gap-3 bg-white rounded-b-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tampil</span>
            <select className="bg-slate-50 border rounded-lg px-2 py-1 text-xs font-bold" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
              <option value={10}>10</option><option value={50}>50</option><option value="All">Semua</option>
            </select>
          </div>
          <div className="text-xs text-slate-500">Melihat {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems}</div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || itemsPerPage === 'All'} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || itemsPerPage === 'All'} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <ModalMasterMatkul isOpen={isMasterOpen} onClose={()=>setMasterOpen(false)} onSave={saveMaster} editData={selectedMatkul} mahasiswaList={mahasiswaList} />
      <ModalAssignMatkul isOpen={isAssignOpen} onClose={()=>setAssignOpen(false)} onSave={saveAssign} mkData={selectedMatkul} dosenList={dosenList} angkatanList={angkatanList} mahasiswaList={mahasiswaList} />
      <ModalLihatPeserta isOpen={isPesertaOpen} onClose={()=>setPesertaOpen(false)} mkData={selectedMatkul} onRefresh={fetchData} />
      <ModalCSVMatkul isOpen={isCsvOpen} onClose={()=>setCsvOpen(false)} onSuccess={()=>{fetchData(); showToast("CSV diimpor!");}} />
    </div>
  );
};

export default DataMatkul;