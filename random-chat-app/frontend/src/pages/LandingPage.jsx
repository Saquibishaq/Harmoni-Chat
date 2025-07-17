import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [fakeMessages, setFakeMessages] = useState([]);

  const handleStart = () => {
    navigate('/register');
  };

  useEffect(() => {
    const scriptedMessages = [
      { sender: 'me', text: 'Hey there!' },
      { sender: 'stranger', text: 'Hello! 😊' },
      { sender: 'me', text: 'Where are you from?' },
      { sender: 'stranger', text: "I'm from Berlin. You?" },
      { sender: 'me', text: 'India ✌️' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      setFakeMessages((prev) => {
        if (i >= scriptedMessages.length) return prev;
        return [...prev, scriptedMessages[i++]];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-fullpage">
      {/* Top Hero Section */}
      <div className="hero-section">
        <h1 className="app-name">Harmoni Chat</h1>
        <button onClick={handleStart} className="start-chat-btn">
          Start Chatting
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="info-section no-image">
        <div className="info-left">
          <h2>Smart Matching Based on How You Feel</h2>
          <p>
            Harmoni Chat lets you instantly connect with strangers across the world — no coins, no subscriptions, just pure human connection.
          </p>
          <ul>
            <li>⚡ Instant Matching</li>
            <li>Totally Free — Forever</li>
            <li> One-on-One Chat</li>
            <li> Voice Chat avaliable</li>
            <li> Private & Secure</li>
          </ul>

          <div className="connect-social">
            <h4>Connect With Me</h4>
            <div className="socials">
              <i className="fab fa-instagram"></i>
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-linkedin-in"></i>
              <i className="fas fa-envelope"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Preview Section */}
      <div className="live-chat-preview">
        <h3>💬 See Harmoni Chat in Action</h3>
        <div className="mock-chat-box">
          {fakeMessages.map((msg, index) => (
            <div key={index} className={`mock-bubble ${msg.sender}`}>
              <strong>{msg.sender === 'me' ? 'You' : 'Stranger'}:</strong> {msg.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
