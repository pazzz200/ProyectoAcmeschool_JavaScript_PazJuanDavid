// Aca arranca todo. Este archivo decide que pantalla se ve segun la URL
import "./componentes/formulario-login.js";
import "./componentes/barra-navegacion.js";
import "./componentes/gestion-usuarios.js";
import { crearAdminPorDefecto } from "./servicios/almacenamiento.js";
import { obtenerUsuarioActual } from "./servicios/autenticacion.js";

const contenedorApp = document.getElementById("app");

// pantallas que solo se ven con sesion iniciada
const rutasPrivadas = ["#/usuarios", "#/examenes"];

crearAdminPorDefecto();

// pantalla temporal para los modulos que aun no hemos hecho
function pantallaPendiente(titulo) {
  return `
    <section class="tarjeta">
      <h1 class="titulo-pagina">${titulo}</h1>
      <p class="subtitulo">Este módulo lo construimos en las próximas etapas.</p>
    </section>
  `;
}

// cada ruta (lo que va despues del #) tiene su pantalla
const rutas = {
  "#/": `
    <section class="tarjeta">
      <h1 class="titulo-pagina">Bienvenido a Acme School</h1>
      <p class="subtitulo">Plataforma para crear y presentar exámenes en línea.</p>
      <a href="#/presentar" class="boton">Presentar un examen</a>
      <a href="#/login" class="boton boton--secundario">Soy docente / administrativo</a>
    </section>
  `,
  "#/login": "<formulario-login></formulario-login>",
  "#/presentar": pantallaPendiente("Presentar examen"),
  "#/usuarios": "<gestion-usuarios></gestion-usuarios>",
  "#/examenes": pantallaPendiente("Gestión de exámenes"),
};

function mostrarPantalla() {
  // si no hay # en la URL, mostramos el inicio
  const rutaActual = location.hash || "#/";
  const usuario = obtenerUsuarioActual();

  // sin sesion no puede entrar a lo privado, pa'l login
  if (rutasPrivadas.includes(rutaActual) && !usuario) {
    location.hash = "#/login";
    return;
  }

  // si ya esta logueado no tiene sentido mostrarle el login otra vez
  if (rutaActual === "#/login" && usuario) {
    location.hash = "#/usuarios";
    return;
  }

  contenedorApp.innerHTML = rutas[rutaActual] || pantallaPendiente("Página no encontrada");
}

// hashchange salta cada vez que cambia lo que va despues del #
window.addEventListener("hashchange", mostrarPantalla);
mostrarPantalla();
