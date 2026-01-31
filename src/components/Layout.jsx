import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="app-title">GradientIQ</h2>
          <div className="nav-tabs">
            <Link 
              to="/" 
              className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/assessment" 
              className={`nav-tab ${location.pathname === '/assessment' ? 'active' : ''}`}
            >
              Assessment
            </Link>
            <Link 
              to="/analysis" 
              className={`nav-tab ${location.pathname === '/analysis' ? 'active' : ''}`}
            >
              Analysis
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
