import React from 'react';
import useAuthStore from '../../store/useAuthStore';

const NavbarAdmin = ({ onToggleMenu }) => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white shadow-sm border-b border-slate-100 p-4 flex justify-between items-center w-full z-10 shrink-0 h-[72px]">
      <div className="flex items-center">
        {/* Tombol Hamburger: Khusus muncul di HP/Tablet */}
        <button 
          className="p-2 md:hidden text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl focus:outline-none mr-4 transition-colors"
          onClick={onToggleMenu}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Profil Admin di Kanan Atas */}
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800 leading-tight">{user?.nama || 'Admin Akademik'}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrator</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-black border border-blue-100 shadow-sm uppercase">
          {user?.nama ? user.nama.substring(0, 2) : 'AD'}
        </div>
      </div>
    </header>
  );
};

export default NavbarAdmin;