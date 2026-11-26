// Aca manejamos la sesion: entrar, salir y saber quien esta logueado.
// La "sesion" no es mas que un objeto guardado en LocalStorage con la clave "sesion":
// si existe, hay alguien logueado. Si no existe, nadie ha iniciado sesion
import { leerDatos } from "./almacenamiento.js";

// devuelve true si el correo y la contrasena coinciden con algun usuario
export function iniciarSesion(correo, contrasena) {
  const usuarios = leerDatos("usuarios");

  // find recorre la lista y devuelve el PRIMER usuario que cumpla la condicion,
  // si ninguno cumple devuelve undefined
  const usuarioEncontrado = usuarios.find(
    (usuario) => usuario.correo === correo && usuario.contrasena === contrasena
  );

  if (!usuarioEncontrado) {
    return false;
  }

  // guardamos solo lo necesario, la contrasena no hace falta en la sesion
  const sesion = {
    nombre: usuarioEncontrado.nombre,
    correo: usuarioEncontrado.correo,
    cargo: usuarioEncontrado.cargo,
  };
  localStorage.setItem("sesion", JSON.stringify(sesion));
  return true;
}

// cerrar sesion es tan facil como borrar esa clave
export function cerrarSesion() {
  localStorage.removeItem("sesion");
}

// devuelve el usuario logueado o null si no hay nadie.
// Lo usamos en principal.js pa proteger las rutas y en la barra pa mostrar el nombre
export function obtenerUsuarioActual() {
  const texto = localStorage.getItem("sesion");
  return texto ? JSON.parse(texto) : null;
}
