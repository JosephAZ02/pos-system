export interface UserDto {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    accessToken: string;
    user: UserDto;
}