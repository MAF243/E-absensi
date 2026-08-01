import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown } from 'lucide-react';

const ModalDosen = ({ isOpen, onClose, onSave, editData }) => {
  const defaultForm = { 
    nomor_induk: '', nama_lengkap: '', password: '', 
    status_akademik: 'aktif', jenis_kelamin: 'L' 
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
          status_akademik: editData.status_akademik || 'aktif',
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Tutup">
          <X size={20} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {editData ? 'Edit Data Dosen' : 'Tambah Data Dosen'}
            {!editData && (formData.nomor_induk || formData.nama_lengkap) && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2 tracking-wide uppercase">Draft Tersimpan</span>
            )}
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {editData ? 'Perbarui informasi profil dosen pada form di bawah ini.' : 'Tambahkan dosen baru menggunakan NIDN atau Inisial sebagai akses masuk.'}
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
            
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">NIDN / Inisial (Username) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: 04123456 atau AB"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 uppercase" 
                value={formData.nomor_induk} 
                onChange={(e) => setFormData({...formData, nomor_induk: e.target.value.toUpperCase()})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: Dr. Budi Santoso, M.Kom."
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.nama_lengkap} 
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jenis Kelamin</label>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}>
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status Aktif</label>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" value={formData.status_akademik} onChange={(e) => setFormData({...formData, status_akademik: e.target.value})}>
                  <option value="aktif">Aktif Mengajar</option>
                  <option value="tidak aktif">Tidak Aktif</option> {/* <-- INI YANG DIUBAH */}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kata Sandi (Password)</label>
              <input 
                type="text" 
                placeholder={editData ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter. Jika kosong, akan sama dengan Username."} 
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm w-full sm:w-auto">Batal</button>
            <button type="submit" className="px-8 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all text-sm w-full sm:w-auto">
              {editData ? 'Simpan Perubahan' : 'Simpan Data Dosen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDosen;