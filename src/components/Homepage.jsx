import React from "react";
import "./stylings/HomePage.css";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const HomePage = () => {
	const navigate = useNavigate();
	const { isAuthenticated, loginWithRedirect } = useAuth0();

	return (
		<div className="home-container">
			<h1 className="home-title">Preferences Sharing Interface </h1>

			<p className="home-subtitle">
			"Only the Users with an Admin role, can access the backend dashboard."
			</p>

			{isAuthenticated ? (
				<div className="button-container">
					<button onClick={() => navigate("/user")} className="home-button">Go to User Landing Page
					</button>
					<button onClick={() => navigate("/backend_dashboard")} className="home-button">Go to Backend Dashboard</button>
				</div>
			) : (
				<div className="button-container">
					<button onClick={() => loginWithRedirect()} className="home-button">Log In</button>
				</div>
			)}
		</div>
	);
};

export default HomePage;