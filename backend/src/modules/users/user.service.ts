import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async create(dto: CreateUserDto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) throw new ConflictException('El correo ya está registrado');

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
        });

        const saved = await this.userRepo.save(user);

        // separa la contraseña del resto de los datos para no devolverla en la respuesta y que sea seguro
        const { password, ...userWithoutPassword } = saved;

        return userWithoutPassword;
    }

    findAll() {
        // El eager:true en la entidad User ya trae el rol automáticamente
        return this.userRepo.find();
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.findOne(id);

        // Si se está actualizando la contraseña, se encripta de nuevo
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        Object.assign(user, dto);

        const saved = await this.userRepo.save(user);

        // separa la contraseña del resto de los datos para no devolverla en la respuesta y que sea seguro
        const { password, ...userWithoutPassword } = saved;

        return userWithoutPassword;
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        await this.userRepo.remove(user);
        return { message: 'Usuario eliminado' };
    }
}