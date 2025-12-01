/**
 * Creates a new meeting on the backend.
 * 
 * @param uid - The unique identifier of the user creating the meeting.
 * @param hostName - The visible name of the meeting host.
 * @param token - Firebase Auth token used for authorization.
 * 
 * @returns The meeting data returned by the server.
 * 
 * @throws Error if the server responds with a non-OK status.
 */
export async function createMeeting(uid: string, hostName: string, token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/meetings`, { // <- removed /api
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ uid, hostName })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("❌ SERVER ERROR:", data);
    throw new Error(data.message || "Error creating meeting");
  }

  return data;
}


/**
 * Retrieves a specific meeting by its ID.
 * 
 * @param id - Meeting ID to retrieve.
 * @param token - Firebase Auth token used for authorization.
 * 
 * @returns Meeting data returned by the backend.
 * 
 * @throws Error if the meeting cannot be fetched.
 */
export async function getMeeting(id: string, token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Error fetching meeting");
  return res.json();
}

/**
 * Lists all meetings for a specific user.
 * 
 * @param uid - User ID whose meetings should be listed.
 * @param token - Firebase Auth token used for authorization.
 * 
 * @returns Array of meetings for the user.
 * 
 * @throws Error if the list cannot be retrieved.
 */
export async function listMeetings(uid: string, token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings?uid=${uid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) throw new Error("Error listing meetings");
  return res.json();
}

/**
 * Deletes a meeting by its ID.
 * 
 * @param id - The meeting ID to delete.
 * @param token - Firebase Auth token used for authorization.
 * 
 * @returns Backend response confirming deletion.
 * 
 * @throws Error if the meeting cannot be deleted.
 */
export async function deleteMeeting(id: string, token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Error deleting meeting");
  return res.json();
}
