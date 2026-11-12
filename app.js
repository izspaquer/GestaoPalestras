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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});