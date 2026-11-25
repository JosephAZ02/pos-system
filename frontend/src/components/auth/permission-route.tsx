import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';

interface Props {
    requiredPermission: string;
}

export const PermissionRoute = ({ requiredPermission }: Props) => {
    const { user, isAuthenticated } = useAuth();

    // 1. Si no está logueado, al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si está logueado pero no tiene el permiso, lo mandamos a una página de "No autorizado" o al dashboard
    if (!user?.permissions?.includes(requiredPermission)) {
        // Puedes crear una vista 403 o simplemente redirigir al inicio
        return <Navigate to="/dashboard" replace />; 
    }

    // 3. Si tiene el permiso, lo dejamos pasar
    return <Outlet />;
};