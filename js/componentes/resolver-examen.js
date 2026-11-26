// <resolver-examen codigo="MAT01">: aca el estudiante presenta el examen
// Tiene 2 pasos: 1) pedir sus datos  2) mostrar las preguntas
import { leerDatos, guardarDatos } from "../servicios/almacenamiento.js";
import "./temporizador-examen.js";
import "./resultado-examen.js";

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
        <temporizador-examen minutos="${this.examen.tiempo}"></temporizador-examen>
      </header>

      <form id="formExamen">
        ${preguntasHTML}
        <button type="submit" class="boton boton-terminar">Terminar examen</button>
      </form>
    `;

    this.querySelector("#formExamen").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.terminarExamen(false);
    });

    // el temporizador nos avisa con este evento cuando llega a 0
    this.querySelector("temporizador-examen").addEventListener("tiempo-agotado", () => {
      this.terminarExamen(true);
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

  // porTiempo es true cuando lo llama el temporizador al llegar a 0
  terminarExamen(porTiempo) {
    const elegidas = this.obtenerRespuestasElegidas();
    const sinResponder = elegidas.filter((elegida) => elegida === null).length;

    // si termina antes de tiempo y le faltan preguntas, le preguntamos.
    // Si se acabo el tiempo no hay nada que preguntar, se envia si o si
    if (!porTiempo && sinResponder > 0) {
      const seguro = confirm(`Te faltan ${sinResponder} pregunta(s) por responder. ¿Quieres terminar de todas formas?`);
      if (!seguro) {
        return;
      }
    }

    // contamos las correctas: la pregunta cuenta si eligio algo y lo que eligio es la correcta
    const preguntas = this.examen.preguntas;
    const correctas = preguntas.filter((pregunta, numeroPregunta) => {
      const elegida = elegidas[numeroPregunta];
      return elegida !== null && pregunta.respuestas[elegida].esCorrecta;
    }).length;

    // Math.round redondea, ej: 66.66 -> 67
    const porcentaje = Math.round((correctas / preguntas.length) * 100);

    this.guardarResultado(correctas, porcentaje);
    this.mostrarResultado(correctas, porcentaje, porTiempo);
  }

  // guardamos el resultado en LocalStorage asociado a los datos del estudiante
  guardarResultado(correctas, porcentaje) {
    const resultados = leerDatos("resultados");

    resultados.push({
      identificacion: this.estudiante.identificacion,
      nombre: this.estudiante.nombre,
      codigoExamen: this.examen.codigo,
      tituloExamen: this.examen.titulo,
      correctas: correctas,
      totalPreguntas: this.examen.preguntas.length,
      porcentaje: porcentaje,
      aprobo: porcentaje >= this.examen.porcentajeAprobacion,
      fecha: new Date().toLocaleString(),
    });

    guardarDatos("resultados", resultados);
  }

  mostrarResultado(correctas, porcentaje, porTiempo) {
    // creamos la etiqueta con JS y le ponemos los datos con setAttribute
    const resultado = document.createElement("resultado-examen");
    resultado.setAttribute("nombre", this.estudiante.nombre);
    resultado.setAttribute("examen", this.examen.titulo);
    resultado.setAttribute("correctas", correctas);
    resultado.setAttribute("total", this.examen.preguntas.length);
    resultado.setAttribute("porcentaje", porcentaje);
    resultado.setAttribute("aprobacion", this.examen.porcentajeAprobacion);
    resultado.setAttribute("por-tiempo", porTiempo ? "si" : "no");

    // al borrar el contenido, el temporizador desaparece y su disconnectedCallback para el reloj
    this.innerHTML = "";
    this.appendChild(resultado);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

customElements.define("resolver-examen", ResolverExamen);
