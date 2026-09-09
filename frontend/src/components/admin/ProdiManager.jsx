import React, { useEffect, useState } from 'react';
import { Edit, Save, Trash2, X } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const emptyForm = { nama_prodi: '', kode_prodi: '' };

const ProdiManager = ({ onChanged }) => {
  const [prodiList, setProdiList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProdi = async () => {
    const { data } = await axiosClient.get('/prodi?include_inactive=true');
    setProdiList(data.data || []);
  };

  useEffect(() => {
    fetchProdi().catch(() => setErrorMsg('Gagal memuat data prodi.'));
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    try {
      const request = editingId
        ? axiosClient.put(`/prodi/${editingId}`, formData)
        : axiosClient.post('/prodi', formData);
      await request;
      await fetchProdi();
      onChanged?.();
      resetForm();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Gagal menyimpan prodi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus prodi ini? Data yang masih menggunakannya akan mencegah penghapusan.')) return;
    try {
      await axiosClient.delete(`/prodi/${id}`);
      await fetchProdi();
      onChanged?.();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Gagal menghapus prodi.');
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-5 lg:p-6 border border-slate-100 shadow-xl shadow-slate-200/30">
      <div className="flex flex-col lg:flex-row gap-6">
        <form onSubmit={handleSubmit} className="lg:w-80 shrink-0 space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">Master Prodi</h3>
            <p className="text-sm text-slate-500 mt-1">Prodi dipilih dari daftar ini pada data mahasiswa dan mata kuliah.</p>
          </div>
          {errorMsg && <p className="text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nama Prodi</label>
            <input required value={formData.nama_prodi} onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Contoh: Informatika" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kode Prodi</label>
            <input value={formData.kode_prodi} onChange={(e) => setFormData({ ...formData, kode_prodi: e.target.value.toUpperCase() })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Contoh: IF" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-blue-700"><Save size={16} /> {editingId ? 'Simpan' : 'Tambah'}</button>
            {editingId && <button type="button" onClick={resetForm} className="p-3 bg-slate-100 text-slate-600 rounded-xl" title="Batal edit"><X size={17} /></button>}
          </div>
        </form>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Nama Prodi</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Kode</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prodiList.map((prodi) => (
                <tr key={prodi.id}>
                  <td className="px-4 py-4 font-bold text-slate-800">{prodi.nama_prodi}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{prodi.kode_prodi || '-'}</td>
                  <td className="px-4 py-4"><span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase ${prodi.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{prodi.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => { setEditingId(prodi.id); setFormData({ nama_prodi: prodi.nama_prodi, kode_prodi: prodi.kode_prodi || '' }); }} className="p-2 text-slate-400 hover:text-blue-600" title="Edit prodi"><Edit size={17} /></button>
                    <button onClick={() => handleDelete(prodi.id)} className="p-2 text-slate-400 hover:text-rose-600" title="Hapus prodi"><Trash2 size={17} /></button>
                  </td>
                </tr>
              ))}
              {prodiList.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-400">Belum ada prodi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProdiManager;
