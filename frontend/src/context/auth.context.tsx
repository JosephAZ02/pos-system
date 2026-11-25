import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as loginService } from '../services/auth/auth.service';
import type { UserDto, LoginRequestDto } from '@pos/shared';

interface AuthContextData {
    user: UserDto | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequestDto) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function loadStoredUser(): UserDto | null {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as UserDto;
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserDto | null>(loadStoredUser);

    const login = async (credentials: LoginRequestDto) => {
        const data = await loginService(credentials);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
