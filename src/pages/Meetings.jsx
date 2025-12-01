import { useState, useEffect } from "react";
import { createMeeting, listMeetings, deleteMeeting } from "../services/meetingService";

export default function Meetings({ user, token }) {
  const [meetings, setMeetings] = useState([]);

  // Creates a new meeting for the current user
  const generate = async () => {
    try {
      const res = await createMeeting(
        user.uid,
        user.displayName || user.firstName || "Anónimo",
        token
      );

      alert(`Reunión creada con ID: ${res.id}`);

      load(); // reload meeting list
    } catch (e) {
      console.error(e);
      alert("Error al crear reunión");
    }
  };

  // Loads all meetings created by the current user
  const load = async () => {
    try {
      const res = await listMeetings(user.uid, token);
      setMeetings(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Deletes a meeting and refreshes the list
  const removeMeet = async (id) => {
    await deleteMeeting(id, token);
    load();
  };

  // Load meetings when component mounts
  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🔵 Mis Reuniones</h1>

      {/* Button to create a new meeting */}
      <button onClick={generate}>➕ Crear Reunión</button>

      {/* List of user's meetings */}
      <ul>
        {meetings.map((m) => (
          <li key={m.id} style={{ marginTop: 10 }}>
            <b>{m.id}</b> — {m.hostName}
            
            {/* Link to enter the meeting */}
            <a
              href={`/room/${m.id}`}
              style={{ marginLeft: 10, color: "blue" }}
            >
              Entrar
            </a>

            {/* Button to delete the meeting */}
            <button
              style={{ marginLeft: 10 }}
              onClick={() => removeMeet(m.id)}
            >
              🗑 Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
