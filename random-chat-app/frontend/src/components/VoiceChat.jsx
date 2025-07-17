// src/components/VoiceChat.jsx
import React, { useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5003');

const VoiceChat = () => {
  const localRef = useRef();
  const remoteRef = useRef();
  const [pc, setPc] = useState(null);

  const callUser = async () => {
    const peer = new RTCPeerConnection();
    setPc(peer);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    peer.ontrack = (e) => {
      remoteRef.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { candidate: e.candidate });
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('voice-offer', { sdp: offer });
  };

  const answerCall = async (offer) => {
    const peer = new RTCPeerConnection();
    setPc(peer);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    peer.ontrack = (e) => {
      remoteRef.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { candidate: e.candidate });
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('voice-answer', { sdp: answer });
  };

  socket.on('voice-offer', (data) => answerCall(data.sdp));
  socket.on('voice-answer', (data) => pc?.setRemoteDescription(new RTCSessionDescription(data.sdp)));
  socket.on('ice-candidate', (data) => pc?.addIceCandidate(data.candidate));

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button onClick={callUser}>📞 Call</button>
      <audio ref={localRef} autoPlay muted />
      <audio ref={remoteRef} autoPlay />
    </div>
  );
};

export default VoiceChat;
