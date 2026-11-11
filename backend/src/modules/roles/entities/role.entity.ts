import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {RolePermission} from '../../auth/entities/role-permission.entity';
import {User} from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, length: 50})
    name: string;

    @Column({length: 255, nullable: true})
    description: string;

    @Column({default: true})
    isActive: boolean;

    @OneToMany(() => RolePermission, (rp) => rp.role)
    rolePermissions: RolePermission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}