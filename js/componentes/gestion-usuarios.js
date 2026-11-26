// <gestion-usuarios>: formulario + tabla para crear, ver, editar y eliminar usuarios
import { leerDatos, guardarDatos } from "../servicios/almacenamiento.js";
import { obtenerUsuarioActual, iniciarSesion } from "../servicios/autenticacion.js";

class GestionUsuarios extends HTMLElement {

  connectedCallback() {
    // si esto tiene una identificacion, estamos editando. Si es null, estamos creando
    this.identificacionEditando = null;

    this.innerHTML = `
      <h1 class="titulo-pagina">Gestión de usuarios</h1>
      <p class="subtitulo">Registra y administra quién puede entrar a la plataforma</p>

      <section class="tarjeta">
        <h2 id="tituloFormulario">Nuevo usuario</h2>
        <br>
        <form id="formUsuario" novalidate>
          <div class="formulario-grid">
            <div class="campo">
              <label for="identificacion">Número de identificación</label>
              <input type="text" id="identificacion" placeholder="1234567890">
            </div>
            <div class="campo">
              <label for="nombre">Nombre completo</label>
              <input type="text" id="nombre" placeholder="Ana Pérez">
            </div>
            <div class="campo">
              <label for="correoUsuario">Correo electrónico</label>
              <input type="email" id="correoUsuario" placeholder="ana@acme.com">
            </div>
            <div class="campo">
              <label for="telefono">Teléfono</label>
              <input type="text" id="telefono" placeholder="3001234567">
            </div>
            <div class="campo">
              <label for="cargo">Cargo</label>
              <select id="cargo">
                <option value="">Selecciona un cargo</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Docente">Docente</option>
              </select>
            </div>
            <div class="campo">
              <label for="contrasenaUsuario">Contraseña</label>
              <input type="password" id="contrasenaUsuario" placeholder="Mínimo 4 caracteres">
            </div>
          </div>

          <p class="mensaje-error" id="errorUsuario"></p>
          <p class="mensaje-exito" id="exitoUsuario"></p>

          <div class="botones-formulario">
            <button type="submit" class="boton" id="botonGuardar">Guardar usuario</button>
            <button type="button" class="boton boton--secundario" id="botonCancelar">Cancelar</button>
          </div>
        </form>
      </section>

      <section class="tarjeta">
        <h2>Usuarios registrados</h2>
        <br>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Cargo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="cuerpoTabla"></tbody>
          </table>
        </div>
      </section>
    `;

    this.querySelector("#formUsuario").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.guardarUsuario();
    });

    this.querySelector("#botonCancelar").addEventListener("click", () => {
      this.limpiarFormulario();
    });

    // en vez de ponerle un evento a cada boton, escuchamos clics en toda la tabla
    // y miramos que boton fue (esto se llama delegacion de eventos)
    this.querySelector("#cuerpoTabla").addEventListener("click", (evento) => {
      // evento.target es el elemento exacto donde se hizo clic.
      // dataset.id lee el atributo data-id que le pusimos a cada boton en pintarTabla
      const boton = evento.target;
      const identificacion = boton.dataset.id;

      if (boton.classList.contains("boton-editar")) {
        this.cargarEnFormulario(identificacion);
      }
      if (boton.classList.contains("boton-eliminar")) {
        this.eliminarUsuario(identificacion);
      }
    });

    this.pintarTabla();
  }

  // borra la tabla y la vuelve a armar con lo que haya en LocalStorage.
  // La llamamos cada vez que se crea, edita o borra algo, asi siempre esta al dia
  pintarTabla() {
    const usuarios = leerDatos("usuarios");
    const cuerpoTabla = this.querySelector("#cuerpoTabla");

    if (usuarios.length === 0) {
      cuerpoTabla.innerHTML = `<tr><td colspan="6">No hay usuarios registrados.</td></tr>`;
      return;
    }

    // map convierte cada usuario en una fila de texto y join las une todas
    cuerpoTabla.innerHTML = usuarios.map((usuario) => `
      <tr>
        <td>${usuario.identificacion}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.telefono}</td>
        <td><span class="etiqueta">${usuario.cargo}</span></td>
        <td class="acciones">
          <button class="boton boton--pequeno boton-editar" data-id="${usuario.identificacion}">Editar</button>
          <button class="boton boton--pequeno boton--peligro boton-eliminar" data-id="${usuario.identificacion}">Eliminar</button>
        </td>
      </tr>
    `).join("");
  }

  guardarUsuario() {
    // armamos un objeto con lo que escribieron en el formulario.
    // El correo lo pasamos a minuscula pa que "Ana@acme.com" y "ana@acme.com" sean el mismo
    const usuario = {
      identificacion: this.querySelector("#identificacion").value.trim(),
      nombre: this.querySelector("#nombre").value.trim(),
      correo: this.querySelector("#correoUsuario").value.trim().toLowerCase(),
      telefono: this.querySelector("#telefono").value.trim(),
      cargo: this.querySelector("#cargo").value,
      contrasena: this.querySelector("#contrasenaUsuario").value.trim(),
    };

    const mensajeError = this.querySelector("#errorUsuario");
    const mensajeExito = this.querySelector("#exitoUsuario");
    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    const error = this.validarUsuario(usuario);
    if (error) {
      mensajeError.textContent = error;
      return;
    }

    const usuarios = leerDatos("usuarios");

    // si no estamos editando, es un usuario nuevo: lo agregamos al final con push
    if (this.identificacionEditando === null) {
      usuarios.push(usuario);
      mensajeExito.textContent = "Usuario creado correctamente.";
    } else {
      // buscamos la posicion del usuario y lo reemplazamos por el nuevo
      const posicion = usuarios.findIndex((u) => u.identificacion === this.identificacionEditando);
      const correoViejo = usuarios[posicion].correo;
      usuarios[posicion] = usuario;
      mensajeExito.textContent = "Usuario actualizado correctamente.";

      // si se edito a si mismo, guardamos y rehacemos la sesion con los datos nuevos
      if (correoViejo === obtenerUsuarioActual().correo) {
        guardarDatos("usuarios", usuarios);
        iniciarSesion(usuario.correo, usuario.contrasena);
      }
    }

    guardarDatos("usuarios", usuarios);
    this.limpiarFormulario(false);
    this.pintarTabla();
  }

  // devuelve el texto del error, o "" si todo esta bien
  validarUsuario(usuario) {
    if (!usuario.identificacion || !usuario.nombre || !usuario.correo ||
        !usuario.telefono || !usuario.cargo || !usuario.contrasena) {
      return "Por favor llena todos los campos.";
    }

    // ^\d+$ significa: de principio a fin, solo numeros (\d es un digito)
    if (!/^\d+$/.test(usuario.identificacion)) {
      return "La identificación solo puede tener números.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correo)) {
      return "El correo no tiene un formato válido.";
    }

    // \d{7,10} = entre 7 y 10 numeros
    if (!/^\d{7,10}$/.test(usuario.telefono)) {
      return "El teléfono debe tener entre 7 y 10 números.";
    }

    if (usuario.contrasena.length < 4) {
      return "La contraseña debe tener mínimo 4 caracteres.";
    }

    // revisamos que no se repitan, pero sin contarse a si mismo cuando editamos
    const otrosUsuarios = leerDatos("usuarios").filter(
      (u) => u.identificacion !== this.identificacionEditando
    );

    // some devuelve true si AL MENOS UNO cumple la condicion
    if (otrosUsuarios.some((u) => u.identificacion === usuario.identificacion)) {
      return "Ya existe un usuario con esa identificación.";
    }
    if (otrosUsuarios.some((u) => u.correo === usuario.correo)) {
      return "Ya existe un usuario con ese correo.";
    }

    return "";
  }

  cargarEnFormulario(identificacion) {
    const usuario = leerDatos("usuarios").find((u) => u.identificacion === identificacion);

    this.querySelector("#identificacion").value = usuario.identificacion;
    this.querySelector("#nombre").value = usuario.nombre;
    this.querySelector("#correoUsuario").value = usuario.correo;
    this.querySelector("#telefono").value = usuario.telefono;
    this.querySelector("#cargo").value = usuario.cargo;
    this.querySelector("#contrasenaUsuario").value = usuario.contrasena;

    // la identificacion es como la "llave" del usuario, no dejamos cambiarla
    this.querySelector("#identificacion").disabled = true;

    this.identificacionEditando = identificacion;
    this.querySelector("#tituloFormulario").textContent = "Editar usuario";
    this.querySelector("#botonGuardar").textContent = "Actualizar usuario";

    // subimos al formulario pa que se vea que cambio
    this.scrollIntoView({ behavior: "smooth" });
  }

  eliminarUsuario(identificacion) {
    const usuarios = leerDatos("usuarios");
    const usuario = usuarios.find((u) => u.identificacion === identificacion);
    const usuarioActual = obtenerUsuarioActual();

    // no dejamos que se borre a si mismo, si no se queda por fuera
    if (usuario.correo === usuarioActual.correo) {
      alert("No puedes eliminar el usuario con el que iniciaste sesión.");
      return;
    }

    // confirm muestra una ventanita con Aceptar/Cancelar y devuelve true o false
    if (!confirm(`¿Seguro que quieres eliminar a ${usuario.nombre}?`)) {
      return;
    }

    // filter deja todos menos el que queremos borrar
    const usuariosRestantes = usuarios.filter((u) => u.identificacion !== identificacion);
    guardarDatos("usuarios", usuariosRestantes);
    this.pintarTabla();

    // si justo estabamos editando ese usuario, limpiamos el form
    if (this.identificacionEditando === identificacion) {
      this.limpiarFormulario();
    }
  }

  // borrarMensajes en false sirve pa que no se borre el "creado correctamente"
  limpiarFormulario(borrarMensajes = true) {
    // reset() vacia todos los campos del form de una
    this.querySelector("#formUsuario").reset();
    this.querySelector("#identificacion").disabled = false;
    this.identificacionEditando = null;
    this.querySelector("#tituloFormulario").textContent = "Nuevo usuario";
    this.querySelector("#botonGuardar").textContent = "Guardar usuario";

    if (borrarMensajes) {
      this.querySelector("#errorUsuario").textContent = "";
      this.querySelector("#exitoUsuario").textContent = "";
    }
  }
}

customElements.define("gestion-usuarios", GestionUsuarios);
