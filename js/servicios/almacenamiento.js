// Todo lo que tenga que ver con LocalStorage pasa por aca.
// LocalStorage solo guarda texto, por eso convertimos a JSON y de vuelta.
// La idea es que ningun otro archivo toque localStorage directo para leer o guardar listas,
// asi si algun dia cambiamos la forma de guardar, solo se cambia este archivo

// "export" deja usar la funcion desde otros archivos con import
export function leerDatos(clave) {
  // getItem devuelve el texto guardado, o null si esa clave no existe
  const texto = localStorage.getItem(clave);

  // si hay texto lo convertimos en arreglo con JSON.parse,
  // si no hay nada devolvemos un arreglo vacio pa que no se rompa nada
  return texto ? JSON.parse(texto) : [];
}

export function guardarDatos(clave, datos) {
  // JSON.stringify convierte el arreglo de objetos en texto pa poder guardarlo
  localStorage.setItem(clave, JSON.stringify(datos));
}

// La primera vez no hay usuarios y nadie podria entrar,
// entonces creamos un admin de prueba
export function crearAdminPorDefecto() {
  const usuarios = leerDatos("usuarios");

  // solo lo creamos si la lista esta vacia, si ya hay usuarios no hacemos nada
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
