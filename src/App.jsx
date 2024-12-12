import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./components/Homepage";
import Navbar from "./components/Navbar";
import NavbarB from "./components/Navbar_backend";
import LandingPage from "./components/LandingPage";
import BackendDashboard from "./components/BackendDashboard";
import PopUp from "./components/popUp";
import EditPreference from "./components/EditPreference";
import { useAuth0 } from "@auth0/auth0-react";

const App = () => {
	const location = useLocation();
	const { isAuthenticated, user } = useAuth0();
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const fetchUserRole = async () => {
		if (user) {
				const response = await fetch(`http://localhost:5000/api/user-preference/${user.sub}`);
				const data = await response.json();
				setIsAdmin(data.role === "admin");
		}
		};

		if (isAuthenticated) {
		fetchUserRole();
		}
	}, [isAuthenticated, user]);

	return (
		<>
		{(location.pathname === "/user" || location.pathname === "/edit") && <Navbar />}
		{location.pathname === "/backend_dashboard" && <NavbarB />}

		<Routes>

			<Route path="/" element={<HomePage />} />
      
			{isAuthenticated && (
			<>
				<Route path="/user" element={<LandingPage />} />
				{
					isAdmin && 
					<Route path="/backend_dashboard" element={<BackendDashboard />} />
				}
				<Route path="/popUp" element={<PopUp />} />
				<Route path="/edit" element={<EditPreference />} />
			</>
			)}
		</Routes>
		</>
	);
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;