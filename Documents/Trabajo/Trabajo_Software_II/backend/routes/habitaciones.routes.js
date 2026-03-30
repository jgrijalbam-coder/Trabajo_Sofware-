const express = require('express');
const router = express.Router();
const {
  listarHabitaciones,
  obtenerHabitacionPorId,
  listarHabitacionesDisponibles
} = require('../controllers/habitaciones.controller');

router.get('/', listarHabitaciones);
router.get('/disponibles', listarHabitacionesDisponibles);
router.get('/:id', obtenerHabitacionPorId);

module.exports = router;