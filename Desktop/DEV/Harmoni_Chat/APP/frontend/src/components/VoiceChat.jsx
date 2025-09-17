import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5003');

const VoiceChat = () => {
  const localRef = useRef();
  const remoteRef = useRef();
  const [pc, setPc] = useState(null);
  
  // Call states
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'receiving', 'connected'
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callerName, setCallerName] = useState('');

  useEffect(() => {
    // Handle incoming call offer
    socket.on('voice-offer', (data) => {
      console.log('📞 Incoming call offer received');
      setIncomingOffer(data.sdp);
      setCallState('receiving');
      setCallerName(data.callerName || 'Unknown');
    });

    socket.on('voice-answer', (data) => {
      console.log('✅ Call answered by partner');
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setCallState('connected');
      }
    });

    socket.on('ice-candidate', (data) => {
      if (pc && data.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('call-ended', () => {
      console.log('📴 Call ended by partner');
      endCall();
    });

    socket.on('call-declined', () => {
      console.log('❌ Call declined by partner');
      setCallState('idle');
      setPc(null);
    });

    return () => {
      socket.off('voice-offer');
      socket.off('voice-answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-declined');
    };
  }, [pc]);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    peer.onconnectionstatechange = () => {
      console.log('Connection state:', peer.connectionState);
      if (peer.connectionState === 'connected') {
        setCallState('connected');
      } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        endCall();
      }
    };

    return peer;
  };

  const startCall = async () => {
    try {
      console.log('📞 Starting call...');
      setCallState('calling');
      
      const peer = createPeerConnection();
      setPc(peer);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      
      socket.emit('voice-offer', { sdp: offer });
    } catch (error) {
      console.error('Error starting call:', error);
      setCallState('idle');
    }
  };

  const answerCall = async () => {
    try {
      console.log('✅ Answering call...');
      
      const peer = createPeerConnection();
      setPc(peer);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      socket.emit('voice-answer', { sdp: answer });
      setCallState('connected');
      setIncomingOffer(null);
    } catch (error) {
      console.error('Error answering call:', error);
      declineCall();
    }
  };

  const declineCall = () => {
    console.log('❌ Declining call...');
    socket.emit('call-declined');
    setCallState('idle');
    setIncomingOffer(null);
    setCallerName('');
  };

  const endCall = () => {
    console.log('📴 Ending call...');
    
    if (pc) {
      pc.close();
      setPc(null);
    }
    
    if (localRef.current && localRef.current.srcObject) {
      localRef.current.srcObject.getTracks().forEach(track => track.stop());
      localRef.current.srcObject = null;
    }
    
    if (remoteRef.current) {
      remoteRef.current.srcObject = null;
    }
    
    socket.emit('end-call');
    setCallState('idle');
    setIncomingOffer(null);
    setCallerName('');
  };

  const renderCallControls = () => {
    switch (callState) {
      case 'idle':
        return (
          <button onClick={startCall} style={styles.callButton}>
            📞 Call
          </button>
        );
      
      case 'calling':
        return (
          <div style={styles.callStatus}>
            <div>📞 Calling...</div>
            <button onClick={endCall} style={styles.endButton}>
              End Call
            </button>
          </div>
        );
      
      case 'receiving':
        return (
          <div style={styles.incomingCall}>
            <div style={styles.callNotification}>
              📞 Incoming call from {callerName}
            </div>
            <div style={styles.callActions}>
              <button onClick={answerCall} style={styles.answerButton}>
                ✅ Answer
              </button>
              <button onClick={declineCall} style={styles.declineButton}>
                ❌ Decline
              </button>
            </div>
          </div>
        );
      
      case 'connected':
        return (
          <div style={styles.callStatus}>
            <div style={styles.connectedStatus}>🔊 Call Connected</div>
            <button onClick={endCall} style={styles.endButton}>
              📴 End Call
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {renderCallControls()}
      <audio ref={localRef} autoPlay muted />
      <audio ref={remoteRef} autoPlay />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  callButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  callStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  connectedStatus: {
    color: '#28a745',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  incomingCall: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '2px solid #007bff'
  },
  callNotification: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#007bff'
  },
  callActions: {
    display: 'flex',
    gap: '15px'
  },
  answerButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  declineButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  endButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default VoiceChat;
