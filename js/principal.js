// Aca arranca todo. Este archivo decide que pantalla se ve segun la URL

// estos import no traen ninguna funcion, solo cargan el archivo.
// Con eso basta pa que cada componente haga su customElements.define
// y el navegador ya entienda etiquetas como <gestion-usuarios>
import "./componentes/formulario-login.js";
import "./componentes/barra-navegacion.js";
import "./componentes/gestion-usuarios.js";
import "./componentes/gestion-examenes.js";
import "./componentes/gestion-preguntas.js";
import "./componentes/lista-examenes.js";
import "./componentes/resolver-examen.js";
import { crearAdminPorDefecto } from "./servicios/almacenamiento.js";
import { obtenerUsuarioActual } from "./servicios/autenticacion.js";

const contenedorApp = document.getElementById("app");

// pantallas que solo se ven con sesion iniciada
const rutasPrivadas = ["#/usuarios", "#/examenes", "#/preguntas"];

// apenas abre la app nos aseguramos de que exista al menos un usuario pa poder entrar
crearAdminPorDefecto();

// pantalla pa cuando escriben una ruta que no existe
const paginaNoEncontrada = `
  <section class="tarjeta">
    <h1 class="titulo-pagina">Página no encontrada</h1>
    <p class="subtitulo">La página que buscas no existe.</p>
    <a href="#/" class="boton">Ir al inicio</a>
  </section>
`;

// cada ruta (lo que va despues del #) tiene su pantalla.
// Las que necesitan un dato extra (como el codigo del examen) son funciones
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
  "#/presentar": "<lista-examenes></lista-examenes>",
  "#/resolver": (codigo) => `<resolver-examen codigo="${codigo}"></resolver-examen>`,
  "#/usuarios": "<gestion-usuarios></gestion-usuarios>",
  "#/examenes": "<gestion-examenes></gestion-examenes>",
  "#/preguntas": (codigo) => `<gestion-preguntas codigo="${codigo}"></gestion-preguntas>`,
};

function mostrarPantalla() {
  // si no hay # en la URL, mostramos el inicio
  const rutaActual = location.hash || "#/";

  // partimos la ruta, ej: "#/preguntas/MAT01" queda ["#", "preguntas", "MAT01"]
  const partes = rutaActual.split("/");
  const rutaBase = "#/" + (partes[1] || "");
  const parametro = partes[2];

  const usuario = obtenerUsuarioActual();

  // sin sesion no puede entrar a lo privado, pa'l login.
  // includes revisa si la ruta esta dentro del arreglo de rutas privadas
  if (rutasPrivadas.includes(rutaBase) && !usuario) {
    location.hash = "#/login";
    return;
  }

  // si ya esta logueado no tiene sentido mostrarle el login otra vez
  if (rutaBase === "#/login" && usuario) {
    location.hash = "#/usuarios";
    return;
  }

  // buscamos la pantalla en el objeto rutas usando la ruta como "llave"
  const pantalla = rutas[rutaBase];

  // si no existe mostramos el error, si es funcion le pasamos el parametro
  // (ej: el codigo del examen) y si es texto lo ponemos tal cual
  if (!pantalla) {
    contenedorApp.innerHTML = paginaNoEncontrada;
  } else if (typeof pantalla === "function") {
    contenedorApp.innerHTML = pantalla(parametro);
  } else {
    contenedorApp.innerHTML = pantalla;
  }
}

// hashchange salta cada vez que cambia lo que va despues del #
window.addEventListener("hashchange", mostrarPantalla);

// y la llamamos una vez al cargar, pa pintar la primera pantalla
mostrarPantalla();
