import { useState, type JSX } from "react";
import "../styles/register.sass";
import { useAuth } from "../components/AuthProvider";

export default function Register(): JSX.Element {
  // State for storing user registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Access register function from AuthProvider
  const { register } = useAuth();

  // Handle form submission for user registration
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Validate age is provided
    if (!age) {
      alert("Debes ingresar tu edad");
      return;
    }

    try {
      // Call register function from AuthProvider
      await register({ firstName, lastName, age, email, password });

      // Notify user and redirect after successful registration
      alert("Cuenta creada. Ahora inicia sesión.");
      window.location.href = "/login";
    } catch (err: any) {
      // Display error returned by backend or fallback message
      alert(err.message || "Error al registrar");
    }
  }

  return (
    <div className="register-container">
      {/* Left section with logo and platform message */}
      <div className="register-left">
        <img
          src="/images/uvmeet-removebg-preview.png"
          alt="UVMeet Logo"
          className="register-logo"
        />
        <h2 className="register-text">Tu plataforma de videollamadas favorita</h2>
      </div>

      {/* Registration card with form */}
      <div className="register-card">
        <h2 className="register-title">Crea tu cuenta</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* First Name */}
          <label htmlFor="firstName">Nombre</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          {/* Last Name */}
          <label htmlFor="lastName">Apellido</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          {/* Age */}
          <label htmlFor="age">Edad</label>
          <input
            id="age"
            type="number"
            min="1"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            required
          />

          {/* Email */}
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Confirm Password */}
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Submit button */}
          <button type="submit" className="register-button">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
