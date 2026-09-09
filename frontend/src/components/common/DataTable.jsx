import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  data = [],
  columns = [],
  headerContent = null,
  selectedIds = null,
  onSelectionChange = null,
  keyField = 'id',
  emptyMessage = 'Tidak ada data yang dapat ditampilkan.',
  isLoading = false,
  containerClassName = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page to 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, itemsPerPage]);

  const totalItems = data.length;
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'All' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'All' ? totalItems : startIndex + itemsPerPage;
  
  const paginatedData = data.slice(startIndex, endIndex);

  // Checkbox Handlers
  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map(item => item[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id) => {
    if (!onSelectionChange || !selectedIds) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(item => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden w-full ${containerClassName}`}>
      
      {/* Header Slot (Filter, Search, dll) */}
      {headerContent && (
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          {headerContent}
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {onSelectionChange && (
                <th className="px-4 md:px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 focus:ring-blue-500" 
                    onChange={handleSelectAll} 
                    checked={paginatedData.length > 0 && selectedIds?.length === paginatedData.length} 
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 md:px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="p-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <span className="text-sm font-medium">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={row[keyField] || rowIndex} 
                  className={`transition-colors hover:bg-slate-50/80 ${selectedIds?.includes(row[keyField]) ? 'bg-blue-50/40' : 'bg-white'}`}
                >
                  {onSelectionChange && (
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 focus:ring-blue-500" 
                        checked={selectedIds?.includes(row[keyField])} 
                        onChange={() => handleSelectOne(row[keyField])} 
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-4 md:px-6 py-3 md:py-4 ${col.tdClassName || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="p-12 text-center text-slate-500 font-medium text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-6 py-4 border-t border-slate-100 gap-3 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          Tampil 
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer font-bold" 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="All">Semua</option>
          </select>
        </div>
        
        <div className="text-sm font-medium text-slate-500">
          Melihat <span className="font-bold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)}</span> dari <span className="font-bold text-slate-700">{totalItems}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1 || itemsPerPage === 'All'} 
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages || totalPages === 0 || itemsPerPage === 'All'} 
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default DataTable;
