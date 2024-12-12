import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./stylings/Navbar.css";

const NavbarB = () => {
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    console.log("Logged out");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div onClick={() => navigate("/")} className="navbar-logo">
        Admin Dashboard
      </div>
      <ul className="navbar-links">
        {/* <li onClick={() => navigate("/edit")} className="navbar-item">
          Edit Preferences
        </li> */}
        <li onClick={handleLogout} className="navbar-item">
          Logout
        </li>
      </ul>
    </nav>
  );
};

export default NavbarB;
