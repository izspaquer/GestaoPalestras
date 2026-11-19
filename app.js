const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const connection = require('./database/conexao');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'gestao-palestras-chave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/palestras', (req, res) => {

    const usuarioId = req.session.usuario
        ? req.session.usuario.id
        : null;

    const sql = `
        SELECT
            palestras.*,
            salas.nome_sala,
            DATE_FORMAT(palestras.data_hora, '%d/%m/%Y') AS data_formatada,
            TIME_FORMAT(palestras.data_hora, '%H:%i') AS horario_formatado,
            (favoritos.id IS NOT NULL) AS favorita
        FROM palestras
        INNER JOIN salas ON palestras.id_sala = salas.id
        LEFT JOIN favoritos
            ON favoritos.palestra_id = palestras.id
            AND favoritos.usuario_id = ?
        ORDER BY palestras.data_hora
    `;

    connection.query(sql, [usuarioId], (erro, resultado) => {

        if (erro) {
            console.log(erro);
            return res.send('Erro ao buscar palestras.');
        }

        res.render('palestras', {
            palestras: resultado,
            usuario: req.session.usuario
        });

    });

});

app.get('/login', (req, res) => {
    res.render('login', {
        erro: null,
        cadastroSucesso: req.query.cadastro === 'sucesso'
    });
});

app.post('/login', (req, res) => {

    const { email, senha } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    connection.query(sql, [email], async (erro, resultado) => {

        if (erro) {
            console.log(erro);
            return res.send('Erro ao realizar login.');
        }

        if (resultado.length === 0) {
            return res.render('login', {
                erro: 'Email ou senha incorretos!',
                cadastroSucesso: false
            });
        }

        const usuario = resultado[0];

        try {
            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.render('login', {
                    erro: 'Email ou senha incorretos!',
                    cadastroSucesso: false
                });
            }

            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            };

            if (usuario.tipo === 'admin') {
                return res.redirect('/admin');
            }

            res.redirect('/palestras');

        } catch (erro) {
            console.log(erro);
            res.send('Erro ao verificar a senha.');
        }
    });
});

function verificarAdmin(req, res, next) {

    if (req.session.usuario && req.session.usuario.tipo === 'admin') {
        return next();
    }

    res.redirect('/login');
}

app.get('/admin', verificarAdmin, (req, res) => {

    const sqlSalas = 'SELECT * FROM salas';

    connection.query(sqlSalas, (erro, salas) => {

        if (erro) {
            console.log(erro);
            return res.send('Erro ao buscar salas.');
        }

        const sqlPalestras = `
            SELECT palestras.*, salas.nome_sala
            FROM palestras
            INNER JOIN salas ON palestras.id_sala = salas.id
            ORDER BY palestras.data_hora
        `;

        connection.query(sqlPalestras, (erro, palestras) => {

            if (erro) {
                console.log(erro);
                return res.send('Erro ao buscar palestras.');
            }
            res.render('admin', {
                usuario: req.session.usuario,
                salas: salas,
                palestras: palestras
            });
        });
    });
});

app.post('/admin/salas', verificarAdmin, (req, res) => {

    const { nome_sala, capacidade_maxima, bloco } = req.body;
    const sql = `
        INSERT INTO salas (nome_sala, capacidade_maxima, bloco)
        VALUES (?, ?, ?)
    `;

    connection.query(
        sql,
        [nome_sala, capacidade_maxima, bloco],
        (erro) => {

            if (erro) {
                console.log(erro);
                return res.send('Erro ao cadastrar sala.');
            }
            res.redirect('/admin');
        }
    );
});

app.post('/admin/palestras', verificarAdmin, (req, res) => {
    const {
        titulo_palestra,
        descricao,
        palestrante,
        data_hora,
        id_sala
    } = req.body;

    const dataFormatada = data_hora.replace('T', ' ') + ':00';
    const sql = `
        INSERT INTO palestras
        (titulo_palestra, descricao, palestrante, data_hora, id_sala, usuario_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    connection.query(
        sql,
        [
            titulo_palestra,
            descricao,
            palestrante,
            dataFormatada,
            id_sala,
            req.session.usuario.id
        ],
        (erro) => {
            if (erro) {
                console.log(erro);
                return res.send('Erro ao cadastrar palestra.');
            }
            res.redirect('/admin');
        }
    );
});

app.get('/admin/palestras/editar/:id', verificarAdmin, (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT *,
        DATE_FORMAT(data_hora, '%Y-%m-%dT%H:%i') AS data_hora_input
        FROM palestras
        WHERE id = ?
    `;
    connection.query(sql, [id], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.send('Erro ao buscar palestra.');
        }
        if (resultado.length === 0) {
            return res.send('Palestra não encontrada.');
        }
        const palestra = resultado[0];
        connection.query('SELECT * FROM salas', (erro, salas) => {
            if (erro) {
                console.log(erro);
                return res.send('Erro ao buscar salas.');
            }
            res.render('editarPalestra', {
                palestra: palestra,
                salas: salas
            });
        });
    });
});

app.post('/admin/palestras/editar/:id', verificarAdmin, (req, res) => {

    const id = req.params.id;
    const {
        titulo_palestra,
        descricao,
        palestrante,
        data_hora,
        id_sala
    } = req.body;

    const dataFormatada = data_hora.replace('T', ' ') + ':00';
    const sql = `
        UPDATE palestras
        SET titulo_palestra = ?,
            descricao = ?,
            palestrante = ?,
            data_hora = ?,
            id_sala = ?
        WHERE id = ?
    `;
    connection.query(
        sql,
        [
            titulo_palestra,
            descricao,
            palestrante,
            dataFormatada,
            id_sala,
            id
        ],
        (erro) => {
            if (erro) {
                console.log(erro);
                return res.send('Erro ao atualizar palestra.');
            }
            res.redirect('/admin');
        }
    );
});

app.post('/admin/palestras/excluir/:id', verificarAdmin, (req, res) => {

    const id = req.params.id;
    const sql = 'DELETE FROM palestras WHERE id = ?';
    connection.query(sql, [id], (erro) => {

        if (erro) {
            console.log(erro);
            return res.send('Erro ao excluir palestra.');
        }

        res.redirect('/admin');
    });
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.send('Preencha todos os campos!');
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const sql = `
            INSERT INTO usuarios (nome, email, senha, tipo)
            VALUES (?, ?, ?, 'usuario')
        `;

        connection.query(sql, [nome, email, senhaCriptografada], (erro) => {
            if (erro) {
                console.log(erro);
                return res.send('Erro ao cadastrar usuário. Verifique se o e-mail já existe.');
            }
            res.redirect('/login?cadastro=sucesso');
        });
    } catch (erro) {
        console.log(erro);
        res.send('Erro interno ao processar cadastro.');
    }
});

app.post('/favoritos/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    const usuarioId = req.session.usuario.id;
    const palestraId = req.params.id;

    const sqlVerificar = 'SELECT * FROM favoritos WHERE usuario_id = ? AND palestra_id = ?';

    connection.query(sqlVerificar, [usuarioId, palestraId], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.send('Erro ao verificar favoritos.');
        }

        if (resultado.length > 0) {
            const sqlRemover = 'DELETE FROM favoritos WHERE usuario_id = ? AND palestra_id = ?';
            connection.query(sqlRemover, [usuarioId, palestraId], (erro) => {
                if (erro) console.log(erro);
                res.redirect('/palestras');
            });
        } else {
            const sqlAdicionar = 'INSERT INTO favoritos (usuario_id, palestra_id) VALUES (?, ?)';
            connection.query(sqlAdicionar, [usuarioId, palestraId], (erro) => {
                if (erro) console.log(erro);
                res.redirect('/palestras');
            });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

