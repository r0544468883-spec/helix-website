export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            HELIX<span className="dot">.</span>
          </div>
          <div>© {year} · Founded by Eran Lipshtain</div>
          <div className="footer-links">
            <a href="/privacy">פרטיות</a>
            <a
              href="https://www.linkedin.com/in/eranlipi/"
              target="_blank"
              rel="me noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
