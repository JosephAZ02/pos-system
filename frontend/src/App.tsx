import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/login-page';
import { ProtectedRoute } from './components/auth/protected-route';
import { DashboardPage } from './pages/other/dashboard-page';
import AppLayout from './components/templates/app-layout';
import { ProductsPage } from './pages/products/products-page';
import { PosRegisterPage } from './pages/pos/PosRegisterPage';
import { ReportsPage } from './pages/reports/reports-page';
import { UsersRolesPage } from './pages/auth/users-roles-page';
import { PermissionRoute } from './components/auth/permission-route';




export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />


                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>.

                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route element={<PermissionRoute requiredPermission="sales.create" />}>

                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/sales" element={<PosRegisterPage />} />
                            <Route path="/reports" element={<ReportsPage />} />



                        </Route>

                        <Route element={<PermissionRoute requiredPermission="users.manage" />}>
                            <Route path="/users-roles" element={<UsersRolesPage />} />
                        </Route>

                        
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}