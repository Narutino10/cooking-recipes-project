import { useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function useSocket(namespace = '/chat') {
  const socketRef = useRef<any | null>(null);

  useEffect(() => {
    let socket: any = null;
    let mounted = true;

    (async () => {
      try {
        const mod = await import('socket.io-client');
        if (!mounted) return;
        socket = mod.io(API_URL + namespace, { autoConnect: true });
        socketRef.current = socket;
      } catch (err) {
        // dynamic import failed (module not installed) -> leave socketRef null
        console.warn('socket.io-client unavailable:', err);
      }
    })();

    return () => {
      mounted = false;
      try { socket?.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
  }, [namespace]);

  return socketRef;
}
