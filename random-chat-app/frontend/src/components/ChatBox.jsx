import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './ChatBox.css';

const socket = io('https://harmoni-chat-6.onrender.com');

const ChatBox = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('⌛ Waiting for someone who feels like you…');
  const [partnerName, setPartnerName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inCall, setInCall] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

   const moodSentence = prompt("How are you feeling today?");
   socket.emit('join', { username: user.username, moodSentence });


    socket.on('status', (msg) => setStatus(msg));
    socket.on('partnerName', (name) => setPartnerName(name));
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('partnerTyping', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      socket.off('status');
      socket.off('receiveMessage');
      socket.off('partnerTyping');
      socket.off('partnerName');
    };
  }, [user]);

  const handleSend = () => {
    if (text.trim()) {
      socket.emit('sendMessage', text);
      setText('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing');
  };

  const handleSkip = () => {
    setMessages([]);
    setStatus('⌛ Waiting for someone who feels like you…');
    setPartnerName('');
    socket.emit('skipChat');
  };

  const startVoiceCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    setInCall(true);
    // Voice call logic if needed
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    socket.emit('end-call');
    peerRef.current = null;
    setInCall(false);
  };

  return (
    <div className="chatbox-center-bg">
      <div className="chatbox-card">
        <div className="chatbox-header">
          <div className="chatbox-userpic">{user.username[0]?.toUpperCase()}</div>
          <div>
            <div className="chatbox-welcome">
              Welcome <span className="highlight">{user.username}</span>
            </div>
            <div className="chatbox-connected">
              {partnerName
                ? <>Connected to <span className="highlight">{partnerName}</span></>
                : <span>{status}</span>
              }
            </div>
          </div>
        </div>
        <div className="chatbox-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chatbox-bubble ${msg.sender === user.username ? 'me' : 'other'}`}
            >
              <strong>
                {msg.sender === user.username ? 'You' : msg.sender}:
              </strong> {msg.content}
            </div>
          ))}
          {isTyping && partnerName && (
            <div className="chatbox-typing">{partnerName} is typing…</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbox-controls">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleTyping}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <button onClick={handleSend} className="send">Send</button>
          <button onClick={handleSkip} className="skip">Skip</button>
          {!inCall ? (
            <button onClick={startVoiceCall} className="call">Call</button>
          ) : (
            <button onClick={endCall} className="end">End</button>
          )}
        </div>
        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
};

export default ChatBox;
