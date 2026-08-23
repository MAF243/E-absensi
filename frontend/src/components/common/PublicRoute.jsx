import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const PublicRoute = ({ children }) => {
  const { user, token } = useAuthStore();

  if (token && user) {
    // Jika sudah login, jangan izinkan akses ke halaman login, kembalikan ke dasbor
    if (user.role === 'admin') return <Navigate to="/dashboard-admin" replace />;
    if (user.role === 'dosen') return <Navigate to="/dashboard-dosen" replace />;
    return <Navigate to="/dashboard-mahasiswa" replace />;
  }

  return children;
};

export default PublicRoute;
