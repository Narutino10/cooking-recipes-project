import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function useSocket(namespace = '/chat') {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API_URL + namespace, { autoConnect: true });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace]);

  return socketRef;
}
