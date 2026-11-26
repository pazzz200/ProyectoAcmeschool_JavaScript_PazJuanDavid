// lista-examenes: pantalla publica con los examenes que se pueden presentar
import { leerDatos } from "../servicios/almacenamiento.js";

class ListaExamenes extends HTMLElement {

  connectedCallback() {
    // un examen sin preguntas no tiene sentido presentarlo, asi que no lo mostramos
    const examenes = leerDatos("examenes").filter((examen) => examen.preguntas.length > 0);

    // en esta variable armamos lo que va debajo del titulo,
    // puede ser el mensaje de "no hay examenes" o la grilla de tarjetas
    let contenido = "";

    if (examenes.length === 0) {
      contenido = `
        <section class="tarjeta">
          <p class="subtitulo">Por ahora no hay exámenes disponibles. Vuelve más tarde.</p>
        </section>
      `;
    } else {
      // map convierte cada examen en el HTML de una tarjeta, y join("") pega todas
      // en un solo texto (sin join quedarian comas entre las tarjetas).
      // El boton lleva el codigo en la URL, asi resolver-examen sabe cual abrir
      contenido = `
        <div class="grilla-examenes">
          ${examenes.map((examen) => `
            <article class="tarjeta tarjeta-examen">
              <span class="etiqueta">${examen.codigo}</span>
              <h2>${examen.titulo}</h2>
              <p class="tarjeta-examen__descripcion">${examen.descripcion}</p>
              <ul class="tarjeta-examen__datos">
                <li>Tiempo: <strong>${examen.tiempo}</strong> minutos</li>
                <li>Aprueba con: <strong>${examen.porcentajeAprobacion}%</strong></li>
                <li>Preguntas: <strong>${examen.preguntas.length}</strong></li>
              </ul>
              <a href="#/resolver/${examen.codigo}" class="boton tarjeta-examen__boton">Presentar examen</a>
            </article>
          `).join("")}
        </div>
      `;
    }

    this.innerHTML = `
      <h1 class="titulo-pagina">Exámenes disponibles</h1>
      <p class="subtitulo">Elige el examen que vas a presentar. No necesitas iniciar sesión.</p>
      ${contenido}
    `;
  }
}

customElements.define("lista-examenes", ListaExamenes);
