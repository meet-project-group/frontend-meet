import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import "../styles/deleteaccount.sass";
import Menu from "../components/menu";

/**
 * Componente para eliminar la cuenta del usuario.
 * Permite mostrar un menú lateral, solicitar confirmación
 * e ingresar la contraseña para validar la eliminación.
 */
export default function DeleteAccount() {
  // Estado para abrir/cerrar el menú lateral
  const [openMenu, setOpenMenu] = useState(false);

  // Estado que controla si el usuario ya pidió eliminar la cuenta (pantalla de confirmación)
  const [confirm, setConfirm] = useState(false);

  // Contraseña ingresada por el usuario para validar la eliminación
  const [password, setPassword] = useState("");

  // Muestra el estado de carga mientras se elimina la cuenta
  const [loading, setLoading] = useState(false);

  // Obtiene la función deleteAccount desde el AuthProvider
  const { deleteAccount } = useAuth();

  // Hook para navegar entre rutas
  const navigate = useNavigate();

  /**
   * Maneja todo el proceso de eliminación:
   * - Verifica que haya contraseña
   * - Pide confirmación al usuario
   * - Llama a deleteAccount() del AuthProvider
   */
  const handleDelete = async () => {
    if (!password || password.length < 6) {
      alert("Debe ingresar su contraseña antes de continuar.");
      return;
    }

    const yes = window.confirm(
      "¿Seguro que desea eliminar su cuenta? Esta acción es permanente y no se puede deshacer."
    );

    if (!yes) return;

    setLoading(true);

    try {
      await deleteAccount(password);
      alert("Cuenta eliminada exitosamente.");
      navigate("/login"); // Redirige tras borrar la cuenta
    } catch (err: any) {
      alert(err.message || "Error al eliminar la cuenta.");
    }

    setLoading(false);
  };

  return (
    <div className="deleteaccount-page">
      {/* HEADER */}
      <header className="delete-header">
        <div className="header-left">
          {/* Botón que abre el menú lateral */}
          <button
            className="btn-menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
          >
            ☰
          </button>

          {/* Menú lateral */}
          <Menu open={openMenu} setOpen={setOpenMenu} />

          {/* Logo de UVMeet */}
          <img
            src="/images/uvmeet-removebg-preview.png"
            alt="UVMeet Logo"
            className="logo"
          />
        </div>
      </header>

      {/* MAIN */}
      <div className="edit-profile-container">
        <div className="delete-card">
          {/* Si aún no se pidió confirmación */}
          {!confirm ? (
            <>
              <h2 className="delete-title">¿DESEA ELIMINAR ESTA CUENTA?</h2>

              {/* Botón que cambia al estado de confirmación */}
              <button
                className="btn-delete-main"
                onClick={() => setConfirm(true)}
                disabled={loading}
              >
                Eliminar cuenta
              </button>
            </>
          ) : (
            <>
              {/* Texto de advertencia + solicitud de contraseña */}
              <p className="delete-confirm-text">
                Esta acción es permanente.  
                <br />Ingrese su contraseña para confirmar:
              </p>

              {/* Input de contraseña */}
              <input
                type="password"
                className="delete-password-input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Botones de confirmar o cancelar */}
              <div className="delete-confirm-buttons">
                <button
                  className="btn-confirm-delete"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </button>

                <button
                  className="btn-confirm-cancel"
                  onClick={() => setConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-divider"></div>
        <h3>Mapa del sitio</h3>

        {/* Enlaces del footer */}
        <div className="footer-columns">
          <div>
            <p><strong>ACCESO</strong></p>
            <p>Iniciar Sesión</p>
            <p>Crear cuenta</p>
            <p>Recuperar contraseña</p>
          </div>

          <div>
            <p><strong>CUENTA Y SOPORTE</strong></p>
            <p>Editar perfil</p>
            <p>Sobre nosotros</p>
            <p>Contacto</p>
          </div>

          <div>
            <p><strong>NAVEGACIÓN</strong></p>
            <p>Inicio</p>
            <p>Sobre nosotros</p>
            <p>Reuniones</p>
          </div>

          <div>
            <p><strong>CONTACTO</strong></p>
            <p>uvmeet@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

