    import { useLocation, useNavigate } from "react-router-dom";
    import { useState, useEffect, useRef } from "react";
    import "../../styles/estilosPages/autenticacion/codigoRecuperacion.css";

    export default function CodigoRecuperacion(){
        const navigate = useNavigate();
        const [mensaje, setMensaje] = useState("");
        const [tipoMensaje, setTipoMensaje] = useState("");
        const location = useLocation();

        const API = import.meta.env.VITE_API_URL;

        const email = location.state?.email;

        const [codigo, setCodigo] = useState(Array(6).fill(""));
        const inputsRef = useRef([]);
        
        useEffect(() => {
            if (!email){
                navigate("/recuperar-password");
            }
        }, [email, navigate]);

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

        const verificarCodigo = async () => {
            const codigoCompleto  = codigo.join("");

            if(codigoCompleto.length !== 6){
                setMensaje("Ingrese los 6 dígitos del código");
                setTipoMensaje("error");
                return;
            }

            try{
                const response = await fetch (`${API}/auth/verificar-recuperacion`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        codigo: codigoCompleto,
                    }),
                });

                const data = await response.json();

                if(data.success){
                    setMensaje("Código verificado correctamente.");
                    setTipoMensaje("success");
                    setTimeout(() => { 
                        navigate("/restablecer-password",{
                            state: {
                                email,
                                codigo: codigoCompleto
                            }
                        })
                    }, 1200);
                } else {
                    setMensaje(data.message);
                    setTipoMensaje("error");
                }
            } catch (error) {
                console.error(error);
                setMensaje("No fue posible conectar con el servidor.");
                setTipoMensaje("error");
            }
        };

        return (
            <div className="codigo-pagina">
                <div className="codigo-card">

                    <h2>Verificar correo</h2>

                        <p className="subtitulo">Hemos enviado un correo a: {email}</p>

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
                    
                        </div>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                {mensaje}
                            </div>
                        )}

                        <button className="btn-verificar"
                            onClick={verificarCodigo}>
                            Verificar
                        </button>

                        <button className="btn-volver"
                            onClick={() => navigate("/recuperar-password")}
                        >
                            Volver
                        </button>
                    </div>  
            </div>
        );
    }