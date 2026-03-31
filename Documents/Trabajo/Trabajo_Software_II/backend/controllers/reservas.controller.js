const pool = require('../config/db');

const calcularDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

const crearReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id_usuario, id_habitacion, fecha_inicio, fecha_fin } = req.body;

    if (!id_usuario || !id_habitacion || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
      return res.status(400).json({
        mensaje: 'La fecha_fin debe ser mayor que la fecha_inicio'
      });
    }

    const [usuario] = await connection.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: 'El usuario no existe'
      });
    }

    const [habitacion] = await connection.query(
      `SELECT h.id_habitacion, h.estado, t.precio_base
       FROM habitaciones h
       INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
       WHERE h.id_habitacion = ?`,
      [id_habitacion]
    );

    if (habitacion.length === 0) {
      return res.status(404).json({
        mensaje: 'La habitación no existe'
      });
    }

    if (habitacion[0].estado === 'mantenimiento') {
      return res.status(400).json({
        mensaje: 'La habitación está en mantenimiento'
      });
    }

    const [cruceReservas] = await connection.query(
      `SELECT r.id_reserva
       FROM reservas r
       INNER JOIN detalle_reserva d ON r.id_reserva = d.id_reserva
       WHERE d.id_habitacion = ?
       AND r.estado IN ('pendiente', 'confirmada')
       AND (
         (? BETWEEN r.fecha_inicio AND r.fecha_fin)
         OR (? BETWEEN r.fecha_inicio AND r.fecha_fin)
         OR (r.fecha_inicio BETWEEN ? AND ?)
         OR (r.fecha_fin BETWEEN ? AND ?)
       )`,
      [
        id_habitacion,
        fecha_inicio,
        fecha_fin,
        fecha_inicio,
        fecha_fin,
        fecha_inicio,
        fecha_fin
      ]
    );

    if (cruceReservas.length > 0) {
      return res.status(400).json({
        mensaje: 'La habitación ya está reservada en esas fechas'
      });
    }

    const dias = calcularDias(fecha_inicio, fecha_fin);
    const precio_noche = Number(habitacion[0].precio_base);
    const total = dias * precio_noche;

    await connection.beginTransaction();

    const [resultadoReserva] = await connection.query(
      `INSERT INTO reservas (id_usuario, fecha_inicio, fecha_fin, estado, total)
       VALUES (?, ?, ?, 'confirmada', ?)`,
      [id_usuario, fecha_inicio, fecha_fin, total]
    );

    const id_reserva = resultadoReserva.insertId;

    await connection.query(
      `INSERT INTO detalle_reserva (id_reserva, id_habitacion, precio_noche)
       VALUES (?, ?, ?)`,
      [id_reserva, id_habitacion, precio_noche]
    );

    await connection.query(
      `UPDATE habitaciones
       SET estado = 'reservada'
       WHERE id_habitacion = ?`,
      [id_habitacion]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Reserva creada correctamente',
      reserva: {
        id_reserva,
        id_usuario,
        id_habitacion,
        fecha_inicio,
        fecha_fin,
        dias,
        precio_noche,
        total
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      mensaje: 'Error al crear la reserva'
    });
  } finally {
    connection.release();
  }
};

const listarReservas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.estado, r.total, r.fecha_creacion,
             u.nombre, u.apellido, u.email,
             h.numero AS numero_habitacion,
             t.nombre AS tipo_habitacion
      FROM reservas r
      INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
      INNER JOIN detalle_reserva d ON r.id_reserva = d.id_reserva
      INNER JOIN habitaciones h ON d.id_habitacion = h.id_habitacion
      INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
      ORDER BY r.id_reserva DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({
      mensaje: 'Error al listar reservas'
    });
  }
};

const listarReservasPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [usuario] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const [rows] = await pool.query(
      `SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.estado, r.total, r.fecha_creacion,
              h.id_habitacion, h.numero AS numero_habitacion, h.piso,
              t.nombre AS tipo_habitacion, d.precio_noche
       FROM reservas r
       INNER JOIN detalle_reserva d ON r.id_reserva = d.id_reserva
       INNER JOIN habitaciones h ON d.id_habitacion = h.id_habitacion
       INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
       WHERE r.id_usuario = ?
       ORDER BY r.id_reserva DESC`,
      [id_usuario]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al listar reservas del usuario:', error);
    res.status(500).json({
      mensaje: 'Error al listar reservas del usuario'
    });
  }
};

const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.estado, r.total, r.fecha_creacion,
              u.nombre, u.apellido, u.email, u.telefono,
              h.numero AS numero_habitacion, h.piso,
              t.nombre AS tipo_habitacion, t.precio_base
       FROM reservas r
       INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
       INNER JOIN detalle_reserva d ON r.id_reserva = d.id_reserva
       INNER JOIN habitaciones h ON d.id_habitacion = h.id_habitacion
       INNER JOIN tipos_habitacion t ON h.id_tipo = t.id_tipo
       WHERE r.id_reserva = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      mensaje: 'Error al obtener la reserva'
    });
  }
};

const cancelarReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const [detalle] = await connection.query(
      `SELECT d.id_habitacion, r.estado
       FROM detalle_reserva d
       INNER JOIN reservas r ON d.id_reserva = r.id_reserva
       WHERE d.id_reserva = ?`,
      [id]
    );

    if (detalle.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    if (detalle[0].estado === 'cancelada') {
      return res.status(400).json({
        mensaje: 'La reserva ya está cancelada'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE reservas
       SET estado = 'cancelada'
       WHERE id_reserva = ?`,
      [id]
    );

    await connection.query(
      `UPDATE habitaciones
       SET estado = 'disponible'
       WHERE id_habitacion = ?`,
      [detalle[0].id_habitacion]
    );

    await connection.commit();

    res.json({
      mensaje: 'Reserva cancelada correctamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      mensaje: 'Error al cancelar la reserva'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  crearReserva,
  listarReservas,
  listarReservasPorUsuario,
  obtenerReservaPorId,
  cancelarReserva
};
