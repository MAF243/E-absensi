import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Eye, UserCheck, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

import ModalDosen from '../../components/admin/ModalDosen'; 
import ModalProfilDosen from '../../components/admin/ModalProfilDosen'; 
import ModalUploadCSVDosen from '../../components/admin/ModalUploadCSVDosen';
import DataTable from '../../components/common/DataTable';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';

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

  const { showToast, showConfirm } = useUiStore();

  const fetchData = async () => {
    try {
      const res = await axiosClient.get(`/dosen`).then(r => r.data);
      setDosenList(res.data || []);
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, []);

  // Filter & Search Logic
  const filteredDosen = dosenList.filter(d => {
    const matchSearch = String(d.nama_lengkap || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(d.nomor_induk || '').toLowerCase().includes(search.toLowerCase());
    
  const dStatus = String(d.status_akademik || 'AKTIF').toLowerCase() === 'aktif' ? 'aktif' : 'tidak aktif';
    const matchStatus = filterStatus === '' || dStatus === filterStatus;

    return matchSearch && matchStatus;
  });

  // CRUD Actions
  const handleSaveDosen = async (formData) => {
    try {
      const url = selectedDosen ? `/dosen/${selectedDosen.id}` : `/dosen`;
      const res = await axiosClient.request({ url, method: selectedDosen ? 'PUT' : 'POST', data: formData }).then(r => r.data);

      if (res.success) {
        showToast(selectedDosen ? "Data dosen diperbarui!" : "Dosen baru ditambahkan!", "success");
        setFormOpen(false); fetchData();        
      } else showToast(res.message || "Gagal menyimpan data.", "error");
    } catch (error) {}
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await showConfirm({ title: "Hapus Data Massal", message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data dosen secara permanen? Data yang dihapus tidak dapat dikembalikan.`, type: "warning", confirmText: "Ya, Hapus Semua" });
    
    if (isConfirmed) {
      try {
        const res = await axiosClient.delete(`/dosen/bulk-delete`, { data: { ids: selectedIds } }).then(r => r.data);
        
        if (res.success) { setSelectedIds([]); fetchData(); showToast(`${selectedIds.length} data dihapus.`, "success"); } 
        else showToast("Gagal menghapus data massal.", "error");
      } catch (err) {}
    }
  };

  const handleDelete = async (id, nama) => {
    const isConfirmed = await showConfirm({ title: "Hapus Data Dosen", message: `Apakah Anda yakin ingin menghapus data dosen ${nama}?`, type: "warning", confirmText: "Hapus Data" });

    if (isConfirmed) {
      try {
        const res = await axiosClient.delete(`/dosen/${id}`).then(r => r.data);
        if (res.success) { fetchData(); showToast("Data berhasil dihapus.", "success"); } 
        else showToast("Gagal menghapus data dosen.", "error");
      } catch (err) {}
    }
  };

  const columns = [
    { header: 'NIDN / Inisial', accessor: 'nomor_induk', tdClassName: 'font-medium text-slate-700 tracking-wide' },
    { header: 'Nama Lengkap & Gelar', accessor: 'nama_lengkap', tdClassName: 'font-medium text-slate-800' },
    { header: 'L/P', accessor: 'jenis_kelamin', className: 'text-center', tdClassName: 'font-medium text-slate-500 text-center', render: row => row.jenis_kelamin || '-' },
    {
      header: 'Status',
      className: 'text-center',
      tdClassName: 'text-center',
      render: row => {
        const safeStatus = String(row.status_akademik || 'aktif').trim().toLowerCase();
        const statusColor = safeStatus === 'aktif' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700';
        const isActive = safeStatus === 'aktif';
        const displayStatus = isActive ? 'AKTIF MENGAJAR' : 'TIDAK AKTIF MENGAJAR';
        return (
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-medium border uppercase tracking-widest ${statusColor}`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      header: 'Aksi',
      className: 'text-center',
      tdClassName: 'text-center',
      render: row => (
          <div className="flex justify-center gap-1.5">
          <button onClick={() => { setProfileData(row); setProfileOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95" title="Lihat Profil & Mata Kuliah"><Eye size={18} strokeWidth={2.5} /></button>
          <button onClick={() => { setSelectedDosen(row); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95" title="Edit Data"><Edit size={18} strokeWidth={2.5} /></button>
          <button onClick={() => handleDelete(row.id, row.nama_lengkap)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95" title="Hapus Data"><Trash2 size={18} strokeWidth={2.5} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-slate-50/80 font-sans animate-in fade-in duration-500 pb-10">
      
      <div className="mb-10 flex items-center gap-4">
        <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm">
          <UserCheck size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Kelola Data Dosen</h2>
          <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Manajemen pengajar, NIDN, & Penugasan</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] p-3 md:p-5">
        <DataTable 
          data={filteredDosen}
          columns={columns}
          containerClassName="border-0 rounded-[24px] shadow-none"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Belum ada data dosen yang dapat ditampilkan."
          headerContent={
            <>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-3 text-slate-400" size={18} strokeWidth={2.5} />
                  <input type="text" placeholder="Cari Nama atau NIDN/Inisial..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold text-sm text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                
                <select className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white font-bold text-sm text-slate-600 w-full sm:w-auto transition-all appearance-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif Mengajar</option>
                  <option value="tidak aktif">Tidak Aktif Mengajar</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                {selectedIds.length > 0 && (
                  <button onClick={handleBulkDelete} className="w-full sm:w-auto bg-red-50 text-red-600 border border-red-100 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors text-sm shadow-sm active:scale-95">
                    <Trash2 size={18} strokeWidth={2.5} /> Hapus ({selectedIds.length})
                  </button>
                )}
                <button onClick={() => setCsvOpen(true)} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-sm shadow-sm hover:shadow active:scale-95">
                  <Upload size={18} strokeWidth={2.5} /> Import CSV
                </button>
                <button onClick={() => { setSelectedDosen(null); setFormOpen(true); }} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm">
                  <Plus size={18} strokeWidth={2.5} /> Tambah Dosen
                </button>
              </div>
            </>
          }
        />
      </div>

      <ModalDosen isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSave={handleSaveDosen} editData={selectedDosen} />
      <ModalProfilDosen isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} dosenData={profileData} />
      <ModalUploadCSVDosen isOpen={isCsvOpen} onClose={() => setCsvOpen(false)} onSuccess={() => { fetchData(); showToast("Data massal CSV berhasil ditambahkan!", "success"); }} />

    </div>
  );
};

export default DataDosen;
