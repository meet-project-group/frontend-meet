import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import "../styles/deleteaccount.sass";
import Menu from "../components/menu";

/**
 * DeleteAccount Component
 * 
 * This page allows the authenticated user to permanently delete their account.
 * It handles:
 * - Opening/closing the side menu
 * - A two-step confirmation process
 * - Asking the user for their password
 * - Calling the deleteAccount() function from the authentication provider
 */
export default function DeleteAccount() {
  // Controls the visibility of the side menu
  const [openMenu, setOpenMenu] = useState(false);

  // Indicates whether the user has entered the confirmation step
  const [confirm, setConfirm] = useState(false);

  // Stores the password typed by the user for re-authentication
  const [password, setPassword] = useState("");

  // Controls loading state during account deletion
  const [loading, setLoading] = useState(false);

  // deleteAccount() is provided by AuthProvider (Firebase re-auth + delete)
  const { deleteAccount } = useAuth();

  // For redirecting after deleting the account
  const navigate = useNavigate();

  /**
   * Handles the entire account deletion process:
   * 1. Validates password
   * 2. Shows a confirmation dialog
   * 3. Calls deleteAccount(password)
   * 4. Redirects the user back to login
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
      await deleteAccount(password); // Firebase delete action
      alert("Cuenta eliminada exitosamente.");
      navigate("/login"); // Redirect after deletion
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
          {/* Button that toggles the side menu */}
          <button
            className="btn-menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
          >
            ☰
          </button>

          {/* Slide-out menu */}
          <Menu open={openMenu} setOpen={setOpenMenu} />

          {/* App logo */}
          <img
            src="/images/uvmeet-removebg-preview.png"
            alt="UVMeet Logo"
            className="logo"
          />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="edit-profile-container">
        <div className="delete-card">
          {/* First step: ask if the user wants to delete the account */}
          {!confirm ? (
            <>
              <h2 className="delete-title">¿DESEA ELIMINAR ESTA CUENTA?</h2>

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
              {/* Second step: ask for the user's password */}
              <p className="delete-confirm-text">
                Esta acción es permanente.  
                <br />Ingrese su contraseña para confirmar:
              </p>

              {/* Password input */}
              <input
                type="password"
                className="delete-password-input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Confirm or cancel actions */}
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

        {/* Footer links */}
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


