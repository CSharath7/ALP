import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  // Dyslexia-friendly styles
  const dyslexicStyles = {
    fontFamily: "'Comic Sans MS', sans-serif",
    letterSpacing: "0.05em",
    lineHeight: "1.6",
    color: "#333",
  };

  // Blue color theme
  const blueTheme = {
    bgLight: "#EFF6FF",       // bg-blue-50
    bgMedium: "#BFDBFE",      // bg-blue-200
    borderLight: "#BFDBFE",   // border-blue-200
    borderMedium: "#60A5FA",  // border-blue-400
    borderDark: "#3B82F6",    // border-blue-500
    textDark: "#1E40AF",      // text-blue-800
    button: "#2563EB",        // bg-blue-600
    buttonHover: "#1D4ED8",   // bg-blue-700
    gradientFrom: "#3B82F6",  // from-blue-500
    gradientTo: "#6366F1"     // to-indigo-500
  };

  return (
    <div style={{ ...dyslexicStyles, backgroundColor: blueTheme.bgLight }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="#" style={{ ...dyslexicStyles, color: blueTheme.textDark }}>
            <span role="img" aria-label="Graduation cap">🎓</span> EduPlatform
          </a>
          <div className="ms-auto d-flex align-items-center">
            <button
              className="btn btn-outline-primary me-3 px-4 py-2 rounded-pill"
              onClick={() => navigate("/login")}
              style={{
                ...dyslexicStyles,
                fontSize: "1.1rem",
                color: blueTheme.borderDark,
                borderColor: blueTheme.borderDark
              }}
            >
              Login
            </button>
            <button
              className="btn btn-outline-primary me-3 px-4 py-2 rounded-pill"
              onClick={() => navigate("/ChildLogin")}
              style={{
                ...dyslexicStyles,
                fontSize: "1.1rem",
                color: blueTheme.borderDark,
                borderColor: blueTheme.borderDark
              }}
            >
              Child Login
            </button>
            <button
              className="btn btn-primary px-4 py-2 rounded-pill"
              onClick={() => navigate("/signup")}
              style={{
                ...dyslexicStyles,
                fontSize: "1.1rem",
                backgroundColor: blueTheme.button,
                borderColor: blueTheme.button
              }}
            >
              Become a Mentor
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="hero d-flex align-items-center justify-content-center text-center py-5"
        style={{
          background: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1')`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "80vh"
        }}
      >
        <div className="container text-white py-5">
          <h1 className="display-4 fw-bold mb-4" style={{ fontSize: "2.8rem" }}>
            Empowering <span style={{ color: "#FBBF24" }}>Dyslexic Learners</span>, One Step at a Time
          </h1>
          <p className="lead fs-3 mb-5">
            A platform designed to make learning accessible and enjoyable for everyone.
          </p>
          <div className="d-flex justify-content-center gap-4">
            <button
              className="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold"
              onClick={() => navigate("/games")}
              style={dyslexicStyles}
            >
              Start Learning Now
            </button>
            <button
              className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold"
              onClick={() => navigate("/about")}
              style={dyslexicStyles}
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" style={{ backgroundColor: blueTheme.bgLight }}>
        <div className="container py-5">
          <h2 className="text-center mb-5 fw-bold" style={{ fontSize: "2.2rem", color: blueTheme.textDark }}>
            Why Choose Our Platform?
          </h2>
          <div className="row g-4">
            {[
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
            ].map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 p-4 border-0 shadow-sm rounded-3 bg-white">
                  <div className="card-body text-center">
                    <div className="fs-1 mb-3" role="img" aria-hidden="true">
                      {feature.icon}
                    </div>
                    <h3 className="card-title fw-bold mb-3" style={{ fontSize: "1.5rem", color: blueTheme.textDark }}>
                      {feature.title}
                    </h3>
                    <p className="card-text" style={{ fontSize: "1.1rem" }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5" style={{ backgroundColor: blueTheme.borderDark }}>
        <div className="container py-5">
          <h2 className="text-center mb-5 fw-bold text-white" style={{ fontSize: "2.2rem" }}>
            Success Stories
          </h2>
          <div className="row g-4">
            {[
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
            ].map((testimonial, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 p-4 border-0 rounded-3 bg-white">
                  <div className="card-body">
                    <p className="card-text fs-5 mb-4" style={{ fontStyle: "italic" }}>
                      "{testimonial.quote}"
                    </p>
                    <p className="card-text fw-bold" style={{ color: blueTheme.borderDark }}>
                      — {testimonial.author}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5" style={{ backgroundColor: blueTheme.bgLight }}>
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-4" style={{ fontSize: "2.2rem", color: blueTheme.textDark }}>
            Ready to Begin Your Learning Journey?
          </h2>
          <p className="lead mb-5" style={{ fontSize: "1.3rem" }}>
            Join thousands of dyslexic learners who are discovering the joy of learning.
          </p>
          <button
            className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold"
            onClick={() => navigate("/signup")}
            style={{
              ...dyslexicStyles,
              backgroundColor: blueTheme.button,
              borderColor: blueTheme.button
            }}
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h3 className="fw-bold mb-3">
                <span role="img" aria-label="Graduation cap">🎓</span> EduPlatform
              </h3>
              <p>
                Making education accessible for dyslexic learners through innovative technology and teaching methods.
              </p>
            </div>
            <div className="col-md-2 mb-4">
              <h4 className="fw-bold mb-3">Links</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white">Home</a></li>
                <li className="mb-2"><a href="#" className="text-white">About</a></li>
                <li className="mb-2"><a href="#" className="text-white">Games</a></li>
                <li className="mb-2"><a href="#" className="text-white">Contact</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h4 className="fw-bold mb-3">Support</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white">Help Center</a></li>
                <li className="mb-2"><a href="#" className="text-white">Accessibility</a></li>
                <li className="mb-2"><a href="#" className="text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h4 className="fw-bold mb-3">Contact Us</h4>
              <p>
                <span role="img" aria-label="Email">✉️</span> help@eduplatform.com<br />
                <span role="img" aria-label="Phone">📞</span> (123) 456-7890
              </p>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center">
            <p>© {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
