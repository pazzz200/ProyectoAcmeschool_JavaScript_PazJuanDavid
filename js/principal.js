// principal.js
// Punto de entrada de la aplicación: es el primer JS que se ejecuta.

// Buscamos el contenedor principal del HTML
const contenedorApp = document.getElementById("app");

// Mostramos un mensaje para comprobar que el JS está conectado
contenedorApp.innerHTML = `
  <h1>Acme School</h1>
  <p>¡El proyecto está funcionando! 🎉</p>
`;

// Mensaje en la consola del navegador (F12 → pestaña Console)
console.log("principal.js cargado correctamente");
