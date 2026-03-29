USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(50)  NOT NULL
);

INSERT INTO users (email, password, role) VALUES
('alice@example.com',   '.JVBvTxJmQe', 'USER'),
('bob@example.com',     '.JVBvTxJmQe', 'USER'),
('carol@example.com',   '.JVBvTxJmQe', 'USER'),
('dave@example.com',    '.JVBvTxJmQe', 'USER'),
('eve@example.com',     '.JVBvTxJmQe', 'USER'),
('frank@example.com',   '.JVBvTxJmQe', 'USER'),
('grace@example.com',   '.JVBvTxJmQe', 'USER'),
('henry@example.com',   '.JVBvTxJmQe', 'USER'),
('iris@example.com',    '.JVBvTxJmQe', 'USER'),
('admin@example.com',   '.JVBvTxJmQe', 'ADMIN');