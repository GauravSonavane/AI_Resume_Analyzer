import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMAP</p>
            </Link>
            <Link to="/upload">
                <button type="button" className="primary-button w-fit">
                    Upload Resume
                </button>
            </Link>
        </nav>
    );
};

export default Navbar;
