import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { loginRequest } from "../services/auth.service";
import { useAuth } from "../components/AuthProvider";
import "../styles/login.sass";

export default function Login() {
  const { setUser, setToken } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =====================================================
      LOGIN CON EMAIL Y CONTRASEÑA
  ====================================================== */
  async function handleSubmit(e: any) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const fbUser = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await fbUser.user.getIdToken();

      const res: any = await loginRequest({
        firebaseToken,
        email: fbUser.user.email!,
        provider: "manual",
      });

      if (!res) throw new Error("El servidor rechazó el login");

      setToken(res.token);
      setUser(res.user);

      nav("/home");
    } catch (error: any) {
      console.error(error);
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
      LOGIN CON GOOGLE
  ====================================================== */
  async function handleGoogleLogin() {
    setErr(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const firebaseToken = await result.user.getIdToken();

      const res = await loginRequest({
        firebaseToken,
        email: result.user.email ?? "",
        provider: "google",
      });

      if (!res?.token || !res?.user) {
        setErr("Respuesta inválida del servidor");
        return;
      }

      setToken(res.token);
      setUser(res.user);

      nav("/home");
    } catch (error) {
      console.error("Google Login Error:", error);
      setErr("No se pudo iniciar sesión con Google");
    }
  }

  /* =====================================================
      LOGIN CON GITHUB
  ====================================================== */
  async function handleGithubLogin() {
    setErr(null);

    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const firebaseToken = await result.user.getIdToken();

      const res = await loginRequest({
        firebaseToken,
        email: result.user.email ?? "",
        provider: "github",
      });

      if (!res?.token || !res?.user) {
        setErr("Respuesta inválida del servidor");
        return;
      }

      setToken(res.token);
      setUser(res.user);

      nav("/home");
    } catch (error) {
      console.error("GitHub Login Error:", error);
      setErr("No se pudo iniciar sesión con GitHub");
    }
  }

  /* =====================================================
      UI
  ====================================================== */
  return (
    <div className="login-container">
      <div className="login-card">
        
        <img
          src="/images/uvmeet-removebg-preview.png"
          alt="UVMeet Logo"
          className="login-logo"
        />

        <h2 className="login-title">Tu plataforma de videollamadas favorita</h2>

        <form onSubmit={handleSubmit} className="login-form">

          <label htmlFor="username">Usuario (email)</label>
          <input
            id="username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <p className="login-error">{err}</p>}

          <button type="submit" className="login-button">
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>

          <p className="forgot-link">
            ¿Problemas al acceder a su cuenta? <a href="/forgot">Recuperar</a>
          </p>

          <p className="ressetpasword-link">
            ¿Olvidó su contraseña? <a href="/ressetpasword">Cambiar</a>
          </p>
        </form>

        {/* Social login */}
        <div className="social-login">
          <button className="social-btn google" onClick={handleGoogleLogin}>
            <img src="/icons/google.svg" alt="" />
            Iniciar sesión con Google
          </button>

          <button className="social-btn github" onClick={handleGithubLogin}>
            <img src="/icons/github.svg" alt="" />
            Iniciar sesión con GitHub
          </button>
        </div>

        <p className="login-footer">
          ¿No tiene cuenta? <a href="/register">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
