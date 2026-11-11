import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {Role} from '../../roles/entities/role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    name: string;

    @Column({unique: true, length: 150})
    email: string;

    @Column({select: false})
    password: string;

    @Column({default: true})
    isActive: boolean;

    @Column()
    roleId: number;

    @ManyToOne(() => Role, (role) => role.users, {eager: true})
    @JoinColumn({name: 'roleId'})
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}