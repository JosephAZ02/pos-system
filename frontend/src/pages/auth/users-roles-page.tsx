
import { useEffect, useState } from 'react';

import { getUsers, createUser, updateUser, deleteUser } from '../../services/auth/users.service';
import {
    getRoles,
    getPermissions,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions
} from '../../services/auth/roles.service';
import './users-roles-page.css';
import { showConfirm, showError, showSuccess } from '../../components/utils/alerts';

export const UsersRolesPage = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);

    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingRole, setEditingRole] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        roleId: ''
    });

    const [roleForm, setRoleForm] = useState({
        name: '',
        description: ''
    });

    // CARGAR DATOS

    const loadData = async () => {
        try {
            const [usersData, rolesData, permsData] = await Promise.all([
                getUsers(),
                getRoles(),
                getPermissions()
            ]);

            setUsers(usersData);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch (error) {
            showError(error, 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // USUARIOS

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingUser) {

                const updateData: any = {
                    name: userForm.name,
                    email: userForm.email,
                    roleId: Number(userForm.roleId)
                };


                if (userForm.password.trim() !== '') {
                    updateData.password = userForm.password;
                }

                await updateUser(editingUser.id, updateData);
                showSuccess('Usuario actualizado', 'El usuario se actualizó correctamente.');
            } else {

                await createUser({
                    name: userForm.name,
                    email: userForm.email,
                    password: userForm.password,
                    roleId: Number(userForm.roleId)
                });
                showSuccess('Usuario creado', 'El usuario se creó correctamente.');
            }

            setUserForm({ name: '', email: '', password: '', roleId: '' });
            setEditingUser(null);
            await loadData();
        } catch (error) {
            showError(error, 'No se pudo guardar el usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);

        setUserForm({
            name: user.name || '',
            email: user.email || '',
            password: '',
            roleId: String(user.role?.id || user.roleId || '')
        });
    };

    const handleDeleteUser = async (id: number) => {
        const confirmed = await showConfirm(
            'Eliminar usuario',
            '¿Deseas eliminar este usuario?',
            'Eliminar'
        );

        if (!confirmed) return;

        try {
            await deleteUser(id);
            showSuccess('Usuario eliminado', 'El usuario se eliminó correctamente.');
            await loadData();
        } catch (error) {
            showError(error, 'No se pudo eliminar el usuario');
        }
    };

    const cancelUserEdit = () => {
        setEditingUser(null);
        setUserForm({ name: '', email: '', password: '', roleId: '' });
    };

    // ROLES

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingRole) {
                await updateRole(editingRole.id, roleForm);
                showSuccess('Rol actualizado', 'El rol se actualizó correctamente.');
            } else {
                await createRole(roleForm);
                showSuccess('Rol creado', 'El rol se creó correctamente.');
            }

            setRoleForm({ name: '', description: '' });
            setEditingRole(null);
            await loadData();
        } catch (error) {
            showError(error, 'No se pudo guardar el rol');
        } finally {
            setSaving(false);
        }
    };

    const handleEditRole = (role: any) => {
        setEditingRole(role);
        setRoleForm({
            name: role.name || '',
            description: role.description || ''
        });
    };

    const handleDeleteRole = async (id: number) => {
        const confirmed = await showConfirm(
            'Eliminar rol',
            '¿Deseas eliminar este rol?',
            'Eliminar'
        );

        if (!confirmed) return;

        try {
            await deleteRole(id);

            showSuccess('Rol eliminado', 'El rol se eliminó correctamente.');

            if (selectedRole?.id === id) {
                setSelectedRole(null);
                setSelectedPermissions([]);
            }

            setEditingRole(null);
            setRoleForm({ name: '', description: '' });

            await loadData();
        } catch (error) {
            showError(error, 'No se pudo eliminar el rol');
        }
    };

    const cancelRoleEdit = () => {
        setEditingRole(null);
        setRoleForm({ name: '', description: '' });
    };

    const handleSelectRole = (role: any) => {
        setSelectedRole(role);
        setSelectedPermissions(
            role.rolePermissions?.map((rp: any) => rp.permissionId) || []
        );
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id)
                ? prev.filter((p) => p !== id)
                : [...prev, id]
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        setSaving(true);

        try {
            await assignPermissions(selectedRole.id, selectedPermissions);

            showSuccess('Permisos actualizados', 'Los permisos se guardaron correctamente.');

            await loadData();

            const updatedRole = roles.find((r) => r.id === selectedRole.id);

            if (updatedRole) {
                setSelectedRole({
                    ...updatedRole,
                    rolePermissions: selectedPermissions.map((id) => ({
                        permissionId: id
                    }))
                });
            }
        } catch (error) {
            showError(error, 'No se pudieron guardar los permisos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-muted mt-4">Cargando datos...</p>;
    }

    return (
        <div>
            <small className="text-pos fw-semibold text-uppercase">
                Administración
            </small>

            <h2 className="mb-4">Usuarios y Roles</h2>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'users' ? 'active fw-bold text-pos' : 'text-secondary'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                </li>

                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'roles' ? 'active fw-bold text-pos' : 'text-secondary'}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Roles y Permisos
                    </button>
                </li>
            </ul>



            {activeTab === 'users' && (
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Correo</th>
                                                <th>Rol</th>

                                                <th>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`badge ${user.role?.name?.toLowerCase() === 'admin' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {user.role?.name || 'Sin rol'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-muted py-4">
                                                        No hay usuarios registrados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 bg-body-tertiary">
                            <div className="card-body">
                                <h5 className="mb-3">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h5>

                                <form onSubmit={handleUserSubmit}>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Nombre"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            name: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        type="email"
                                        className="form-control mb-2"
                                        placeholder="Correo"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            email: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        type="password"
                                        className="form-control mb-2"
                                        placeholder={editingUser ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                                        value={userForm.password}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            password: e.target.value
                                        })}
                                        required={!editingUser}
                                    />

                                    <select
                                        className="form-select mb-3"
                                        value={userForm.roleId}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            roleId: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Seleccione un rol...</option>

                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        className="btn btn-pos w-100"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'Guardando...'
                                            : editingUser
                                                ? 'Actualizar Usuario'
                                                : 'Crear Usuario'}
                                    </button>

                                    {editingUser && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-100 mt-2"
                                            onClick={cancelUserEdit}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ROLES */}

            {activeTab === 'roles' && (
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body">
                                <h5 className="mb-3">
                                    {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                                </h5>

                                <form onSubmit={handleRoleSubmit}>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Nombre del rol"
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({
                                            ...roleForm,
                                            name: e.target.value
                                        })}
                                        required
                                    />

                                    <textarea
                                        className="form-control mb-3"
                                        placeholder="Descripción"
                                        rows={3}
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({
                                            ...roleForm,
                                            description: e.target.value
                                        })}
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-pos w-100"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'Guardando...'
                                            : editingRole
                                                ? 'Actualizar Rol'
                                                : 'Crear Rol'}
                                    </button>

                                    {editingRole && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-100 mt-2"
                                            onClick={cancelRoleEdit}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="list-group shadow-sm">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`list-group-item ${selectedRole?.id === role.id ? 'border-pos' : ''}`}
                                >
                                    <button
                                        className="btn btn-link text-decoration-none text-start p-0 w-100"
                                        onClick={() => handleSelectRole(role)}
                                    >
                                        <strong>{role.name}</strong>

                                        <small className="d-block text-muted">
                                            {role.description || 'Sin descripción'}
                                        </small>

                                        <small className="text-muted">
                                            {role.rolePermissions?.length || 0} permisos
                                        </small>
                                    </button>

                                    <div className="mt-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEditRole(role)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteRole(role.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-8">
                        {selectedRole ? (
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <h5 className="mb-4">
                                        Permisos: <span className="text-pos">{selectedRole.name}</span>
                                    </h5>

                                    <div className="row g-3">
                                        {permissions.map((permission) => (
                                            <div className="col-sm-6" key={permission.id}>
                                                <div className="form-check border rounded p-3 ps-5">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`perm-${permission.id}`}
                                                        checked={selectedPermissions.includes(permission.id)}
                                                        onChange={() => togglePermission(permission.id)}
                                                    />

                                                    <label
                                                        className="form-check-label"
                                                        htmlFor={`perm-${permission.id}`}
                                                    >
                                                        <strong className="d-block">
                                                            {permission.name}
                                                        </strong>

                                                        <small className="text-muted">
                                                            {permission.description}
                                                        </small>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-pos mt-4"
                                        onClick={handleSavePermissions}
                                        disabled={saving}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Permisos'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded p-5 text-center text-muted">
                                Selecciona un rol para gestionar sus permisos.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
