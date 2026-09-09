import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Edit, Eye, Upload, Users, BookOpen, User, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Edit2, Check, GraduationCap, List, UserPlus, CheckSquare, SlidersHorizontal } from 'lucide-react';
import ModalMahasiswa from '../../components/admin/ModalMahasiswa'; 
import ModalUploadCSV from '../../components/admin/ModalUploadCSV';
import ModalAngkatan from '../../components/admin/ModalAngkatan'; 
import AngkatanManager from '../../components/admin/AngkatanManager';
import useUiStore from '../../store/useUiStore';
import axiosClient from '../../utils/axiosClient';
import DataTable from '../../components/common/DataTable';

const DataMahasiswa = () => {
  const { showConfirm } = useUiStore();
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [students, setStudents] = useState([]);
  const [angkatanList, setAngkatanList] = useState([]);
  
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAngkatan, setBulkAngkatan] = useState('');

  // State Modal
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCsvOpen, setCsvOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null); 

  // State Angkatan
  const [newAngkatan, setNewAngkatan] = useState('');
  const [editingAngkatanId, setEditingAngkatanId] = useState(null);
  const [editAngkatanName, setEditAngkatanName] = useState('');

  // State Modal Daftar Mahasiswa per Angkatan
  const [isViewStudentsOpen, setViewStudentsOpen] = useState(false);
  const [selectedAngkatanView, setSelectedAngkatanView] = useState(null); 

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const BASE_URL = 'http://localhost:5000';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    try {
      const [resM, resA] = await Promise.all([
        axiosClient.get('/mahasiswa').then(r => r.data).catch(() => ({ data: [] })),
        axiosClient.get('/angkatan').then(r => r.data).catch(() => ({ data: [] }))
      ]);
      setStudents(resM.data || []);
      setAngkatanList(resA.data || []);
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, []);

  // LOGIKA CERDAS MENDETEKSI GRUP MULTIPEL
  const getStudentsByAngkatan = (angkatanId) => {
    return students.filter(s => {
       if (String(s.angkatan_id) === String(angkatanId)) return true;
       if (s.list_kelompok_id) {
          const groups = String(s.list_kelompok_id).split(',');
          if (groups.includes(String(angkatanId))) return true;
       }
       return false;
    });
  };

  // FUNGSI BARU UNTUK KELAS
  useEffect(() => {
    window.openManageKelas = (kelasObj) => {
      setSelectedAngkatanView(kelasObj);
      setViewStudentsOpen(true);
    };
    return () => {
      delete window.openManageKelas;
    };
  }, []);

  const getStudentInfoByAngkatan = (angkatanId) => {
    const mhs = getStudentsByAngkatan(angkatanId);
    return { count: mhs.length, previewNames: mhs.slice(0, 2).map(s => s.nama_lengkap).join(', ') + (mhs.length > 2 ? `, +${mhs.length - 2} lainnya` : '') };
  };

  const opsiJurusan = useMemo(() => [...new Set(students.map(s => s.jurusan).filter(Boolean))], [students]);

  const filteredStudents = students.filter(s => {
    const matchSearch = String(s.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) || String(s.nomor_induk || '').toLowerCase().includes(search.toLowerCase());
    const matchJurusan = filterJurusan === '' || s.jurusan === filterJurusan;
    const matchAngkatan = filterAngkatan === '' || 
        String(s.angkatan_id) === String(filterAngkatan) || 
        (s.list_kelompok_id && String(s.list_kelompok_id).split(',').includes(String(filterAngkatan)));
    return matchSearch && matchJurusan && matchAngkatan;
  });

  useEffect(() => { setCurrentPage(1); }, [search, filterJurusan, filterAngkatan, itemsPerPage]);

  const totalItems = filteredStudents.length;
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'All' ? totalItems : startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handleSelectAll = (e) => { e.target.checked ? setSelectedIds(paginatedStudents.map(s => s.id)) : setSelectedIds([]); };
  const handleSelectOne = (id) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

  const handleSaveStudent = async (formData) => {
    try {
      const url = selectedStudent ? `/mahasiswa/${selectedStudent.id}` : '/mahasiswa';
      const method = selectedStudent ? 'put' : 'post';
      const { data: res } = await axiosClient[method](url, formData);
      if (res.success) { showToast(selectedStudent ? "Data diperbarui!" : "Mahasiswa ditambahkan!", "success"); setFormOpen(false); fetchData(); } 
      else showToast(res.message || "Gagal.", "error");
    } catch (error) { showToast("Koneksi gagal.", "error"); }
  };

  const handleBulkDelete = async () => {
    const confirm = await showConfirm(`Yakin menghapus ${selectedIds.length} mahasiswa permanen?`);
    if (confirm) {
      try {
        const { data: res } = await axiosClient.delete('/mahasiswa/bulk-delete', { data: { ids: selectedIds } });
        if (res.success) { setSelectedIds([]); fetchData(); showToast(`${selectedIds.length} data dihapus.`, "success"); } else showToast(res.message, "error");
      } catch (err) { showToast("Gagal jaringan.", "error"); }
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (!bulkStatus && !bulkAngkatan) {
      showToast('Pilih status atau angkatan yang akan diubah.', 'error');
      return;
    }
    try {
      const { data: res } = await axiosClient.put('/mahasiswa/bulk-update-status-angkatan', {
        studentIds: selectedIds,
        status_akademik: bulkStatus || undefined,
        angkatan_id: bulkAngkatan || undefined
      });
      if (!res.success) throw new Error(res.message);
      setBulkEditOpen(false);
      setBulkStatus('');
      setBulkAngkatan('');
      setSelectedIds([]);
      await fetchData();
      showToast(res.message || 'Data mahasiswa berhasil diperbarui.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Gagal memperbarui data mahasiswa.', 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    const confirm = await showConfirm(`Yakin hapus data ${nama}?`);
    if (confirm) {
      try {
        const { data: res } = await axiosClient.delete(`/mahasiswa/${id}`);
        if (res.success) { fetchData(); showToast("Data dihapus.", "success"); } 
      } catch (err) {}
    }
  };

  const handleAddAngkatan = async () => {
    if (!newAngkatan.trim()) return;
    try {
      const { data: res } = await axiosClient.post('/angkatan', { nama_angkatan: newAngkatan });
      if(res.success) { setNewAngkatan(''); fetchData(); showToast("Kategori ditambahkan.", "success"); } 
    } catch (err) {}
  };

  const handleUpdateAngkatan = async (id) => {
    if (!editAngkatanName.trim()) return;
    try {
      const { data: res } = await axiosClient.put(`/angkatan/${id}`, { nama_angkatan: editAngkatanName });
      if(res.success) { setEditingAngkatanId(null); setEditAngkatanName(''); fetchData(); showToast("Perubahan disimpan.", "success"); } 
    } catch (err) {}
  };

  const handleDeleteAngkatan = async (id) => {
    const confirm = await showConfirm('Peringatan: Lanjutkan menghapus kelompok ini?');
    if (confirm) {
      try {
        const { data: res } = await axiosClient.delete(`/angkatan/${id}`);
        if(res.success) { fetchData(); showToast("Data dihapus.", "success"); } 
      } catch (err) {}
    }
  };

  // FUNGSI BARU: MENGELUARKAN MAHASISWA MASSAL
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500 relative pb-10">
      
      {toast.show && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[9999] animate-in fade-in slide-in-from-top-8 duration-300">
          <div className={`flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><CheckCircle2 size={24} /></div>
            <div className="flex flex-col pr-4"><span className="text-sm font-bold text-slate-800 tracking-tight">{toast.type === 'success' ? 'Berhasil!' : 'Oops, Gagal!'}</span><span className="text-xs font-medium text-slate-500 line-clamp-2">{toast.message}</span></div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-400 hover:text-slate-600 ml-auto pl-2"><X size={18} /></button>
          </div>
        </div>
      )}

      {/* HEADER & TABS */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm">
            <Users size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Manajemen Mahasiswa</h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Kelola biodata, kelompok & angkatan</p>
          </div>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit overflow-x-auto shrink-0">
          <button onClick={() => { setActiveTab('mahasiswa'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'mahasiswa' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}><Users size={16}/> Data Mahasiswa</button>
          <button onClick={() => { setActiveTab('angkatan'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'angkatan' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}><BookOpen size={16}/> Kelompok & Angkatan</button>
        </div>
      </div>

      {activeTab === 'mahasiswa' ? (
        /* TAB 1: TABEL MAHASISWA UTAMA */
        <div className="bg-white rounded-[32px] p-5 lg:p-6 mb-8 border border-slate-100 shadow-xl shadow-slate-200/30">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto min-w-0">
              <div className="relative w-full sm:w-56 shrink-0"><Search className="absolute left-3.5 top-2.5 text-slate-400" size={17} /><input type="text" placeholder="Cari NIM/Nama..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <select className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs text-slate-600 w-full sm:w-auto" value={filterJurusan} onChange={(e) => setFilterJurusan(e.target.value)}><option value="">Semua Jurusan</option>{opsiJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}</select>
              <select className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs text-slate-600 w-full sm:w-auto" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}><option value="">Semua Angkatan</option>{angkatanList.map((a) => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}</select>
            </div>
            <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 w-full xl:w-auto mt-2 xl:mt-0">
              {selectedIds.length > 0 && <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 border border-red-100 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-red-100 justify-center text-xs whitespace-nowrap"><Trash2 size={15}/> Hapus ({selectedIds.length})</button>}
              {selectedIds.length > 0 && <button onClick={() => setBulkEditOpen(true)} className="bg-amber-50 text-amber-700 border border-amber-100 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-100 justify-center text-xs whitespace-nowrap"><SlidersHorizontal size={15}/> Edit Massal ({selectedIds.length})</button>}
              <button onClick={() => setCsvOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 text-xs shadow-sm whitespace-nowrap"><Upload size={15}/> Import CSV</button>
              <button onClick={() => { setSelectedStudent(null); setFormOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-sm text-xs whitespace-nowrap"><Plus size={15}/> Tambah Data</button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left table-auto min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 md:px-6 py-4 w-12 text-center"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" onChange={handleSelectAll} checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length} /></th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">NIM</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">Nama Lengkap</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">L/P</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">Jurusan / Angkatan</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map(s => {
                  const safeStatus = String(s.status_akademik || 'aktif').trim().toLowerCase();
                  return (
                    <tr key={s.id} className={`hover:bg-slate-50/80 ${selectedIds.includes(s.id) ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-center"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={selectedIds.includes(s.id)} onChange={() => handleSelectOne(s.id)} /></td>
                      <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-slate-600 text-sm">{s.nomor_induk}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-slate-800 text-sm">{s.nama_lengkap}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-slate-500 text-center text-sm">{s.jenis_kelamin || '-'}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="font-bold text-blue-600 text-sm">{s.jurusan || '-'}</div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                           <span className="uppercase">{s.nama_angkatan || '-'}</span>
                           {s.list_kelompok_id && <span className="text-amber-600 ml-1">(+Klp)</span>}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-center"><span className={`px-2 py-1 rounded-md text-[11px] font-bold border uppercase ${safeStatus === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.status_akademik || 'AKTIF'}</span></td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setProfileData(s); setProfileOpen(true); }} className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Eye size={18}/></button>
                          <button onClick={() => { setSelectedStudent(s); setFormOpen(true); }} className="p-1.5 md:p-2 text-slate-400 hover:text-amber-600 rounded-lg"><Edit size={18}/></button>
                          <button onClick={() => handleDelete(s.id, s.nama_lengkap)} className="p-1.5 md:p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-6 py-4 border-t gap-3 bg-white rounded-b-3xl">
            <div className="flex items-center gap-2 text-sm text-slate-500">Tampil <select className="bg-slate-50 border rounded-lg px-2 py-1 text-slate-700" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value))}><option value={10}>10</option><option value={50}>50</option><option value="All">Semua</option></select></div>
            <div className="text-sm text-slate-500">Melihat <span className="font-bold">{totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)}</span> dari <span className="font-bold">{totalItems}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || itemsPerPage === 'All'} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || itemsPerPage === 'All'} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: MANAJEMEN KELOMPOK & ANGKATAN */
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
           <AngkatanManager />
        </div>
      )}

      <ModalAngkatan isOpen={isViewStudentsOpen} onClose={() => setViewStudentsOpen(false)} angkatan={selectedAngkatanView} students={students} angkatanList={angkatanList} onSuccess={fetchData} />

      {/* Modal Profile Sederhana */}
      {isProfileOpen && profileData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setProfileOpen(false)}>
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <div className="text-center">
                <h3 className="font-bold text-lg">{profileData.nama_lengkap}</h3>
                <p className="text-sm text-slate-500 mb-4">{profileData.nomor_induk} - {profileData.jurusan}</p>
                <button onClick={()=>setProfileOpen(false)} className="w-full bg-slate-100 py-2 rounded-xl font-bold">Tutup</button>
             </div>
           </div>
        </div>
      )}

      <ModalMahasiswa isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSave={handleSaveStudent} editData={selectedStudent} angkatanList={angkatanList} />
      <ModalUploadCSV isOpen={isCsvOpen} onClose={() => setCsvOpen(false)} onSuccess={() => { fetchData(); showToast("Data massal ditambahkan!", "success"); }} angkatanList={angkatanList} />

      {isBulkEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBulkEditOpen(false)}>
          <form onSubmit={handleBulkUpdate} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Edit Massal Mahasiswa</h3>
                <p className="text-sm text-slate-500 mt-1">Mengubah {selectedIds.length} mahasiswa terpilih.</p>
              </div>
              <button type="button" onClick={() => setBulkEditOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status Akademik</label>
                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
                  <option value="">Tidak diubah</option>
                  <option value="AKTIF">Aktif</option>
                  <option value="CUTI">Cuti</option>
                  <option value="LULUS">Lulus</option>
                  <option value="KELUAR">Keluar</option>
                  <option value="RESIGN">Resign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Angkatan</label>
                <select value={bulkAngkatan} onChange={(e) => setBulkAngkatan(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
                  <option value="">Tidak diubah</option>
                  {angkatanList.map((angkatan) => <option key={angkatan.id} value={angkatan.id}>{angkatan.nama_angkatan}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button type="button" onClick={() => setBulkEditOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default DataMahasiswa;