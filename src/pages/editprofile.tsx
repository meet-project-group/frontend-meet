import { useEffect, useState } from "react";
import "../styles/editprofile.sass";
import Menu from "../components/menu";
import { useAuth } from "../components/AuthProvider";
import { auth } from "../firebase";
import { updateProfile, updateEmail, reload } from "firebase/auth";

/**
 * EditProfile Component
 *
 * This component allows authenticated users to update their personal information.
 * It performs updates in three layers:
 * 1. Firebase Authentication (displayName and email)
 * 2. Backend server (custom user fields)
 * 3. Local user state (front-end global context)
 */
export default function EditProfile() {
  // Access global authentication context
  const { user, token, setUser } = useAuth();

  // Control the visibility of the side menu
  const [openMenu, setOpenMenu] = useState(false);

  // Local form state for the editable user fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
  });

  console.log("USER DESDE AUTH:", user);

  /**
   * Load user data into the form when the component mounts
   * or when the global user object changes.
   */
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        age: user.age?.toString() || "",
      });
    }
  }, [user]);

  /**
   * Handles input changes for every field in the form.
   */
  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Submits the profile updates.
   * Steps:
   * 1. Validate the user session
   * 2. Update Firebase Auth (displayName + email)
   * 3. Refresh Firebase user data
   * 4. Update backend user document
   * 5. Update global front-end user state
   */
  async function handleSubmit(e: any) {
    e.preventDefault();
    console.log("USUARIO EN EDITPROFILE:", user);

    if (!user?.uid) {
      alert("Usuario no válido");
      return;
    }

    const currentAuthUser = auth.currentUser;

    if (!currentAuthUser) {
      alert("No hay usuario en Firebase");
      return;
    }

    try {
      // 1️⃣ Update Firebase Authentication profile
      await updateProfile(currentAuthUser, {
        displayName: `${form.firstName} ${form.lastName}`,
      });

      // Update email only if the user changed it
      if (form.email !== currentAuthUser.email) {
        await updateEmail(currentAuthUser, form.email);
      }

      // Refresh Firebase user data
      await reload(currentAuthUser);

      // 2️⃣ Update backend user record
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("ID QUE ENVÍO AL BACKEND:", user.uid);
        alert("Error al actualizar: " + data.error);
        return;
      }

      // 3️⃣ Update the global user state (frontend context)
      setUser({
        ...user,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        age: Number(form.age),
      });

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Hubo un error actualizando el perfil");
    }
  }

  return (
    <div className="editprofile-page">
      {/* HEADER */}
      <header className="edit-header">
        <div className="header-left">
          {/* Button to toggle the side menu */}
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

      {/* FORM SECTION */}
      <div className="edit-profile-container">
        <div className="edit-card">
          {/* Static profile picture placeholder */}
          <div className="profile-photo">
            <div className="circle">
              <span className="icon">👤</span>
            </div>
            <button className="btn-edit-photo">Editar foto</button>
          </div>

          {/* Display the user's first name */}
          <div className="username-section">
            <h2 className="username">{form.firstName || "Usuario"}</h2>
          </div>

          {/* Form for updating user information */}
          <form onSubmit={handleSubmit} className="edit-form">
            <label>Nombre</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />

            <label>Apellido</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />

            <label>Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <label>Edad</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
            />

            {/* Submit button */}
            <button type="submit" className="btn-save">
              Guadar
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-divider"></div>
        <h3>Mapa del sitio</h3>

        <div className="footer-columns">
          <div>
            <p>
              <strong>ACCESO</strong>
            </p>
            <p>Iniciar Sesión</p>
            <p>Crear cuenta</p>
            <p>Recuperar contraseña</p>
          </div>

          <div>
            <p>
              <strong>CUENTA Y SOPORTE</strong>
            </p>
            <p>Editar perfil</p>
            <p>Sobre nosotros</p>
            <p>Contacto</p>
          </div>

          <div>
            <p>
              <strong>NAVEGACIÓN</strong>
            </p>
            <p>Inicio</p>
            <p>Sobre nosotros</p>
            <p>Reuniones</p>
          </div>

          <div>
            <p>
              <strong>CONTACTO</strong>
            </p>
            <p>uvmeet@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
