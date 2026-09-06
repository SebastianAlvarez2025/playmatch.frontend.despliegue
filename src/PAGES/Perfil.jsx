import "../styles/estilosPages/perfil.css";
import avatar from "../ASSETS/avatar.png";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPerfil, actualizarPerfil } from "../services/perfilService";
import { validarCorreo, validarTelefono } from "../utils/validaciones";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
    const { user, token, actualizarUsuario } = useContext(AuthContext);
    const [perfil, setPerfil] = useState(null);
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({});
    const [errores, setErrores] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const guardarCambios = async () => {

        const nuevosErrores = {};

        if (!validarCorreo(formData.email)) {
            nuevosErrores.email = "Correo electrónico inválido.";
        }

        if (!validarTelefono(formData.telefono)) {
            nuevosErrores.telefono = "El teléfono debe iniciar por 3 y tener 10 dígitos.";
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        setErrores({});

        if (formData.email !== perfil.email) {
            const confirmacion = window.confirm("¿Estás seguro de que deseas cambiar tu correo electrónico? Esto podría afectar tu acceso a la cuenta.");
            if (!confirmacion) {
                return;
            }
        }
        try {

            if (formData.email !== perfil.email) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/solicitar-cambio-correo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        id_usuario: user.id_usuario,
                        nuevoEmail: formData.email
                    })
                });

                const data = await response.json();
            
                if (!response.ok) {
                    setErrores({ email: data.message});
                    return;
                }

                navigate("/perfil/codigo-cambio-correo", { state: { datosPerfil: formData, nuevoEmail: formData.email } });

                return;
            }

            await actualizarPerfil({
                ...formData,
                id_usuario: user.id_usuario
            });

            setPerfil(formData);

            actualizarUsuario({
                nombre_usuario:formData.nombre_usuario,
                apellido_usuario: formData.apellido_usuario
            });

            setEditando(false);

            alert("Usuario actualizado.")

        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
        }
    };

    const capitalizar = (texto) => {
        if (!texto) return "";
        return texto.toLowerCase().split(" ").map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(" ");
    };

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const data = await getPerfil(user.id_usuario);
                setPerfil(data);
                setFormData(data);
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
            }
        };
        
        if (user){
            cargarPerfil();
        }
    }, [user]);

    if (!perfil) {
        return <h2>Cargando perfil...</h2>;
    }

    return (
        <div className="perfil-container">

            <div className="perfil-card">

                <div className="perfil-header">

                    <img
                        src={avatar}
                        alt="Foto perfil"
                        className="perfil-foto"
                    />

                    <div className="perfil-header-info">

                        <h2 className="perfil-nombre">
                            {capitalizar(perfil.nombre_usuario)} {capitalizar(perfil.apellido_usuario)}
                        </h2>

                        <span className="perfil-rol">
                            {perfil.rol}
                        </span>
                    </div>
                </div>

                <div className="perfil-info">

                    <h3>Información personal</h3>

                    <div className="perfil-grid">

                        <div className="info-item">
                            <span className="info-label">Tipo de identificación:</span>
                            <span className="info-value">{perfil.tipo_documento}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Identificación:</span>
                            <span className="info-value">{perfil.id_usuario}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Nombre:</span>
                            { editando ? (
                                <input
                                    id="nombre"
                                    type="text"
                                    name="nombre_usuario"
                                    value={formData.nombre_usuario || ""}
                                    onChange={handleChange}
                                    className="perfil-input"
                                />
                            ) : (
                                <span className="info-value">{capitalizar(perfil.nombre_usuario)}</span>
                            )}
                        </div>

                        <div className="info-item">
                            <span className="info-label">Apellido:</span>
                            { editando ? (
                                <input
                                    id="apellido"
                                    type="text"
                                    name="apellido_usuario"
                                    value={formData.apellido_usuario || ""}
                                    onChange={handleChange}
                                    className="perfil-input"
                                />
                            ) : (
                                <span className="info-value">{capitalizar(perfil.apellido_usuario)}</span>
                            )}
                        </div>

                        <div className="info-item">
                            <span className="info-label">Teléfono:</span>
                            { editando ? (
                                <>
                                    <input
                                        id="telefono"
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono || ""}
                                        onChange={handleChange}
                                        className="perfil-input"
                                    />
                                    {errores.telefono && (
                                        <p className="perfil-error">{errores.telefono}</p>
                                    )}
                                </>
                            ) : (
                                <span className="info-value">{perfil.telefono}</span>
                            )}
                        </div>

                        <div className="info-item">
                            <span className="info-label">Correo electrónico:</span>
                            { editando ? (
                                <>
                                    <input
                                        id="correo"
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        className="perfil-input"
                                    />
                                    {errores.email && (
                                        <p className="perfil-error">{errores.email}</p>
                                    )}
                                </>
                            ) : (
                                <span className="info-value">{perfil.email}</span>
                            )}
                        </div> 
                            
                        <div className="info-item">
                            <span className="info-label">Fecha de nacimiento:</span>
                            <span className="info-value">{new Date(perfil.fecha_nacimiento).toLocaleDateString("es-CO")}</span>
                        </div>
                        
                        <div className="info-item">
                            <span className="info-label">Rol:</span>
                            <span className="info-value">{perfil.rol}</span>
                        </div>
                    </div>

                    { !editando ? (
                        <button className="editar-btn"
                            onClick={() => setEditando(true)}
                        >
                            Editar perfil
                        </button>
                    ) : (
                        <div className="acciones-perfil">
                            <button className="guardar-btn"
                                onClick={guardarCambios}
                            >
                                Guardar cambios
                            </button>
                            <button className="cancelar-btn"
                                onClick={() => {
                                    setFormData(perfil); 
                                    setEditando(false);
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
