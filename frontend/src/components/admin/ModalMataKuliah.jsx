import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, BookOpen } from 'lucide-react';

const ModalMataKuliah = ({ isOpen, onClose, onSave, editData, dosenList, angkatanList }) => {
  const defaultForm = { 
    kode_mk: '', 
    nama_mk: '', 
    sks: 2, 
    dosen_id: '', 
    angkatan_id: '', 
    jurusan: '' 
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errorMsg, setErrorMsg] = useState('');

  // EFEK LOAD DATA & AUTOSAVE DRAFT
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          kode_mk: editData.kode_mk || '',
          nama_mk: editData.nama_mk || '',
          sks: editData.sks || 2,
          dosen_id: editData.dosen_id || '',
          angkatan_id: editData.angkatan_id || '',
          jurusan: editData.jurusan || ''
        });
      } else {
        const savedDraft = localStorage.getItem('draft_form_matkul');
        if (savedDraft) {
          try { setFormData(JSON.parse(savedDraft)); } 
          catch (e) { setFormData(defaultForm); }
        } else {
          setFormData(defaultForm);
        }
      }
      setErrorMsg('');
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen && !editData) {
      localStorage.setItem('draft_form_matkul', JSON.stringify(formData));
    }
  }, [formData, isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.kode_mk || !formData.nama_mk || !formData.dosen_id || !formData.angkatan_id || !formData.jurusan) {
      setErrorMsg('Semua kolom yang bertanda bintang (*) wajib diisi!');
      return;
    }
    
    if (!editData) localStorage.removeItem('draft_form_matkul');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] border border-slate-100 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Tutup">
          <X size={20} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {editData ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            {!editData && (formData.kode_mk || formData.nama_mk) && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2 tracking-wide uppercase">Draft Tersimpan</span>
            )}
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {editData ? 'Perbarui informasi mata kuliah dan penugasan dosen.' : 'Buat mata kuliah baru dan tugaskan ke dosen pengampu.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            {/* KODE MK & SKS */}
            <div className="md:col-span-1 flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Kode MK <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Cth: TIF101"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800 uppercase" 
                  value={formData.kode_mk} 
                  onChange={(e) => setFormData({...formData, kode_mk: e.target.value.toUpperCase()})} 
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">SKS <span className="text-red-500">*</span></label>
                <input 
                  type="number" min="1" max="6"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800 text-center" 
                  value={formData.sks} 
                  onChange={(e) => setFormData({...formData, sks: e.target.value})} 
                />
              </div>
            </div>

            {/* NAMA MK */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Nama Mata Kuliah <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Cth: Pemrograman Web Lanjut"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.nama_mk} 
                onChange={(e) => setFormData({...formData, nama_mk: e.target.value})} 
              />
            </div>

            {/* DOSEN PENGAMPU */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Dosen Pengampu <span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" 
                  value={formData.dosen_id} 
                  onChange={(e) => setFormData({...formData, dosen_id: e.target.value})}
                >
                  <option value="">-- Pilih Dosen Pengampu --</option>
                  {dosenList.filter(d => String(d.status_akademik || 'AKTIF').toUpperCase() === 'AKTIF').map(dosen => (
                    <option key={dosen.id} value={dosen.id}>{dosen.nama_lengkap} ({dosen.nomor_induk})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* JURUSAN & ANGKATAN */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Jurusan (Peserta) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Cth: ITK, ADM, APQ"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800 uppercase" 
                value={formData.jurusan} 
                onChange={(e) => setFormData({...formData, jurusan: e.target.value.toUpperCase()})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Kategori Angkatan <span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" 
                  value={formData.angkatan_id} 
                  onChange={(e) => setFormData({...formData, angkatan_id: e.target.value})}
                >
                  <option value="">-- Pilih Angkatan --</option>
                  {angkatanList.map(angkatan => (
                    <option key={angkatan.id} value={angkatan.id}>{angkatan.nama_angkatan}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm w-full sm:w-auto">Batal</button>
            <button type="submit" className="px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-sm w-full sm:w-auto">
              {editData ? 'Simpan Perubahan' : 'Simpan Mata Kuliah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMataKuliah;
