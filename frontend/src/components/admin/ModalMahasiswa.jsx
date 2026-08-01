import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, ChevronDown } from 'lucide-react';

const ModalMahasiswa = ({ isOpen, onClose, onSave, editData, angkatanList }) => {
  // Nilai bawaan form kosong
  const defaultForm = { 
    nomor_induk: '', nama_lengkap: '', password: '', status_akademik: 'aktif', 
    jenis_kelamin: 'L', jurusan: '', angkatan_id: '' 
  };

  const [formData, setFormData] = useState(defaultForm);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const wrapperRef = useRef(null);

  // 1. EFEK MEMUAT DATA SAAT MODAL DIBUKA (Termasuk Fitur Pemanggil Draft)
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Jika mode Edit: Selalu gunakan data asli dari database
        setFormData({
          nomor_induk: editData.nomor_induk || '',
          nama_lengkap: editData.nama_lengkap || '',
          password: '', 
          status_akademik: editData.status_akademik || 'aktif',
          jenis_kelamin: editData.jenis_kelamin || 'L',
          jurusan: editData.jurusan || '',
          angkatan_id: editData.angkatan_id || '' 
        });
      } else {
        // Jika mode Tambah: Cek apakah ada "Draft" yang tertinggal di LocalStorage
        const savedDraft = localStorage.getItem('draft_form_mahasiswa');
        if (savedDraft) {
          try {
            setFormData(JSON.parse(savedDraft));
          } catch (e) {
            setFormData(defaultForm);
          }
        } else {
          setFormData(defaultForm);
        }
      }
      setErrorMsg('');
    }
  }, [editData, isOpen]);

  // 2. EFEK AUTOSAVE (SIMPAN OTOMATIS)
  // Berjalan di latar belakang setiap kali Anda mengetik sesuatu di mode "Tambah"
  useEffect(() => {
    if (isOpen && !editData) {
      localStorage.setItem('draft_form_mahasiswa', JSON.stringify(formData));
    }
  }, [formData, isOpen, editData]);

  // Efek klik luar untuk menutup dropdown angkatan
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpenDropdown(false);
    };
    if (openDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  if (!isOpen) return null;

  // 3. FUNGSI SUBMIT DATA
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nomor_induk || !formData.nama_lengkap) {
      setErrorMsg('NIM dan Nama Lengkap wajib diisi.');
      return;
    }

    // Jika mode Tambah dan berhasil disubmit, hapus Draft agar kembali kosong untuk data berikutnya
    if (!editData) {
      localStorage.removeItem('draft_form_mahasiswa');
    }

    onSave(formData);
  };

  // Penerjemah ID ke Nama Angkatan
  const selectedAngkatanName = angkatanList?.find(a => String(a.id) === String(formData.angkatan_id))?.nama_angkatan;

  return (
    /* AREA LUAR (BACKDROP): Klik di sini akan menutup modal (tapi draft tetap aman tersimpan) */
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Tutup"
        >
          <X size={20} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {editData ? 'Edit Data Mahasiswa' : 'Tambah Data Mahasiswa'}
            {/* Indikator Draft (Hanya muncul jika mode tambah dan ada isinya) */}
            {!editData && (formData.nomor_induk || formData.nama_lengkap) && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2 tracking-wide uppercase">Draft Tersimpan</span>
            )}
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {editData ? 'Silakan perbarui informasi mahasiswa pada form di bawah ini.' : 'Lengkapi form di bawah ini untuk menambahkan mahasiswa baru ke sistem.'}
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
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">NIM <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                disabled={!!editData} 
                placeholder="Masukkan Nomor Induk Mahasiswa"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" 
                value={formData.nomor_induk} 
                onChange={(e) => setFormData({...formData, nomor_induk: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Masukkan Nama Lengkap"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.nama_lengkap} 
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jenis Kelamin</label>
              <div className="relative">
                <select 
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" 
                  value={formData.jenis_kelamin} 
                  onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jurusan</label>
              <input 
                type="text" 
                placeholder="Contoh: Informatika" 
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.jurusan} 
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})} 
              />
            </div>

            <div ref={wrapperRef} className="relative">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Angkatan</label>
              <div 
                onClick={() => setOpenDropdown(!openDropdown)} 
                className={`w-full border focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all cursor-pointer flex justify-between items-center ${openDropdown ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <span className={selectedAngkatanName ? "text-slate-800" : "text-slate-400"}>
                  {selectedAngkatanName || 'Pilih Angkatan'}
                </span>
                <ChevronDown className={`text-slate-400 transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} size={16} />
              </div>

              {openDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div 
                    onClick={() => { setFormData({...formData, angkatan_id: ''}); setOpenDropdown(false); }} 
                    className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-sm cursor-pointer text-slate-500 mb-1"
                  >
                    Tidak ada / Kosongkan
                  </div>
                  {angkatanList?.map((ang) => (
                    <div 
                      key={ang.id} 
                      onClick={() => { setFormData({...formData, angkatan_id: ang.id}); setOpenDropdown(false); }} 
                      className="px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 font-medium text-sm cursor-pointer text-slate-700 transition-colors"
                    >
                      {ang.nama_angkatan}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status Akademik</label>
              <div className="relative">
                <select 
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800 appearance-none cursor-pointer" 
                  value={formData.status_akademik} 
                  onChange={(e) => setFormData({...formData, status_akademik: e.target.value})}
                >
                  <option value="aktif">Aktif</option>
                  <option value="cuti">Cuti</option>
                  <option value="tidak aktif">Tidak Aktif</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kata Sandi (Password)</label>
              <input 
                type="text" 
                placeholder={editData ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter"} 
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all text-slate-800" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm w-full sm:w-auto"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all text-sm w-full sm:w-auto"
            >
              {editData ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMahasiswa;