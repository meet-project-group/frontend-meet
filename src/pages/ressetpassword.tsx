import { useState, type JSX } from "react";
import { resetPasswordRequest } from "../services/auth.service";
import "../styles/ressetpasword.sass";

export default function RessetPasword(): JSX.Element {
  // State for new password input
  const [password, setPassword] = useState("");
  // State for repeated password input (confirmation)
  const [repeatPassword, setRepeatPassword] = useState("");
  // State to store any error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // State to store success message after updating password
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle form submission for resetting user password
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate that both password fields match
    if (password !== repeatPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    try {
      // Retrieve password reset token from URL query parameters
      const token = new URLSearchParams(window.location.search).get("oobCode");

      if (!token) {
        setErrorMessage("Token no válido");
        return;
      }

      // Make a request to backend to update the password
      const ok = await resetPasswordRequest({ password, token });

      if (!ok) {
        setErrorMessage("No se pudo actualizar la contraseña");
        return;
      }

      // Notify success and redirect after a short delay
      setSuccessMessage("Contraseña actualizada correctamente");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      // Fallback message in case of any error
      setErrorMessage("Error al procesar la solicitud");
    }
  }

  return (
    <div className="reset-bg">
      <div className="reset-card">
        {/* Logo displayed on the reset password page */}
        <img
           src={`${import.meta.env.BASE_URL}images/uvmeet-removebg-preview.png`}
           alt="UVMeet Logo"
           className="reset-logo"
        />

        <h2 className="reset-title">Restablecer contraseña</h2>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="reset-form">
          {/* New password input */}
          <label>Nueva contraseña</label>
          <input
            type="password"
            placeholder="Ingrese su nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Repeat password input */}
          <label>Repita la contraseña</label>
          <input
            type="password"
            placeholder="Repita su nueva contraseña"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />

          {/* Display error message if present */}
          {errorMessage && <p className="reset-error">{errorMessage}</p>}
          {/* Display success message if present */}
          {successMessage && <p className="reset-success">{successMessage}</p>}

          {/* Submit button */}
          <button type="submit" className="reset-button">
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
}
