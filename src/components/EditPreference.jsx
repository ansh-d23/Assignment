import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './stylings/popUp.css';

const EditPreferences = () => {
    const { user } = useAuth0();
    const [toggleStates, setToggleStates] = useState({
        emailPermission: false,
        phonePermission: false,
        addressPermission: false,
    });
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userID = user.sub;

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/user-preference/${userID}`);
                if (!response.ok) {
                    throw new Error('Error fetching preferences');
                }
                const data = await response.json();
                setToggleStates({
                    emailPermission: data.e_Permission || false,
                    phonePermission: data.p_Permission || false,
                    addressPermission: data.a_Permission || false,
                });

                if (data.e_Permission) setEmail(data.email || '');
                if (data.p_Permission) setPhone(data.phone || '');
                if (data.a_Permission) setAddress(data.address || '');
            } catch (err) {
                console.error('Error fetching preferences:', err);
                setError(err.message);
            }
        };

        fetchPreferences();
    }, [userID]);

    const handleToggle = (permission) => {
        setToggleStates((prevStates) => ({
            ...prevStates,
            [permission]: !prevStates[permission],
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        if (toggleStates.emailPermission && !email.trim()) {
            alert("email is req!");
            setLoading(false);
            return;
        }
        if (toggleStates.phonePermission && !phone.trim()) {
            alert("phone number req!");
            setLoading(false);
            return;
        }
        if (toggleStates.addressPermission && !address.trim()) {
            alert("address req!");
            setLoading(false);
            return;
        }

        const preferences = {
            userSub: user.sub,
            e_Permission: toggleStates.emailPermission,
            p_Permission: toggleStates.phonePermission,
            a_Permission: toggleStates.addressPermission,
            email: toggleStates.emailPermission ? email : null,
            phone: toggleStates.phonePermission ? phone : null,
            address: toggleStates.addressPermission ? address : null,
        };

        console.log(preferences);

        try {
            const response = await fetch('http://localhost:5000/api/edit-preference', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            alert("Preferences updated successfully");
            console.log('Preferences updated successfully:', data);
        } catch (err) {
            console.error('Error submitting preferences:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            window.location.href = '/user';
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit Preferences</h2>
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

                    {toggleStates.emailPermission && (
                        <div>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    )}

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

                    {toggleStates.phonePermission && (
                        <div>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    )}

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

                    {toggleStates.addressPermission && (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
                {error && <p className="error-message">Error: {error}</p>}
            </div>
        </div>
    );
};

export default EditPreferences;