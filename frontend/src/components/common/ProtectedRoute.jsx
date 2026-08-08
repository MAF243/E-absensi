import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    // Jika tidak ada sesi, lempar ke login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Jika role tidak sesuai, lempar ke dasbor masing-masing
    if (user.role === 'admin') return <Navigate to="/dashboard-admin" replace />;
    if (user.role === 'dosen') return <Navigate to="/dashboard-dosen" replace />;
    return <Navigate to="/dashboard-mahasiswa" replace />;
  }

  return children;
};

export default ProtectedRoute;
