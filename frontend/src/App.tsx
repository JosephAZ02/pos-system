import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/login-page';
import { ProtectedRoute } from './components/auth/protected-route';
import { DashboardPage } from './pages/other/dashboard-page';
import AppLayout from './components/templates/app-layout';
import { ProductsPage } from './pages/products/products-page';
import { SalesPage } from './pages/sales/sales-page';
import { ReportsPage } from './pages/reports/reports-page';
import { UsersRolesPage } from './pages/auth/users-roles-page';




export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />


                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/users-roles" element={<UsersRolesPage />} />
                    </Route>

                </Route>
            </Routes>
        </BrowserRouter>
    );
}