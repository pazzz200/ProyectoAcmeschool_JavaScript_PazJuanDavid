// Nuestro primer web component: <formulario-login>
// Una clase que hereda de HTMLElement es basicamente una etiqueta HTML hecha por nosotros

class FormularioLogin extends HTMLElement {

  // esto se ejecuta solo cuando la etiqueta aparece en la pagina
  connectedCallback() {
    this.innerHTML = `
      <section class="tarjeta login">
        <h1 class="titulo-pagina">Iniciar sesión</h1>
        <p class="subtitulo">Ingresa con tu correo y contraseña</p>

        <form id="formLogin" novalidate>
          <div class="campo">
            <label for="correo">Correo electrónico</label>
            <input type="email" id="correo" placeholder="correo@acme.com">
          </div>

          <div class="campo">
            <label for="contrasena">Contraseña</label>
            <input type="password" id="contrasena" placeholder="Tu contraseña">
          </div>

          <p class="mensaje-error" id="mensajeError"></p>
          <p class="mensaje-exito" id="mensajeExito"></p>

          <button type="submit" class="boton login__boton">Ingresar</button>
        </form>
      </section>
    `;

    const formulario = this.querySelector("#formLogin");

    // preventDefault evita que el form recargue la pagina
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.validarFormulario();
    });
  }

  validarFormulario() {
    const correo = this.querySelector("#correo").value.trim();
    const contrasena = this.querySelector("#contrasena").value.trim();
    const mensajeError = this.querySelector("#mensajeError");
    const mensajeExito = this.querySelector("#mensajeExito");

    // limpiamos mensajes viejos
    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    if (correo === "" || contrasena === "") {
      mensajeError.textContent = "Por favor llena todos los campos.";
      return;
    }

    // revisa que tenga forma de correo: 
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
      mensajeError.textContent = "El correo no tiene un formato válido.";
      return;
    }

    if (contrasena.length < 4) {
      mensajeError.textContent = "La contraseña debe tener mínimo 4 caracteres.";
      return;
    }

    // por ahora solo avisamos, en la etapa 4 revisamos si el usuario existe de verdad
    mensajeExito.textContent = "Datos válidos. En la siguiente etapa revisamos si el usuario existe.";
  }
}

// aca le decimos al navegador: cuando veas <formulario-login>, usa esta clase
customElements.define("formulario-login", FormularioLogin);
