// <lista-examenes>: pantalla publica con los examenes que se pueden presentar
import { leerDatos } from "../servicios/almacenamiento.js";

class ListaExamenes extends HTMLElement {

  connectedCallback() {
    // un examen sin preguntas no tiene sentido presentarlo, asi que no lo mostramos
    const examenes = leerDatos("examenes").filter((examen) => examen.preguntas.length > 0);

    let contenido = "";

    if (examenes.length === 0) {
      contenido = `
        <section class="tarjeta">
          <p class="subtitulo">Por ahora no hay exámenes disponibles. Vuelve más tarde 🙂</p>
        </section>
      `;
    } else {
      contenido = `
        <div class="grilla-examenes">
          ${examenes.map((examen) => `
            <article class="tarjeta tarjeta-examen">
              <span class="etiqueta">${examen.codigo}</span>
              <h2>${examen.titulo}</h2>
              <p class="tarjeta-examen__descripcion">${examen.descripcion}</p>
              <ul class="tarjeta-examen__datos">
                <li>⏱ <strong>${examen.tiempo}</strong> minutos</li>
                <li>🎯 Aprueba con <strong>${examen.porcentajeAprobacion}%</strong></li>
                <li>📝 <strong>${examen.preguntas.length}</strong> preguntas</li>
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
