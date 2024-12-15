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

  const downloadCSV = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/download', {
            method: 'GET',
            headers: {
                'Content-Type': 'text/csv',
            },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'user_data.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading CSV:', error);
    }
};


  return (
    <nav className="navbar">
      <div onClick={() => navigate("/")} className="navbar-logo">
        Admin Dashboard
      </div>
      <ul className="navbar-links">
         <li onClick={() => navigate("/analysis")} className="navbar-item">
          Analytics
        </li>
        <li onClick={downloadCSV} className="navbar-item">
          download CSV
        </li>
        <li onClick={handleLogout} className="navbar-item">
          Logout
        </li>
      </ul>
    </nav>
  );
};

export default NavbarB;
