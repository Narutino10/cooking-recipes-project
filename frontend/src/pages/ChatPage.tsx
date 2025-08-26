import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import '../styles/pages/ChatPage.scss';

type Props = { socketRef?: any };

const ChatPage = ({ socketRef }: Props) => {
  const localSocketRef = useSocket('/chat');
  const sockRef = socketRef ?? localSocketRef;
  const [messages, setMessages] = useState<{ user: string; text: string; at: string; seen?: boolean }[]>([]);
  const [text, setText] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const room = 'global';

  useEffect(() => {
    const socket = sockRef.current;
    if (!socket) return;

    const onMessage = (m: any) => setMessages((s) => [...s, { ...m, seen: false }]);
    const onSystem = (m: any) => setMessages((s) => [...s, { user: 'system', text: m.text, at: new Date().toISOString(), seen: true }]);
    const onSeen = (payload: any) => {
      // mark messages as seen if room matches
      setMessages((s) => s.map((msg) => ({ ...msg, seen: true })));
    };

    socket.on('message', onMessage);
    socket.on('system', onSystem);
    socket.on('seen', onSeen);

    return () => {
      socket.off('message', onMessage);
      socket.off('system', onSystem);
      socket.off('seen', onSeen);
    };
  }, [sockRef]);

  const send = () => {
  const socket = sockRef.current;
  if (!socket || !text.trim()) return;
  socket.emit('message', { user: 'web', text, room: joinedRoom ?? undefined });
    setText('');
  };

  const join = () => {
  const socket = sockRef.current;
    if (!socket) return;
    socket.emit('join', { room });
    setJoinedRoom(room);
  };

  return (
    <div className="chat-page">
      <h1>Chat</h1>
      <div className="chat-controls">
        <button type="button" onClick={join} disabled={!!joinedRoom}>{joinedRoom ? 'Rejoint' : 'Rejoindre le chat'}</button>
      </div>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.user === 'system' ? 'system' : ''}`}>
            <strong>{m.user}</strong>: <span>{m.text}</span>
            <div className="time">{new Date(m.at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message..." />
        <button type="button" onClick={send}>Envoyer</button>
      </div>
    </div>
  );
};

export default ChatPage;
