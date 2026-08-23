import React, { useState, useEffect } from 'react';
import { List, X, UserPlus, Users, Trash2, Edit2, Search, Plus, CheckSquare } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';

const ModalAngkatan = ({ isOpen, onClose, angkatan: kelas, students, onSuccess }) => {
  const { showToast, showConfirm } = useUiStore();

  const [isAssignMode, setIsAssignMode] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignFilterJurusan, setAssignFilterJurusan] = useState('');
  const [assignSelectedIds, setAssignSelectedIds] = useState([]);
  
  const [editKelompokSelectedIds, setEditKelompokSelectedIds] = useState([]);
  const [isBulkEditJurusanModalOpen, setBulkEditJurusanModalOpen] = useState(false);
  const [bulkNewJurusan, setBulkNewJurusan] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsAssignMode(false);
      setAssignSearch('');
      setAssignFilterJurusan('');
      setAssignSelectedIds([]);
      setEditKelompokSelectedIds([]);
      setBulkEditJurusanModalOpen(false);
      setBulkNewJurusan('');
    }
  }, [isOpen]);

  if (!isOpen || !kelas) return null;

  const getStudentsByKelas = (kelasId) => {
    return students.filter(s => String(s.kelas_id) === String(kelasId));
  };

  const handleAssignSubmit = async () => {
    if (assignSelectedIds.length === 0) return;
    try {
      const { data: res } = await axiosClient.put('/mahasiswa/bulk-assign-kelas', { studentIds: assignSelectedIds, kelas_id: kelas.id });
      if (res.success) { showToast(res.message, "success"); setAssignSelectedIds([]); setIsAssignMode(false); onSuccess(); } else showToast(res.message, "error");
    } catch (err) { showToast("Terjadi kesalahan jaringan.", "error"); }
  };

  const handleRemoveFromKelas = async (studentId, studentName) => {
    showConfirm(`Keluarkan ${studentName} dari kelas ini?`, async () => {
      try {
        const { data: res } = await axiosClient.post('/mahasiswa/remove-kelas', { mahasiswa_id: studentId, kelas_id: kelas.id });
        if (res.success) { showToast(res.message, "success"); setEditKelompokSelectedIds(prev => prev.filter(id => id !== studentId)); onSuccess(); } else showToast(res.message, "error");
      } catch (err) { showToast("Kesalahan jaringan.", "error"); }
    });
  };

  const handleBulkRemoveFromKelas = async () => {
    if (editKelompokSelectedIds.length === 0) return;
    showConfirm(`Keluarkan ${editKelompokSelectedIds.length} mahasiswa dari kelas ini?`, async () => {
      try {
        const promises = editKelompokSelectedIds.map(id => 
          axiosClient.post('/mahasiswa/remove-kelas', { mahasiswa_id: id, kelas_id: kelas.id }).then(r => r.data)
        );
        await Promise.all(promises);
        setEditKelompokSelectedIds([]);
        onSuccess();
        showToast(`${editKelompokSelectedIds.length} mahasiswa berhasil dikeluarkan.`, "success");
      } catch (err) {
        showToast("Terjadi kesalahan jaringan saat mengeluarkan mahasiswa.", "error");
      }
    });
  };

  const handleBulkEditJurusanSubmit = async (e) => {
    e.preventDefault();
    if (!bulkNewJurusan.trim()) return;
    try {
      const { data: res } = await axiosClient.put('/mahasiswa/bulk-edit-jurusan', { ids: editKelompokSelectedIds, jurusan_baru: bulkNewJurusan });
      if (res.success) { showToast(res.message, "success"); setBulkEditJurusanModalOpen(false); setBulkNewJurusan(''); setEditKelompokSelectedIds([]); onSuccess(); } else showToast(res.message, "error");
    } catch(err) { showToast("Kesalahan jaringan.", "error"); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
        <div className={`bg-white w-full ${isAssignMode ? 'max-w-6xl' : 'max-w-4xl'} rounded-3xl p-5 md:p-8 shadow-2xl relative animate-in zoom-in-95 h-[90vh] flex flex-col transition-all duration-300`} onClick={e => e.stopPropagation()}>

          <div className="mb-4 border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><List size={22} className="text-blue-600"/> Data Mahasiswa Kelas</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Kelas: <span className="font-bold text-blue-600">{kelas.name || kelas.nama_kelas}</span></p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => setIsAssignMode(!isAssignMode)} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isAssignMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}>
                {isAssignMode ? <><X size={16}/> Batal Tambah</> : <><UserPlus size={16}/> Tambah Anggota</>}
              </button>
              <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm text-xs md:text-sm">
                Tutup & Selesai
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 overflow-hidden min-h-[400px] mt-2">
            
            {/* KIRI: AREA TAMBAH MAHASISWA */}
            {isAssignMode && (() => {
              const availableStudents = students.filter(s => {
                if (String(s.kelas_id) === String(kelas.id)) return false;
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

                  <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-y-auto p-2 space-y-1 shadow-inner mb-4 custom-scrollbar">
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
                    <button onClick={handleBulkRemoveFromKelas} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-colors">
                      <Trash2 size={14}/> Keluarkan ({editKelompokSelectedIds.length})
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                  {(() => {
                    const mhsList = getStudentsByKelas(kelas.id);
                    if(mhsList.length === 0) return <div className="text-center p-12 text-slate-400 font-medium italic text-sm h-full flex items-center justify-center">Belum ada anggota di kelas ini.</div>;

                    return (
                      <table className="w-full text-left table-auto">
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
                                <button onClick={() => handleRemoveFromKelas(m.id, m.nama_lengkap)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X size={18}/></button>
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
    </>
  );
};

export default ModalAngkatan;
