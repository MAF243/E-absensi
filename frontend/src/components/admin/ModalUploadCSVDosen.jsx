import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';

const ModalUploadCSVDosen = ({ isOpen, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const BASE_URL = 'http://localhost:5000';

  const downloadTemplate = () => {
    const headers = "nidn;nama;jk;status;password\n";
    const sample1 = "04123456;Dr. Budi Santoso;L;aktif;rahasia123\n";
    const sample2 = "DSN_AB;Siti Aminah, M.Kom;P;aktif;dosen123\n";
    
    const blob = new Blob([headers + sample1 + sample2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Dosen.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const delimiter = text.includes(';') ? ';' : ','; 
      const rows = text.split('\n').map(row => row.trim()).filter(row => row !== ''); 
      
      if (rows.length < 2) {
        resetFile();
        setErrorMsg("File CSV kosong atau tidak memiliki baris data.");
        return;
      }

      const userHeaders = rows[0].split(delimiter).map(h => h.trim().toLowerCase());
      
      if (!userHeaders.includes('nidn') || !userHeaders.includes('nama')) {
        resetFile();
        setErrorMsg("Format CSV tidak valid. Pastikan ada kolom 'nidn' dan 'nama'.");
        return;
      }

      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(delimiter).map(v => v.trim());
        let rawRow = {};
        userHeaders.forEach((header, index) => { rawRow[header] = values[index] || ''; });

        parsedData.push({
          nomor_induk: rawRow.nidn,
          nama_lengkap: rawRow.nama,
          jenis_kelamin: rawRow.jk || 'L',
          status_akademik: rawRow.status || 'aktif',
          password: rawRow.password || rawRow.nidn 
        });
      }
      setCsvData(parsedData);
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleUploadSubmit = async () => {
    setIsLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${BASE_URL}/api/dosen/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: csvData }) 
      }).then(r => r.json());

      if (res.success) {
        resetFile(); onSuccess(); onClose();
      } else setErrorMsg(res.message || "Gagal mengimpor data CSV.");
    } catch (error) {
      setErrorMsg("Terjadi kesalahan koneksi saat mengirim data ke server.");
    } finally { setIsLoading(false); }
  };

  const resetFile = () => { setCsvData([]); setFileName(''); setErrorMsg(''); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Import Massal Dosen (CSV)</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">Tambahkan banyak data dosen sekaligus.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex gap-3"><AlertCircle size={18} className="shrink-0 mt-0.5" /><p>{errorMsg}</p></div>
        )}

        {csvData.length === 0 ? (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Info size={18} className="text-blue-600" /> Panduan Impor Data</h4>
              <ol className="relative border-l border-slate-300 ml-3 space-y-5">
                <li className="pl-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 text-blue-600 font-bold text-xs">1</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Unduh Template</h5>
                  <button onClick={downloadTemplate} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50"><Download size={16} /> Unduh Template CSV</button>
                </li>
                <li className="pl-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full -left-3 text-slate-600 font-bold text-xs">2</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Unggah File</h5>
                  <p className="text-sm text-slate-500 mt-1">Pilih file CSV yang sudah diisi.</p>
                </li>
              </ol>
            </div>

            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileSelect} className="hidden" />
            <div onClick={() => fileInputRef.current.click()} className="w-full py-10 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className="p-3 bg-white border border-slate-200 rounded-full mb-3 group-hover:bg-blue-100"><UploadCloud size={28} className="text-slate-400 group-hover:text-blue-600" /></div>
              <p className="font-semibold text-slate-700 text-sm">Klik untuk memilih file CSV</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">File Terpilih</p><p className="font-bold text-slate-800 text-sm">{fileName}</p></div>
              </div>
              <div className="text-right"><p className="text-xs font-semibold text-slate-500 uppercase">Total</p><p className="font-bold text-blue-600 text-sm">{csvData.length} Data</p></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr><th className="px-4 py-3 text-slate-600">NIDN</th><th className="px-4 py-3 text-slate-600">Nama Lengkap</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csvData.slice(0, 5).map((row, idx) => (
                    <tr key={idx}><td className="px-4 py-3 text-slate-700 font-medium">{row.nomor_induk}</td><td className="px-4 py-3 font-bold text-slate-800">{row.nama_lengkap}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={resetFile} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 w-full sm:w-auto">Batal</button>
              <button onClick={handleUploadSubmit} disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-blue-700 flex justify-center gap-2">
                {isLoading ? 'Memproses...' : <><CheckCircle2 size={18} /> Simpan Data</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalUploadCSVDosen;