import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Edit, Eye, Upload, Users, BookOpen, User, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Edit2, Check, GraduationCap, List, UserPlus, CheckSquare } from 'lucide-react';
import ModalMahasiswa from '../../components/admin/ModalMahasiswa'; 
import ModalUploadCSV from '../../components/admin/ModalUploadCSV'; 

const DataMahasiswa = () => {
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [students, setStudents] = useState([]);
  const [angkatanList, setAngkatanList] = useState([]);
  
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

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

  // State Modal Daftar Mahasiswa per Angkatan & Fitur Assign
  const [isViewStudentsOpen, setViewStudentsOpen] = useState(false);
  const [selectedAngkatanView, setSelectedAngkatanView] = useState(null); 
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignFilterJurusan, setAssignFilterJurusan] = useState('');
  const [assignSelectedIds, setAssignSelectedIds] = useState([]);

  // State Edit/Hapus Kelompok Massal
  const [editKelompokSelectedIds, setEditKelompokSelectedIds] = useState([]);
  const [isBulkEditJurusanModalOpen, setBulkEditJurusanModalOpen] = useState(false);
  const [bulkNewJurusan, setBulkNewJurusan] = useState('');

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
        fetch(`${BASE_URL}/api/mahasiswa`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${BASE_URL}/api/angkatan`).then(r => r.json()).catch(() => ({ data: [] }))
      ]);
      setStudents(resM.data || []);
      setAngkatanList(resA.data || []);
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if(!isViewStudentsOpen) setEditKelompokSelectedIds([]); }, [isViewStudentsOpen]);

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
      const url = selectedStudent ? `${BASE_URL}/api/mahasiswa/${selectedStudent.id}` : `${BASE_URL}/api/mahasiswa`;
      const method = selectedStudent ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }).then(r => r.json());
      if (res.success) { showToast(selectedStudent ? "Data diperbarui!" : "Mahasiswa ditambahkan!", "success"); setFormOpen(false); fetchData(); } 
      else showToast(res.message || "Gagal.", "error");
    } catch (error) { showToast("Koneksi gagal.", "error"); }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin menghapus ${selectedIds.length} mahasiswa permanen?`)) {
      try {
        const res = await fetch(`${BASE_URL}/api/mahasiswa/bulk-delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) }).then(r => r.json());
        if (res.success) { setSelectedIds([]); fetchData(); showToast(`${selectedIds.length} data dihapus.`, "success"); } else showToast(res.message, "error");
      } catch (err) { showToast("Gagal jaringan.", "error"); }
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin hapus data ${nama}?`)) {
      try {
        const res = await fetch(`${BASE_URL}/api/mahasiswa/${id}`, { method: 'DELETE' }).then(r => r.json());
        if (res.success) { fetchData(); showToast("Data dihapus.", "success"); } 
      } catch (err) {}
    }
  };

  const handleAddAngkatan = async () => {
    if (!newAngkatan.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/angkatan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama_angkatan: newAngkatan }) }).then(r => r.json());
      if(res.success) { setNewAngkatan(''); fetchData(); showToast("Kategori ditambahkan.", "success"); } 
    } catch (err) {}
  };

  const handleUpdateAngkatan = async (id) => {
    if (!editAngkatanName.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/angkatan/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama_angkatan: editAngkatanName }) }).then(r => r.json());
      if(res.success) { setEditingAngkatanId(null); setEditAngkatanName(''); fetchData(); showToast("Perubahan disimpan.", "success"); } 
    } catch (err) {}
  };

  const handleDeleteAngkatan = async (id) => {
    if (window.confirm("Peringatan: Lanjutkan menghapus kelompok ini?")) {
      try {
        const res = await fetch(`${BASE_URL}/api/angkatan/${id}`, { method: 'DELETE' }).then(r => r.json());
        if(res.success) { fetchData(); showToast("Data dihapus.", "success"); } 
      } catch (err) {}
    }
  };

  const handleAssignSubmit = async () => {
    if (assignSelectedIds.length === 0) return alert("Pilih minimal 1 mahasiswa!");
    try {
      const res = await fetch(`${BASE_URL}/api/mahasiswa/bulk-assign`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds: assignSelectedIds, angkatan_id: selectedAngkatanView.id }) }).then(r => r.json());
      if (res.success) { setAssignSelectedIds([]); fetchData(); alert(`Sukses! ${res.message}`); showToast(res.message, "success"); } else showToast(res.message, "error");
    } catch (error) { showToast("Terjadi kesalahan jaringan.", "error"); }
  };

  const handleRemoveFromAngkatan = async (studentId, studentName) => {
    if(!window.confirm(`Keluarkan ${studentName} dari grup ini?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/mahasiswa/remove-group`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ mahasiswa_id: studentId, angkatan_id: selectedAngkatanView.id }) 
      }).then(r => r.json());
      if(res.success) { 
        setEditKelompokSelectedIds(prev => prev.filter(id => id !== studentId));
        fetchData(); 
        showToast(`${studentName} dikeluarkan.`, "success"); 
      }
    } catch (err) {}
  };

  // FUNGSI BARU: MENGELUARKAN MAHASISWA MASSAL
  const handleBulkRemoveFromAngkatan = async () => {
    if(!window.confirm(`Keluarkan ${editKelompokSelectedIds.length} mahasiswa terpilih dari grup ini?`)) return;
    try {
      // Loop untuk menembak API remove-group secara massal
      const promises = editKelompokSelectedIds.map(id => 
        fetch(`${BASE_URL}/api/mahasiswa/remove-group`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ mahasiswa_id: id, angkatan_id: selectedAngkatanView.id }) 
        }).then(r => r.json())
      );
      
      await Promise.all(promises);
      setEditKelompokSelectedIds([]);
      fetchData();
      showToast(`${editKelompokSelectedIds.length} mahasiswa berhasil dikeluarkan.`, "success");
    } catch (err) {
      showToast("Terjadi kesalahan jaringan saat mengeluarkan mahasiswa.", "error");
    }
  };

  const handleBulkEditJurusanSubmit = async (e) => {
    e.preventDefault();
    if (!bulkNewJurusan.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/mahasiswa/bulk-edit-jurusan`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: editKelompokSelectedIds, jurusan_baru: bulkNewJurusan })
      }).then(r => r.json());
      if (res.success) { showToast(res.message, "success"); setBulkEditJurusanModalOpen(false); setBulkNewJurusan(''); setEditKelompokSelectedIds([]); fetchData(); } else showToast(res.message, "error");
    } catch(err) { showToast("Kesalahan jaringan.", "error"); }
  };

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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0"><Users size={24} /></div>
          <div><h2 className="text-xl md:text-2xl font-bold text-slate-800">Manajemen Mahasiswa</h2><p className="text-xs md:text-sm font-medium text-slate-500 mt-1 line-clamp-1 md:line-clamp-none">Kelola biodata mahasiswa, serta data master kelompok dan angkatan.</p></div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-fit overflow-x-auto shrink-0">
          <button onClick={() => { setActiveTab('mahasiswa'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'mahasiswa' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}><Users size={16}/> Data Mahasiswa</button>
          <button onClick={() => { setActiveTab('angkatan'); setSelectedIds([]); }} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'angkatan' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}><BookOpen size={16}/> Kelompok & Angkatan</button>
        </div>
      </div>

      {activeTab === 'mahasiswa' ? (
        /* TAB 1: TABEL MAHASISWA UTAMA */
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-64 shrink-0"><Search className="absolute left-3.5 top-3 text-slate-400" size={18} /><input type="text" placeholder="Cari NIM/Nama..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <select className="px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-sm text-slate-600 w-full sm:w-auto" value={filterJurusan} onChange={(e) => setFilterJurusan(e.target.value)}><option value="">Semua Jurusan</option>{opsiJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}</select>
              <select className="px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-sm text-slate-600 w-full sm:w-auto" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}><option value="">Semua Angkatan</option>{angkatanList.map((a) => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}</select>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto mt-2 xl:mt-0">
              {selectedIds.length > 0 && <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-red-100 flex-1 md:flex-none justify-center text-sm"><Trash2 size={16}/> Hapus ({selectedIds.length})</button>}
              <button onClick={() => setCsvOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 text-sm shadow-sm flex-1 md:flex-none"><Upload size={16}/> Import CSV</button>
              <button onClick={() => { setSelectedStudent(null); setFormOpen(true); }} className="bg-blue-600 text-white px-4 md:px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm text-sm flex-1 md:flex-none w-full md:w-auto"><Plus size={16}/> Tambah Data</button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 md:px-6 py-4 w-12 text-center"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" onChange={handleSelectAll} checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length} /></th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">NIM</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">Nama Lengkap</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">L/P</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500">Jurusan / Angkatan</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>
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
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right">
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
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border flex-1 flex flex-col justify-center">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 mb-2"><BookOpen size={20} className="text-blue-600"/> Master Data Jurusan & Kelompok</h2>
              <p className="text-slate-500 text-sm mb-5">Tambahkan kategori kelas kelompok, angkatan, atau jurusan di sini.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="Cth: Kelompok PTG 2, Informatika 8..." value={newAngkatan} onChange={(e) => setNewAngkatan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddAngkatan()}/>
                <button onClick={handleAddAngkatan} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 text-sm whitespace-nowrap"><Plus size={16}/> Simpan</button>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-80 shrink-0">
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={24}/></div>
                <div><p className="text-sm font-semibold text-slate-500 mb-0.5">Kategori Kelompok</p><h4 className="text-2xl font-black text-slate-800">{angkatanList.length}</h4></div>
              </div>
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm flex items-center gap-4 flex-1">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24}/></div>
                <div><p className="text-sm font-semibold text-slate-500 mb-0.5">Mahasiswa Aktif</p><h4 className="text-2xl font-black text-slate-800">{students.filter(s => s.status_akademik === 'aktif').length}</h4></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
            {angkatanList.map(a => {
              const info = getStudentInfoByAngkatan(a.id);
              const isEditing = editingAngkatanId === a.id;
              return (
                <div key={a.id} className="bg-white border rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                  {isEditing ? (
                    <div className="flex flex-col h-full animate-in zoom-in-95 duration-200">
                      <label className="text-[11px] font-bold uppercase text-slate-400 mb-2">Edit Nama Kelompok</label>
                      <input autoFocus value={editAngkatanName} onChange={(e) => setEditAngkatanName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateAngkatan(a.id)} className="w-full px-3 py-2 bg-slate-50 border focus:border-blue-500 rounded-lg outline-none font-semibold text-sm mb-4"/>
                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => setEditingAngkatanId(null)} className="flex-1 py-2 bg-slate-100 rounded-lg font-semibold text-xs">Batal</button>
                        <button onClick={() => handleUpdateAngkatan(a.id)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs flex justify-center gap-1"><Check size={14}/> Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 text-lg leading-tight pr-2">{a.nama_angkatan}</h4>
                          <div className="flex gap-0.5 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedAngkatanView({id: a.id, name: a.nama_angkatan}); setViewStudentsOpen(true); setIsAssignMode(false); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md" title="Lihat/Atur Anggota"><List size={16}/></button>
                            <button onClick={() => { setEditingAngkatanId(a.id); setEditAngkatanName(a.nama_angkatan); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteAngkatan(a.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-xs mb-3"><GraduationCap size={14} /> {info.count} Terdaftar</div>
                        {info.count > 0 ? <p className="text-[11px] md:text-xs font-medium text-slate-500 italic line-clamp-2">Termasuk: {info.previewNames}</p> : <p className="text-[11px] md:text-xs text-slate-400 italic">Kosong.</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR MAHASISWA & ASSIGN MODE */}
      {isViewStudentsOpen && selectedAngkatanView && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => { setViewStudentsOpen(false); setIsAssignMode(false); }}>
          <div className={`bg-white w-full ${isAssignMode ? 'max-w-6xl' : 'max-w-4xl'} rounded-3xl p-5 md:p-8 shadow-2xl relative animate-in zoom-in-95 h-[90vh] flex flex-col transition-all duration-300`} onClick={e => e.stopPropagation()}>

            <div className="mb-4 border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><List size={22} className="text-blue-600"/> Data Kelompok Kelas</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Kategori: <span className="font-bold text-blue-600">{selectedAngkatanView.name}</span></p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => setIsAssignMode(!isAssignMode)} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isAssignMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}>
                  {isAssignMode ? <><X size={16}/> Batal Tambah</> : <><UserPlus size={16}/> Tambah Anggota</>}
                </button>
                <button onClick={() => { setViewStudentsOpen(false); setIsAssignMode(false); }} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm text-xs md:text-sm">
                  Tutup & Selesai
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 overflow-hidden min-h-[400px] mt-2">
              
              {/* KIRI: AREA TAMBAH MAHASISWA */}
              {isAssignMode && (() => {
                const availableStudents = students.filter(s => {
                  if (String(s.angkatan_id) === String(selectedAngkatanView.id)) return false;
                  if (s.list_kelompok_id && String(s.list_kelompok_id).split(',').includes(String(selectedAngkatanView.id))) return false;
                  return true;
                });
                const assignOpsiJurusan = [...new Set(availableStudents.map(s => s.jurusan).filter(Boolean))];
                const filteredAvailable = availableStudents.filter(s => {
                  const matchSearch = String(s.nama_lengkap).toLowerCase().includes(assignSearch.toLowerCase()) || String(s.nomor_induk).includes(assignSearch);
                  const matchJurusan = assignFilterJurusan === '' || s.jurusan === assignFilterJurusan;
                  return matchSearch && matchJurusan;
                });
                const isAllFilteredSelected = filteredAvailable.length > 0 && filteredAvailable.every(m => assignSelectedIds.includes(m.id));

                return (
                  <div className="w-full lg:w-5/12 flex flex-col bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-5 h-full">
                    <div className="flex justify-between items-end mb-3 shrink-0">
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2"><CheckSquare size={16}/> Mahasiswa Tersedia</label>
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded shadow-sm">{assignSelectedIds.length} Dipilih</span>
                    </div>

                    <div className="flex gap-2 mb-3 shrink-0">
                      <input type="text" placeholder="Cari..." className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none focus:border-blue-500 min-w-0 bg-white" value={assignSearch} onChange={e=>setAssignSearch(e.target.value)} />
                      <select className="w-28 text-xs border rounded-xl px-2 py-2 outline-none focus:border-blue-500 uppercase bg-white" value={assignFilterJurusan} onChange={e=>setAssignFilterJurusan(e.target.value)}><option value="">SEMUA JURUSAN</option>{assignOpsiJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}</select>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] md:text-sm font-bold text-blue-800 mb-2 px-1 pb-2 border-b border-blue-200 border-dashed shrink-0">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={isAllFilteredSelected} onChange={(e) => {
                         if (e.target.checked) {
                            const newIds = [...assignSelectedIds];
                            filteredAvailable.forEach(m => { if(!newIds.includes(m.id)) newIds.push(m.id); });
                            setAssignSelectedIds(newIds);
                         } else {
                            const filterIds = filteredAvailable.map(m => m.id);
                            setAssignSelectedIds(assignSelectedIds.filter(id => !filterIds.includes(id)));
                         }
                      }} disabled={filteredAvailable.length === 0} />
                      Pilih Semua Hasil Pencarian
                    </label>

                    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-y-auto p-2 space-y-1 shadow-inner mb-4">
                      {filteredAvailable.map(mhs => (
                        <label key={mhs.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${assignSelectedIds.includes(mhs.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                          <input type="checkbox" checked={assignSelectedIds.includes(mhs.id)} onChange={() => setAssignSelectedIds(p => p.includes(mhs.id) ? p.filter(i=>i!==mhs.id) : [...p, mhs.id])} className="w-4 h-4 rounded text-blue-600 shrink-0" />
                          <div className="min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{mhs.nama_lengkap}</p><p className="text-[10px] text-slate-500 truncate">{mhs.nomor_induk} • <span className="text-blue-600 uppercase">{mhs.jurusan}</span></p></div>
                        </label>
                      ))}
                    </div>
                    <button onClick={handleAssignSubmit} className="shrink-0 w-full bg-blue-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2"><Plus size={16}/> Masukkan Terpilih</button>
                  </div>
                );
              })()}

              {/* KANAN: TABEL ANGGOTA SAAT INI */}
              <div className={`w-full ${isAssignMode ? 'lg:w-7/12' : 'w-full'} flex flex-col h-full`}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18}/> Anggota Terdaftar</h4>
                  
                  {editKelompokSelectedIds.length > 0 && (
                    <div className="flex gap-2 animate-in fade-in">
                      <button onClick={() => setBulkEditJurusanModalOpen(true)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-sm transition-colors">
                        <Edit2 size={14}/> Edit Jurusan ({editKelompokSelectedIds.length})
                      </button>
                      <button onClick={handleBulkRemoveFromAngkatan} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-colors">
                        <Trash2 size={14}/> Keluarkan ({editKelompokSelectedIds.length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-slate-50 border rounded-2xl overflow-hidden flex flex-col h-full">
                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    {(() => {
                      const mhsList = getStudentsByAngkatan(selectedAngkatanView.id);
                      if(mhsList.length === 0) return <div className="text-center p-12 text-slate-400 font-medium italic text-sm h-full flex items-center justify-center">Belum ada anggota di kelompok ini.</div>;

                      return (
                        <table className="w-full text-left whitespace-nowrap min-w-[550px]">
                          <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                            <tr>
                              <th className="px-4 md:px-5 py-3 text-center w-10">
                                <input type="checkbox" className="w-4 h-4 cursor-pointer text-indigo-600 rounded" 
                                  onChange={(e) => setEditKelompokSelectedIds(e.target.checked ? mhsList.map(m => m.id) : [])} 
                                  checked={mhsList.length > 0 && editKelompokSelectedIds.length === mhsList.length} 
                                />
                              </th>
                              <th className="px-4 py-3 text-[10px] md:text-xs font-bold uppercase text-slate-500">NIM</th>
                              <th className="px-4 py-3 text-[10px] md:text-xs font-bold uppercase text-slate-500">Nama Lengkap</th>
                              <th className="px-4 py-3 text-[10px] md:text-xs font-bold uppercase text-indigo-600">Jurusan</th>
                              <th className="px-4 py-3 text-[10px] md:text-xs font-bold uppercase text-slate-500 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mhsList.map(m => (
                              <tr key={m.id} className={`transition-colors ${editKelompokSelectedIds.includes(m.id) ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}>
                                <td className="px-4 py-3 text-center">
                                  <input type="checkbox" className="w-4 h-4 cursor-pointer text-indigo-600 rounded" 
                                    checked={editKelompokSelectedIds.includes(m.id)} 
                                    onChange={() => setEditKelompokSelectedIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} 
                                  />
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-600 text-xs md:text-sm">{m.nomor_induk}</td>
                                <td className="px-4 py-3 font-bold text-slate-800 text-xs md:text-sm">{m.nama_lengkap}</td>
                                <td className="px-4 py-3 font-bold text-indigo-600 text-xs md:text-sm">{m.jurusan || '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => handleRemoveFromAngkatan(m.id, m.nama_lengkap)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X size={18}/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kecil: Edit Jurusan Massal */}
      {isBulkEditJurusanModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2"><Edit2 size={18} className="text-amber-500"/> Edit Jurusan Massal</h3>
             <p className="text-xs text-slate-500 mb-5">Mengubah jurusan untuk <b>{editKelompokSelectedIds.length} mahasiswa</b> terpilih.</p>
             <form onSubmit={handleBulkEditJurusanSubmit}>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ketik Jurusan Baru</label>
                <input required autoFocus type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 uppercase text-sm font-bold text-indigo-700 focus:border-blue-500 outline-none mb-6 bg-slate-50 focus:bg-white transition-colors" placeholder="Cth: DKV, SI, TI..." value={bulkNewJurusan} onChange={e => setBulkNewJurusan(e.target.value)} />
                <div className="flex gap-2">
                   <button type="button" onClick={() => setBulkEditJurusanModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Batal</button>
                   <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors">Simpan Jurusan</button>
                </div>
             </form>
          </div>
        </div>
      )}

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

    </div>
  );
};

export default DataMahasiswa;