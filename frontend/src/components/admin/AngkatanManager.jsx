import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const AngkatanManager = () => {
  const [list, setList] = useState([]);
  const [input, setInput] = useState('');

  const fetchList = async () => {
    const res = await axios.get('http://localhost:5000/api/angkatan');
    setList(res.data.data);
  };

  useEffect(() => { fetchList(); }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border max-w-lg">
      <h3 className="font-bold mb-4">Master Data Angkatan/Jurusan</h3>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 rounded w-full" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Contoh: IT8 / ITK" />
        <button onClick={async() => { await axios.post('http://localhost:5000/api/angkatan', { nama_angkatan: input }); fetchList(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+</button>
      </div>
      <div className="space-y-2">
        {list.map(a => (
          <div key={a.id} className="flex justify-between p-3 bg-slate-50 rounded-lg">
            {a.nama_angkatan}
            <button onClick={async() => { await axios.delete(`http://localhost:5000/api/angkatan/${a.id}`); fetchList(); }} className="text-rose-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AngkatanManager;