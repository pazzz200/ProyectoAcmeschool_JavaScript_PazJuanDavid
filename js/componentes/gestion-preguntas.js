// <gestion-preguntas codigo="MAT01">: maneja las preguntas de UN examen
// El codigo del examen le llega como atributo desde principal.js
import { leerDatos, guardarDatos } from "../servicios/almacenamiento.js";

const MINIMO_RESPUESTAS = 2;
const MAXIMO_RESPUESTAS = 6;

class GestionPreguntas extends HTMLElement {

  connectedCallback() {
    this.codigoExamen = this.getAttribute("codigo");
    // null = creando una pregunta nueva, un numero = la posicion de la que editamos
    this.posicionEditando = null;

    const examen = this.buscarExamen();

    // si alguien escribe un codigo que no existe en la URL
    if (!examen) {
      this.innerHTML = `
        <section class="tarjeta">
          <h1 class="titulo-pagina">Examen no encontrado</h1>
          <a href="#/examenes" class="boton">Volver a exámenes</a>
        </section>
      `;
      return;
    }

    this.innerHTML = `
      <a href="#/examenes" class="enlace-volver">← Volver a exámenes</a>
      <h1 class="titulo-pagina">Preguntas de: ${examen.titulo}</h1>
      <p class="subtitulo">Código ${examen.codigo} · ${examen.tiempo} min · Aprueba con ${examen.porcentajeAprobacion}%</p>

      <section class="tarjeta">
        <h2 id="tituloFormPregunta">Nueva pregunta</h2>
        <br>
        <form id="formPregunta" novalidate>
          <div class="campo">
            <label for="textoPregunta">Pregunta</label>
            <textarea id="textoPregunta" rows="2" placeholder="¿Cuánto es 2 + 2?"></textarea>
          </div>

          <label class="etiqueta-campo">Respuestas (marca la correcta)</label>
          <div id="listaRespuestas"></div>

          <button type="button" class="boton boton--secundario boton--pequeno" id="botonAgregarRespuesta">
            + Agregar respuesta
          </button>

          <p class="mensaje-error" id="errorPregunta"></p>
          <p class="mensaje-exito" id="exitoPregunta"></p>

          <div class="botones-formulario">
            <button type="submit" class="boton" id="botonGuardarPregunta">Guardar pregunta</button>
            <button type="button" class="boton boton--secundario" id="botonCancelarPregunta">Cancelar</button>
          </div>
        </form>
      </section>

      <section class="tarjeta">
        <h2 id="contadorPreguntas"></h2>
        <br>
        <div id="listaPreguntas"></div>
      </section>
    `;

    this.prepararFormularioVacio();

    this.querySelector("#botonAgregarRespuesta").addEventListener("click", () => {
      this.agregarFilaRespuesta();
    });

    // boton de quitar respuesta (delegacion de eventos)
    this.querySelector("#listaRespuestas").addEventListener("click", (evento) => {
      if (evento.target.classList.contains("boton-quitar")) {
        this.quitarFilaRespuesta(evento.target);
      }
    });

    this.querySelector("#formPregunta").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.guardarPregunta();
    });

    this.querySelector("#botonCancelarPregunta").addEventListener("click", () => {
      this.prepararFormularioVacio();
    });

    this.querySelector("#listaPreguntas").addEventListener("click", (evento) => {
      // dataset siempre devuelve texto, por eso lo pasamos a numero
      const posicion = Number(evento.target.dataset.posicion);

      if (evento.target.classList.contains("boton-editar")) {
        this.cargarEnFormulario(posicion);
      }
      if (evento.target.classList.contains("boton-eliminar")) {
        this.eliminarPregunta(posicion);
      }
    });

    this.pintarPreguntas();
  }

  buscarExamen() {
    return leerDatos("examenes").find((examen) => examen.codigo === this.codigoExamen);
  }

  // ---------- filas de respuestas del formulario ----------

  agregarFilaRespuesta(texto = "", esCorrecta = false) {
    const lista = this.querySelector("#listaRespuestas");

    if (lista.children.length >= MAXIMO_RESPUESTAS) {
      this.querySelector("#errorPregunta").textContent = `Máximo ${MAXIMO_RESPUESTAS} respuestas por pregunta.`;
      return;
    }

    // todos los radios tienen el mismo name="correcta",
    // asi el navegador solo deja marcar uno. Justo lo que necesitamos!
    const fila = document.createElement("div");
    fila.classList.add("fila-respuesta");
    fila.innerHTML = `
      <input type="radio" name="correcta" title="Marcar como correcta" ${esCorrecta ? "checked" : ""}>
      <input type="text" class="texto-respuesta" placeholder="Escribe una respuesta">
      <button type="button" class="boton-quitar" title="Quitar respuesta">✕</button>
    `;
    // el texto lo ponemos aparte pa que no se rompa si la respuesta trae comillas
    fila.querySelector(".texto-respuesta").value = texto;
    lista.appendChild(fila);
  }

  quitarFilaRespuesta(boton) {
    const lista = this.querySelector("#listaRespuestas");

    if (lista.children.length <= MINIMO_RESPUESTAS) {
      this.querySelector("#errorPregunta").textContent = `Cada pregunta necesita mínimo ${MINIMO_RESPUESTAS} respuestas.`;
      return;
    }

    // closest busca hacia arriba el div de la fila y lo borra completo
    boton.closest(".fila-respuesta").remove();
  }

  // deja el form limpio con 2 respuestas vacias
  prepararFormularioVacio() {
    this.posicionEditando = null;
    this.querySelector("#textoPregunta").value = "";
    this.querySelector("#listaRespuestas").innerHTML = "";
    this.agregarFilaRespuesta();
    this.agregarFilaRespuesta();

    this.querySelector("#tituloFormPregunta").textContent = "Nueva pregunta";
    this.querySelector("#botonGuardarPregunta").textContent = "Guardar pregunta";
    this.querySelector("#errorPregunta").textContent = "";
  }

  // ---------- guardar, editar y eliminar ----------

  guardarPregunta() {
    const mensajeError = this.querySelector("#errorPregunta");
    const mensajeExito = this.querySelector("#exitoPregunta");
    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    // leemos cada fila y armamos el arreglo de respuestas
    const filas = this.querySelectorAll(".fila-respuesta");
    const respuestas = [];
    filas.forEach((fila) => {
      respuestas.push({
        texto: fila.querySelector(".texto-respuesta").value.trim(),
        esCorrecta: fila.querySelector("input[type='radio']").checked,
      });
    });

    const pregunta = {
      texto: this.querySelector("#textoPregunta").value.trim(),
      respuestas: respuestas,
    };

    const error = this.validarPregunta(pregunta);
    if (error) {
      mensajeError.textContent = error;
      return;
    }

    // traemos todos los examenes, cambiamos el nuestro y guardamos todo otra vez
    const examenes = leerDatos("examenes");
    const examen = examenes.find((e) => e.codigo === this.codigoExamen);

    if (this.posicionEditando === null) {
      examen.preguntas.push(pregunta);
      mensajeExito.textContent = "Pregunta agregada.";
    } else {
      examen.preguntas[this.posicionEditando] = pregunta;
      mensajeExito.textContent = "Pregunta actualizada.";
    }

    guardarDatos("examenes", examenes);
    this.prepararFormularioVacio();
    this.pintarPreguntas();
  }

  validarPregunta(pregunta) {
    if (pregunta.texto === "") {
      return "Escribe el texto de la pregunta.";
    }

    if (pregunta.respuestas.some((respuesta) => respuesta.texto === "")) {
      return "Ninguna respuesta puede quedar vacía.";
    }

    // pasamos todo a minuscula pa comparar y ver si hay respuestas repetidas
    const textos = pregunta.respuestas.map((respuesta) => respuesta.texto.toLowerCase());
    const sinRepetir = new Set(textos);
    if (sinRepetir.size !== textos.length) {
      return "Hay respuestas repetidas.";
    }

    // filter cuenta cuantas estan marcadas, tiene que ser exactamente 1
    const correctas = pregunta.respuestas.filter((respuesta) => respuesta.esCorrecta);
    if (correctas.length !== 1) {
      return "Marca cuál es la respuesta correcta.";
    }

    return "";
  }

  cargarEnFormulario(posicion) {
    const pregunta = this.buscarExamen().preguntas[posicion];

    this.querySelector("#textoPregunta").value = pregunta.texto;
    this.querySelector("#listaRespuestas").innerHTML = "";
    pregunta.respuestas.forEach((respuesta) => {
      this.agregarFilaRespuesta(respuesta.texto, respuesta.esCorrecta);
    });

    this.posicionEditando = posicion;
    this.querySelector("#tituloFormPregunta").textContent = `Editar pregunta ${posicion + 1}`;
    this.querySelector("#botonGuardarPregunta").textContent = "Actualizar pregunta";
    this.querySelector("#errorPregunta").textContent = "";
    this.querySelector("#exitoPregunta").textContent = "";
    this.scrollIntoView({ behavior: "smooth" });
  }

  eliminarPregunta(posicion) {
    if (!confirm(`¿Seguro que quieres eliminar la pregunta ${posicion + 1}?`)) {
      return;
    }

    const examenes = leerDatos("examenes");
    const examen = examenes.find((e) => e.codigo === this.codigoExamen);

    // splice(posicion, 1) saca 1 elemento desde esa posicion
    examen.preguntas.splice(posicion, 1);
    guardarDatos("examenes", examenes);

    // al borrar, las posiciones se corren, asi que si estabamos editando algo limpiamos el form
    if (this.posicionEditando !== null) {
      this.prepararFormularioVacio();
    }
    this.pintarPreguntas();
  }

  // ---------- lista de preguntas guardadas ----------

  pintarPreguntas() {
    const preguntas = this.buscarExamen().preguntas;
    const lista = this.querySelector("#listaPreguntas");

    this.querySelector("#contadorPreguntas").textContent = `Preguntas del examen (${preguntas.length})`;

    if (preguntas.length === 0) {
      lista.innerHTML = `<p class="subtitulo">Este examen todavía no tiene preguntas.</p>`;
      return;
    }

    lista.innerHTML = preguntas.map((pregunta, posicion) => `
      <article class="pregunta">
        <div class="pregunta__encabezado">
          <h3>${posicion + 1}. ${pregunta.texto}</h3>
          <div class="acciones">
            <button class="boton boton--pequeno boton-editar" data-posicion="${posicion}">Editar</button>
            <button class="boton boton--pequeno boton--peligro boton-eliminar" data-posicion="${posicion}">Eliminar</button>
          </div>
        </div>
        <ul class="pregunta__respuestas">
          ${pregunta.respuestas.map((respuesta) => `
            <li class="${respuesta.esCorrecta ? "respuesta-correcta" : ""}">
              ${respuesta.esCorrecta ? "✔" : "○"} ${respuesta.texto}
            </li>
          `).join("")}
        </ul>
      </article>
    `).join("");
  }
}

customElements.define("gestion-preguntas", GestionPreguntas);
