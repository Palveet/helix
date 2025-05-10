import { io } from "socket.io-client";

const BACKEND_URL = 'http://localhost:5000';

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],  
  reconnection: true,
  reconnectionAttempts: Infinity,  
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true
});

socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {

    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Socket reconnection attempt:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('Socket failed to reconnect');

  if (confirm('Connection lost. Reload the page?')) {
    window.location.reload();
  }
});

export const ensureSocketConnection = () => {
  if (!socket.connected) {
    console.log('Socket not connected, attempting to connect...');
    socket.connect();
    return false;
  }
  return true;
};

export default socket;
