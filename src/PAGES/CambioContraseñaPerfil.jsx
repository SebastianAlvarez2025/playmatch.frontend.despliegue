import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/estilosPages/cambioContraseñaPerfil.css";
import { validarPassword } from "../utils/validaciones";

export default function CambioContraseñaPerfil(){ 

    const navigate = useNavigate();

    const { user, token } = useContext(AuthContext);

    const API = import.meta.env.VITE_API_URL;

    const [passwordActual, setPasswordActual] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
    const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false)

    const requisitos = validarPassword(password);

    const validacionContraseña =
    requisitos.longitud &&
    requisitos.especial &&
    requisitos.minuscula &&
    requisitos.mayuscula &&
    requisitos.numero;

    const cambiarPassword = async (e) => {
        e.preventDefault();
        setError("")
        setMensaje("")

        if (!passwordActual) {
            setError("Ingresa tu contraseña actual.");
            return;
        }

        if (!validacionContraseña){
            setError("La contraseña no cumple los requisitos de seguridad.");
            return;
        }

        if (password !== confirmarPassword){
            setError("Las contraseñas no coinciden.")
            return;
        }

        if (passwordActual === password){
            setError("La nueva contraseña debe ser diferente a la actual.");
            return;
        }

        try{
            const response = await fetch(`${API}/usuarios/cambiar-password-perfil`,{
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_usuario: user.id_usuario,
                    passwordActual,
                    nuevaPassword: password,
                })
            });

            const data = await response.json();

            if(!response.ok){
                setError(data.message);
                return;
            }

            setMensaje("Contraseña actualizada correctamente.");

            setPasswordActual("");
            setPassword("");
            setConfirmarPassword("");
            setMostrarRequisitos(false);

            setTimeout(() => {
                navigate("/home");
            }, 1500)

        }catch(error){

            console.error(error);

            setError(
                "Ocurrió un error al conectarse con el servidor."
            );

        }
    };

    return(
        <div className="cambio-password-page">
            <div className="cambio-password-card">
                <h2>Restablecer contraseña</h2>

                <p className="subtitulo">
                    Cambia la contraseña de tu cuenta.
                </p>

                <form onSubmit={cambiarPassword}>

                    <div className="campo-password">

                        <label htmlFor="passwordActual">
                            Contraseña actual
                        </label>

                        <div className="password-input-container">
                            <input
                                id="password-actual"
                                type={mostrarPasswordActual ? "text" : "password"}
                                value={passwordActual}
                                onChange={(e) => setPasswordActual(e.target.value)}
                                placeholder="Ingresa tu actual contraseña."
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setMostrarPasswordActual(!mostrarPasswordActual)}
                            >
                                {mostrarPasswordActual ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                    </div>

                    <div className="campo-password password-field">

                        <label htmlFor="password">
                            Nueva contraseña
                        </label>

                        <div className="password-input-container">

                            <input
                                id="password"
                                type={mostrarPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setMostrarRequisitos(true)}
                                onBlur={() => setMostrarRequisitos(false)}
                                placeholder="Ingresa tu nueva contraseña"
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>

                        </div>

                        {mostrarRequisitos && (
                            <div className="password-card">

                                <h4>La contraseña debe contener:</h4>

                                <p className={requisitos.longitud ? "ok" : "bad"}>
                                    {requisitos.longitud ? "✔" : "✖"} Entre 8 y 16 caracteres
                                </p>

                                <p className={requisitos.mayuscula ? "ok" : "bad"}>
                                    {requisitos.mayuscula ? "✔" : "✖"} Una letra mayúscula
                                </p>

                                <p className={requisitos.minuscula ? "ok" : "bad"}>
                                    {requisitos.minuscula ? "✔" : "✖"} Una letra minúscula
                                </p>

                                <p className={requisitos.numero ? "ok" : "bad"}>
                                    {requisitos.numero ? "✔" : "✖"} Un número
                                </p>

                                <p className={requisitos.especial ? "ok" : "bad"}>
                                    {requisitos.especial ? "✔" : "✖"} Un carácter especial
                                </p>

                            </div>
                        )}

                    </div>

                    <div className="campo-password">

                        <label htmlFor="confirmarPassword">
                            Confirmar contraseña
                        </label>

                        <div className="password-input-container">
                            <input
                                id="confirmarPassword"
                                type={mostrarConfirmarPassword ? "text" : "password"}
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                placeholder="Repite tu nueva contraseña"
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                            >
                                {mostrarConfirmarPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                    </div>

                    {error && (
                        <p className="mensaje-error">
                            {error}
                        </p>
                    )}

                    {mensaje && (
                        <p className="mensaje-exito">
                            {mensaje}
                        </p>
                    )}

                    <button type="submit" className="btn-cambiar-password">
                        Cambiar contraseña
                    </button>

                    <button type="button" className="btn-volver" onClick={() => navigate("/home")}>
                        Volver
                    </button>
                </form>
            </div>
        </div>
    );





}