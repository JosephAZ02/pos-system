import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {RolePermission} from '../../auth/entities/role-permission.entity';

@Entity('permissions')
@Unique(['resource', 'action'])
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    resource: string;

    @Column({length: 50})
    action: string;

    @Column({unique: true, length: 100})
    name: string;

    @Column({length: 255, nullable: true})
    description: string;

    @OneToMany(() => RolePermission, (rp) => rp.permission)
    rolePermissions: RolePermission[];

    @CreateDateColumn()
    createdAt: Date;
}