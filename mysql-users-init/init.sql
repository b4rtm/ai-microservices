USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(50)  NOT NULL,
    archived TINYINT(1)   NOT NULL DEFAULT 0
);

-- Passwords are BCrypt-hashed; plain-text value: .JVBvTxJmQe
INSERT INTO users (email, password, role) VALUES
('alice@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('bob@example.com',     '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('carol@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('dave@example.com',    '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('eve@example.com',     '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('frank@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('grace@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('henry@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('iris@example.com',    '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'USER'),
('admin@example.com',   '$2b$10$K8VhEMi/BJurHOPGDL//U.DNSTVgXF7qaGnZqkVqO1i6fL3BhRT5a', 'ADMIN');