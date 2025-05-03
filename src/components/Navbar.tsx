import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Create Meme</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Meme Gallery</Link>
    </nav>
  );
};

export default Navbar; 