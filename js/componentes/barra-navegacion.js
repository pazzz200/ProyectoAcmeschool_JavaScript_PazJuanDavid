// <barra-navegacion>: muestra unos enlaces u otros segun si hay sesion o no
import { obtenerUsuarioActual, cerrarSesion } from "../servicios/autenticacion.js";

class BarraNavegacion extends HTMLElement {

  connectedCallback() {
    this.pintar();
    // cada vez que cambia la pantalla volvemos a pintar la barra,
    // asi se actualiza justo despues de entrar o salir
    window.addEventListener("hashchange", () => this.pintar());
  }

  // arma la barra desde cero cada vez. Primero mira si hay alguien logueado
  // y segun eso decide que enlaces mostrar
  pintar() {
    const usuario = obtenerUsuarioActual();
    let enlaces = "";

    if (usuario) {
      enlaces = `
        <li><a href="#/presentar">Presentar examen</a></li>
        <li><a href="#/usuarios">Usuarios</a></li>
        <li><a href="#/examenes">Exámenes</a></li>
        <li class="barra__usuario">${usuario.nombre}</li>
        <li><button class="barra__salir" id="botonSalir">Cerrar sesión</button></li>
      `;
    } else {
      enlaces = `
        <li><a href="#/presentar">Presentar examen</a></li>
        <li><a href="#/login">Iniciar sesión</a></li>
      `;
    }

    this.innerHTML = `
      <nav class="barra">
        <a href="#/" class="barra__logo">Acme School</a>
        <ul class="barra__enlaces">${enlaces}</ul>
      </nav>
    `;

    // el boton solo existe si hay sesion, por eso preguntamos antes
    // resaltamos el enlace de la pantalla donde estamos
    // (startsWith pa que #/preguntas/MAT01 tambien marque "Examenes")
    const rutaActual = location.hash.replace("#/preguntas", "#/examenes").replace("#/resolver", "#/presentar");
    this.querySelectorAll(".barra__enlaces a").forEach((enlace) => {
      if (rutaActual.startsWith(enlace.getAttribute("href"))) {
        enlace.classList.add("activo");
      }
    });

    const botonSalir = this.querySelector("#botonSalir");
    if (botonSalir) {
      // al salir borramos la sesion y lo mandamos al login,
      // ese cambio de hash hace que la barra se vuelva a pintar sin los enlaces privados
      botonSalir.addEventListener("click", () => {
        cerrarSesion();
        location.hash = "#/login";
      });
    }
  }
}

customElements.define("barra-navegacion", BarraNavegacion);
