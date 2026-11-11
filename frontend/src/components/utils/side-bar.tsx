import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import './side-bar.css';

function SideBar() {
    const { logout } = useAuth();

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h4>POS System</h4>
            </div>

            <div className="sidebar-menu">


                <NavLink to="/dashboard" className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }>
                    <i className="bi bi-speedometer2"></i>
                    Panel de Control
                </NavLink>

                <NavLink to="/products" className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }>
                    <i className="bi bi-box-seam"></i>
                    Productos
                </NavLink>

                <NavLink to="/sales" className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }>
                    <i className="bi bi-cart3"></i>
                    Ventas
                </NavLink>

                <NavLink to="/reports" className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }>
                    <i className="bi bi-graph-up"></i>
                    Reportes
                </NavLink>

                <NavLink to="/users-roles" className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }>
                    <i className="bi bi-person"></i>
                    Usuarios y Roles
                </NavLink>
            </div>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-button">
                    <i className="bi bi-box-arrow-left"></i>
                    Cerrar sesión
                </button>
            </div>

        </aside>
    );
}

export default SideBar;