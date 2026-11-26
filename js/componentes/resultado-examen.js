// <resultado-examen>: muestra la nota final del estudiante
// Todos los datos le llegan como atributos desde resolver-examen

class ResultadoExamen extends HTMLElement {

  connectedCallback() {
    const nombre = this.getAttribute("nombre");
    const examen = this.getAttribute("examen");
    const correctas = Number(this.getAttribute("correctas"));
    const total = Number(this.getAttribute("total"));
    const porcentaje = Number(this.getAttribute("porcentaje"));
    const porcentajeAprobacion = Number(this.getAttribute("aprobacion"));
    const porTiempo = this.getAttribute("por-tiempo") === "si";

    const aprobo = porcentaje >= porcentajeAprobacion;

    this.innerHTML = `
      <section class="tarjeta resultado">
        ${porTiempo ? `<p class="resultado__aviso">⏰ Se acabó el tiempo, el examen se envió automáticamente.</p>` : ""}

        <div class="resultado__circulo ${aprobo ? "resultado__circulo--aprobado" : "resultado__circulo--reprobado"}">
          ${porcentaje}%
        </div>

        <span class="estado ${aprobo ? "estado--aprobado" : "estado--reprobado"}">
          ${aprobo ? "✔ APROBADO" : "✖ NO APROBADO"}
        </span>

        <ul class="resultado__datos">
          <li><span>Estudiante</span><strong>${nombre}</strong></li>
          <li><span>Examen</span><strong>${examen}</strong></li>
          <li><span>Respuestas correctas</span><strong>${correctas} de ${total}</strong></li>
          <li><span>Porcentaje de aciertos</span><strong>${porcentaje}%</strong></li>
          <li><span>Necesitabas</span><strong>${porcentajeAprobacion}%</strong></li>
        </ul>

        <a href="#/presentar" class="boton">Volver a los exámenes</a>
      </section>
    `;
  }
}

customElements.define("resultado-examen", ResultadoExamen);
