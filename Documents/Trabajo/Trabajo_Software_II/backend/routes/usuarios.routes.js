const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  obtenerUsuarioPorId,
  registrarUsuario,
  loginUsuario,
  actualizarUsuario
} = require('../controllers/usuarios.controller');

router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.put('/:id', actualizarUsuario);

module.exports = router;
