import React from 'react';

const StatCard = ({ title, value, icon, color, aktif, cuti, tidakAktif }) => {
  return (
    <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${color}`}>
          {icon}
        </div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>

      {(aktif !== undefined || cuti !== undefined) && (
        <div className="flex flex-wrap gap-2 mt-5 text-[10px] font-bold">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Aktif: {aktif}
          </span>
          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Cuti: {cuti}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;