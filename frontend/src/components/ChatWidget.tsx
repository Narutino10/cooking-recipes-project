import { useEffect, useState } from 'react';
import ChatPage from '../pages/ChatPage';
import useSocket from '../hooks/useSocket';
import '../styles/components/ChatWidget.scss';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const socketRef = useSocket('/chat');
  const [unread, setUnread] = useState<number>(() => {
    try {
      const v = localStorage.getItem('chat:unread');
      return v ? Number(v) : 0;
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onMessage = (m: any) => {
      // if widget closed, increment unread
      if (!open) {
        setUnread((u) => {
          const next = u + 1;
          try { localStorage.setItem('chat:unread', String(next)); } catch (e) {}
          return next;
        });
      }
    };

    socket.on('message', onMessage);
    return () => {
      socket.off('message', onMessage);
    };
  }, [socketRef, open]);

  return (
    <div className={`chat-widget ${open ? 'open' : ''}`}>
    {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat">
      <ChatPage socketRef={socketRef} />
        </div>
      )}

      <button
        className="chat-bubble"
        type="button"
        aria-pressed={open}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        onClick={() => {
          setOpen((s) => {
            const next = !s;
            if (next) {
              // opening -> clear unread & notify server
              try { localStorage.setItem('chat:unread', '0'); } catch (e) {}
              setUnread(0);
              const socket = socketRef.current;
              if (socket) socket.emit('seen', { room: 'global' });
            }
            return next;
          });
        }}
      >
        <div style={{ position: 'relative' }}>
          {open ? '✖' : '💬'}
          {!open && unread > 0 && (
            <span className="chat-badge" aria-hidden>{unread}</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default ChatWidget;
