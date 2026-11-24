// Aca arranca todo. Este archivo decide que pantalla se ve segun la URL
import "./componentes/formulario-login.js";

const contenedorApp = document.getElementById("app");

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
  "#/usuarios": pantallaPendiente("Gestión de usuarios"),
  "#/examenes": pantallaPendiente("Gestión de exámenes"),
};

function mostrarPantalla() {
  // si no hay # en la URL, mostramos el inicio
  const rutaActual = location.hash || "#/";
  contenedorApp.innerHTML = rutas[rutaActual] || pantallaPendiente("Página no encontrada");
}

// hashchange salta cada vez que cambia lo que va despues del #
window.addEventListener("hashchange", mostrarPantalla);
mostrarPantalla();
