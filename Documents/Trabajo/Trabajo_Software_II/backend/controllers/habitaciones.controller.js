const pool = require('../config/db');

const listarHabitaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT h.id_habitacion, h.numero, h.piso, h.estado, h.vista,
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
      `SELECT h.id_habitacion, h.numero, h.piso, h.estado, h.vista,
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
      SELECT h.id_habitacion, h.numero, h.piso, h.estado, h.vista,
             t.id_tipo, t.nombre AS tipo_habitacion, t.descripcion,
             t.capacidad, t.precio_base
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

const buscarHabitaciones = async (req, res) => {
  try {
    const { tipo, vista, piso, huespedes } = req.query;

    let sql = `
      SELECT h.id_habitacion, h.numero, h.piso, h.estado, h.vista,
             t.id_tipo, t.nombre AS tipo_habitacion, t.descripcion,
             t.capacidad, t.precio_base
      FROM habitaciones h
      INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
      WHERE h.estado = 'disponible'
    `;

    const params = [];

    if (tipo && tipo !== 'Cualquiera') {
      sql += ` AND LOWER(t.nombre) = LOWER(?)`;
      params.push(tipo);
    }

    if (vista && vista !== 'Cualquiera') {
      sql += ` AND LOWER(h.vista) = LOWER(?)`;
      params.push(vista);
    }

    if (piso && piso !== 'Cualquiera') {
      if (piso === 'Piso bajo') {
        sql += ` AND h.piso = 1`;
      } else if (piso === 'Piso medio') {
        sql += ` AND h.piso IN (2, 3)`;
      } else if (piso === 'Piso alto') {
        sql += ` AND h.piso >= 4`;
      }
    }

    if (huespedes) {
      sql += ` AND t.capacidad >= ?`;
      params.push(Number(huespedes));
    }

    sql += ` ORDER BY t.precio_base ASC, h.numero ASC`;

    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al buscar habitaciones:', error);
    res.status(500).json({ mensaje: 'Error al buscar habitaciones' });
  }
};

module.exports = {
  listarHabitaciones,
  obtenerHabitacionPorId,
  listarHabitacionesDisponibles,
  buscarHabitaciones
};
