import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, Users, BookOpen, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';
import DataTable from '../../components/common/DataTable';

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

  const { showToast } = useUiStore();

  useEffect(() => {
    axiosClient.get(`/angkatan`).then(r => r.data).then(res => { if(res.success) setAngkatanList(res.data); }).catch(()=>({}));
    // Set default date: 1 bulan terakhir
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const tarikData = async () => {
    setIsLoading(true);
    
    try {
      if (activeTab === 'mahasiswa') {
        const queryParams = new URLSearchParams({
          angkatan_id: filterAngkatan, jurusan: filterJurusan, start_date: startDate, end_date: endDate
        }).toString();
        const res = await axiosClient.get(`/rekap/mahasiswa?${queryParams}`).then(r => r.data);
        
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
        const res = await axiosClient.get(`/rekap/dosen?${queryParams}`).then(r => r.data);
        
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

  const currentList = activeTab === 'mahasiswa' ? dataMhs : dataDosen;
  const currentListWithIndex = currentList.map((item, index) => ({ ...item, absolute_index: index + 1 }));

  const columnsMhs = [
    { header: 'No', accessor: 'absolute_index', className: 'text-center', tdClassName: 'text-center text-slate-400 font-bold w-12 border-r border-slate-100/60' },
    { header: 'NIM', accessor: 'nomor_induk', tdClassName: 'font-black tracking-widest text-slate-500 text-xs' },
    { header: 'Nama Mahasiswa', accessor: 'nama_lengkap', tdClassName: 'font-bold text-slate-800' },
    { header: 'Jurusan', accessor: 'jurusan', className: 'text-center', tdClassName: 'text-center font-black uppercase tracking-widest text-blue-600', render: (row) => row.jurusan || '-' },
    { header: 'AKM%', accessor: 'akm', className: 'text-center text-blue-600', tdClassName: 'text-center font-black text-blue-600', render: (row) => `${row.akm}%` }
  ];

  const columnsDosen = [
    { header: 'No', accessor: 'absolute_index', className: 'text-center', tdClassName: 'text-center text-slate-400 font-bold w-12 border-r border-slate-100/60' },
    { header: 'Nama Dosen', accessor: 'nama_dosen', tdClassName: 'font-bold text-slate-800' },
    { header: 'Mata Kuliah', accessor: 'nama_mk', tdClassName: 'font-bold text-slate-600' },
    { header: 'Tanggal', accessor: 'tanggal', className: 'text-center', tdClassName: 'text-center font-black tracking-widest text-slate-500 text-[11px] md:text-xs' },
    { header: 'Agenda Materi', accessor: 'agenda', tdClassName: 'truncate max-w-[200px] text-slate-600' }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen font-sans animate-in fade-in duration-500 relative pb-10">
      
      {/* HEADER */}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm shrink-0">
            <FileSpreadsheet size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Laporan & Rekap Absensi</h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Cetak rekapitulasi kehadiran dinamis.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto shrink-0 shadow-inner">
          <button onClick={() => { setActiveTab('mahasiswa'); setDataMhs([]); }} className={`flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-xs md:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${activeTab === 'mahasiswa' ? 'bg-white text-blue-700 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Users size={18} strokeWidth={2.5}/> Rekap Mahasiswa
          </button>
          <button onClick={() => { setActiveTab('dosen'); setDataDosen([]); }} className={`flex-1 md:flex-none px-6 py-2.5 rounded-[12px] text-xs md:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${activeTab === 'dosen' ? 'bg-white text-blue-700 shadow-sm shadow-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <BookOpen size={18} strokeWidth={2.5}/> Rekap Dosen
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Filter size={20} strokeWidth={2.5}/></div>
          Parameter Laporan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {activeTab === 'mahasiswa' && (
            <>
              <div className="animate-in fade-in">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Angkatan / Kelompok</label>
                <select className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer appearance-none" value={filterAngkatan} onChange={e => setFilterAngkatan(e.target.value)}>
                  <option value="">-- Semua Kategori --</option>
                  {angkatanList.map(a => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}
                </select>
              </div>
              <div className="animate-in fade-in">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ketik Jurusan (Opsional)</label>
                <input type="text" placeholder="Cth: ITK, SI, APQ..." className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-black tracking-widest text-slate-700 uppercase transition-all placeholder:font-medium placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400" value={filterJurusan} onChange={e => setFilterJurusan(e.target.value.toUpperCase())}/>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Mulai Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} strokeWidth={2.5}/>
              <input type="date" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Sampai Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} strokeWidth={2.5}/>
              <input type="date" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100/60 mt-4">
          <button onClick={tarikData} disabled={isLoading} className="px-8 py-3.5 bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-800/20 active:scale-95 hover:bg-slate-900 transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2.5">
            {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses...</span> : 'Tarik Data Peninjauan'}
          </button>
        </div>
      </div>

      {/* HASIL DATA (DATATABLE) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        <DataTable
          data={currentListWithIndex}
          columns={activeTab === 'mahasiswa' ? columnsMhs : columnsDosen}
          isLoading={isLoading}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 animate-in zoom-in-95 duration-500">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <FileSpreadsheet size={48} strokeWidth={1.5} className="text-slate-300"/>
              </div>
              <p className="font-black text-slate-800 text-xl tracking-tight mb-2">Pratinjau Laporan Kosong</p>
              <p className="text-sm font-medium text-slate-500 text-center max-w-sm">Silakan sesuaikan parameter laporan di atas lalu klik tombol <b>Tarik Data</b>.</p>
            </div>
          }
          headerContent={
            currentList.length > 0 ? (
              <div className="flex flex-col xl:flex-row justify-between items-center w-full gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-1 w-full justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-black text-emerald-800 tracking-tight text-base md:text-lg mb-1">Data Tinjauan Siap!</h4>
                    <p className="text-[11px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Ditemukan <b>{currentList.length} Baris Data</b>. Klik unduh untuk laporan utuh.</p>
                  </div>
                  <div className="p-3 bg-white rounded-full hidden sm:block shadow-sm">
                    <CheckCircle2 size={32} strokeWidth={2.5} className="text-emerald-500"/>
                  </div>
                </div>
                
                {activeTab === 'mahasiswa' && dataMhs.length > 0 && (
                  <button onClick={exportExcelMhs} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 shrink-0 w-full xl:w-auto">
                    <Download size={18} strokeWidth={2.5}/> Unduh Excel Mahasiswa
                  </button>
                )}

                {activeTab === 'dosen' && dataDosen.length > 0 && (
                  <button onClick={exportExcelDosen} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 shrink-0 w-full xl:w-auto">
                    <Download size={18} strokeWidth={2.5}/> Unduh Excel Dosen
                  </button>
                )}
              </div>
            ) : null
          }
        />
      </div>

    </div>
  );
};

export default RekapAbsensi;