import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';


export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    // Si no está autenticado, manda al login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};