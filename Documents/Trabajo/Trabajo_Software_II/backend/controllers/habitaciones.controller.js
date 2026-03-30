const pool = require('../config/db');

const listarHabitaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT h.id_habitacion, h.numero, h.piso, h.estado,
             t.id_tipo, t.nombre AS tipo_habitacion, t.descripcion,
             t.capacidad, t.precio_base
      FROM habitaciones h
      INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
      ORDER BY h.numero ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al listar habitaciones:', error);
    res.status(500).json({ mensaje: 'Error al listar habitaciones' });
  }
};

const obtenerHabitacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT h.id_habitacion, h.numero, h.piso, h.estado,
              t.id_tipo, t.nombre AS tipo_habitacion, t.descripcion,
              t.capacidad, t.precio_base
       FROM habitaciones h
       INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
       WHERE h.id_habitacion = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Habitación no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({ mensaje: 'Error al obtener la habitación' });
  }
};

const listarHabitacionesDisponibles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT h.id_habitacion, h.numero, h.piso, h.estado,
             t.nombre AS tipo_habitacion, t.capacidad, t.precio_base
      FROM habitaciones h
      INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
      WHERE h.estado = 'disponible'
      ORDER BY h.numero ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al listar habitaciones disponibles:', error);
    res.status(500).json({ mensaje: 'Error al listar habitaciones disponibles' });
  }
};

module.exports = {
  listarHabitaciones,
  obtenerHabitacionPorId,
  listarHabitacionesDisponibles
};