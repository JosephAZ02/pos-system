
import { api } from './api';

export const getRoles = async () => {
    const { data } = await api.get('/roles/get-all');
    return data;
};

export const getPermissions = async () => {
    const { data } = await api.get('/permissions/get-all');
    return data;
};

export const createRole = async (roleData: any) => {
    const { data } = await api.post('/roles/create', roleData);
    return data;
};

export const updateRole = async (id: number, roleData: any) => {
    const { data } = await api.put(`/roles/update/${id}`, roleData);
    return data;
};

export const deleteRole = async (id: number) => {
    const { data } = await api.delete(`/roles/delete/${id}`);
    return data;
};

export const assignPermissions = async (roleId: number, permissionIds: number[]) => {
    const { data } = await api.patch(`/roles/give-permissions/${roleId}`, {
        permissionIds
    });
    return data;
};
