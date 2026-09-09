import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, BookOpen, CalendarDays, ClipboardCheck, Settings, LogOut, ChevronDown, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUiStore from '../../store/useUiStore';

const SidebarAdmin = ({ activeMenu, setMenu }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const showConfirm = useUiStore((state) => state.showConfirm);
  const [openGroups, setOpenGroups] = useState({ master: true, operasional: true, sistem: true });

  useEffect(() => {
    if (['mahasiswa', 'dosen'].includes(activeMenu)) setOpenGroups((groups) => ({ ...groups, master: true }));
    if (['matkul', 'jadwal'].includes(activeMenu)) setOpenGroups((groups) => ({ ...groups, operasional: true }));
    if (['rekap', 'aktivitas', 'pengaturan'].includes(activeMenu)) setOpenGroups((groups) => ({ ...groups, sistem: true }));
  }, [activeMenu]);

  const handleLogout = async () => {
    const isConfirmed = await showConfirm({
      title: 'Keluar dari Dasbor',
      message: 'Apakah Anda yakin ingin keluar dari Dasbor Admin?',
      confirmText: 'Ya, Keluar',
      type: 'danger'
    });

    if (isConfirmed) {
      logout();
      localStorage.removeItem('lastMenu'); 
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { id: 'statistik', name: 'Dashboard', icon: <LayoutDashboard size={20} /> }
  ];
  const groups = [
    { id: 'master', title: 'Master Data', items: [{ id: 'mahasiswa', name: 'Data Mahasiswa', icon: <Users size={20} /> }, { id: 'dosen', name: 'Data Dosen', icon: <UserCog size={20} /> }] },
    { id: 'operasional', title: 'Operasional Akademik', items: [{ id: 'matkul', name: 'Mata Kuliah', icon: <BookOpen size={20} /> }, { id: 'jadwal', name: 'Jadwal & Sesi', icon: <CalendarDays size={20} /> }] },
    { id: 'sistem', title: 'Laporan & Sistem', items: [{ id: 'rekap', name: 'Rekap Absensi', icon: <ClipboardCheck size={20} /> }, { id: 'aktivitas', name: 'Aktivitas Sistem', icon: <Activity size={20} /> }, { id: 'pengaturan', name: 'Pengaturan Akun', icon: <Settings size={20} /> }] }
  ];

  const renderMenuItem = (item) => (
    <button key={item.id} onClick={() => setMenu(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm border-l-4 ${activeMenu === item.id ? 'bg-blue-800 text-white shadow-lg border-white translate-x-1' : 'text-blue-200 hover:bg-blue-800 hover:text-white border-transparent hover:translate-x-1'}`}>
      {item.icon} {item.name}
    </button>
  );

  return (
    <div className="flex flex-col w-full h-full bg-blue-900 text-white shadow-2xl border-r border-blue-800">
      
      {/* Header Sidebar */}
      <div className="p-6 border-b border-blue-800 shrink-0">
        <h1 className="text-2xl font-black tracking-tight text-white">E-ABSENSI</h1>
        <p className="text-blue-300 text-[10px] uppercase font-bold tracking-wider mt-1">STIKOM Elrahma Bogor</p>
      </div>

      {/* Navigasi Menu Dinamis */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-4 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
        {groups.map((group) => <div key={group.id} className="mt-2"><button onClick={() => setOpenGroups((groups) => ({ ...groups, [group.id]: !groups[group.id] }))} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-300 hover:text-white"><span>{group.title}</span><ChevronDown size={15} className={`transition-transform ${openGroups[group.id] ? 'rotate-180' : ''}`} /></button>{openGroups[group.id] && <div className="space-y-1">{group.items.map(renderMenuItem)}</div>}</div>)}
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-blue-800 shrink-0">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-xl font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all text-sm"
        >
          <LogOut size={20} /> Keluar
        </button>
      </div>
      
    </div>
  );
};

export default SidebarAdmin;
