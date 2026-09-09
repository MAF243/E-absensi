import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown } from 'lucide-react';

const ModalDosen = ({ isOpen, onClose, onSave, editData }) => {
  const defaultForm = { 
    nomor_induk: '', nama_lengkap: '', password: '', 
    status_akademik: 'AKTIF', jenis_kelamin: 'L'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          nomor_induk: editData.nomor_induk || '',
          nama_lengkap: editData.nama_lengkap || '',
          password: '', 
          status_akademik: editData.status_akademik || 'AKTIF',
          jenis_kelamin: editData.jenis_kelamin || 'L'
        });
      } else {
        const savedDraft = localStorage.getItem('draft_form_dosen');
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
      localStorage.setItem('draft_form_dosen', JSON.stringify(formData));
    }
  }, [formData, isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nomor_induk || !formData.nama_lengkap) {
      setErrorMsg('NIDN/Inisial dan Nama Lengkap wajib diisi.');
      return;
    }
    
    const payload = { ...formData, role: 'dosen' };
    
    if (!editData) localStorage.removeItem('draft_form_dosen');
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Tutup">
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-5">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            {editData ? 'Edit Data Dosen' : 'Tambah Data Dosen'}
            {!editData && (formData.nomor_induk || formData.nama_lengkap) && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-xl font-bold ml-2 tracking-widest uppercase border border-amber-200">Draft</span>
            )}
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
            {editData ? 'Perbarui informasi profil dosen pada formulir di bawah ini.' : 'Tambahkan dosen baru menggunakan NIDN atau Inisial sebagai akses masuk.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle size={20} strokeWidth={2.5} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">NIDN / Inisial <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: 04123456 atau AB"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 uppercase" 
                value={formData.nomor_induk} 
                onChange={(e) => setFormData({...formData, nomor_induk: e.target.value.toUpperCase()})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Nama Lengkap & Gelar <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: Dr. Budi Santoso, M.Kom."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400" 
                value={formData.nama_lengkap} 
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Jenis Kelamin</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}>
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Status Akademik</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" value={formData.status_akademik} onChange={(e) => setFormData({...formData, status_akademik: e.target.value})}>
                  <option value="AKTIF">Aktif Mengajar</option>
                  <option value="KELUAR">Tidak Aktif Mengajar</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Kata Sandi (Password)</label>
              <input 
                type="text" 
                placeholder={editData ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter. Jika kosong, password otomatis sama dengan NIDN/Inisial."} 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10 pt-6 border-t border-slate-100 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm w-full sm:w-auto active:scale-95">Batal</button>
            <button type="submit" className="px-8 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-sm w-full sm:w-auto active:scale-95">
              {editData ? 'Simpan Perubahan' : 'Simpan Data Dosen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDosen;
