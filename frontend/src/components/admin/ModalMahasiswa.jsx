import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, ChevronDown } from 'lucide-react';

const ModalMahasiswa = ({ isOpen, onClose, onSave, editData, angkatanList, prodiList, defaultAngkatanId = '', defaultKelasId = '' }) => {
  // Nilai bawaan form kosong
  const defaultForm = { 
    nomor_induk: '', nama_lengkap: '', password: '', status_akademik: 'AKTIF',
    jenis_kelamin: 'L', jurusan: '', prodi_id: '', angkatan_id: '', kelas_id: ''
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
          status_akademik: editData.status_akademik || 'AKTIF',
          jenis_kelamin: editData.jenis_kelamin || 'L',
          jurusan: editData.jurusan || '',
          prodi_id: editData.prodi_id || '',
          angkatan_id: editData.angkatan_id || defaultAngkatanId,
          kelas_id: editData.kelas_id || defaultKelasId
        });
      } else {
        // Jika mode Tambah: Cek apakah ada "Draft" yang tertinggal di LocalStorage
        const savedDraft = localStorage.getItem('draft_form_mahasiswa');
        if (savedDraft) {
          try {
            setFormData(JSON.parse(savedDraft));
          } catch (e) {
            setFormData({ ...defaultForm, angkatan_id: defaultAngkatanId, kelas_id: defaultKelasId });
          }
        } else {
          setFormData({ ...defaultForm, angkatan_id: defaultAngkatanId, kelas_id: defaultKelasId });
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] border border-slate-100 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Tutup"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mb-8 border-b border-slate-100 pb-5">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            {editData ? 'Edit Data Mahasiswa' : 'Tambah Data Mahasiswa'}
            {/* Indikator Draft (Hanya muncul jika mode tambah dan ada isinya) */}
            {!editData && (formData.nomor_induk || formData.nama_lengkap) && (
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-xl font-bold ml-2 tracking-widest uppercase border border-amber-200">Draft</span>
            )}
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
            {editData ? 'Silakan perbarui informasi profil mahasiswa pada formulir di bawah ini.' : 'Lengkapi formulir di bawah ini untuk menambahkan mahasiswa baru ke sistem.'}
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
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">NIM <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                disabled={!!editData} 
                placeholder="Masukkan Nomor Induk Mahasiswa"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100" 
                value={formData.nomor_induk} 
                onChange={(e) => setFormData({...formData, nomor_induk: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Nama Lengkap <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Masukkan Nama Lengkap"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400" 
                value={formData.nama_lengkap} 
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Jenis Kelamin</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" 
                  value={formData.jenis_kelamin} 
                  onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Jurusan</label>
              <input 
                type="text" 
                placeholder="Contoh: Informatika" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400" 
                value={formData.jurusan} 
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Prodi <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" value={formData.prodi_id} onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}>
                  <option value="">Pilih Prodi</option>
                  {prodiList?.filter((prodi) => prodi.aktif || String(prodi.id) === String(formData.prodi_id)).map((prodi) => <option key={prodi.id} value={prodi.id}>{prodi.nama_prodi}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div ref={wrapperRef} className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Angkatan</label>
              <div 
                onClick={() => setOpenDropdown(!openDropdown)} 
                className={`w-full border rounded-2xl px-5 py-3.5 font-semibold text-sm transition-all cursor-pointer flex justify-between items-center ${openDropdown ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'}`}
              >
                <span className={selectedAngkatanName ? "text-slate-800" : "text-slate-400"}>
                  {selectedAngkatanName || 'Pilih Angkatan'}
                </span>
                <ChevronDown className={`text-slate-400 transition-transform duration-200 ${openDropdown ? 'rotate-180 text-blue-500' : ''}`} size={18} strokeWidth={2.5} />
              </div>

              {openDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                  <div 
                    onClick={() => { setFormData({...formData, angkatan_id: ''}); setOpenDropdown(false); }} 
                    className="px-4 py-2.5 rounded-xl hover:bg-slate-50 font-bold text-sm cursor-pointer text-slate-400 mb-1"
                  >
                    Tidak ada / Kosongkan
                  </div>
                  {angkatanList?.map((ang) => (
                    <div 
                      key={ang.id} 
                      onClick={() => { setFormData({...formData, angkatan_id: ang.id}); setOpenDropdown(false); }} 
                      className="px-4 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 font-bold text-sm cursor-pointer text-slate-700 transition-colors"
                    >
                      {ang.nama_angkatan}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Status Akademik</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer" 
                  value={formData.status_akademik} 
                  onChange={(e) => setFormData({...formData, status_akademik: e.target.value})}
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="CUTI">Cuti</option>
                  <option value="LULUS">Lulus</option>
                  <option value="KELUAR">Keluar</option>
                  <option value="RESIGN">Resign</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-2 tracking-wide uppercase">Kata Sandi (Password)</label>
              <input 
                type="text" 
                placeholder={editData ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter"} 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10 pt-6 border-t border-slate-100 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm w-full sm:w-auto active:scale-95"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-8 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-sm w-full sm:w-auto active:scale-95"
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
