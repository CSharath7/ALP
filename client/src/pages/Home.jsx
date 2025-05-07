
// export default HomePage;
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🧩",
      title: "Interactive Learning",
      desc: "Multi-sensory activities designed specifically for dyslexic learners"
    },
    {
      icon: "👩‍🏫",
      title: "Trained Mentors",
      desc: "Specialists who understand dyslexia and alternative learning methods"
    },
    {
      icon: "⏱️",
      title: "Self-Paced",
      desc: "Learn at your own speed with no time pressure"
    },
    {
      icon: "🎮",
      title: "Game-Based",
      desc: "Educational games that make learning fun and engaging"
    },
    {
      icon: "🔊",
      title: "Audio Support",
      desc: "Text-to-speech and audio instructions for all content"
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      desc: "Visual progress indicators to celebrate achievements"
    }
  ];

  const testimonials = [
    {
      quote: "This platform helped my son gain confidence in reading. The games made learning enjoyable!",
      author: "Sarah, Parent"
    },
    {
      quote: "As a dyslexic student, I finally found a way to learn that works for me. The mentors are amazing!",
      author: "Jamie, Age 12"
    },
    {
      quote: "The multisensory approach has transformed our teaching methods. Highly recommend for educators!",
      author: "Mr. Thompson, Teacher"
    }
  ];

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container">
          <a className="navbar-brand" href="#">
            <span role="img" aria-label="Graduation cap">🎓</span> EduPlatform
          </a>
          <div className="ms-auto d-flex align-items-center">
            <button
              className="nav-btn nav-btn-outline me-3"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="nav-btn nav-btn-outline me-3"
              onClick={() => navigate("/ChildLogin")}
            >
              Child Login
            </button>
            <button
              className="nav-btn nav-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Become a Mentor
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container py-5">
          <h1 className="hero-title">
            Empowering <span className="hero-highlight">Dyslexic Learners</span>, One Step at a Time
          </h1>
          <p className="hero-subtitle">
            A platform designed to make learning accessible and enjoyable for everyone.
          </p>
          <div className="d-flex justify-content-center gap-4">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate("/games")}
            >
              Start Learning Now
            </button>
            <button
              className="hero-btn hero-btn-outline"
              onClick={() => navigate("/about")}
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container py-5">
          <h2 className="section-title">
            Why Choose Our Platform?
          </h2>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="feature-card">
                  <div className="feature-icon" role="img" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container py-5">
          <h2 className="testimonial-title">
            Success Stories
          </h2>
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div className="col-md-4" key={index}>
                <div className="testimonial-card">
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <p className="testimonial-author">— {testimonial.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container py-5">
          <h2 className="cta-title">
            Ready to Begin Your Learning Journey?
          </h2>
          <p className="cta-subtitle">
            Join thousands of dyslexic learners who are discovering the joy of learning.
          </p>
          <button
            className="cta-btn"
            onClick={() => navigate("/signup")}
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h3 className="footer-title">
                <span role="img" aria-label="Graduation cap">🎓</span> EduPlatform
              </h3>
              <p>
                Making education accessible for dyslexic learners through innovative technology and teaching methods.
              </p>
            </div>
            <div className="col-md-2 mb-4">
              <h4 className="footer-title">Links</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">Home</a></li>
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Games</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Accessibility</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h4 className="footer-title">Contact Us</h4>
              <p>
                <span role="img" aria-label="Email">✉️</span> help@eduplatform.com<br />
                <span role="img" aria-label="Phone">📞</span> (123) 456-7890
              </p>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;