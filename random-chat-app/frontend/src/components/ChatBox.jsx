import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './ChatBox.css';

const socket = io('http://localhost:5003');

const ChatBox = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('⌛ Connecting...');
  const [partnerName, setPartnerName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inCall, setInCall] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pingSound = useRef(new Audio('/ping.mp3'));
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
      pingSound.current.play().catch(() => {});
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('partnerTyping', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('voice-offer', async ({ sdp }) => {
      const peer = createPeer(false);
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('voice-answer', { sdp: answer });
      setInCall(true);
    });

    socket.on('voice-answer', async ({ sdp }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (peerRef.current) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('call-ended', () => {
      if (peerRef.current) peerRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerRef.current = null;
      setInCall(false);
    });

    return () => {
      socket.off('status');
      socket.off('receiveMessage');
      socket.off('partnerTyping');
      socket.off('partnerName');
      socket.off('voice-offer');
      socket.off('voice-answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
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
    setStatus('⌛ Searching for a new chat...');
    setPartnerName('');
    socket.emit('skipChat');
  };

  const startVoiceCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    const peer = createPeer(true);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('voice-offer', { sdp: offer });
    setInCall(true);
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

  const createPeer = () => {
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    return peer;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Welcome {user.username}</h1>
        <p>{partnerName ? `Connected to ${partnerName}` : status}</p>
        {inCall && <div className="in-call">📞 In Call</div>}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.sender === user.username ? 'me' : 'other'}`}
          >
            <strong>{msg.sender === user.username ? 'You' : msg.sender}:</strong> {msg.content}
          </div>
        ))}
        {isTyping && <div className="typing">💬 {partnerName} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-controls">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="send">Send</button>
        <button onClick={handleSkip} className="skip">Skip</button>
        {!inCall ? (
          <button onClick={startVoiceCall} className="call">Call</button>
        ) : (
          <button onClick={endCall} className="end">End Call</button>
        )}
      </div>

      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default ChatBox;
