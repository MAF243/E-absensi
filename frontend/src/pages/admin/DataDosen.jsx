import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Eye, UserCheck, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

import ModalDosen from '../../components/admin/ModalDosen'; 
import ModalProfilDosen from '../../components/admin/ModalProfilDosen'; 
import ModalUploadCSVDosen from '../../components/admin/ModalUploadCSVDosen';

const DataDosen = () => {
  const [dosenList, setDosenList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // State Modals
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCsvOpen, setCsvOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState(null); 
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null); 

  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const BASE_URL = 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/dosen`).then(r => r.json());
      setDosenList(res.data || []);
    } catch (error) {
      console.error("Gagal load data dosen", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter & Search Logic
  const filteredDosen = dosenList.filter(d => {
    const matchSearch = String(d.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(d.nomor_induk || '').toLowerCase().includes(search.toLowerCase());
    
    // Penyesuaian Filter Logika:
    // Jika filter adalah "tidak aktif", maka cocokkan data yang berstatus "tidak aktif" ATAU "cuti" (sebagai legacy)
    const dStatus = String(d.status_akademik).toLowerCase();
    const matchStatus = filterStatus === '' 
                        ? true 
                        : filterStatus === 'tidak aktif' 
                           ? (dStatus === 'tidak aktif' || dStatus === 'cuti')
                           : dStatus === filterStatus;

    return matchSearch && matchStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, itemsPerPage]);

  const totalItems = filteredDosen.length;
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'All' ? totalItems : startIndex + itemsPerPage;
  const paginatedDosen = filteredDosen.slice(startIndex, endIndex);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(paginatedDosen.map(d => d.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // CRUD Actions
  const handleSaveDosen = async (formData) => {
    try {
      const url = selectedDosen ? `${BASE_URL}/api/dosen/${selectedDosen.id}` : `${BASE_URL}/api/dosen`;
      const method = selectedDosen ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      }).then(r => r.json());

      if (res.success) {
        showToast(selectedDosen ? "Data dosen diperbarui!" : "Dosen baru ditambahkan!", "success");
        setFormOpen(false); fetchData();        
      } else showToast(res.message || "Gagal menyimpan data.", "error");
    } catch (error) { showToast("Terjadi kesalahan koneksi server.", "error"); }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin menghapus ${selectedIds.length} dosen secara permanen?`)) {
      try {
        const res = await fetch(`${BASE_URL}/api/dosen/bulk-delete`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds })
        }).then(r => r.json());
        
        if (res.success) { setSelectedIds([]); fetchData(); showToast(`${selectedIds.length} data dihapus.`, "success"); } 
        else showToast("Gagal menghapus data massal.", "error");
      } catch (err) { showToast("Terjadi kesalahan saat menghapus data.", "error"); }
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin hapus data dosen ${nama}?`)) {
      try {
        const res = await fetch(`${BASE_URL}/api/dosen/${id}`, { method: 'DELETE' }).then(r => r.json());
        if (res.success) { fetchData(); showToast("Data berhasil dihapus.", "success"); } 
        else showToast("Gagal menghapus data dosen.", "error");
      } catch (err) { showToast("Terjadi kesalahan koneksi.", "error"); }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500 relative">
      
      {toast.show && (
        <div className="fixed top-8 right-8 z-[9999] animate-in fade-in slide-in-from-top-8 duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800 tracking-tight">{toast.type === 'success' ? 'Berhasil!' : 'Oops, Gagal!'}</span>
              <span className="text-xs font-medium text-slate-500">{toast.message}</span>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-400 hover:text-slate-600 ml-auto pl-2"><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20">
          <UserCheck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Data Dosen</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manajemen data pengajar, NIDN, dan penugasan mata kuliah.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
        
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Cari Nama atau NIDN/Inisial..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-medium text-sm text-slate-700 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              
              {/* DROPDOWN FILTER STATUS DIUBAH */}
              <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-medium text-sm text-slate-600 w-full sm:w-auto transition-all" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="aktif">Aktif Mengajar</option>
                <option value="tidak aktif">Tidak Aktif</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors text-sm">
                  <Trash2 size={16}/> Hapus ({selectedIds.length})
                </button>
              )}
              <button onClick={() => setCsvOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors text-sm shadow-sm">
                <Upload size={16}/> Import CSV
              </button>
              <button onClick={() => { setSelectedDosen(null); setFormOpen(true); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md text-sm">
                <Plus size={16}/> Tambah Dosen
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer text-blue-600 rounded border-slate-300 focus:ring-blue-500" onChange={handleSelectAll} checked={paginatedDosen.length > 0 && selectedIds.length === paginatedDosen.length} /></th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">NIDN / Inisial</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Nama Lengkap & Gelar</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">L/P</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDosen.length > 0 ? paginatedDosen.map(d => {
                const safeStatus = String(d.status_akademik || 'aktif').trim().toLowerCase();
                const statusColor = safeStatus === 'aktif' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700';
                
                // LOGIKA CERDAS: Jika di DB masih tertulis 'cuti', tampilkan sebagai 'TIDAK AKTIF'
                const displayStatus = safeStatus === 'cuti' ? 'TIDAK AKTIF' : (d.status_akademik || 'AKTIF');

                return (
                  <tr key={d.id} className={`transition-colors hover:bg-slate-50/80 ${selectedIds.includes(d.id) ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-6 py-4 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={selectedIds.includes(d.id)} onChange={() => handleSelectOne(d.id)} /></td>
                    <td className="px-6 py-4 font-semibold text-slate-700 tracking-wider">{d.nomor_induk}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{d.nama_lengkap}</td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-center">{d.jenis_kelamin || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {/* TAMPILAN STATUS BERUBAH DI SINI */}
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${statusColor}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => { setProfileData(d); setProfileOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Profil & Mata Kuliah"><Eye size={18}/></button>
                        <button onClick={() => { setSelectedDosen(null); setSelectedDosen(d); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Data"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(d.id, d.nama_lengkap)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan="6" className="p-16 text-center text-slate-500 font-medium">Belum ada data dosen yang dapat ditampilkan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-slate-100 gap-4 bg-white rounded-b-3xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Menampilkan</span>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-semibold text-sm text-slate-700 focus:border-blue-500 transition-colors cursor-pointer" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="All">Semua</option>
            </select>
            <span className="text-sm font-medium text-slate-500">baris data</span>
          </div>
          
          <div className="text-sm font-medium text-slate-500 text-center">
            Melihat <span className="font-bold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)}</span> dari <span className="font-bold text-slate-700">{totalItems}</span> Total Data
          </div>

          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || itemsPerPage === 'All'} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || itemsPerPage === 'All'} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <ModalDosen isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSave={handleSaveDosen} editData={selectedDosen} />
      <ModalProfilDosen isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} dosenData={profileData} />
      <ModalUploadCSVDosen isOpen={isCsvOpen} onClose={() => setCsvOpen(false)} onSuccess={() => { fetchData(); showToast("Data massal CSV berhasil ditambahkan!", "success"); }} />

    </div>
  );
};

export default DataDosen;