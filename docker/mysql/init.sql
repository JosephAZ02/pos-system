
CREATE
DATABASE IF NOT EXISTS `pos-system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE
`pos-system`;

GRANT ALL PRIVILEGES ON *.* TO
'admin'@'%' WITH GRANT OPTION;
FLUSH
PRIVILEGES;

CREATE TABLE IF NOT EXISTS `roles`
(
    `id`
    int
    NOT
    NULL
    AUTO_INCREMENT,
    `name`
    varchar
(
    50
) NOT NULL,
    `description` varchar
(
    255
) NULL,
    `isActive` tinyint NOT NULL DEFAULT 1,
    `createdAt` datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
),
    `updatedAt` datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
) ON UPDATE CURRENT_TIMESTAMP
(
    6
),
    UNIQUE INDEX `IDX_648e3f5447f725579d7d4ffdfb`
(
    `name`
),
    PRIMARY KEY
(
    `id`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE =utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions`
(
    `id`
    int
    NOT
    NULL
    AUTO_INCREMENT,
    `resource`
    varchar
(
    50
) NOT NULL,
    `action` varchar
(
    50
) NOT NULL,
    `name` varchar
(
    100
) NOT NULL,
    `description` varchar
(
    255
) NULL,
    `createdAt` datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
),
    UNIQUE INDEX `IDX_48ce552495d14eae9b187bb671`
(
    `name`
),
    UNIQUE INDEX `IDX_73ef93c7e8c6a92f64c22f4d18`
(
    `resource`,
    `action`
),
    PRIMARY KEY
(
    `id`
)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE =utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions`
(
    `id`
    int
    NOT
    NULL
    AUTO_INCREMENT,
    `roleId`
    int
    NOT
    NULL,
    `permissionId`
    int
    NOT
    NULL,
    `createdAt`
    datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
),
    UNIQUE INDEX `IDX_b4599f8b8f548d35850afa2d12`
(
    `roleId`,
    `permissionId`
),
    PRIMARY KEY
(
    `id`
),
    CONSTRAINT `FK_b4599f8b8f548d35850afa2d12_role` FOREIGN KEY
(
    `roleId`
) REFERENCES `roles`
(
    `id`
) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `FK_b4599f8b8f548d35850afa2d12_perm` FOREIGN KEY
(
    `permissionId`
) REFERENCES `permissions`
(
    `id`
) ON DELETE CASCADE ON UPDATE NO ACTION
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE =utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users`
(
    `id`
    int
    NOT
    NULL
    AUTO_INCREMENT,
    `name`
    varchar
(
    100
) NOT NULL,
    `email` varchar
(
    150
) NOT NULL,
    `password` varchar
(
    255
) NOT NULL,
    `isActive` tinyint NOT NULL DEFAULT 1,
    `roleId` int NOT NULL,
    `createdAt` datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
),
    `updatedAt` datetime
(
    6
) NOT NULL DEFAULT CURRENT_TIMESTAMP
(
    6
) ON UPDATE CURRENT_TIMESTAMP
(
    6
),
    UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be`
(
    `email`
),
    PRIMARY KEY
(
    `id`
),
    CONSTRAINT `FK_368e146b785b574f42ae9e53d5e` FOREIGN KEY
(
    `roleId`
) REFERENCES `roles`
(
    `id`
) ON DELETE NO ACTION ON UPDATE NO ACTION
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE =utf8mb4_unicode_ci;

INSERT INTO permissions (resource, action, name, description)
VALUES ('products', 'create', 'products.create', 'Crear productos'),
       ('products', 'read', 'products.read', 'Ver productos'),
       ('products', 'update', 'products.update', 'Editar productos'),
       ('products', 'delete', 'products.delete', 'Eliminar productos'),
       ('sales', 'create', 'sales.create', 'Registrar ventas'),
       ('sales', 'read', 'sales.read', 'Ver ventas'),
       ('users', 'manage', 'users.manage', 'Gestionar usuarios'),
       ('reports', 'read', 'reports.read', 'Ver reportes');

INSERT INTO roles (name, description)
VALUES ('admin', 'Acceso total'),
       ('cashier', 'Caja y ventas');

INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r,
     permissions p
WHERE r.name = 'admin';

INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r,
     permissions p
WHERE r.name = 'cashier'
  AND p.name IN ('products.read', 'sales.create', 'sales.read');

INSERT INTO users (name, email, password, isActive, roleId)
VALUES ('Administrador', 'admin@pos.com', '$2a$12$7rtvE76wvAnd55w7/V2LKuvfFkpJbAjjRaQYOcc2JhMneheVQ9012', 1,
        (SELECT id FROM roles WHERE name = 'admin'));
