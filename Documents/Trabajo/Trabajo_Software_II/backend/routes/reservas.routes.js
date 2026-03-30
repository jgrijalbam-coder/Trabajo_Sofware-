const express = require('express');
const router = express.Router();
const {
  crearReserva,
  listarReservas,
  obtenerReservaPorId,
  cancelarReserva
} = require('../controllers/reservas.controller');

router.post('/', crearReserva);
router.get('/', listarReservas);
router.get('/:id', obtenerReservaPorId);
router.delete('/:id', cancelarReserva);

module.exports = router;