import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './stylings/LandingForm.css';
import PopUp from './popUp'; 
import { useAuth0 } from '@auth0/auth0-react';

const LandingForm = () => {
    const { user, isLoading } = useAuth0(); 
    const [userPreferences, setUserPreferences] = useState(null);
    const [showPopUp, setShowPopUp] = useState(false);
    // const [address, setAddress] = useState(false);
    const [formData, setFormData] = useState({
        userSub: '',
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (user?.sub) {
            setFormData((prevData) => ({
                ...prevData,
                userSub: user.sub,
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (!user?.sub) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/user-preference/${encodeURIComponent(user.sub)}`, {
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                });
                setUserPreferences(response.data); 
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching user preferences:', error);
                setUserPreferences(null); 
            }
        };

        const fetchUserData = async () => {
            if (!user?.sub) return;

            try {
                await axios.post(`http://localhost:5000/api/log`, {
                    userSub: user.sub 
                }, {
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Error logging user data:', error);
            }
        };

        fetchUserPreferences();
        fetchUserData();
    }, [user]);

    useEffect(() => {
        if (userPreferences === null) {
            setShowPopUp(true);
        } else if (userPreferences) {
            setFormData((prevData) => ({
                ...prevData,
                name: userPreferences.name || '',
                email: userPreferences.email || '',
                phone: userPreferences.phone || '',
                address: userPreferences.address || ''
            }));
            setShowPopUp(false);
        }
    }, [userPreferences]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        try {
            const response = await axios.post('http://localhost:5000/api/submit', formData, {
                headers: { 
                    'Content-Type': 'application/json'
                }
            });
            alert("Submission Completed!");
            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error submitting form data:', error);
        }
    
            try {
                const res = await axios.post('http://localhost:5000/api/calcDistance', {
                    userSub: formData.userSub 
                }, {
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Distance calculated");
                console.log(res.data);
            } catch (error) {
                console.error('Error calculating distance:', error);
            }

            try {
                const res = await axios.post('http://localhost:5000/api/trust', {
                    userSub: formData.userSub 
                }, {
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                });
                console.log("saved");
                console.log(res.data);
            } catch (error) {
                console.error('Error calculating distance:', error);
            }     
        
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {showPopUp && <PopUp setShowPopUp={setShowPopUp} />}
            
            {userPreferences && !showPopUp && (
                <form onSubmit={handleSubmit}>
                    <h2>User Form</h2>
                    <div className="form-label">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={!userPreferences.e_Permission}
                        />
                    </div>
                    <div>
                        <label>Phone:</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={!userPreferences.p_Permission}
                        />
                    </div>
                    <div>
                        <label>Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            disabled={!userPreferences.a_Permission}
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}
        </>
    );
};

export default LandingForm;
