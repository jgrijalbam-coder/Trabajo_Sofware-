alert("JavaScript activo");

window.addEventListener("scroll", function () {
  const imagen = document.querySelector(".bg");
  const menu = document.querySelector(".menu");

  let scroll = window.scrollY;
  let opacidad = 1 - scroll / 600;

  if (opacidad < 0) {
    opacidad = 0;
  }

  if (imagen) {
    imagen.style.opacity = opacidad;
  }

  if (menu) {
    if (scroll > 80) {
      menu.classList.add("scrolled");
    } else {
      menu.classList.remove("scrolled");
    }
  }
});

document.querySelectorAll(".btn-info").forEach(function (boton) {
  boton.addEventListener("click", function () {
    const info = boton.parentElement.querySelector(".info-habitacion");

    if (info.style.display === "block") {
      info.style.display = "none";
      boton.textContent = "Ver información";
    } else {
      info.style.display = "block";
      boton.textContent = "Ocultar información";
    }
  });
});

const servicios = document.querySelectorAll(".servicio");

window.addEventListener("scroll", () => {
  servicios.forEach(servicio => {
    const posicion = servicio.getBoundingClientRect().top;
    const alturaPantalla = window.innerHeight;

    if (posicion < alturaPantalla - 100) {
      servicio.classList.add("visible");
    }
  });
});

const API_USUARIOS = "http://localhost:3000/api/usuarios";
const API_RESERVAS = "http://localhost:3000/api/reservas";
const API_HABITACIONES = "http://localhost:3000/api/habitaciones";

const modalLogin = document.getElementById("modalLogin");
const modalRegistro = document.getElementById("modalRegistro");
const modalCuenta = document.getElementById("modalCuenta");

const cerrarLogin = document.getElementById("cerrarLogin");
const cerrarRegistro = document.getElementById("cerrarRegistro");
const cerrarCuenta = document.getElementById("cerrarCuenta");

const irARegistro = document.getElementById("irARegistro");
const irALogin = document.getElementById("irALogin");

const authButtons = document.getElementById("authButtons");

const formRegistro = document.getElementById("formRegistro");
const mensajeRegistro = document.getElementById("mensajeRegistro");

const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

const cuentaNombre = document.getElementById("cuentaNombre");
const cuentaEmail = document.getElementById("cuentaEmail");
const cuentaRol = document.getElementById("cuentaRol");

const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
const btnVerReservas = document.getElementById("btnVerReservas");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");

const panelReservas = document.getElementById("panelReservas");
const panelEditarPerfil = document.getElementById("panelEditarPerfil");
const listaReservas = document.getElementById("listaReservas");

const formEditarPerfil = document.getElementById("formEditarPerfil");
const mensajeEditarPerfil = document.getElementById("mensajeEditarPerfil");

const mensajeReserva = document.getElementById("mensajeReserva");
const btnBuscarReserva = document.getElementById("btnBuscarReserva");
const resultadosHabitaciones = document.getElementById("resultadosHabitaciones");

const resumenReserva = document.getElementById("resumenReserva");
const resumenHabitacion = document.getElementById("resumenHabitacion");
const resumenTipo = document.getElementById("resumenTipo");
const resumenVista = document.getElementById("resumenVista");
const resumenPiso = document.getElementById("resumenPiso");
const resumenPrecio = document.getElementById("resumenPrecio");
const resumenNoches = document.getElementById("resumenNoches");
const resumenTotal = document.getElementById("resumenTotal");
const btnConfirmarReserva = document.getElementById("btnConfirmarReserva");

let accionPendiente = null;
let habitacionPendiente = null;
let habitacionSeleccionada = null;

function mostrarModal(modal) {
  if (!modal) return;
  modal.classList.add("activo");
  document.body.style.overflow = "hidden";
}

function ocultarModal(modal) {
  if (!modal) return;
  modal.classList.remove("activo");

  const algunModalActivo =
    (modalLogin && modalLogin.classList.contains("activo")) ||
    (modalRegistro && modalRegistro.classList.contains("activo")) ||
    (modalCuenta && modalCuenta.classList.contains("activo"));

  if (!algunModalActivo) {
    document.body.style.overflow = "auto";
  }
}

function obtenerUsuarioSesion() {
  const usuarioGuardado = localStorage.getItem("usuario");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

function guardarUsuarioSesion(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function limpiarPanelesCuenta() {
  if (panelReservas) panelReservas.classList.remove("activo");
  if (panelEditarPerfil) panelEditarPerfil.classList.remove("activo");
}

function enlazarBotonesAuth() {
  const abrirLogin = document.getElementById("abrirLogin");
  const abrirRegistro = document.getElementById("abrirRegistro");
  const abrirCuenta = document.getElementById("abrirCuenta");

  if (abrirLogin) {
    abrirLogin.addEventListener("click", function (e) {
      e.preventDefault();
      mostrarModal(modalLogin);
    });
  }

  if (abrirRegistro) {
    abrirRegistro.addEventListener("click", function (e) {
      e.preventDefault();
      mostrarModal(modalRegistro);
    });
  }

  if (abrirCuenta) {
    abrirCuenta.addEventListener("click", function (e) {
      e.preventDefault();
      cargarDatosCuenta();
      limpiarPanelesCuenta();
      mostrarModal(modalCuenta);
    });
  }
}

function actualizarZonaUsuario() {
  const usuario = obtenerUsuarioSesion();

  if (!authButtons) return;

  if (usuario) {
    authButtons.innerHTML = `
      <a href="#" class="iniciar-btn" id="abrirCuenta">Mi cuenta</a>
    `;
  } else {
    authButtons.innerHTML = `
      <a href="#" class="iniciar-btn" id="abrirLogin">Iniciar sesión</a>
      <a href="#" class="registrarse-btn" id="abrirRegistro">Registrarse</a>
    `;
  }

  enlazarBotonesAuth();
}

function cargarDatosCuenta() {
  const usuario = obtenerUsuarioSesion();
  if (!usuario) return;

  if (cuentaNombre) {
    cuentaNombre.textContent = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
  }

  if (cuentaEmail) {
    cuentaEmail.textContent = usuario.email || "";
  }

  if (cuentaRol) {
    cuentaRol.textContent = usuario.rol || "Cliente";
  }
}

function llenarFormularioEditar(usuario) {
  const editNombre = document.getElementById("editNombre");
  const editApellido = document.getElementById("editApellido");
  const editEmail = document.getElementById("editEmail");
  const editTelefono = document.getElementById("editTelefono");
  const editDireccion = document.getElementById("editDireccion");

  if (editNombre) editNombre.value = usuario.nombre || "";
  if (editApellido) editApellido.value = usuario.apellido || "";
  if (editEmail) editEmail.value = usuario.email || "";
  if (editTelefono) editTelefono.value = usuario.telefono || "";
  if (editDireccion) editDireccion.value = usuario.direccion || "";
}

async function cargarPerfilUsuario() {
  const usuario = obtenerUsuarioSesion();
  if (!usuario) return;

  try {
    const respuesta = await fetch(`${API_USUARIOS}/${usuario.id_usuario}`);
    const resultado = await respuesta.json();

    if (respuesta.ok) {
      const usuarioActualizado = {
        id_usuario: resultado.id_usuario,
        nombre: resultado.nombre,
        apellido: resultado.apellido,
        email: resultado.email,
        telefono: resultado.telefono,
        direccion: resultado.direccion,
        id_rol: resultado.id_rol,
        rol: resultado.nombre_rol
      };

      guardarUsuarioSesion(usuarioActualizado);
      cargarDatosCuenta();
      llenarFormularioEditar(usuarioActualizado);
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  }
}

async function cargarReservasUsuario() {
  const usuario = obtenerUsuarioSesion();
  if (!usuario || !listaReservas) return;

  listaReservas.innerHTML = `<p class="texto-vacio">Cargando reservas...</p>`;

  try {
    const respuesta = await fetch(`${API_RESERVAS}/usuario/${usuario.id_usuario}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      listaReservas.innerHTML = `<p class="texto-vacio">${resultado.mensaje || "No se pudieron cargar las reservas"}</p>`;
      return;
    }

    if (resultado.length === 0) {
      listaReservas.innerHTML = `<p class="texto-vacio">Aún no has realizado reservas.</p>`;
      return;
    }

    listaReservas.innerHTML = resultado.map(reserva => `
      <div class="tarjeta-reserva">
        <p><strong>Reserva:</strong> #${reserva.id_reserva}</p>
        <p><strong>Habitación:</strong> ${reserva.numero_habitacion} - ${reserva.tipo_habitacion}</p>
        <p><strong>Check-in:</strong> ${reserva.fecha_inicio}</p>
        <p><strong>Check-out:</strong> ${reserva.fecha_fin}</p>
        <p><strong>Estado:</strong> ${reserva.estado}</p>
        <p><strong>Total:</strong> $${formatearPrecio(reserva.total)}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error al cargar reservas:", error);
    listaReservas.innerHTML = `<p class="texto-vacio">No se pudo conectar con el servidor.</p>`;
  }
}

function manejarLoginExitoso(usuario) {
  guardarUsuarioSesion(usuario);
  actualizarZonaUsuario();

  if (accionPendiente === "reservar") {
    accionPendiente = null;
    ocultarModal(modalLogin);
    window.location.href = "#reservar";

    if (mensajeReserva && habitacionPendiente) {
      mensajeReserva.textContent = `Ya iniciaste sesión. Ahora selecciona o confirma tu habitación.`;
    }
  } else {
    setTimeout(() => {
      ocultarModal(modalLogin);
    }, 800);
  }
}

function obtenerImagenPorTipo(tipo) {
  const tipoNormalizado = (tipo || "").toLowerCase();

  if (tipoNormalizado === "suite") return "images/photo-1702411200201-3061d0eea802.jpeg";
  if (tipoNormalizado === "familiar") return "images/hb3.jpeg";
  return "images/hb1.jpeg";
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO").format(Number(valor));
}

function calcularNoches(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

function actualizarResumenReserva(habitacion) {
  const fechaInicio = document.getElementById("fechaInicioReserva").value;
  const fechaFin = document.getElementById("fechaFinReserva").value;

  if (!habitacion || !fechaInicio || !fechaFin) {
    if (resumenReserva) resumenReserva.classList.add("oculto");
    return;
  }

  const noches = calcularNoches(fechaInicio, fechaFin);

  if (noches <= 0) {
    if (mensajeReserva) {
      mensajeReserva.textContent = "La fecha de salida debe ser posterior al check-in.";
    }
    if (resumenReserva) resumenReserva.classList.add("oculto");
    return;
  }

  const total = noches * Number(habitacion.precio_base);

  resumenHabitacion.textContent = habitacion.numero;
  resumenTipo.textContent = habitacion.tipo_habitacion;
  resumenVista.textContent = habitacion.vista || "No definida";
  resumenPiso.textContent = habitacion.piso;
  resumenPrecio.textContent = `$${formatearPrecio(habitacion.precio_base)}`;
  resumenNoches.textContent = noches;
  resumenTotal.textContent = `$${formatearPrecio(total)}`;

  resumenReserva.classList.remove("oculto");
}

function renderizarHabitaciones(habitaciones) {
  if (!resultadosHabitaciones) return;

  if (!habitaciones || habitaciones.length === 0) {
    resultadosHabitaciones.innerHTML = `
      <div class="mensaje-sin-resultados">
        No se encontraron habitaciones con esos filtros.
      </div>
    `;
    if (resumenReserva) resumenReserva.classList.add("oculto");
    return;
  }

  resultadosHabitaciones.innerHTML = habitaciones.map(habitacion => `
    <div class="tarjeta-habitacion">
      <img 
        src="${obtenerImagenPorTipo(habitacion.tipo_habitacion)}" 
        alt="${habitacion.tipo_habitacion}" 
        class="imagen-habitacion-card"
      >
      <div class="contenido-habitacion-card">
        <span class="badge-habitacion">${habitacion.tipo_habitacion}</span>
        <h3 class="titulo-habitacion-card">Habitación ${habitacion.numero}</h3>
        <p class="detalle-habitacion"><strong>Piso:</strong> ${habitacion.piso}</p>
        <p class="detalle-habitacion"><strong>Vista:</strong> ${habitacion.vista || "No definida"}</p>
        <p class="detalle-habitacion"><strong>Capacidad:</strong> ${habitacion.capacidad} huésped(es)</p>
        <p class="detalle-habitacion"><strong>Estado:</strong> ${habitacion.estado}</p>
        <div class="precio-habitacion">$ ${formatearPrecio(habitacion.precio_base)} / noche</div>
        <div class="acciones-habitacion">
          <button class="btn-reservar-card" data-id="${habitacion.id_habitacion}">
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".btn-reservar-card").forEach(boton => {
    boton.addEventListener("click", () => {
      const usuario = obtenerUsuarioSesion();
      const idHabitacion = Number(boton.dataset.id);
      const habitacion = habitaciones.find(h => Number(h.id_habitacion) === idHabitacion);

      if (!usuario) {
        accionPendiente = "reservar";
        habitacionPendiente = idHabitacion;
        mostrarModal(modalLogin);
        return;
      }

      habitacionPendiente = idHabitacion;
      habitacionSeleccionada = habitacion;
      actualizarResumenReserva(habitacion);

      if (mensajeReserva) {
        mensajeReserva.textContent = `Habitación ${habitacion.numero} seleccionada. Revisa el resumen y confirma tu reserva.`;
      }

      window.location.href = "#resumenReserva";
    });
  });
}

async function buscarHabitacionesElegantes() {
  const tipo = document.getElementById("tipoHabitacionReserva").value;
  const vista = document.getElementById("vistaReserva").value;
  const piso = document.getElementById("pisoReserva").value;
  const huespedes = document.getElementById("huespedesReserva").value;

  try {
    const params = new URLSearchParams({
      tipo,
      vista,
      piso,
      huespedes
    });

    const respuesta = await fetch(`${API_HABITACIONES}/buscar/filtros?${params.toString()}`);
    const resultado = await respuesta.json();

    if (respuesta.ok) {
      renderizarHabitaciones(resultado);
      if (mensajeReserva) {
        mensajeReserva.textContent = `${resultado.length} habitación(es) encontrada(s).`;
      }
    } else {
      if (mensajeReserva) {
        mensajeReserva.textContent = resultado.mensaje || "No se pudieron buscar habitaciones.";
      }
    }
  } catch (error) {
    console.error("Error al buscar habitaciones:", error);
    if (mensajeReserva) {
      mensajeReserva.textContent = "No se pudo conectar con el servidor.";
    }
  }
}

async function crearReservaReal() {
  const usuario = obtenerUsuarioSesion();

  if (!usuario) {
    mostrarModal(modalLogin);
    return;
  }

  if (!habitacionPendiente || !habitacionSeleccionada) {
    if (mensajeReserva) {
      mensajeReserva.textContent = "Primero selecciona una habitación.";
    }
    return;
  }

  const fechaInicio = document.getElementById("fechaInicioReserva").value;
  const fechaFin = document.getElementById("fechaFinReserva").value;

  if (!fechaInicio || !fechaFin) {
    if (mensajeReserva) {
      mensajeReserva.textContent = "Debes seleccionar check-in y check-out.";
    }
    return;
  }

  const noches = calcularNoches(fechaInicio, fechaFin);

  if (noches <= 0) {
    if (mensajeReserva) {
      mensajeReserva.textContent = "La fecha de salida debe ser posterior al check-in.";
    }
    return;
  }

  try {
    const respuesta = await fetch(API_RESERVAS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_usuario: usuario.id_usuario,
        id_habitacion: Number(habitacionPendiente),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      if (mensajeReserva) {
        mensajeReserva.textContent = "Reserva creada correctamente.";
      }

      habitacionPendiente = null;
      habitacionSeleccionada = null;

      if (resumenReserva) {
        resumenReserva.classList.add("oculto");
      }

      if (resultadosHabitaciones) {
        resultadosHabitaciones.innerHTML = "";
      }

      await cargarReservasUsuario();
    } else {
      if (mensajeReserva) {
        mensajeReserva.textContent = resultado.mensaje || "No se pudo crear la reserva.";
      }
    }
  } catch (error) {
    console.error("Error al crear reserva:", error);
    if (mensajeReserva) {
      mensajeReserva.textContent = "No se pudo conectar con el servidor.";
    }
  }
}

if (cerrarLogin) {
  cerrarLogin.addEventListener("click", function () {
    ocultarModal(modalLogin);
  });
}

if (cerrarRegistro) {
  cerrarRegistro.addEventListener("click", function () {
    ocultarModal(modalRegistro);
  });
}

if (cerrarCuenta) {
  cerrarCuenta.addEventListener("click", function () {
    ocultarModal(modalCuenta);
  });
}

if (irARegistro) {
  irARegistro.addEventListener("click", function (e) {
    e.preventDefault();
    ocultarModal(modalLogin);
    mostrarModal(modalRegistro);
  });
}

if (irALogin) {
  irALogin.addEventListener("click", function (e) {
    e.preventDefault();
    ocultarModal(modalRegistro);
    mostrarModal(modalLogin);
  });
}

window.addEventListener("click", function (e) {
  if (e.target === modalLogin) ocultarModal(modalLogin);
  if (e.target === modalRegistro) ocultarModal(modalRegistro);
  if (e.target === modalCuenta) ocultarModal(modalCuenta);
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    ocultarModal(modalLogin);
    ocultarModal(modalRegistro);
    ocultarModal(modalCuenta);
  }
});

if (formRegistro) {
  formRegistro.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datosRegistro = {
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      password: document.getElementById("password").value,
      id_rol: parseInt(document.getElementById("id_rol").value)
    };

    try {
      const respuesta = await fetch(`${API_USUARIOS}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosRegistro)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        mensajeRegistro.textContent = resultado.mensaje || "Usuario registrado correctamente";
        mensajeRegistro.style.color = "green";
        formRegistro.reset();

        setTimeout(() => {
          mensajeRegistro.textContent = "";
          ocultarModal(modalRegistro);
          mostrarModal(modalLogin);
        }, 1000);
      } else {
        mensajeRegistro.textContent = resultado.mensaje || "Error al registrar usuario";
        mensajeRegistro.style.color = "red";
      }
    } catch (error) {
      console.error("Error en registro:", error);
      mensajeRegistro.textContent = "No se pudo conectar con el servidor";
      mensajeRegistro.style.color = "red";
    }
  });
}

if (formLogin) {
  formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datosLogin = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value
    };

    try {
      const respuesta = await fetch(`${API_USUARIOS}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosLogin)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        mensajeLogin.textContent = resultado.mensaje || "Inicio de sesión exitoso";
        mensajeLogin.style.color = "green";

        if (resultado.usuario) {
          manejarLoginExitoso(resultado.usuario);
        }

        setTimeout(() => {
          mensajeLogin.textContent = "";
        }, 1000);
      } else {
        mensajeLogin.textContent = resultado.mensaje || "Error al iniciar sesión";
        mensajeLogin.style.color = "red";
      }
    } catch (error) {
      console.error("Error en login:", error);
      mensajeLogin.textContent = "No se pudo conectar con el servidor";
      mensajeLogin.style.color = "red";
    }
  });
}

if (cerrarSesionBtn) {
  cerrarSesionBtn.addEventListener("click", function () {
    localStorage.removeItem("usuario");
    ocultarModal(modalCuenta);
    actualizarZonaUsuario();
  });
}

if (btnVerReservas) {
  btnVerReservas.addEventListener("click", async function () {
    if (panelEditarPerfil) panelEditarPerfil.classList.remove("activo");
    if (panelReservas) panelReservas.classList.add("activo");
    await cargarReservasUsuario();
  });
}

if (btnEditarPerfil) {
  btnEditarPerfil.addEventListener("click", async function () {
    if (panelReservas) panelReservas.classList.remove("activo");
    if (panelEditarPerfil) panelEditarPerfil.classList.add("activo");
    await cargarPerfilUsuario();
  });
}

if (formEditarPerfil) {
  formEditarPerfil.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = obtenerUsuarioSesion();
    if (!usuario) return;

    const datosActualizados = {
      nombre: document.getElementById("editNombre").value.trim(),
      apellido: document.getElementById("editApellido").value.trim(),
      email: document.getElementById("editEmail").value.trim(),
      telefono: document.getElementById("editTelefono").value.trim(),
      direccion: document.getElementById("editDireccion").value.trim()
    };

    try {
      const respuesta = await fetch(`${API_USUARIOS}/${usuario.id_usuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizados)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        const usuarioActualizado = {
          id_usuario: resultado.usuario.id_usuario,
          nombre: resultado.usuario.nombre,
          apellido: resultado.usuario.apellido,
          email: resultado.usuario.email,
          telefono: resultado.usuario.telefono,
          direccion: resultado.usuario.direccion,
          id_rol: resultado.usuario.id_rol,
          rol: resultado.usuario.nombre_rol
        };

        guardarUsuarioSesion(usuarioActualizado);
        cargarDatosCuenta();

        if (mensajeEditarPerfil) {
          mensajeEditarPerfil.textContent = resultado.mensaje || "Datos actualizados";
          mensajeEditarPerfil.style.color = "green";
        }
      } else {
        if (mensajeEditarPerfil) {
          mensajeEditarPerfil.textContent = resultado.mensaje || "No se pudo actualizar";
          mensajeEditarPerfil.style.color = "red";
        }
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      if (mensajeEditarPerfil) {
        mensajeEditarPerfil.textContent = "No se pudo conectar con el servidor";
        mensajeEditarPerfil.style.color = "red";
      }
    }
  });
}

document.querySelectorAll(".btn-reservar").forEach(function (boton) {
  boton.addEventListener("click", function (e) {
    const usuario = obtenerUsuarioSesion();
    const idHabitacion = boton.dataset.idHabitacion;

    if (!usuario) {
      e.preventDefault();
      accionPendiente = "reservar";
      habitacionPendiente = idHabitacion;
      mostrarModal(modalLogin);
    } else {
      habitacionPendiente = idHabitacion;
      if (mensajeReserva) {
        mensajeReserva.textContent = `Vas a reservar la habitación ${idHabitacion}. Ahora completa las fechas y busca disponibilidad.`;
      }
    }
  });
});

if (btnBuscarReserva) {
  btnBuscarReserva.addEventListener("click", async function () {
    await buscarHabitacionesElegantes();
  });
}

if (btnConfirmarReserva) {
  btnConfirmarReserva.addEventListener("click", async function () {
    await crearReservaReal();
  });
}

document.getElementById("fechaInicioReserva")?.addEventListener("change", function () {
  if (habitacionSeleccionada) actualizarResumenReserva(habitacionSeleccionada);
});

document.getElementById("fechaFinReserva")?.addEventListener("change", function () {
  if (habitacionSeleccionada) actualizarResumenReserva(habitacionSeleccionada);
});

actualizarZonaUsuario();
enlazarBotonesAuth();
