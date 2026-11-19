CREATE DATABASE IF NOT EXISTS gestao_palestras;
USE gestao_palestras;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS palestras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    local VARCHAR(150) NOT NULL,
    usuario_id INT,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
