import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, Users, BookOpen, CheckCircle2, AlertCircle, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const RekapAbsensi = () => {
  const [activeTab, setActiveTab] = useState('mahasiswa');
  const [angkatanList, setAngkatanList] = useState([]);
  
  // State Filter
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State Data
  const [dataMhs, setDataMhs] = useState([]);
  const [dataDosen, setDataDosen] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State Pagination Preview (Baru)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Maksimal 25 data per halaman

  const BASE_URL = 'http://localhost:5000';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/angkatan`).then(r => r.json()).then(res => { if(res.success) setAngkatanList(res.data); }).catch(()=>({}));
    // Set default date: 1 bulan terakhir
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const tarikData = async () => {
    setIsLoading(true);
    setCurrentPage(1); // Reset halaman ke 1 setiap kali menarik data baru
    
    try {
      if (activeTab === 'mahasiswa') {
        const queryParams = new URLSearchParams({
          angkatan_id: filterAngkatan, jurusan: filterJurusan, start_date: startDate, end_date: endDate
        }).toString();
        const res = await fetch(`${BASE_URL}/api/rekap/mahasiswa?${queryParams}`).then(r => r.json());
        
        if (res.success) { 
          if (res.data.length > 0) {
            setDataMhs(res.data); 
            showToast(`Ditemukan ${res.data.length} data mahasiswa!`, "success"); 
          } else {
            setDataMhs([]);
            showToast("Data Kosong! Tidak ada mahasiswa yang cocok dengan filter.", "error"); 
          }
        }
      } else {
        const queryParams = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
        const res = await fetch(`${BASE_URL}/api/rekap/dosen?${queryParams}`).then(r => r.json());
        
        if (res.success) { 
          if (res.data.length > 0) {
            setDataDosen(res.data); 
            showToast(`Ditemukan ${res.data.length} sesi perkuliahan!`, "success"); 
          } else {
            setDataDosen([]);
            showToast("Data Kosong! Belum ada sesi pada rentang tanggal ini.", "error");
          }
        }
      }
    } catch (err) {
      showToast("Gagal mengambil data dari server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // EXPORT EXCEL MAHASISWA
  // ===============================================
  const exportExcelMhs = async () => {
    if (dataMhs.length === 0) return showToast("Tidak ada data untuk diekspor", "error");
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Mahasiswa', { views: [{ showGridLines: false }] });

    let allMatkuls = [];
    dataMhs.forEach(m => {
      m.detail_matkul.forEach(mk => {
        if (!allMatkuls.includes(mk.nama_mk)) allMatkuls.push(mk.nama_mk);
      });
    });

    const selectedAngkatanName = angkatanList.find(a => String(a.id) === String(filterAngkatan))?.nama_angkatan || 'Semua Angkatan';
    const totalCols = 5 + allMatkuls.length + 5; 
    const endColLetter = sheet.getColumn(totalCols).letter;
    
    sheet.mergeCells(`A1:${endColLetter}1`);
    const titleCell = sheet.getCell('A1');
    titleCell.value = `REKAP ABSENSI MAHASISWA ${selectedAngkatanName.toUpperCase()} ${filterJurusan}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.addRow([]);

    const baseHeaders = ['NO', 'NIM', 'NAMA MAHASISWA', 'JLK', 'JUR'];
    const mkHeaders = allMatkuls.map(mk => `TM - ${mk}`);
    const endHeaders = ['H', 'I', 'S', 'A', 'AKM%'];
    const headers = [...baseHeaders, ...mkHeaders, ...endHeaders];

    const headerRow = sheet.addRow(headers);
    headerRow.height = 160; 

    headerRow.eachCell((cell, colNum) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }; 
      cell.font = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      
      if (colNum > 5 && colNum <= 5 + allMatkuls.length) {
        cell.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
      } else if (colNum > 5 + allMatkuls.length && colNum < totalCols) {
        cell.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' }; 
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    });

    sheet.getColumn(1).width = 5;  
    sheet.getColumn(2).width = 15; 
    sheet.getColumn(3).width = 35; 
    sheet.getColumn(4).width = 5;  
    sheet.getColumn(5).width = 8;  
    for(let i=0; i<allMatkuls.length; i++) sheet.getColumn(6+i).width = 6; 
    for(let i=0; i<endHeaders.length; i++) sheet.getColumn(6+allMatkuls.length+i).width = 6; 

    dataMhs.forEach((mhs, idx) => {
      const rowData = [
        idx + 1, 
        mhs.nomor_induk, 
        mhs.nama_lengkap, 
        (mhs.jenis_kelamin && mhs.jenis_kelamin.toLowerCase() === 'perempuan') ? 'P' : 'L', 
        mhs.jurusan || '-'
      ];
      
      allMatkuls.forEach(mkName => {
        const found = mhs.detail_matkul.find(d => d.nama_mk === mkName);
        rowData.push(found ? `${found.persen}%` : ''); 
      });
      
      rowData.push(mhs.total_h, mhs.total_i, mhs.total_s, mhs.total_a, `${mhs.akm}%`);

      const row = sheet.addRow(rowData);
      row.eachCell((cell, colNum) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: colNum === 3 ? 'left' : 'center' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Rekap_Mahasiswa_${startDate}_sd_${endDate}.xlsx`);
  };

  // ===============================================
  // EXPORT EXCEL DOSEN
  // ===============================================
  const exportExcelDosen = async () => {
    if (dataDosen.length === 0) return showToast("Tidak ada data untuk diekspor", "error");
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Dosen');

    sheet.mergeCells('A1:G1');
    const title = sheet.getCell('A1');
    title.value = `REKAPITULASI MENGAJAR DOSEN (${startDate} s/d ${endDate})`;
    title.font = { name: 'Arial', size: 14, bold: true };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.addRow([]);

    const headers = ['NO', 'NAMA DOSEN', 'MATA KULIAH', 'TANGGAL & WAKTU', 'JENIS SESI', 'AGENDA MATERI', 'JML MHS HADIR'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; 
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 25;
    sheet.getColumn(3).width = 30;
    sheet.getColumn(4).width = 20;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 45;
    sheet.getColumn(7).width = 15;

    dataDosen.forEach((d, idx) => {
      const rowData = [
        idx + 1, d.nama_dosen, `${d.kode_mk} - ${d.nama_mk}`, `${d.tanggal} (${d.jam_mulai}-${d.jam_selesai})`,
        d.jenis_sesi, d.agenda, d.total_hadir_mhs
      ];
      const row = sheet.addRow(rowData);
      row.eachCell((cell, colNum) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.alignment = { vertical: 'middle', horizontal: (colNum === 2 || colNum === 3 || colNum === 6) ? 'left' : 'center', wrapText: true };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Rekap_Dosen_${startDate}_sd_${endDate}.xlsx`);
  };

  // LOGIKA PAGINATION UNTUK PREVIEW
  const currentList = activeTab === 'mahasiswa' ? dataMhs : dataDosen;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentList.slice(startIndex, endIndex);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500 pb-10">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[9999] animate-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <span className="text-sm font-bold text-slate-800">{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md"><FileSpreadsheet size={24} /></div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Laporan & Rekap Absensi</h2>
            <p className="text-xs md:text-sm text-slate-500">Cetak rekapitulasi kehadiran dinamis sesuai permintaan atasan.</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border shadow-sm w-full md:w-fit">
          <button onClick={() => { setActiveTab('mahasiswa'); setDataMhs([]); setCurrentPage(1); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'mahasiswa' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><Users size={16}/> Rekap Mahasiswa</button>
          <button onClick={() => { setActiveTab('dosen'); setDataDosen([]); setCurrentPage(1); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'dosen' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}><BookOpen size={16}/> Rekap Dosen</button>
        </div>
      </div>

      {/* PANEL FILTER & KONTROL */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Filter size={18} className="text-indigo-600"/> Filter Laporan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {activeTab === 'mahasiswa' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Angkatan / Kelompok</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm font-semibold" value={filterAngkatan} onChange={e => setFilterAngkatan(e.target.value)}>
                  <option value="">-- Semua Kategori --</option>
                  {angkatanList.map(a => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ketik Jurusan (Opsional)</label>
                <input type="text" placeholder="Cth: ITK, SI, APQ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 text-sm font-semibold uppercase" value={filterJurusan} onChange={e => setFilterJurusan(e.target.value.toUpperCase())}/>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Mulai Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
              <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Sampai Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
              <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-slate-100">
          <button onClick={tarikData} disabled={isLoading} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 transition-colors disabled:opacity-70">
            {isLoading ? 'Memproses...' : 'Tarik Data Peninjauan'}
          </button>
          
          {activeTab === 'mahasiswa' && dataMhs.length > 0 && (
            <button onClick={exportExcelMhs} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 animate-in zoom-in-95">
              <Download size={16}/> Unduh Laporan Excel
            </button>
          )}

          {activeTab === 'dosen' && dataDosen.length > 0 && (
            <button onClick={exportExcelDosen} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 animate-in zoom-in-95">
              <Download size={16}/> Unduh Laporan Excel
            </button>
          )}
        </div>
      </div>

      {/* PREVIEW DATA (DENGAN PAGINATION) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 flex-1">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold text-sm">Menghitung akumulasi dan rentang waktu dinamis...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 flex-1">
            <FileSpreadsheet size={48} className="text-slate-200 mb-4"/>
            <p className="font-bold text-slate-600 text-lg">Pratinjau Laporan Kosong</p>
            <p className="text-sm">Silakan sesuaikan filter dan klik "Tarik Data Peninjauan".</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
             <div className="p-6 pb-0">
               <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center mb-4">
                  <div>
                     <h4 className="font-bold text-indigo-800">Tinjauan Singkat Berhasil Ditarik!</h4>
                     <p className="text-xs text-indigo-600 font-medium mt-0.5">Ditemukan total <b>{currentList.length} baris data</b>. Silakan klik tombol hijau "Unduh Laporan Excel" di atas untuk mendapatkan format laporan yang utuh dan presisi.</p>
                  </div>
                  <FileSpreadsheet size={32} className="text-indigo-200 hidden sm:block"/>
               </div>
             </div>

             <div className="overflow-x-auto w-full px-6">
                <table className="w-full text-left whitespace-nowrap text-sm border-x border-t border-slate-200 rounded-t-xl overflow-hidden">
                   <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                     {activeTab === 'mahasiswa' ? (
                       <tr>
                         <th className="px-4 py-3 border-r border-slate-200 w-12 text-center">No</th>
                         <th className="px-4 py-3">NIM</th>
                         <th className="px-4 py-3">NAMA MAHASISWA</th>
                         <th className="px-4 py-3 text-center">JURUSAN</th>
                         <th className="px-4 py-3 text-center text-indigo-600">AKM%</th>
                       </tr>
                     ) : (
                       <tr>
                         <th className="px-4 py-3 border-r border-slate-200 w-12 text-center">No</th>
                         <th className="px-4 py-3">NAMA DOSEN</th>
                         <th className="px-4 py-3">MATA KULIAH</th>
                         <th className="px-4 py-3 text-center">TANGGAL</th>
                         <th className="px-4 py-3">AGENDA MATERI</th>
                       </tr>
                     )}
                   </thead>
                   <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {paginatedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                           <td className="px-4 py-3 text-center border-r border-slate-100">{startIndex + idx + 1}</td>
                           {activeTab === 'mahasiswa' ? (
                             <>
                               <td className="px-4 py-3">{item.nomor_induk}</td>
                               <td className="px-4 py-3 font-bold text-slate-800">{item.nama_lengkap}</td>
                               <td className="px-4 py-3 text-center">{item.jurusan || '-'}</td>
                               <td className="px-4 py-3 text-center font-black text-indigo-600">{item.akm}%</td>
                             </>
                           ) : (
                             <>
                               <td className="px-4 py-3 font-bold text-slate-800">{item.nama_dosen}</td>
                               <td className="px-4 py-3">{item.nama_mk}</td>
                               <td className="px-4 py-3 text-center">{item.tanggal}</td>
                               <td className="px-4 py-3 truncate max-w-[200px]" title={item.agenda}>{item.agenda}</td>
                             </>
                           )}
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* KONTROL PAGINATION */}
             <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-slate-200 gap-3 bg-white rounded-b-3xl mt-auto">
                <div className="text-xs font-semibold text-slate-500">
                  Melihat baris <span className="text-slate-800 font-bold">{startIndex + 1} - {Math.min(endIndex, currentList.length)}</span> dari total <span className="text-slate-800 font-bold">{currentList.length}</span> data
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                    Hal {currentPage} / {totalPages || 1}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RekapAbsensi;