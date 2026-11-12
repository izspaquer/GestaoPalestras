const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "ifsp",
    database: "gestao_palestras",
    port: 3306
});

conexao.connect((erro) => {
    if (erro) {
        console.error("Erro ao conectar ao banco de dados:", erro);
        return;
    }

    console.log("Conectado ao banco de dados MySQL!");
});

module.exports = conexao;