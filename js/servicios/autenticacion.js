// Aca manejamos la sesion: entrar, salir y saber quien esta logueado
import { leerDatos } from "./almacenamiento.js";

// devuelve true si el correo y la contrasena coinciden con algun usuario
export function iniciarSesion(correo, contrasena) {
  const usuarios = leerDatos("usuarios");

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

export function cerrarSesion() {
  localStorage.removeItem("sesion");
}

// devuelve el usuario logueado o null si no hay nadie
export function obtenerUsuarioActual() {
  const texto = localStorage.getItem("sesion");
  return texto ? JSON.parse(texto) : null;
}
