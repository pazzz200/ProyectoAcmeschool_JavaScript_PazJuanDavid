// Todo lo que tenga que ver con LocalStorage pasa por aca.
// LocalStorage solo guarda texto, por eso convertimos a JSON y de vuelta

export function leerDatos(clave) {
  const texto = localStorage.getItem(clave);
  // si no hay nada guardado devolvemos un arreglo vacio
  return texto ? JSON.parse(texto) : [];
}

export function guardarDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

// La primera vez no hay usuarios y nadie podria entrar,
// entonces creamos un admin de prueba
export function crearAdminPorDefecto() {
  const usuarios = leerDatos("usuarios");

  if (usuarios.length === 0) {
    usuarios.push({
      identificacion: "1000",
      nombre: "Administrador Acme",
      correo: "admin@acme.com",
      telefono: "3000000000",
      cargo: "Administrativo",
      contrasena: "admin123",
    });
    guardarDatos("usuarios", usuarios);
  }
}
