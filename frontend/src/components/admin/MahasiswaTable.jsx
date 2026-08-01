import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Edit, Eye, User, X } from 'lucide-react';
import ModalMahasiswa from './ModalMahasiswa';

const MahasiswaTable = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  
  // State untuk Checkbox & Hapus Massal
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State untuk Modal Form (Tambah/Edit)
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // State untuk Modal Profil (Mata)
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/mahasiswa`);
      setData(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data mahasiswa:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Ekstrak opsi unik untuk Dropdown Filter
  const opsiJurusan = useMemo(() => [...new Set(data.map(item => item.jurusan).filter(Boolean))], [data]);
  const opsiAngkatan = useMemo(() => [...new Set(data.map(item => item.angkatan).filter(Boolean))], [data]);

  // Logika Filter
  const filteredData = data.filter(m => {
    const matchSearch = m.nama?.toLowerCase().includes(search.toLowerCase()) || m.nim?.toLowerCase().includes(search.toLowerCase());
    const matchJurusan = filterJurusan === '' || m.jurusan === filterJurusan;
    const matchAngkatan = filterAngkatan === '' || m.angkatan === filterAngkatan;
    return matchSearch && matchJurusan && matchAngkatan;
  });

  // Logika Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Logika Hapus Massal
  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} data mahasiswa secara permanen?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/mahasiswa/bulk-delete`, {
          data: { ids: selectedIds } // Menggunakan data array IDs sesuai backend Anda
        });
        setSelectedIds([]);
        fetchData();
      } catch (error) {
        console.error("Gagal hapus massal", error);
      }
    }
  };

  // Logika Hapus Individu
  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus data mahasiswa ${nama}?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/mahasiswa/${id}`);
        fetchData();
      } catch (error) {
        console.error("Gagal hapus", error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      
      {/* FILTER & PENCARIAN */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Input Pencarian */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              className="w-full pl-10 border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-blue-500 font-medium text-sm" 
              placeholder="Cari NIM / Nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          {/* Filter Jurusan */}
          <select 
            className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-blue-500 font-bold text-sm text-slate-600 w-full sm:w-auto"
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
          >
            <option value="">Semua Jurusan</option>
            {opsiJurusan.map((j, i) => <option key={i} value={j}>{j}</option>)}
          </select>

          {/* Filter Angkatan */}
          <select 
            className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-blue-500 font-bold text-sm text-slate-600 w-full sm:w-auto"
            value={filterAngkatan}
            onChange={(e) => setFilterAngkatan(e.target.value)}
          >
            <option value="">Semua Angkatan</option>
            {opsiAngkatan.map((a, i) => <option key={i} value={a}>{a}</option>)}
          </select>
        </div>

        {/* TOMBOL AKSI KANAN */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-all text-sm w-full sm:w-auto justify-center shadow-md shadow-rose-600/20">
              <Trash2 size={16}/> Hapus ({selectedIds.length})
            </button>
          )}
          
          <button onClick={() => { setSelectedStudent(null); setModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-sm w-full sm:w-auto justify-center shadow-md shadow-blue-600/20 ml-auto xl:ml-0">
            <Plus size={18}/> Tambah Data
          </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-wider">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                />
              </th>
              <th className="p-4">NIM</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Jurusan / Angkatan</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map(m => (
                <tr key={m.id} className={`transition-all hover:bg-slate-50/70 ${selectedIds.includes(m.id) ? 'bg-blue-50/40' : ''}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500"
                      checked={selectedIds.includes(m.id)}
                      onChange={() => handleSelectOne(m.id)}
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-700 text-sm">{m.nim}</td>
                  <td className="p-4 font-bold text-slate-800 text-sm">{m.nama}</td>
                  
                  {/* PENGGABUNGAN JURUSAN & ANGKATAN */}
                  <td className="p-4">
                    <p className="font-black text-blue-600 text-sm">{m.jurusan || '-'}</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">{m.angkatan || '-'}</p>
                  </td>
                  
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      String(m.status).toLowerCase() === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      String(m.status).toLowerCase() === 'cuti' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => { setProfileData(m); setProfileOpen(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Lihat Profil"><Eye size={16}/></button>
                    <button onClick={() => { setSelectedStudent(m); setModalOpen(true); }} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" title="Edit Data"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(m.id, m.nama)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Hapus"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold text-sm">Tidak ada data mahasiswa ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PROFIL (MATA) */}
      {isProfileOpen && profileData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setProfileOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={18}/></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
                <User size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800">{profileData.nama}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">{profileData.nim}</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Jenis Kelamin</span>
                  <span className="text-sm font-bold text-slate-700">{profileData.jk === 'L' || profileData.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Jurusan</span>
                  <span className="text-sm font-bold text-blue-600">{profileData.jurusan}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Angkatan</span>
                  <span className="text-sm font-bold text-slate-700">{profileData.angkatan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                  <span className={`text-xs font-black uppercase ${profileData.status === 'aktif' ? 'text-emerald-600' : 'text-rose-600'}`}>{profileData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT */}
      <ModalMahasiswa 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={(data) => { 
          // Logika save bisa dikirim ke parent atau dilanjutkan dari props
          setModalOpen(false); 
          fetchData(); 
        }} 
        editData={selectedStudent} 
        // Mengirimkan list jurusan & angkatan jika ModalMahasiswa Anda membutuhkannya
        angkatanList={opsiAngkatan} 
      />
    </div>
  );
};

export default MahasiswaTable;