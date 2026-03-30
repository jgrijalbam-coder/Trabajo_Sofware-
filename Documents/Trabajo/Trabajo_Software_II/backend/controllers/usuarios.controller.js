const pool = require('../config/db');

const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono,
             u.direccion, u.estado, u.bloqueado, u.fecha_registro,
             r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      mensaje: 'Error al listar usuarios'
    });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      password,
      id_rol
    } = req.body;

    if (!nombre || !email || !password || !id_rol) {
      return res.status(400).json({
        mensaje: 'Nombre, email, password e id_rol son obligatorios'
      });
    }

    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        mensaje: 'El correo ya está registrado'
      });
    }

    await pool.query(
      `INSERT INTO usuarios
      (nombre, apellido, email, telefono, direccion, password_hash, id_rol)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido || null,
        email,
        telefono || null,
        direccion || null,
        password,
        id_rol
      ]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente'
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      mensaje: 'Error al registrar usuario'
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensaje: 'Email y password son obligatorios'
      });
    }

    const [usuarios] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash,
              u.estado, u.bloqueado, u.intentos_login, u.id_rol, r.nombre_rol
       FROM usuarios u
       INNER JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = ?`,
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const usuario = usuarios[0];

    if (usuario.bloqueado) {
      return res.status(403).json({
        mensaje: 'La cuenta está bloqueada'
      });
    }

    if (usuario.password_hash !== password) {
      await pool.query(
        `UPDATE usuarios
         SET intentos_login = intentos_login + 1,
             bloqueado = IF(intentos_login + 1 >= 5, TRUE, bloqueado)
         WHERE id_usuario = ?`,
        [usuario.id_usuario]
      );

      return res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });
    }

    await pool.query(
      `UPDATE usuarios
       SET intentos_login = 0
       WHERE id_usuario = ?`,
      [usuario.id_usuario]
    );

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        id_rol: usuario.id_rol,
        rol: usuario.nombre_rol
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      mensaje: 'Error al iniciar sesión'
    });
  }
};

module.exports = {
  listarUsuarios,
  registrarUsuario,
  loginUsuario
};