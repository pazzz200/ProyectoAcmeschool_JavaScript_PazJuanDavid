// <resolver-examen codigo="MAT01">: aca el estudiante presenta el examen
// Tiene 2 pasos: 1) pedir sus datos  2) mostrar las preguntas
import { leerDatos } from "../servicios/almacenamiento.js";

class ResolverExamen extends HTMLElement {

  connectedCallback() {
    const codigo = this.getAttribute("codigo");
    this.examen = leerDatos("examenes").find((examen) => examen.codigo === codigo);

    if (!this.examen || this.examen.preguntas.length === 0) {
      this.innerHTML = `
        <section class="tarjeta">
          <h1 class="titulo-pagina">Examen no disponible</h1>
          <a href="#/presentar" class="boton">Ver exámenes disponibles</a>
        </section>
      `;
      return;
    }

    this.mostrarFormularioEstudiante();
  }

  // ---------- paso 1: datos del estudiante ----------

  mostrarFormularioEstudiante() {
    this.innerHTML = `
      <a href="#/presentar" class="enlace-volver">← Volver a la lista</a>

      <section class="tarjeta login">
        <h1 class="titulo-pagina">${this.examen.titulo}</h1>
        <p class="subtitulo">
          ⏱ ${this.examen.tiempo} min · 🎯 Aprueba con ${this.examen.porcentajeAprobacion}%
          · 📝 ${this.examen.preguntas.length} preguntas
        </p>

        <form id="formEstudiante" novalidate>
          <div class="campo">
            <label for="identificacionEstudiante">Número de identificación</label>
            <input type="text" id="identificacionEstudiante" placeholder="1234567890">
          </div>
          <div class="campo">
            <label for="nombreEstudiante">Nombre completo</label>
            <input type="text" id="nombreEstudiante" placeholder="Tu nombre">
          </div>

          <p class="mensaje-error" id="errorEstudiante"></p>

          <button type="submit" class="boton login__boton">Comenzar examen</button>
        </form>
      </section>
    `;

    this.querySelector("#formEstudiante").addEventListener("submit", (evento) => {
      evento.preventDefault();

      const identificacion = this.querySelector("#identificacionEstudiante").value.trim();
      const nombre = this.querySelector("#nombreEstudiante").value.trim();
      const mensajeError = this.querySelector("#errorEstudiante");

      if (identificacion === "" || nombre === "") {
        mensajeError.textContent = "Por favor llena tus datos para comenzar.";
        return;
      }
      if (!/^\d+$/.test(identificacion)) {
        mensajeError.textContent = "La identificación solo puede tener números.";
        return;
      }

      // guardamos al estudiante en el componente pa usarlo cuando termine
      this.estudiante = { identificacion, nombre };
      this.mostrarPreguntas();
    });
  }

  // ---------- paso 2: las preguntas ----------

  mostrarPreguntas() {
    const preguntas = this.examen.preguntas;

    // cada pregunta tiene sus radios con un name distinto (pregunta-0, pregunta-1...)
    // asi en cada pregunta solo se puede marcar una respuesta
    const preguntasHTML = preguntas.map((pregunta, numeroPregunta) => `
      <article class="tarjeta pregunta-examen">
        <h3>${numeroPregunta + 1}. ${pregunta.texto}</h3>
        <div class="opciones">
          ${pregunta.respuestas.map((respuesta, numeroRespuesta) => `
            <label class="opcion">
              <input type="radio" name="pregunta-${numeroPregunta}" value="${numeroRespuesta}">
              <span>${respuesta.texto}</span>
            </label>
          `).join("")}
        </div>
      </article>
    `).join("");

    this.innerHTML = `
      <header class="tarjeta encabezado-examen">
        <div>
          <h1 class="titulo-pagina">${this.examen.titulo}</h1>
          <p class="subtitulo">
            👤 ${this.estudiante.nombre} · 📝 ${preguntas.length} preguntas
            · 🎯 Aprueba con ${this.examen.porcentajeAprobacion}%
          </p>
        </div>
        <!-- aca va el reloj en la etapa 9 -->
      </header>

      <form id="formExamen">
        ${preguntasHTML}
        <p class="mensaje-error" id="errorExamen"></p>
        <button type="submit" class="boton boton-terminar">Terminar examen</button>
      </form>
    `;

    this.querySelector("#formExamen").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.terminarExamen();
    });
  }

  // devuelve un arreglo con la posicion de la respuesta elegida en cada pregunta
  // (o null si la dejo sin responder)
  obtenerRespuestasElegidas() {
    return this.examen.preguntas.map((pregunta, numeroPregunta) => {
      const marcada = this.querySelector(`input[name="pregunta-${numeroPregunta}"]:checked`);
      return marcada ? Number(marcada.value) : null;
    });
  }

  terminarExamen() {
    const elegidas = this.obtenerRespuestasElegidas();
    const sinResponder = elegidas.filter((elegida) => elegida === null).length;

    // si dejo preguntas sin responder le preguntamos antes de terminar
    if (sinResponder > 0) {
      const seguro = confirm(`Te faltan ${sinResponder} pregunta(s) por responder. ¿Quieres terminar de todas formas?`);
      if (!seguro) {
        return;
      }
    }

    // por ahora solo mostramos cuantas respondio, en la etapa 9 calculamos la nota
    this.innerHTML = `
      <section class="tarjeta login">
        <h1 class="titulo-pagina">¡Examen enviado!</h1>
        <p class="subtitulo">
          ${this.estudiante.nombre}, respondiste ${elegidas.length - sinResponder} de ${elegidas.length} preguntas.
        </p>
        <a href="#/presentar" class="boton">Volver a los exámenes</a>
      </section>
    `;
  }
}

customElements.define("resolver-examen", ResolverExamen);
