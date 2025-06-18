import { Link } from 'react-router-dom';

function Navbar({ onPatientList, onCreateEhr }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-lg fixed-top" style={{ 
      background: 'rgba(0, 123, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/doctor" style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          fontSize: '1.5rem'
        }}>
          <i className="bi bi-heart-pulse me-2"></i>
          Doctor Dashboard
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item me-2">
              <button 
                className="nav-link btn text-white fw-medium px-4 py-2 rounded-pill"
                onClick={onPatientList}
                style={{ 
                  transition: 'all 0.3s',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-people me-2"></i>
                Patient List
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn text-white fw-medium px-4 py-2 rounded-pill"
                onClick={onCreateEhr}
                style={{ 
                  transition: 'all 0.3s',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create EHR
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;