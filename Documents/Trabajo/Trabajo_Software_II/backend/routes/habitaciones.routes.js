const express = require('express');
const router = express.Router();
const {
  listarHabitaciones,
  obtenerHabitacionPorId,
  listarHabitacionesDisponibles,
  buscarHabitaciones
} = require('../controllers/habitaciones.controller');

router.get('/', listarHabitaciones);
router.get('/disponibles', listarHabitacionesDisponibles);
router.get('/buscar/filtros', buscarHabitaciones);
router.get('/:id', obtenerHabitacionPorId);

module.exports = router;
