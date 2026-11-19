const bcrypt = require('bcrypt');
const connection = require('./database/conexao');

const nome = 'Administrador';
const email = 'admin@email.com';
const senha = 'Admin@123';
const tipo = 'admin';

bcrypt.hash(senha, 10, (erro, hash) => {
    if (erro) {
        console.log('Erro ao criptografar senha:', erro);
        connection.end();
        return;
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha, tipo)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [nome, email, hash, tipo], (erro) => {
        if (erro) {
            console.log('Erro ao cadastrar administrador:', erro);
        } else {
            console.log('Administrador cadastrado com sucesso!');
        }

        connection.end();
    });
});