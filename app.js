const express = require('express');
const app = express();
const port = 3000;
const connection = require('./database/conexao');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/palestras', (req, res) => {
  res.render("palestras");
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

  connection.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro na consulta:', err);
      return res.render('login', {
        error: 'Erro interno no servidor.',
        email: email
      });
    }

    if (results.length > 0) {
      res.redirect('/palestras');
    } else {
      res.render('login', {
        error: 'E-mail ou senha incorretos!',
        email: email
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
