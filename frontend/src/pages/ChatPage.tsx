import { useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import { getAllUsers, User } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/ChatPage.scss';

type Props = { socketRef?: any };

type Message = {
  user: string;
  text: string;
  at: string;
  seen?: boolean;
  from?: string;
  to?: string;
};

const ChatPage = ({ socketRef }: Props) => {
  const localSocketRef = useSocket('/chat');
  const sockRef = socketRef ?? localSocketRef;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const room = 'global';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers.filter(u => u.id !== currentUser?.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const socket = sockRef.current;
    if (!socket) return;

    const onMessage = (m: Message) => {
      setMessages((s) => [...s, { ...m, seen: false }]);
    };

    const onSystem = (m: any) => {
      setMessages((s) => [...s, { user: 'system', text: m.text, at: new Date().toISOString(), seen: true }]);
    };

    const onSeen = (payload: any) => {
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

    const messageData = {
      user: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous',
      text,
      ...(selectedUser ? { to: selectedUser.id } : { room: joinedRoom ?? undefined })
    };

    socket.emit('message', messageData);
    setText('');
  };

  const join = () => {
    const socket = sockRef.current;
    if (!socket) return;
    socket.emit('join', { room });
    setJoinedRoom(room);
  };

  const startPrivateChat = (user: User) => {
    setSelectedUser(user);
    const socket = sockRef.current;
    if (!socket) return;
    socket.emit('join-private', { with: user.id });
    setMessages([]); // Clear messages when switching to private chat
  };

  const backToGlobal = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const filteredMessages = selectedUser
    ? messages.filter(msg =>
        (msg.from === currentUser?.id && msg.to === selectedUser.id) ||
        (msg.from === selectedUser.id && msg.to === currentUser?.id)
      )
    : messages;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>Chat</h1>
        {selectedUser && (
          <div className="chat-with">
            <span>Chat avec {selectedUser.firstName} {selectedUser.lastName}</span>
            <button onClick={backToGlobal} className="back-btn">Retour au chat général</button>
          </div>
        )}
      </div>

      <div className="chat-layout">
        <div className="users-sidebar">
          <h3>Utilisateurs</h3>
          {loadingUsers ? (
            <p>Chargement...</p>
          ) : (
            <div className="users-list">
              <button
                className={`user-item ${!selectedUser ? 'active' : ''}`}
                onClick={backToGlobal}
              >
                <div className="user-avatar">🌐</div>
                <span>Chat général</span>
              </button>
              {users.map((user) => (
                <button
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => startPrivateChat(user)}
                >
                  <div className="user-avatar">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chat-main">
          {!selectedUser && (
            <div className="chat-controls">
              <button type="button" onClick={join} disabled={!!joinedRoom}>
                {joinedRoom ? 'Rejoint' : 'Rejoindre le chat général'}
              </button>
            </div>
          )}

          <div className="chat-window">
            {filteredMessages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.user === 'system' ? 'system' : ''} ${m.from === currentUser?.id ? 'own' : ''}`}>
                <div className="msg-header">
                  <strong>{m.user}</strong>
                  <span className="time">{new Date(m.at).toLocaleTimeString()}</span>
                </div>
                <div className="msg-content">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={selectedUser ? `Message à ${selectedUser.firstName}...` : "Écrire un message..."}
              onKeyPress={(e) => e.key === 'Enter' && send()}
            />
            <button type="button" onClick={send}>Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
