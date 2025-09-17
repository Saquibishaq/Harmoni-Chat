import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const features = [
  { icon: 'fa-video', label: 'Video Chat', desc: 'Experience authentic face to face encounters with real people from all over the world.' },
  { icon: 'fa-users', label: 'Friends & History', desc: 'Had a fun chat but skipped by accident? Find them in your chat history and add them as a friend.' },
  { icon: 'fa-filter', label: 'Search Filters', desc: 'Want to narrow down your search? Use interests, genders or locations to filter the strangers you meet.' },
  { icon: 'fa-comment-dots', label: 'Text Chat', desc: 'Not in the mood for video? No problem! You can also chat with strangers via text messages. Full of features.' },
  { icon: 'fa-user-shield', label: 'Safety & Moderation', desc: 'We make use of advanced AI technologies and enhanced spam protection to keep your chats clean.' },
  { icon: 'fa-star', label: 'Feature rich', desc: 'From sending photos, videos, having voice calls, to sharing GIFs and adding avatars, we have it all.' },
];

const testimonials = [
  {
    name: 'Stranger 1',
    label: 'Beta Tester',
    text: 'It made connecting through video chat fun and easy. Quick, user-friendly, and I’ve had engaging chats with people worldwide!',
  },
  {
    name: 'Stranger 2',
    label: 'User',
    text: 'I felt lonely—this app changed that. Made friends from around the globe. Love it!',
  },
  {
    name: 'Stranger 3',
    label: 'Premium User',
    text: 'Spam-free, well-moderated, friendly faces from everywhere. This is the best new platform.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    
    <div className="harmoni-root">

      {/* Navigation */}
      <nav className="harmoni-nav">
        <div className="brand">
          <i className="fas fa-comments"></i> Harmoni Chat
        </div>
        <ul>
         <Link to="/home">Home</Link>
         <Link to="/blog">Blog</Link>
          <Link to="/about">About Us</Link>
         <Link to="/support">support Us</Link>
        </ul>
      <div className="nav-actions">
        <Link to="/register" className="nav-btn">Register</Link>
        <Link to="/login" className="nav-btn nav-login">Login</Link>
      </div>

      </nav>

      {/* Hero Section */}
      <section className="harmoni-hero">
        <div className="hero-content">
          <h1>
            Talk to strangers,<br />
            Make friends!
          </h1>
          <p>
            Experience a random chat al ternative to find friends,<br />
            connect with people, and chat with strangers from all over the world!
          </p>
            <button className="cta-btn" onClick={() => navigate('/register')}>Start Chatting</button>

        </div>
        <div className="hero-illustration">
          <img src="/images/image4.png" alt="App UI Preview" />
        </div>
      </section>

      {/* Intro Section */}
      <section className="harmoni-section intro">
        <div>
          {/* <div className="intro-badge">Reach people like you</div> */}
          <h2>Anonymous Chat, Meet new people</h2>
          <p>
            Find strangers worldwide, the new modern alternative to classic chat platforms.<br/>
            Connect with real people, enjoy ad-free text and video chats, and build genuine friendships.
          </p>
        </div>
      </section>

      {/* Features Section in clean grid */}
      <section className="features-section">
        <h2 className="features-title">
          The best site to Chat with Male and Female Strangers.
        </h2>
        <p className="features-desc">
          Many text and video chat apps offer various features for meeting random strangers or chatting without bots, but not all of them are modern, secure and feature rich with a diverse interesting people from around the globe.
        </p>
        <div className="features-main-grid">
          <div className="features-row-flex">
            {features.slice(0, 3).map(({ icon, label, desc }, i) => (
              <div key={i} className="feature-cell">
                <div className="feature-icon-circle"><i className={`fas ${icon}`}></i></div>
                <div className="feature-heading">{label}</div>
                <div className="feature-text">{desc}</div>
              </div>
            ))}
          </div>
          <div className="features-row-flex">
            {features.slice(3).map(({ icon, label, desc }, i) => (
              <div key={i} className="feature-cell">
                <div className="feature-icon-circle"><i className={`fas ${icon}`}></i></div>
                <div className="feature-heading">{label}</div>
                <div className="feature-text">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h3 className="testimonials-title">Don’t take our word for it</h3>
        <div className="testimonials-grid">
          {testimonials.map(({ name, label, text }, i) => (
            <div key={i} className="testimonial">
              <div className="testimonial-name">{name}</div>
              <div className="testimonial-label">{label}</div>
              <div className="testimonial-text">"{text}"</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stay in the Loop CTA */}
      <section className="harmoni-loop-cta">
        <div className="loop-cta-box">
          <div>
            <h2>Stay in the loop</h2>
            <p>Join our Discord Server to get updates before anyone else.</p>
          </div>
          <div className="loop-cta-actions">
            <a className="loop-btn" href="#">Join Discord</a>
            <a className="loop-btn" href="#">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="harmoni-footer">
        <div className="footer-top">
          <span className="brand"><i className="fas fa-comments"></i> Harmoni Chat</span>
          <div className="footer-policies">
            <a href="#">Terms Of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Community Guidelines</a>
            <a href="#">Refund Policy</a>
          </div>
          <div className="footer-socials">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-discord"></i></a>
            <a href="#"><i className="fab fa-tiktok"></i></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>All rights reserved. BeFriendsWith LTD.</span>
        </div>
      </footer>

    </div>
  );
}
