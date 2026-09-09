import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Edit, BookOpen, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, UserPlus, RefreshCw, UploadCloud, Download, Info, Users, Library, CheckSquare, Eye, Filter, ChevronDown, Check } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';

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
        className={`w-full bg-slate-50 border rounded-2xl px-5 py-3.5 text-xs md:text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200/60 hover:bg-white hover:border-slate-300 text-slate-700'}`}
      >
        <span className={value ? "text-slate-800" : "text-slate-400 font-medium"}>{selectedLabel}</span>
        <ChevronDown size={18} strokeWidth={2.5} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative mb-2">
            <Search size={16} strokeWidth={2.5} className="absolute left-3 top-3 text-slate-400" />
            <input 
              autoFocus type="text" placeholder="Ketik untuk mencari..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1 custom-scrollbar p-1">
            <div onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }} className="px-4 py-3 rounded-xl text-xs md:text-sm font-bold text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
              -- Kosongkan Pilihan --
            </div>

            {groups ? (
              groups.map((group, idx) => {
                const filteredOpts = group.options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
                if (filteredOpts.length === 0) return null;
                return (
                  <div key={idx} className="mb-3 last:mb-0">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50/80 rounded-lg mt-2 mb-2 flex items-center gap-2">
                       {group.icon} {group.label}
                    </div>
                    {filteredOpts.map(opt => (
                      <div key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }} className={`px-4 py-3 rounded-xl text-xs md:text-sm font-bold cursor-pointer flex items-center justify-between transition-colors ${String(value) === String(opt.id) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {opt.label} {String(value) === String(opt.id) && <Check size={18} strokeWidth={2.5}/>}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())).map(opt => (
                <div key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }} className={`px-4 py-3 rounded-xl text-xs md:text-sm font-bold cursor-pointer flex items-center justify-between transition-colors ${String(value) === String(opt.id) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {opt.label} {String(value) === String(opt.id) && <Check size={18} strokeWidth={2.5}/>}
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
const ModalMasterMatkul = ({ isOpen, onClose, onSave, editData, mahasiswaList, prodiList }) => {
  const [formData, setFormData] = useState({ kode_mk: '', nama_mk: '', sks: 2, jurusan: '', prodi_id: '', semester: 'Ganjil' });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Ambil jurusan dari target plotting yang tersimpan.
        let syncJurusan = editData.jurusan && editData.jurusan !== '-' ? editData.jurusan : '';
        
        // PAKSA JALANKAN LOGIKA CERDAS: Override/Timpa data jurusan lama di database
        if (editData.jenis_kelas === 'kelompok' && editData.kelas_id && mahasiswaList) {
          const mhsInKelas = mahasiswaList.filter(m => String(m.kelas_id) === String(editData.kelas_id));
          const uniqueJrs = [...new Set(mhsInKelas.map(m => m.jurusan ? String(m.jurusan).toUpperCase() : '').filter(Boolean))];
          if (uniqueJrs.length > 0) syncJurusan = uniqueJrs.join(', ');
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

        setFormData({ ...editData, jurusan: syncJurusan, prodi_id: editData.prodi_id || '', semester: editData.semester || 'Ganjil' });
      } else {
        setFormData({ kode_mk: '', nama_mk: '', sks: 2, jurusan: '', prodi_id: prodiList?.find((prodi) => prodi.aktif)?.id || '', semester: 'Ganjil' });
      }
    }
  }, [isOpen, editData, mahasiswaList, prodiList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[32px] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5}/></button>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Library size={24} strokeWidth={2.5}/></div>
          {editData ? 'Edit Master Matkul' : 'Tambah Master Matkul'}
        </h3>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-[2]">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Kode MK *</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white uppercase text-sm font-bold transition-all text-slate-800 placeholder:text-slate-300" value={formData.kode_mk} onChange={e => setFormData({...formData, kode_mk: e.target.value.toUpperCase()})} placeholder="Cth: TIF101"/>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">SKS *</label>
              <input required type="number" min="1" max="6" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-center text-sm font-bold transition-all text-slate-800" value={formData.sks} onChange={e => setFormData({...formData, sks: e.target.value})} />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-[2]">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nama Mata Kuliah *</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold transition-all text-slate-800 placeholder:text-slate-300 placeholder:font-medium" value={formData.nama_mk} onChange={e => setFormData({...formData, nama_mk: e.target.value})} placeholder="Cth: Algoritma & Pemrograman"/>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Semester *</label>
              <select required className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold transition-all text-slate-800 cursor-pointer appearance-none" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Jurusan / Kelompok</label>
            <input type="text" placeholder="Cth: APQ, ADM, ITK" className="w-full border border-indigo-200 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-400 uppercase font-medium tracking-wider text-indigo-700 bg-indigo-50/50 text-sm transition-all placeholder:text-indigo-300" value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value.toUpperCase()})} />
            <p className="text-[10px] font-medium text-slate-400 mt-2.5 italic leading-relaxed">Untuk Kelas Kelompok, jurusan terisi otomatis dari anggota kelas yang dipilih.</p>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Prodi *</label>
            <select required className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold text-slate-800 cursor-pointer" value={formData.prodi_id} onChange={e => setFormData({...formData, prodi_id: e.target.value})}>
              <option value="">Pilih Prodi</option>
              {prodiList?.filter(prodi => prodi.aktif || String(prodi.id) === String(formData.prodi_id)).map(prodi => <option key={prodi.id} value={prodi.id}>{prodi.nama_prodi}</option>)}
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3.5 sm:py-3.5 rounded-2xl font-bold bg-slate-100 text-slate-600 text-sm w-full sm:w-auto hover:bg-slate-200 active:scale-95 transition-all">Batal</button>
            <button type="submit" className="px-6 py-3.5 sm:py-3.5 rounded-2xl font-bold bg-blue-600 text-white text-sm w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"><CheckCircle2 size={18} strokeWidth={2.5}/> Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. KOMPONEN MODAL: PLOTTING MATKUL
// ==========================================
const ModalAssignMatkul = ({ isOpen, onClose, onSave, mkData, dosenList, kelasList, mahasiswaList, prodiList }) => {
  const [formData, setFormData] = useState({ dosen_id: '', kelas_id: '', jurusan: '', prodi_id: '', jenis_kelas: 'kelompok', peserta: [] });
  const [filterJurusan, setFilterJurusan] = useState('');
  const [searchMhs, setSearchMhs] = useState('');

  const activeMhs = mahasiswaList.filter(m => String(m.status_akademik || 'AKTIF').toUpperCase() === 'AKTIF');
  const uniqueJurusan = [...new Set(activeMhs.map(item => String(item.jurusan).toUpperCase()).filter(Boolean))];

  const dosenOptions = dosenList.filter(d => String(d.status_akademik).toLowerCase() === 'aktif').map(d => ({ id: d.id, label: d.nama_lengkap }));
  
  const kelasOptions = kelasList.map(k => ({ id: k.id, label: k.nama_kelas }));

  useEffect(() => {
    if (!isOpen) { setSearchMhs(''); setFilterJurusan(''); return; }
    setFormData({ dosen_id: mkData?.dosen_id || '', kelas_id: mkData?.kelas_id || '', jurusan: mkData?.jurusan || '', prodi_id: mkData?.prodi_id || '', jenis_kelas: mkData?.jenis_kelas === 'kelompok' ? 'kelompok' : 'paket', peserta: [] });

    if (mkData?.jenis_kelas === 'lintas') {
      axiosClient.get(`/matkul/${mkData.id}/peserta`)
        .then(r => r.data)
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl rounded-[32px] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 min-h-[70vh] max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5}/></button>
        
        <div className="mb-6 border-b border-slate-100 pb-5 pr-8 shrink-0">
           <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><UserPlus size={24} strokeWidth={2.5}/></div>
             Plotting Dosen & Kelas
           </h3>
           <p className="text-xs md:text-sm font-bold text-blue-600 mt-2 bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100">{mkData?.kode_mk} - {mkData?.nama_mk}</p>
        </div>
        
        <div className="overflow-y-auto pr-1 md:pr-2 flex-1 space-y-6 pb-20 custom-scrollbar">
          <div className="relative z-20">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Dosen Pengampu</label>
            <SearchableSelect options={dosenOptions} value={formData.dosen_id} onChange={(id) => setFormData({...formData, dosen_id: id})} placeholder="-- Cari dan Pilih Dosen --" />
          </div>

          <div className="relative z-20">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Prodi</label>
            <SearchableSelect options={prodiList.filter(prodi => prodi.aktif).map(prodi => ({ id: prodi.id, label: prodi.nama_prodi }))} value={formData.prodi_id} onChange={(id) => setFormData({...formData, prodi_id: id})} placeholder="-- Pilih Prodi --" />
          </div>

          <div className="relative z-10">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Jenis Kelas</label>
                <div className="flex flex-col sm:flex-row gap-4">
              <label className={`flex-1 flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.jenis_kelas === 'kelompok' ? 'bg-blue-50/50 border-blue-500 text-blue-800 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'}`}>
                <input type="radio" name="jenis_kelas" value="kelompok" checked={formData.jenis_kelas === 'kelompok'} onChange={() => setFormData({...formData, jenis_kelas: 'kelompok', jurusan: '', peserta: []})} className="w-5 h-5 text-blue-600 shrink-0 cursor-pointer" />
                <div><p className="font-bold text-sm">Kelas Kelompok</p><p className="text-xs font-semibold text-slate-500 mt-1">Contoh: INFORMATIKA 8 MALAM, PTG2.</p></div>
              </label>
              <label className={`flex-1 flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.jenis_kelas === 'paket' ? 'bg-blue-50/50 border-blue-500 text-blue-800 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'}`}>
                <input type="radio" name="jenis_kelas" value="paket" checked={formData.jenis_kelas === 'paket'} onChange={() => setFormData({...formData, jenis_kelas: 'paket', kelas_id: '', peserta: []})} className="w-5 h-5 text-blue-600 shrink-0 cursor-pointer" />
                <div><p className="font-bold text-sm">Kelas Jurusan</p><p className="text-xs font-semibold text-slate-500 mt-1">Contoh: ITK, ADM, KDG.</p></div>
              </label>
            </div>
          </div>

          {formData.jenis_kelas === 'kelompok' && (
            <div className="animate-in fade-in duration-300 relative z-[5]">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pilih Kelas Kelompok</label>
              <SearchableSelect options={kelasOptions} value={formData.kelas_id} onChange={(id) => setFormData({...formData, kelas_id: id})} placeholder="-- Cari dan Pilih Kelas Kelompok --" />
            </div>
          )}

          {formData.jenis_kelas === 'paket' && (
            <div className="animate-in fade-in duration-300 relative z-[5]">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pilih Jurusan</label>
              <SearchableSelect options={uniqueJurusan.map(jurusan => ({ id: jurusan, label: jurusan }))} value={formData.jurusan} onChange={(jurusan) => setFormData({...formData, jurusan})} placeholder="-- Cari dan Pilih Jurusan --" />
            </div>
          )}

          {formData.jenis_kelas === 'lintas' && (
            <div className="border-2 border-indigo-100/60 rounded-[24px] p-5 md:p-6 bg-indigo-50/30 animate-in fade-in duration-300">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2"><CheckSquare size={18} strokeWidth={2.5}/> Pilih Peserta KRS</label>
                <div className="flex items-center gap-2">
                  {formData.peserta.length > 0 && <button type="button" onClick={() => setFormData({...formData, peserta: []})} className="text-[10px] md:text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all active:scale-95 border border-rose-200">Reset</button>}
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg shadow-sm">{formData.peserta.length} Dipilih</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                   <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} strokeWidth={2.5} />
                   <input type="text" placeholder="Cari Nama/NIM..." className="w-full text-xs md:text-sm font-bold border border-slate-200/80 rounded-xl pl-9 pr-3 py-3 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium" value={searchMhs} onChange={e=>setSearchMhs(e.target.value)} />
                </div>
                <select className="w-full sm:w-44 text-xs md:text-sm font-bold border border-slate-200/80 rounded-xl px-4 py-3 bg-white uppercase cursor-pointer outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" value={filterJurusan} onChange={e=>setFilterJurusan(e.target.value)}>
                  <option value="">SEMUA JURUSAN</option>
                  {uniqueJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="flex justify-between items-center mb-3 px-2 pb-3 border-b border-indigo-200 border-dashed">
                <label className="flex items-center gap-2.5 cursor-pointer text-[10px] md:text-xs font-bold text-indigo-700 hover:opacity-80 transition-opacity">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked={isAllFilteredSelected} onChange={handleSelectAllFiltered} disabled={filteredMhsList.length === 0} />
                  PILIH SEMUA {filterJurusan ? `JURUSAN ${filterJurusan}` : 'HASIL PENCARIAN'} ({filteredMhsList.length})
                </label>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl h-56 overflow-y-auto p-2 space-y-1 shadow-inner custom-scrollbar">
                {filteredMhsList.map(mhs => (
                  <label key={mhs.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${formData.peserta.includes(mhs.id) ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <input type="checkbox" checked={formData.peserta.includes(mhs.id)} onChange={() => togglePeserta(mhs.id)} className="w-4 h-4 rounded text-indigo-600 shrink-0 cursor-pointer" />
                    <div className="min-w-0"><p className="text-xs md:text-sm font-bold text-slate-800 truncate">{mhs.nama_lengkap}</p><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate mt-0.5">{mhs.nomor_induk} • <span className="text-indigo-500">{mhs.jurusan}</span></p></div>
                  </label>
                ))}
                {filteredMhsList.length === 0 && <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Pencarian kosong</div>}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2 border-t border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3.5 sm:py-3.5 rounded-2xl font-bold bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 active:scale-95 transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="px-8 py-3.5 sm:py-3.5 rounded-2xl font-bold bg-blue-600 text-white text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">Simpan Penugasan</button>
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
  const { showConfirm, showToast } = useUiStore();

  useEffect(() => {
    if (isOpen && mkData) {
      setIsLoading(true);
      axiosClient.get(`/matkul/${mkData.id}/peserta-detail`)
        .then(r => r.data).then(data => { if(data.success) { setPeserta(data.data); } setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, mkData]);

  if (!isOpen) return null;

  const hapusPeserta = async (mhs_id, mhs_nama) => {
    const isConfirmed = await showConfirm({ title: "Hapus Peserta", message: `Yakin ingin menghapus ${mhs_nama} dari mata kuliah ini?`, type: "warning", confirmText: "Hapus" });
    if (!isConfirmed) return;

    try {
      const res = await axiosClient.delete(`/matkul/${mkData.id}/peserta/${mhs_id}`).then(r=>r.data);
      if (res.success) { 
        setPeserta(prev => prev.filter(p => p.id !== mhs_id)); 
        onRefresh(); 
        showToast("Peserta dihapus.", "success");
      } 
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-[32px] p-6 md:p-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5}/></button>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} strokeWidth={2.5}/></div>
          Daftar Mahasiswa
        </h3>
        <p className="text-[11px] md:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit mb-6 uppercase tracking-widest">{mkData?.kode_mk} - {mkData?.nama_mk}</p>

        <div className="bg-white border border-slate-200/80 rounded-2xl h-[28rem] md:h-[34rem] overflow-y-auto shadow-inner custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-wider animate-pulse gap-2"><RefreshCw size={24} className="animate-spin"/> Memuat data...</div> : peserta.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {peserta.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{p.nama_lengkap}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{p.nomor_induk} • <span className="text-blue-500">{p.jurusan}</span></p>
                  </div>
                  <button onClick={() => hapusPeserta(p.id, p.nama_lengkap)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-95" title="Hapus"><Trash2 size={18} strokeWidth={2.5}/></button>
                </div>
              ))}
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider">Belum ada peserta.</div>}
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
      const res = await axiosClient.post(`/matkul/bulk`, { data: csvData }).then(r => r.data);
      if (res.success) { onSuccess(); onClose(); setCsvData([]); } else alert(res.message);
    } catch (err) { alert("Error koneksi."); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-[32px] p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all active:scale-95"><X size={20} strokeWidth={2.5}/></button>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><UploadCloud size={24} strokeWidth={2.5}/></div>
          Import CSV Mata Kuliah
        </h3>
        
        {csvData.length === 0 ? (
          <div className="space-y-5">
            <button onClick={downloadTemplate} className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200/80 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 w-full sm:w-auto"><Download size={18} strokeWidth={2.5}/> Unduh Template CSV</button>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFile} className="hidden" />
            <div onClick={() => fileInputRef.current.click()} className="py-14 border-2 border-dashed border-blue-200/80 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 transition-all rounded-[24px] flex flex-col items-center justify-center cursor-pointer group">
              <div className="p-4 bg-white rounded-full shadow-sm shadow-blue-500/10 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                <UploadCloud size={36} strokeWidth={2.5} className="text-blue-500" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Klik di sini untuk upload file CSV</p>
              <p className="font-medium text-slate-400 text-xs mt-1">Hanya format .csv yang didukung</p>
            </div>

            {/* PANDUAN CSV */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 mt-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2"><Info size={16} className="text-blue-500"/> Panduan Format CSV</h4>
               <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 font-medium leading-relaxed">
                  <li>Pastikan file berformat <b>.csv</b> (Comma Separated Values).</li>
                  <li>Baris pertama harus berisi header: <br/><b className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] text-blue-600 shadow-sm mt-1 inline-block">kode_mk, nama_mk, sks, jurusan, semester</b></li>
                  <li><b className="text-slate-800">kode_mk</b> harus bersifat unik (belum pernah dipakai).</li>
                  <li>Isi <b className="text-slate-800">semester</b> cukup dengan "Ganjil" atau "Genap".</li>
               </ul>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-center gap-4 p-5 bg-emerald-50/80 border border-emerald-100 rounded-2xl mb-6 shadow-sm">
               <div className="p-3 bg-white rounded-full shadow-sm"><CheckCircle2 className="text-emerald-500" size={28} strokeWidth={2.5}/></div>
               <div>
                  <p className="font-black text-emerald-800 text-base tracking-tight mb-0.5">File Berhasil Dibaca</p>
                  <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-bold">{fileName} • {csvData.length} Baris Data</p>
               </div>
            </div>
            <div className="flex justify-end gap-3">
               <button onClick={() => {setCsvData([]); setFileName('');}} className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all active:scale-95">Batal</button>
               <button onClick={handleUpload} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">Proses Import</button>
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
  const [kelasList, setKelasList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState(''); 
  const [selectedIds, setSelectedIds] = useState([]);

  const [isMasterOpen, setMasterOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isPesertaOpen, setPesertaOpen] = useState(false);
  const [isCsvOpen, setCsvOpen] = useState(false);
  const [selectedMatkul, setSelectedMatkul] = useState(null); 
  
  const { showToast, showConfirm } = useUiStore();

  const fetchData = async () => {
    try {
      const [rMatkul, rDosen, rKelas, rMhs, rProdi] = await Promise.all([
        axiosClient.get(`/matkul`).then(r => r.data).catch(()=>({data:[]})),
        axiosClient.get(`/dosen`).then(r => r.data).catch(()=>({data:[]})),
        axiosClient.get(`/kelas`).then(r => r.data).catch(()=>({data:[]})),
        axiosClient.get(`/mahasiswa`).then(r => r.data).catch(()=>({data:[]})),
        axiosClient.get(`/prodi`).then(r => r.data).catch(()=>({data:[]}))
      ]);
      setMatkulList(rMatkul.data || []); setDosenList(rDosen.data || []); setKelasList(rKelas.data || []); setMahasiswaList(rMhs.data || []); setProdiList(rProdi.data || []);
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = matkulList.filter(m => {
    const matchesSearch = String(m.nama_mk).toLowerCase().includes(search.toLowerCase()) || String(m.kode_mk).toLowerCase().includes(search.toLowerCase());
    const matchesSemester = filterSemester === '' || String(m.semester).toLowerCase() === filterSemester.toLowerCase();
    return matchesSearch && matchesSemester;
  });

  const saveMaster = async (data) => {
    const url = selectedMatkul ? `/matkul/${selectedMatkul.id}` : `/matkul`;
    const res = await axiosClient.request({ url, method: selectedMatkul ? 'PUT' : 'POST', data }).then(r=>r.data);
    if (res.success) { showToast(res.message, "success"); setMasterOpen(false); fetchData(); }
  };

  const saveAssign = async (data) => {
    const res = await axiosClient.put(`/matkul/${selectedMatkul.id}/assign`, data).then(r=>r.data);
    if (res.success) { showToast(res.message, "success"); setAssignOpen(false); fetchData(); }
  };

  const deleteSingle = async (id) => {
    const isConfirmed = await showConfirm({ title: "Hapus Mata Kuliah", message: "Apakah Anda yakin ingin menghapus data mata kuliah ini secara permanen?", type: "warning", confirmText: "Hapus Data" });
    if(!isConfirmed) return;

    const res = await axiosClient.delete(`/matkul/${id}`).then(r=>r.data);
    if (res.success) { showToast(res.message, "success"); fetchData(); }
  };

  const bulkDelete = async () => {
    const isConfirmed = await showConfirm({ title: "Hapus Massal", message: `Hapus ${selectedIds.length} mata kuliah secara permanen? Data yang terhapus tidak dapat dikembalikan.`, type: "warning", confirmText: "Ya, Hapus Semua" });
    if(!isConfirmed) return;

    const res = await axiosClient.delete(`/matkul/bulk-delete`, { data: { ids: selectedIds } }).then(r=>r.data);
    if (res.success) { showToast(res.message, "success"); setSelectedIds([]); fetchData(); }
  };

  const resetSemester = async () => {
    const isConfirmed = await showConfirm({ title: "Reset Penugasan", message: `Kosongkan penugasan dosen pengampu untuk ${selectedIds.length} mata kuliah yang dipilih?`, type: "warning", confirmText: "Reset Penugasan" });
    if(!isConfirmed) return;

    const res = await axiosClient.put(`/matkul/reset-penugasan`, { ids: selectedIds }).then(r=>r.data);
    if (res.success) { showToast(res.message, "success"); setSelectedIds([]); fetchData(); }
  };

  const getDisplayBadge = (m) => {
    const label = m.jenis_kelas === 'kelompok' ? m.nama_kelas : m.jurusan;
    return <span className={`text-sm ${label ? 'text-slate-600' : 'text-slate-400 italic'}`}>{label || 'Belum di-plot'}</span>;
  };

  const columns = activeTab === 'master' 
    ? [
        { header: 'Kode MK', accessor: 'kode_mk', className: 'font-normal', tdClassName: 'font-medium text-slate-700 tracking-wide' },
        { header: 'Nama Mata Kuliah', accessor: 'nama_mk', className: 'font-normal', tdClassName: 'font-medium text-slate-800' },
        { header: 'Semester', className: 'font-normal', render: m => <span className="text-sm text-slate-600">{m.semester || 'Ganjil'}</span> },
        { header: 'SKS', accessor: 'sks', className: 'font-normal', tdClassName: 'font-medium text-slate-500 text-center text-sm' },
        { header: 'PRODI', className: 'font-normal', render: m => <span className="text-sm font-semibold text-blue-600">{m.nama_prodi || '-'}</span> },
        { header: 'KELOMPOK / JURUSAN', className: 'font-normal', render: m => getDisplayBadge(m) },
        { header: 'Aksi',
      className: 'text-center',
      tdClassName: 'text-center', render: m => (
            <div className="flex justify-center gap-1.5">
              <button onClick={()=>{setSelectedMatkul(m); setPesertaOpen(true);}} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl active:scale-95" title="Lihat Peserta"><Eye size={18} strokeWidth={2.5}/></button>
              <button onClick={()=>{setSelectedMatkul(m); setMasterOpen(true);}} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-xl active:scale-95"><Edit size={18} strokeWidth={2.5}/></button>
              <button onClick={()=>deleteSingle(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl active:scale-95"><Trash2 size={18} strokeWidth={2.5}/></button>
            </div>
          )
        }
      ]
    : [
        { header: 'Kode MK', accessor: 'kode_mk', className: 'font-normal', tdClassName: 'font-medium text-slate-700 tracking-wide' },
        { header: 'Nama Mata Kuliah', accessor: 'nama_mk', className: 'font-normal', tdClassName: 'font-medium text-slate-800' },
        { header: 'Dosen Pengampu', className: 'font-normal', render: m => <span className="font-medium text-slate-700">{m.nama_dosen || <span className="text-sm text-rose-500">Belum ada dosen</span>}</span> },
        { header: 'KELOMPOK / JURUSAN', className: 'font-normal', render: m => getDisplayBadge(m) },
        { header: 'Aksi',
      className: 'text-center',
      tdClassName: 'text-center', render: m => (
            <button onClick={()=>{setSelectedMatkul(m); setAssignOpen(true);}} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs rounded-xl hover:bg-blue-100 flex items-center gap-2 ml-auto shadow-sm active:scale-95 transition-all"><UserPlus size={16} strokeWidth={2.5}/> Plotting</button>
          )
        }
      ];

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen font-sans animate-in fade-in duration-500 relative pb-10">
      
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm shrink-0">
            <Library size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Manajemen Kurikulum</h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1 line-clamp-1 md:line-clamp-none">Kelola mata kuliah dan penugasan dosen.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto shrink-0 shadow-inner">
          <button onClick={() => { setActiveTab('master'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-xs md:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${activeTab === 'master' ? 'bg-white text-blue-700 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <BookOpen size={18} strokeWidth={2.5}/> Master Data
          </button>
          <button onClick={() => { setActiveTab('plotting'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-xs md:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${activeTab === 'plotting' ? 'bg-white text-blue-700 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Users size={18} strokeWidth={2.5}/> Plotting Kelas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] p-3 md:p-5 animate-in fade-in duration-300">
        <DataTable 
          data={filteredData}
          columns={columns}
          containerClassName="border-0 rounded-[24px] shadow-none"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Belum ada data mata kuliah yang dapat ditampilkan."
          headerContent={
            <>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} strokeWidth={2.5} />
                  <input type="text" placeholder="Cari Matkul..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold text-sm text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                <select className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold text-sm text-slate-600 w-full sm:w-auto transition-all appearance-none cursor-pointer" value={filterSemester} onChange={e=>setFilterSemester(e.target.value)}>
                  <option value="">Semua Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                {activeTab === 'master' ? (
                  <>
                    {selectedIds.length > 0 && <button onClick={bulkDelete} className="bg-red-50 text-red-600 border border-red-100 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 flex-1 md:flex-none text-sm shadow-sm active:scale-95 transition-all"><Trash2 size={18} strokeWidth={2.5}/> Hapus ({selectedIds.length})</button>}
                    <button onClick={() => setCsvOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 text-sm shadow-sm hover:shadow active:scale-95 transition-all flex-1 md:flex-none"><UploadCloud size={18} strokeWidth={2.5}/> Import CSV</button>
                    <button onClick={() => { setSelectedMatkul(null); setMasterOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-sm flex-1 md:flex-none w-full md:w-auto"><Plus size={18} strokeWidth={2.5}/> Tambah MK</button>
                  </>
                ) : (
                  <>{selectedIds.length > 0 && <button onClick={resetSemester} className="bg-amber-50 text-amber-600 border border-amber-100 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 text-sm shadow-sm active:scale-95 transition-all w-full md:w-auto"><RefreshCw size={18} strokeWidth={2.5}/> Reset ({selectedIds.length})</button>}</>
                )}
              </div>
            </>
          }
        />
      </div>

      <ModalMasterMatkul isOpen={isMasterOpen} onClose={()=>setMasterOpen(false)} onSave={saveMaster} editData={selectedMatkul} mahasiswaList={mahasiswaList} prodiList={prodiList} />
      <ModalAssignMatkul isOpen={isAssignOpen} onClose={()=>setAssignOpen(false)} onSave={saveAssign} mkData={selectedMatkul} dosenList={dosenList} kelasList={kelasList} mahasiswaList={mahasiswaList} prodiList={prodiList} />
      <ModalLihatPeserta isOpen={isPesertaOpen} onClose={()=>setPesertaOpen(false)} mkData={selectedMatkul} onRefresh={fetchData} />
      <ModalCSVMatkul isOpen={isCsvOpen} onClose={()=>setCsvOpen(false)} onSuccess={()=>{fetchData(); showToast("CSV diimpor!", "success");}} />
    </div>
  );
};

export default DataMatkul;
