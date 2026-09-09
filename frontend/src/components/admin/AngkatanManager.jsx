import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';
import { Trash2, Plus, Users, Library, Loader2, Info, ChevronRight, Layers, Pencil, Check, X } from 'lucide-react';

const AngkatanManager = () => {
  const [angkatanList, setAngkatanList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedAngkatan, setSelectedAngkatan] = useState(null);
  
  const [angkatanInput, setAngkatanInput] = useState('');
  const [editingAngkatanId, setEditingAngkatanId] = useState(null);
  const [editingAngkatanName, setEditingAngkatanName] = useState('');
  const [kelasInput, setKelasInput] = useState('');
  const [editingKelasId, setEditingKelasId] = useState(null);
  const [editingKelasName, setEditingKelasName] = useState('');
  
  const [isLoadingAngkatan, setIsLoadingAngkatan] = useState(true);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast, showConfirm } = useUiStore();

  const fetchAngkatan = async () => {
    setIsLoadingAngkatan(true);
    try {
      const res = await axiosClient.get('/angkatan');
      setAngkatanList(res.data.data);
    } catch (error) {
      showToast('Gagal memuat data angkatan', 'error');
    } finally {
      setIsLoadingAngkatan(false);
    }
  };

  const fetchKelas = async (angkatan_id) => {
    setIsLoadingKelas(true);
    try {
      const res = await axiosClient.get(`/kelas?angkatan_id=${angkatan_id}`);
      setKelasList(res.data.data);
    } catch (error) {
      showToast('Gagal memuat data kelas', 'error');
    } finally {
      setIsLoadingKelas(false);
    }
  };

  useEffect(() => { fetchAngkatan(); }, []);

  useEffect(() => {
    if (selectedAngkatan) {
      fetchKelas(selectedAngkatan.id);
    } else {
      setKelasList([]);
    }
  }, [selectedAngkatan]);

  // --- Handlers for Angkatan ---
  const handleAddAngkatan = async (e) => {
    e.preventDefault();
    if (!angkatanInput.trim()) return showToast('Nama angkatan tidak boleh kosong', 'error');
    
    setIsSubmitting(true);
    try {
      await axiosClient.post('/angkatan', { nama_angkatan: angkatanInput.trim() });
      showToast('Angkatan berhasil ditambahkan', 'success');
      setAngkatanInput('');
      fetchAngkatan();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menambah angkatan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAngkatan = async (id, nama) => {
    const isConfirmed = await showConfirm({
      title: 'Hapus Angkatan',
      message: `Anda yakin ingin menghapus Angkatan "${nama}"? Semua kelas di dalamnya juga akan terhapus.`,
      confirmText: 'Ya, Hapus',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await axiosClient.delete(`/angkatan/${id}`);
      showToast(`Angkatan ${nama} berhasil dihapus`, 'success');
      if (selectedAngkatan?.id === id) setSelectedAngkatan(null);
      fetchAngkatan();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus angkatan', 'error');
    }
  };

  const handleStartEditAngkatan = (angkatan) => {
    setEditingAngkatanId(angkatan.id);
    setEditingAngkatanName(angkatan.nama_angkatan);
  };

  const handleCancelEditAngkatan = () => {
    setEditingAngkatanId(null);
    setEditingAngkatanName('');
  };

  const handleUpdateAngkatan = async (e, id) => {
    e.preventDefault();
    const namaAngkatan = editingAngkatanName.trim();
    if (!namaAngkatan) return showToast('Nama angkatan tidak boleh kosong', 'error');

    setIsSubmitting(true);
    try {
      await axiosClient.put(`/angkatan/${id}`, { nama_angkatan: namaAngkatan });
      setAngkatanList((currentList) => currentList.map((item) => (
        item.id === id ? { ...item, nama_angkatan: namaAngkatan } : item
      )));
      if (selectedAngkatan?.id === id) {
        setSelectedAngkatan((current) => ({ ...current, nama_angkatan: namaAngkatan }));
      }
      handleCancelEditAngkatan();
      showToast('Nama angkatan berhasil diperbarui', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah nama angkatan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for Kelas ---
  const handleAddKelas = async (e) => {
    e.preventDefault();
    if (!selectedAngkatan) return;
    if (!kelasInput.trim()) return showToast('Nama kelas tidak boleh kosong', 'error');
    
    setIsSubmitting(true);
    try {
      await axiosClient.post('/kelas', { nama_kelas: kelasInput.trim(), angkatan_id: selectedAngkatan.id });
      showToast('Kelas berhasil ditambahkan', 'success');
      setKelasInput('');
      fetchKelas(selectedAngkatan.id);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menambah kelas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKelas = async (id, nama) => {
    const isConfirmed = await showConfirm({
      title: 'Hapus Kelas',
      message: `Anda yakin ingin menghapus Kelas "${nama}"?`,
      confirmText: 'Ya, Hapus',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await axiosClient.delete(`/kelas/${id}`);
      showToast(`Kelas ${nama} berhasil dihapus`, 'success');
      fetchKelas(selectedAngkatan.id);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus kelas', 'error');
    }
  };

  const handleStartEditKelas = (kelas) => {
    setEditingKelasId(kelas.id);
    setEditingKelasName(kelas.nama_kelas);
  };

  const handleCancelEditKelas = () => {
    setEditingKelasId(null);
    setEditingKelasName('');
  };

  const handleUpdateKelas = async (e, id) => {
    e.preventDefault();
    const namaKelas = editingKelasName.trim();
    if (!namaKelas) return showToast('Nama kelas tidak boleh kosong', 'error');

    setIsSubmitting(true);
    try {
      await axiosClient.put(`/kelas/${id}`, { nama_kelas: namaKelas });
      setKelasList((currentList) => currentList.map((item) => (
        item.id === id ? { ...item, nama_kelas: namaKelas } : item
      )));
      handleCancelEditKelas();
      showToast('Nama kelas berhasil diperbarui', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah nama kelas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 w-full max-w-7xl">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Library size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-black text-xl text-slate-800 tracking-tight">Manajemen Hierarki Kelas</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Kelola Angkatan dan Kelas di dalamnya</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8">
        
        {/* KOLOM KIRI: ANGKATAN */}
        <div className="flex flex-col border-r-0 md:border-r border-slate-100 md:pr-6 lg:pr-8 min-w-0">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            1. Pilih / Tambah Angkatan
          </h4>

          <form onSubmit={handleAddAngkatan} className="flex gap-3 mb-4">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
              value={angkatanInput} 
              onChange={(e) => setAngkatanInput(e.target.value)} 
              placeholder="Cth: Angkatan 2023" 
              disabled={isSubmitting}
            />
            <button 
              type="submit" disabled={isSubmitting || !angkatanInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center transition-colors"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
            </button>
          </form>

          <div className="space-y-2 relative min-h-[200px]">
            {isLoadingAngkatan ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : angkatanList.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold">
                Belum ada Angkatan
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {angkatanList.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => setSelectedAngkatan(a)}
                    className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition-all border ${selectedAngkatan?.id === a.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50'} group`}
                  >
                    {editingAngkatanId === a.id ? (
                      <form onSubmit={(e) => handleUpdateAngkatan(e, a.id)} className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editingAngkatanName}
                          onChange={(e) => setEditingAngkatanName(e.target.value)}
                          className="min-w-0 flex-1 bg-white border border-blue-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                          disabled={isSubmitting}
                        />
                        <button type="submit" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl" title="Simpan nama angkatan" disabled={isSubmitting}>
                          <Check size={16} strokeWidth={2.5} />
                        </button>
                        <button type="button" onClick={handleCancelEditAngkatan} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" title="Batalkan edit" disabled={isSubmitting}>
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </form>
                    ) : (
                    <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl transition-colors ${selectedAngkatan?.id === a.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Library size={16} strokeWidth={2.5} />
                      </div>
                      <span className={`font-bold text-sm truncate ${selectedAngkatan?.id === a.id ? 'text-blue-700' : 'text-slate-700'}`}>{a.nama_angkatan}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEditAngkatan(a); }} 
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit nama angkatan"
                      >
                        <Pencil size={16} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAngkatan(a.id, a.nama_angkatan); }} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                      <ChevronRight size={18} className={`transition-transform ${selectedAngkatan?.id === a.id ? 'text-blue-500' : 'text-slate-300'}`} />
                    </div>
                    </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: KELAS */}
        <div className="flex flex-col min-w-0">
          <h4 className={`font-bold mb-4 flex items-center gap-2 ${selectedAngkatan ? 'text-slate-700' : 'text-slate-400'}`}>
            <Layers size={18} className={selectedAngkatan ? 'text-blue-500' : 'text-slate-300'} />
            2. Kelas di {selectedAngkatan ? `"${selectedAngkatan.nama_angkatan}"` : '...'}
          </h4>

          {selectedAngkatan ? (
            <>
              <form onSubmit={handleAddKelas} className="flex gap-3 mb-4">
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  value={kelasInput} 
                  onChange={(e) => setKelasInput(e.target.value)} 
                  placeholder="Cth: TI-A / SI-B" 
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" disabled={isSubmitting || !kelasInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center transition-colors"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                </button>
              </form>

              <div className="space-y-2 relative min-h-[200px]">
                {isLoadingKelas ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : kelasList.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold">
                    Belum ada Kelas di Angkatan ini
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {kelasList.map(k => (
                      <div key={k.id} className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                        {editingKelasId === k.id ? (
                          <form onSubmit={(e) => handleUpdateKelas(e, k.id)} className="flex items-center gap-2 w-full">
                            <input
                              autoFocus
                              value={editingKelasName}
                              onChange={(e) => setEditingKelasName(e.target.value)}
                              className="min-w-0 flex-1 bg-white border border-blue-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                              disabled={isSubmitting}
                            />
                            <button type="submit" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl" title="Simpan nama kelas" disabled={isSubmitting}>
                              <Check size={16} strokeWidth={2.5} />
                            </button>
                            <button type="button" onClick={handleCancelEditKelas} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" title="Batalkan edit" disabled={isSubmitting}>
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          </form>
                        ) : (
                        <>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Layers size={16} strokeWidth={2.5} />
                          </div>
                          <span className="font-bold text-sm text-slate-700 truncate">{k.nama_kelas}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStartEditKelas(k); }} 
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title="Edit nama kelas"
                          >
                            <Pencil size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); if(window.openManageKelas) window.openManageKelas(k); }} 
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Atur Anggota"
                          >
                            <Users size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteKelas(k.id, k.nama_kelas); }} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                        </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <Info size={40} className="text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-bold text-slate-500">Pilih Angkatan Terlebih Dahulu</p>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px]">Klik salah satu angkatan di sebelah kiri untuk melihat dan mengelola kelas.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AngkatanManager;