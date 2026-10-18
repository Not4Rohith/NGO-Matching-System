import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="ticks"></div>
      <div className="footer-content">
        <div className="footer-col-brand">
          <div className="footer-brand-header">
            <span className="footer-logo">🤝</span>
            <strong>ReliefHub NGO Network</strong>
          </div>
          <p className="footer-tagline">
            An intelligent humanitarian aid matching platform connecting emergency crisis requests
            with certified non-governmental organizations via NLP and multi-factor recommendation models.
          </p>
          <div className="footer-tech-stack">
            <span className="tech-badge">React 19</span>
            <span className="tech-badge">Vite 8</span>
            <span className="tech-badge">Node.js Express 5</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">Python 3 NLP</span>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#center">Overview</a></li>
              <li><a href="#request-aid">Post Aid Request</a></li>
              <li><a href="#directory">NGO Directory</a></li>
              <li><a href="#tracker">Live Request Board</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Source & Community</h4>
            <ul>
              <li>
                <a
                  href="https://github.com/RohithSV2/NGO"
                  target="_blank"
                  rel="noreferrer"
                  className="github-repo-link"
                >
                  <svg className="footer-gh-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                  </svg>
                  GitHub Repository (RohithSV2/NGO)
                </a>
              </li>
              <li><a href="https://vite.dev/" target="_blank" rel="noreferrer">Vite Documentation</a></li>
              <li><a href="https://react.dev/" target="_blank" rel="noreferrer">React 19 Docs</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>&copy; {new Date().getFullYear()} ReliefHub &bull; Open Source Minor Project</span>
        <span>Built with same font & background color theme</span>
      </div>
    </footer>
  );
}
