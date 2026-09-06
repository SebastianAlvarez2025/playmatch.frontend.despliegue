export const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

export const validarTelefono = (telefono) => {
    return /^3\d{9}$/.test(telefono);
};

export const validarPassword = (password) => {
    return {
        longitud: password.length >= 8 && password.length <= 16,
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero: /\d/.test(password),
        especial: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=`~]/.test(password),
    };
};