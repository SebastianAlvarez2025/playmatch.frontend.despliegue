import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/estilosPages/autenticacion/restablecerPassword.css";
import { validarPassword } from "../../utils/validaciones";

export default function RestablecerPassword(){ 

    const navigate = useNavigate();
    const location = useLocation();

    const API = import.meta.env.VITE_API_URL;

    const email = location.state?.email;
    const codigo = location.state?.codigo;

    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    const [ error, setError ] = useState("");
    const [ mensaje, setMensaje ] = useState("");

    const [mostrarRequisitos, setMostrarRequisitos] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false)

    useEffect(() => {
        if (!email || !codigo){
            navigate("/recuperar-password");
        }
    }, [email, codigo, navigate]);

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

        if (!validacionContraseña){
            setError("La contraseña no cumple los requisitos de seguridad.");
            return;
        }

        if (password !== confirmarPassword){
            setError("Las contraseñas no coinciden.")
            return;
        }

        try{
            const response = await fetch(`${API}/auth/cambiar-password`,{
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    email,
                    codigo,
                    password
                })
            });

            const data = await response.json();

            if(!response.ok){
                setError(data.message);
                return;
            }

            setMensaje("Contraseña actualizada correctamente.");

            setTimeout(() => {
                navigate("/login");
            }, 1500)

        }catch(error){

            console.error(error);

            setError(
                "Ocurrió un error al conectarse con el servidor."
            );

        }
    };

    return(
        <div className="restablecer-page">
            <div className="restablecer-card">
                <h2>Restablecer contraseña</h2>
                <p className="subtitulo">
                    Cambia la contraseña de tu cuenta.
                </p>

                <form onSubmit={cambiarPassword}>
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

                    <button type="submit" className="btn-restablecer">
                        Cambiar contraseña
                    </button>
                </form>
            </div>
        </div>
    );





}