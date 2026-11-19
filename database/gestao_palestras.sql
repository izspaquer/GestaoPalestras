USE gestao_palestras;

DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS palestras;
DROP TABLE IF EXISTS salas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

CREATE TABLE salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_sala VARCHAR(100) NOT NULL,
    capacidade_maxima INT NOT NULL,
    bloco VARCHAR(50) NOT NULL
);

CREATE TABLE palestras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo_palestra VARCHAR(150) NOT NULL,
    descricao TEXT,
    palestrante VARCHAR(100) NOT NULL,
    data_hora DATETIME NOT NULL,
    id_sala INT NOT NULL,
    usuario_id INT,
    FOREIGN KEY (id_sala) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    palestra_id INT NOT NULL,
    UNIQUE (usuario_id, palestra_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (palestra_id) REFERENCES palestras(id) ON DELETE CASCADE
);
