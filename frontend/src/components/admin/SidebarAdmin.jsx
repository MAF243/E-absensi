import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, BookOpen, CalendarDays, ClipboardCheck, Settings, LogOut } from 'lucide-react';
import { clearSession } from '../../utils/session';

const SidebarAdmin = ({ activeMenu, setMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if(window.confirm("Apakah Anda yakin ingin keluar dari Dasbor Admin?")) {
      clearSession();
      localStorage.removeItem('lastMenu'); 
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { id: 'statistik', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'mahasiswa', name: 'Data Mahasiswa', icon: <Users size={20} /> },
    { id: 'dosen', name: 'Data Dosen', icon: <UserCog size={20} /> },
    { id: 'matkul', name: 'Mata Kuliah', icon: <BookOpen size={20} /> },
    { id: 'jadwal', name: 'Jadwal & Sesi', icon: <CalendarDays size={20} /> },
    { id: 'rekap', name: 'Rekap Absensi', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-blue-900 text-white shadow-xl">
      
      {/* Header Sidebar */}
      <div className="p-6 border-b border-blue-800 shrink-0">
        <h1 className="text-2xl font-black tracking-tight text-white">E-ABSENSI</h1>
        <p className="text-blue-300 text-xs font-medium mt-1">STIKOM Elrahma Bogor</p>
      </div>

      {/* Navigasi Menu Dinamis */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMenu(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm border-l-4 ${
              activeMenu === item.id 
              ? 'bg-blue-800 text-white shadow-md border-emerald-400' 
              : 'text-blue-200 hover:bg-blue-800 hover:text-white border-transparent'
            }`}
          >
            {item.icon} {item.name}
          </button>
        ))}

        <div className="my-2 border-t border-blue-800"></div>

        {/* Menu Pengaturan */}
        <button
          onClick={() => setMenu('pengaturan')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm border-l-4 ${
            activeMenu === 'pengaturan' 
            ? 'bg-blue-800 text-white shadow-md border-emerald-400' 
            : 'text-blue-200 hover:bg-blue-800 hover:text-white border-transparent'
          }`}
        >
          <Settings size={20} /> Pengaturan Akun
        </button>
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-blue-800 shrink-0">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm text-sm"
        >
          <LogOut size={20} /> Keluar
        </button>
      </div>
      
    </div>
  );
};

export default SidebarAdmin;
