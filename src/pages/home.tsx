import "../styles/home.sass";
import Menu from "../components/menu";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createMeeting } from "../services/meetingService";
import { getAuth } from "firebase/auth";

const Home = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const navigate = useNavigate();

  const handleCreateMeeting = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return alert("⚠ Debes iniciar sesión para crear una reunión");

      const token = await user.getIdToken();

      const meeting = await createMeeting(
        user.uid,
        user.displayName || "Anónimo",
        token
      );

      setMeetingCode(meeting.id);
      setShowModal(true);
      setCopied(false);
      setShared(false);
    } catch (e) {
      console.error("Error creando reunión:", e);
      alert("❌ Error creando reunión");
    }
  };

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(meetingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error("Error copiando:", err);
    alert("No se pudo copiar el código");
  }
};


  const handleShare = async () => {
    const url = `${window.location.origin}/room/${meetingCode}`;
    const text = `Únete a mi reunión en UVMeet: ${meetingCode}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Reunión UVMeet", text, url });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (err) {
        console.warn("Web Share falló o fue cancelado:", err);
      }
    }

    try {
      const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsapp, "_blank");
      setShared(true);
      setTimeout(() => setShared(false), 2000);
      return;
    } catch (err) {
      console.warn("No se pudo abrir WhatsApp:", err);
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles. Pega y comparte donde quieras.");
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el enlace:", err);
      alert("No se pudo compartir el enlace. Copia manualmente: " + url);
    }
  };

  return (
    <div
      className="home-container"
      onClick={() => openMenu && setOpenMenu(false)}
    >
      {/* HEADER */}
      <header className="home-header">
        <div className="header-left">
          <button
            className="hamburger-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(!openMenu);
            }}
          >
            ☰
          </button>

          <Menu open={openMenu} setOpen={setOpenMenu} />

          <img
            src="/images/uvmeet-removebg-preview.png"
            alt="UVMeet Logo"
            className="logo"
          />
        </div>

        <nav className="navbar">
          <Link to="/about">sobre nosotros</Link>
          <Link to="/sitemap">mapa del sitio</Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="home-main">
        <h1 className="main-title">
          Videoconferencias <br /> seguras para todos
        </h1>

        <p className="main-subtitle">
          conecta y colabora con los que quieras en uv meet
        </p>

        <div className="action-section">
          <p className="question">¿Qué deseas hacer?</p>

          <div className="actions">
            <button className="create-btn" onClick={handleCreateMeeting}>
              crear reunión
            </button>

            <input
              type="text"
              placeholder="ingrese el código"
              className="room-input"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />

            <button
              className="join-btn"
              onClick={() => {
                if (!meetingCode.trim())
                  return alert("Ingrese un código válido");
                navigate(`/room/${meetingCode}`);
              }}
            >
              unirme
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER (IGUAL AL DE EDITPROFILE) */}
      <footer className="home-footer">
        <div className="footer-divider"></div>
        <h3>Mapa del sitio</h3>

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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reunión creada</h2>

            <p className="modal-subtitle">Este es tu código de acceso:</p>

            <div className="code-box">
              <span className="code">{meetingCode}</span>

              <button className="copy-btn" onClick={copyCode}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>

            <button className="share-btn" onClick={handleShare}>
              {shared ? "✓ Compartido" : "Compartir"}
            </button>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
