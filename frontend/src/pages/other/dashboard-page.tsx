import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import { showError } from '../../components/utils/alerts';

export const DashboardPage = () => {

    const [loading, setLoading] = useState(false);

    const { logout } = useAuth();
    const navigate = useNavigate();

    
    return (
        <div className="flex h-screen items-center justify-center">


            <h1>Bienvenido al panel de control del sistema de ventas!</h1>
        </div>
    );
};