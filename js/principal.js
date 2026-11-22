// Aca arranca todo. Por ahora solo pintamos una pantalla de bienvenida
const contenedorApp = document.getElementById("app");

contenedorApp.innerHTML = `
  <h1 class="titulo-pagina">Bienvenido a Acme School</h1>
  <p class="subtitulo">Plataforma para crear y presentar exámenes en línea.</p>

  <section class="tarjeta">
    <h2>Botones</h2>
    <br>
    <button class="boton">Principal</button>
    <button class="boton boton--secundario">Secundario</button>
    <button class="boton boton--peligro">Eliminar</button>
  </section>

  <section class="tarjeta">
    <h2>Formulario de ejemplo</h2>
    <br>
    <div class="campo">
      <label for="correoPrueba">Correo</label>
      <input type="email" id="correoPrueba" placeholder="correo@acme.com">
    </div>
    <p class="mensaje-error">Asi se ve un mensaje de error</p>
  </section>

  <section class="tarjeta">
    <h2>Tabla de ejemplo</h2>
    <br>
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr><th>Código</th><th>Título</th><th>Tiempo</th></tr>
        </thead>
        <tbody>
          <tr><td>MAT01</td><td>Matemáticas</td><td>10 min</td></tr>
          <tr><td>ING01</td><td>Inglés</td><td>15 min</td></tr>
        </tbody>
      </table>
    </div>
  </section>
`;
