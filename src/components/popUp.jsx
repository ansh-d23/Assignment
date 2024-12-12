import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './stylings/popUp.css';

const PopUp = ({ setShowPopUp }) => {
    const { user } = useAuth0();
    const [toggleStates, setToggleStates] = useState({
        emailPermission: false,
        phonePermission: false,
        addressPermission: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleToggle = (permission) => {
        setToggleStates((prevStates) => ({
            ...prevStates,
            [permission]: !prevStates[permission],
        }));
    };

    const userID = user.sub;

    const handleSubmit = async () => {

        setLoading(true);
        setError(null);

        const preferences = {
            userSub: user.sub,
            e_Permission: toggleStates.emailPermission,
            p_Permission: toggleStates.phonePermission,
            a_Permission: toggleStates.addressPermission,
        };

        try {
            const response = await fetch('http://localhost:5000/api/preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
            });            
            
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Preferences saved successfully:', data);
        } catch (err) {
            console.error('Error submitting preferences:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setShowPopUp(false);
            window.location.reload();
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Pop-Up Screen</h2>
                <div className="toggle-buttons">
                    <div className="toggle-container">
                        <span>Email ID</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={toggleStates.emailPermission}
                                onChange={() => handleToggle('emailPermission')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="toggle-container">
                        <span>Phone Number</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={toggleStates.phonePermission}
                                onChange={() => handleToggle('phonePermission')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="toggle-container">
                        <span>Address</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={toggleStates.addressPermission}
                                onChange={() => handleToggle('addressPermission')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
                {error && <p className="error-message">Error: {error}</p>}
            </div>
        </div>
    );
};

export default PopUp;
