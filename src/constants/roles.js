export const ROLES = {
  INVITADO: 0,
  ADMINISTRADOR: 1,
  ORGANIZADOR: 2,
  JUGADOR: 3,
  ENTRENADOR: 5,
  VEEDOR: 8,
  SUPERADMINISTRADOR: 11,
};

/*
Aquí definimos los roles que tienen acceso a todas las funcionalidades del aplicativo,
es decir, todas las funcionalidades que son generales. Por ejemplo: Editar perfil,
cambiar contraseña, etc.
*/
export const ROLES_AUTENTICADOS = [
  ROLES.ADMINISTRADOR,
  ROLES.ENTRENADOR,
  ROLES.ORGANIZADOR,
  ROLES.JUGADOR,
  ROLES.VEEDOR,
  ROLES.SUPERADMINISTRADOR,
];