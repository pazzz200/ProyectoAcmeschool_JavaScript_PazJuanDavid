// <temporizador-examen minutos="10">: reloj que cuenta hacia atras hasta 0
// Cuando llega a 0 lanza un evento "tiempo-agotado" pa que el examen se entere

class TemporizadorExamen extends HTMLElement {

  connectedCallback() {
    const minutos = Number(this.getAttribute("minutos"));
    this.segundosRestantes = minutos * 60;

    this.innerHTML = `
      <div class="temporizador">
        <span class="temporizador__etiqueta">Tiempo restante</span>
        <span class="temporizador__reloj" id="reloj"></span>
      </div>
    `;

    this.pintarTiempo();

    // setInterval ejecuta la funcion cada 1000 ms (1 segundo) sin bloquear la pagina
    this.intervalo = setInterval(() => {
      this.segundosRestantes--;
      this.pintarTiempo();

      if (this.segundosRestantes <= 0) {
        clearInterval(this.intervalo);
        // avisamos hacia afuera que se acabo el tiempo
        this.dispatchEvent(new CustomEvent("tiempo-agotado"));
      }
    }, 1000);
  }

  // se ejecuta solo cuando el componente desaparece de la pagina
  // (termino el examen o el estudiante se fue a otra pantalla).
  // Si no paramos el intervalo, seguiria corriendo por detras
  disconnectedCallback() {
    clearInterval(this.intervalo);
  }

  pintarTiempo() {
    const minutos = Math.floor(this.segundosRestantes / 60);
    const segundos = this.segundosRestantes % 60;

    // padStart pone un 0 adelante si hace falta: 5 -> "05"
    const texto = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    this.querySelector("#reloj").textContent = texto;

    // en el ultimo minuto el reloj se pone rojo y palpita
    if (this.segundosRestantes <= 60) {
      this.querySelector(".temporizador").classList.add("temporizador--alerta");
    }
  }
}

customElements.define("temporizador-examen", TemporizadorExamen);
