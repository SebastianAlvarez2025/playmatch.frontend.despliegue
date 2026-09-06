import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/estilosPages/autenticacion/recuperarPassword.css";

export default function RecuperarPassword(){
    const navigate = useNavigate();

    const API = import.meta.env.VITE_API_URL;

    const [ email, setEmail ] = useState("");
    const [ error, setError ] = useState("");
    const [ mensaje, setMensaje ] = useState("");
    const [ cargando, setCargando ] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMensaje("")

        if (!email){
            setError("Ingresa tú correo electrónico.");
            return;
        }

        try {
            setCargando(true);

            const response = await fetch(`${API}/auth/recuperar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            });

            const data = await response.json();

            console.log("RESPUESTA DEL SERVIDOR:", data);
            console.log("STATUS:", response.status);

            if (!response.ok){
                setError(data.message);
                return;
            }

            setMensaje(data.message);

            navigate("/codigo-recuperacion", {
                state: { 
                    email
                }
            });

        }catch(error) {
            console.error(error);
            setError("Ocurrió un error al intentar conectar con el servidor.")
        } finally {
            setCargando(false);
        }
    };

    return(
        <div className="recuperar-container">
            <div className="recuperar-card">
                <h2>Recuperar contraseña</h2>
                <p>
                    Ingresa el correo electrónico asociado a tu cuenta.
                    Te enviaremos un código de verificación para recuperar tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="email">
                        Correo electrónico.
                    </label>

                    <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"/>

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

                    <button 
                    type="submit"
                    disabled={cargando}>
                        {cargando ? "Enviando..." : "Enviar código"}
                    </button>
                </form>

                <button
                type="button"
                onClick={() => navigate("/login")}>
                    Volver al inicio de sesión.
                </button>
            </div>
        </div>
    );

}