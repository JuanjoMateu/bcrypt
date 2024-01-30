const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const users = require('../data/users')

router.get('/', (req, res) => {
    const loginForm = `
    <form action="/login" method="post">
      <label for="username">Usuario:</label>
      <input type="text" id="username" name="username" required><br>

      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required><br>

      <button type="submit">Iniciar sesión</button>
    </form>
    <a href="/dashboard">dashboard</a>
  `;

    res.send(loginForm);
});

router.post('/login', (req, res) => {
    const {username, password } = req.body;
    const user = users.find((user) => user.username === username && user.password === password
    );

    if (user) {
        const token = authMiddleware.generateToken(user);
        req.session.token = token;
        res.redirect('/dashboard');
    } else {
        res.status(401).json({ mensaje: 'Credenciales incorrectas'});
    }
});

router.get('/dashboard', authMiddleware.verifyToken, (req, res) => {
    const userId = req.user;
    const user = users.find((user) => user.id === userId);
    if (user) {
      res.send(`
      <h1>Bienvenido, ${user.name}</h1>
      <p>ID: ${user.id}</p>
      <p>UserName: ${user.username}</p>
      <a href="/">HOME</a>
      <form action="/logout" method="post">
      <button type="submit">Cerrar sesión</button>
      </form>
      `);
    } else {
      res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
