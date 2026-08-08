import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const ModalUploadCSV = ({ isOpen, onClose, onSuccess, angkatanList }) => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 1. FUNGSI DOWNLOAD TEMPLATE
  const downloadTemplate = () => {
    const headers = "nim;nama;jk;jurusan;angkatan;status;password\n";
    const sample1 = "221102001;Andi Budiman;L;Informatika;Informatika 5;aktif;rahasia123\n";
    const sample2 = "221102002;Siti Aminah;P;Informatika;Informatika 6;aktif;mahasiswa123\n";
    
    const blob = new Blob([headers + sample1 + sample2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Mahasiswa.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. FUNGSI BACA DAN TRANSLATE CSV
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
      
      if (!userHeaders.includes('nim') || !userHeaders.includes('nama')) {
        resetFile();
        setErrorMsg("Format CSV tidak valid. Pastikan baris pertama memiliki kolom 'nim' dan 'nama'.");
        return;
      }

      const parsedData = [];
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(delimiter).map(v => v.trim());
        let rawRow = {};
        
        userHeaders.forEach((header, index) => {
          rawRow[header] = values[index] || '';
        });

        // Penerjemah: Ubah nama angkatan (teks) menjadi angkatan_id (angka)
        let matchedAngkatanId = null;
        if (rawRow.angkatan) {
          const found = angkatanList?.find(a => 
            a.nama_angkatan.toLowerCase() === rawRow.angkatan.toLowerCase()
          );
          if (found) matchedAngkatanId = found.id;
        }

        parsedData.push({
          nomor_induk: rawRow.nim,
          nama_lengkap: rawRow.nama,
          jenis_kelamin: rawRow.jk || 'L',
          jurusan: rawRow.jurusan || '',
          angkatan_id: matchedAngkatanId,
          status_akademik: rawRow.status || 'aktif',
          password: rawRow.password || rawRow.nim 
        });
      }
      setCsvData(parsedData);
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = ''; 
  };

  // 3. FUNGSI KIRIM KE BACKEND
  const handleUploadSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.post(`/mahasiswa/bulk`, { data: csvData }).then(r => r.data);

      if (res.success) {
        resetFile();
        onSuccess(); 
        onClose(); // Tutup modal otomatis jika sukses
      } else {
        setErrorMsg(res.message || "Gagal mengimpor data CSV.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
         setErrorMsg(error.response.data.message);
      } else {
         setErrorMsg("Terjadi kesalahan koneksi saat mengirim data ke server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetFile = () => {
    setCsvData([]);
    setFileName('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-[32px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Import Massal (CSV)</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">Tambahkan banyak data mahasiswa sekaligus menggunakan file CSV.</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* PESAN ERROR */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {csvData.length === 0 ? (
          <div className="space-y-6">
            {/* PANDUAN LANGKAH-LANGKAH */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Info size={18} className="text-blue-600" />
                Panduan Impor Data
              </h4>
              <ol className="relative border-l border-slate-300 ml-3 space-y-5">
                <li className="pl-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-slate-50 text-blue-600 font-bold text-xs">1</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Unduh Template</h5>
                  <p className="text-sm text-slate-500 mb-2 mt-1">Gunakan template resmi agar format kolom (NIM, Nama, Angkatan) sesuai dengan standar sistem.</p>
                  <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download size={16} /> Unduh Template CSV
                  </button>
                </li>
                <li className="pl-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full -left-3 ring-4 ring-slate-50 text-slate-600 font-bold text-xs">2</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Isi Data Mahasiswa</h5>
                  <p className="text-sm text-slate-500 mt-1">Buka file di Excel. Pada kolom <b>Angkatan</b>, Anda cukup mengetikkan namanya langsung (Contoh: "INFORMATIKA 5") Atau anda bisa sesuaikan dengan Nama <b>Angkatan</b> yang sudah di buat.
                   Sistem akan otomatis mendeteksinya.</p>
                </li>
                <li className="pl-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full -left-3 ring-4 ring-slate-50 text-slate-600 font-bold text-xs">3</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Unggah File</h5>
                  <p className="text-sm text-slate-500 mt-1">Pilih file CSV yang sudah diisi melalui kotak unggahan di bawah ini.</p>
                </li>
              </ol>
            </div>

            {/* AREA DROPZONE */}
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileSelect} className="hidden" />
            <div 
              onClick={() => fileInputRef.current.click()} 
              className="w-full py-10 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="p-3 bg-white border border-slate-200 rounded-full mb-3 group-hover:border-blue-200 group-hover:bg-blue-100 transition-colors">
                <UploadCloud size={28} className="text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">Klik untuk memilih file CSV</p>
              <p className="text-xs text-slate-500 mt-1">Maksimal ukuran file: 5MB</p>
            </div>
          </div>
        ) : (
          /* TAMPILAN PRATINJAU (PREVIEW) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Terpilih</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{fileName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Baris</p>
                <p className="font-bold text-blue-600 text-sm mt-0.5">{csvData.length} Data Valid</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 mb-3">Pratinjau Data (5 Baris Pertama)</p>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-auto">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">NIM</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Nama Lengkap</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Jurusan</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">ID Angkatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{row.nomor_induk}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{row.nama_lengkap}</td>
                        <td className="px-4 py-3 text-slate-600">{row.jurusan || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          {row.angkatan_id ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md text-xs">{row.angkatan_id}</span>
                          ) : (
                            <span className="bg-red-50 text-red-600 font-bold px-2 py-1 rounded-md text-xs">Kosong</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 5 && (
                <div className="px-4 py-3 text-center text-xs font-semibold text-slate-500 bg-slate-50 border-t border-slate-100">
                  Membaca {csvData.length - 5} baris data lainnya...
                </div>
              )}
            </div>

            {/* TOMBOL AKSI BAWAH */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button 
                onClick={resetFile} 
                className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm w-full sm:w-auto"
              >
                Pilih File Lain
              </button>
              <button 
                onClick={handleUploadSubmit} 
                disabled={isLoading} 
                className="flex-1 bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses Data...' : <><CheckCircle2 size={18} /> Konfirmasi & Simpan Data</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalUploadCSV;