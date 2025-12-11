export const voiceSocket = io(import.meta.env.VITE_VOICE_SERVER_URL, {
  path: "/voice/socket.io",
  transports: ["polling", "websocket"],
  upgrade: true,
  secure: true,
  reconnection: true,
  withCredentials: false
});
