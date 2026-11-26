// gestion-examenes: formulario + tabla para crear, ver, editar y eliminar examenes
// Es casi igual a gestion-usuarios, la diferencia es que cada examen trae su arreglo de preguntas
import { leerDatos, guardarDatos } from "../servicios/almacenamiento.js";

class GestionExamenes extends HTMLElement {

  connectedCallback() {
    // null = creando, con un codigo = editando ese examen
    this.codigoEditando = null;

    this.innerHTML = `
      <h1 class="titulo-pagina">Gestión de exámenes</h1>
      <p class="subtitulo">Crea los exámenes que van a presentar los estudiantes</p>

      <section class="tarjeta">
        <h2 id="tituloFormExamen">Nuevo examen</h2>
        <br>
        <form id="formExamen" novalidate>
          <div class="formulario-grid">
            <div class="campo">
              <label for="codigo">Código</label>
              <input type="text" id="codigo" placeholder="MAT01">
            </div>
            <div class="campo">
              <label for="titulo">Título</label>
              <input type="text" id="titulo" placeholder="Matemáticas básicas">
            </div>
            <div class="campo">
              <label for="tiempo">Tiempo (minutos)</label>
              <input type="number" id="tiempo" min="1" placeholder="30">
            </div>
            <div class="campo">
              <label for="porcentaje">Porcentaje de aprobación (%)</label>
              <input type="number" id="porcentaje" min="1" max="100" placeholder="60">
            </div>
            <div class="campo campo--completo">
              <label for="descripcion">Descripción</label>
              <textarea id="descripcion" rows="3" placeholder="¿De qué trata el examen?"></textarea>
            </div>
          </div>

          <p class="mensaje-error" id="errorExamen"></p>
          <p class="mensaje-exito" id="exitoExamen"></p>

          <div class="botones-formulario">
            <button type="submit" class="boton" id="botonGuardarExamen">Guardar examen</button>
            <button type="button" class="boton boton--secundario" id="botonCancelarExamen">Cancelar</button>
          </div>
        </form>
      </section>

      <section class="tarjeta">
        <h2>Exámenes registrados</h2>
        <br>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Tiempo</th>
                <th>Aprobación</th>
                <th>Preguntas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="cuerpoTablaExamenes"></tbody>
          </table>
        </div>
      </section>
    `;

    this.querySelector("#formExamen").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.guardarExamen();
    });

    this.querySelector("#botonCancelarExamen").addEventListener("click", () => {
      this.limpiarFormulario();
    });

    // delegacion de eventos, igual que en usuarios
    this.querySelector("#cuerpoTablaExamenes").addEventListener("click", (evento) => {
      const boton = evento.target;
      const codigo = boton.dataset.codigo;

      if (boton.classList.contains("boton-editar")) {
        this.cargarEnFormulario(codigo);
      }
      if (boton.classList.contains("boton-eliminar")) {
        this.eliminarExamen(codigo);
      }
    });

    this.pintarTabla();
  }

  pintarTabla() {
    const examenes = leerDatos("examenes");
    const cuerpoTabla = this.querySelector("#cuerpoTablaExamenes");

    if (examenes.length === 0) {
      cuerpoTabla.innerHTML = `<tr><td colspan="6">Todavía no hay exámenes. ¡Crea el primero!</td></tr>`;
      return;
    }

    cuerpoTabla.innerHTML = examenes.map((examen) => `
      <tr>
        <td><strong>${examen.codigo}</strong></td>
        <td>${examen.titulo}</td>
        <td>${examen.tiempo} min</td>
        <td>${examen.porcentajeAprobacion}%</td>
        <td><span class="etiqueta">${examen.preguntas.length}</span></td>
        <td class="acciones">
          <a href="#/preguntas/${examen.codigo}" class="boton boton--pequeno boton--secundario">Preguntas</a>
          <button class="boton boton--pequeno boton-editar" data-codigo="${examen.codigo}">Editar</button>
          <button class="boton boton--pequeno boton--peligro boton-eliminar" data-codigo="${examen.codigo}">Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  guardarExamen() {
    const examen = {
      codigo: this.querySelector("#codigo").value.trim().toUpperCase(),
      titulo: this.querySelector("#titulo").value.trim(),
      // Number() convierte el texto del input en numero
      tiempo: Number(this.querySelector("#tiempo").value),
      porcentajeAprobacion: Number(this.querySelector("#porcentaje").value),
      descripcion: this.querySelector("#descripcion").value.trim(),
      preguntas: [],
    };

    const mensajeError = this.querySelector("#errorExamen");
    const mensajeExito = this.querySelector("#exitoExamen");
    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    const error = this.validarExamen(examen);
    if (error) {
      mensajeError.textContent = error;
      return;
    }

    const examenes = leerDatos("examenes");

    if (this.codigoEditando === null) {
      examenes.push(examen);
      mensajeExito.textContent = "Examen creado correctamente.";
    } else {
      const posicion = examenes.findIndex((e) => e.codigo === this.codigoEditando);
      // ojo conservamos las preguntas que ya tenia, si no se borrarian al editar
      examen.preguntas = examenes[posicion].preguntas;
      examenes[posicion] = examen;
      mensajeExito.textContent = "Examen actualizado correctamente.";
    }

    guardarDatos("examenes", examenes);
    this.limpiarFormulario(false);
    this.pintarTabla();
  }

  validarExamen(examen) {
    if (!examen.codigo || !examen.titulo || !examen.descripcion ||
        !examen.tiempo || !examen.porcentajeAprobacion) {
      return "Por favor llena todos los campos.";
    }

    // Number.isInteger revisa que no tenga decimales
    if (!Number.isInteger(examen.tiempo) || examen.tiempo < 1 || examen.tiempo > 180) {
      return "El tiempo debe ser un número entero entre 1 y 180 minutos.";
    }

    if (examen.porcentajeAprobacion < 1 || examen.porcentajeAprobacion > 100) {
      return "El porcentaje de aprobación debe estar entre 1 y 100.";
    }

    const otrosExamenes = leerDatos("examenes").filter((e) => e.codigo !== this.codigoEditando);
    if (otrosExamenes.some((e) => e.codigo === examen.codigo)) {
      return "Ya existe un examen con ese código.";
    }

    return "";
  }

  cargarEnFormulario(codigo) {
    const examen = leerDatos("examenes").find((e) => e.codigo === codigo);

    this.querySelector("#codigo").value = examen.codigo;
    this.querySelector("#titulo").value = examen.titulo;
    this.querySelector("#tiempo").value = examen.tiempo;
    this.querySelector("#porcentaje").value = examen.porcentajeAprobacion;
    this.querySelector("#descripcion").value = examen.descripcion;

    // el codigo es la llave del examen, no se cambia
    this.querySelector("#codigo").disabled = true;

    this.codigoEditando = codigo;
    this.querySelector("#tituloFormExamen").textContent = "Editar examen";
    this.querySelector("#botonGuardarExamen").textContent = "Actualizar examen";
    this.scrollIntoView({ behavior: "smooth" });
  }

  eliminarExamen(codigo) {
    const examenes = leerDatos("examenes");
    const examen = examenes.find((e) => e.codigo === codigo);

    if (!confirm(`¿Seguro que quieres eliminar "${examen.titulo}"? Se borran también sus preguntas.`)) {
      return;
    }

    guardarDatos("examenes", examenes.filter((e) => e.codigo !== codigo));
    this.pintarTabla();

    if (this.codigoEditando === codigo) {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(borrarMensajes = true) {
    this.querySelector("#formExamen").reset();
    this.querySelector("#codigo").disabled = false;
    this.codigoEditando = null;
    this.querySelector("#tituloFormExamen").textContent = "Nuevo examen";
    this.querySelector("#botonGuardarExamen").textContent = "Guardar examen";

    if (borrarMensajes) {
      this.querySelector("#errorExamen").textContent = "";
      this.querySelector("#exitoExamen").textContent = "";
    }
  }
}

customElements.define("gestion-examenes", GestionExamenes);
