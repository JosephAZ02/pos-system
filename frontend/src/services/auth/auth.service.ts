import { api } from './api';
import type { LoginResponseDto, LoginRequestDto } from '@pos/shared';

export const login = async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {

    const { data } = await api.post<LoginResponseDto>('/auth/login', credentials);
    
    return data;
};