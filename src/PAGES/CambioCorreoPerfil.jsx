import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../styles/estilosPages/autenticacion/codigoRegistro.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { actualizarPerfil } from "../services/perfilService";

export default function CambioCorreoPerfil(){
    const { user, actualizarUsuario } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const location = useLocation();
    const [error, setError] = useState("");

    const API = import.meta.env.VITE_API_URL;

    const nuevoEmail = location.state?.nuevoEmail;
    const datosPerfil = location.state?.datosPerfil;

    const [codigo, setCodigo] = useState(Array(6).fill(""));
    const inputsRef = useRef([]);
    
    useEffect(() => {
        if (!nuevoEmail){
            navigate("/perfil");
        }
    }, [nuevoEmail, navigate]);

    const handleChange = (e, index) => {
        const value = e.target.value;

        if(!/^\d?$/.test(value)) return;

        const nuevoCodigo = [...codigo];
        nuevoCodigo[index] = value;
        setCodigo(nuevoCodigo);

        if(value && index < 5){
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !codigo[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handlePaste = (e) =>{
        e.preventDefault();

        const texto = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6)

        if(!texto) return;

        const nuevoCodigo = Array(6).fill("");

        texto.split("").forEach((num, i) => {
            nuevoCodigo[i]= num;
        });

        setCodigo(nuevoCodigo);

        const ultimo = Math.min(texto.length - 1, 5);
        
        inputsRef.current[ultimo]?.focus(); 
    }

    const handleVerificar = async () => {
         try {
            const response = await fetch(
            `${API}/usuarios/verificar-cambio-correo`,

            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nuevoEmail,
                    codigo: codigo.join("")
                })
            }
        );

        const data = await response.json();

        if (!response.ok){
            setError(data.message);
            return;
        }

        await actualizarPerfil({
            ...datosPerfil,
            id_usuario: user.id_usuario
        });

        actualizarUsuario({
            nombre_usuario: datosPerfil.nombre_usuario,
            apellido_usuario: datosPerfil.apellido_usuario,
            email: nuevoEmail
        });

        setMensaje("Perfil actualizado correctamente.");
        setTipoMensaje("success");

        setTimeout(() => {
            navigate("/perfil");
        }, 1200);


    } catch (error){
        console.error(error);
        setError("Ocurrio un error inesperado.");
    }
};

    return (
        <div className="codigo-page">
            <div className="codigo-card">

                <h2>Verificar correo</h2>

                    <p className="subtitulo">Hemos enviado un correo a: {nuevoEmail}</p>

                    <div className="codigo-container" onPaste={handlePaste}>

                        {codigo.map((numero, index) => (

                            <input
                                key={index}
                                ref={(el) => (inputsRef.current[index] = el)}
                                className="codigo-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={numero}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />

                        ))}

                        {error && (
                            <p className="mensaje-error">
                                {error}
                            </p>
                        )}
                                        
                    </div>

                    {mensaje && (
                        <div className={`mensaje ${tipoMensaje}`}>
                            {mensaje}
                        </div>
                    )}

                    <button className="btn-verificar"
                        onClick={handleVerificar}>
                        Verificar
                    </button>

                    <button className="btn-volver"
                        onClick={() => navigate("/perfil")}
                    >
                        Volver al perfil
                    </button>
                </div>  
        </div>
    );
}
