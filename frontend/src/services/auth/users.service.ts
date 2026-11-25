
import type { UserDto } from '@pos/shared';
import { api } from './api';

export const getUsers = async (): Promise<UserDto[]> => {
    const { data } = await api.get('/users/get-all');
    return data;
};

export const createUser = async (userData: any) => {
    const { data } = await api.post('/users/create', userData);
    return data;
};

export const updateUser = async (id: number, userData: any) => {
    const { data } = await api.put(`/users/update/${id}`, userData);
    return data;
};

export const deleteUser = async (id: number) => {
    const { data } = await api.delete(`/users/delete/${id}`);
    return data;
};
