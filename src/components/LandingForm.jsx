import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './stylings/LandingForm.css';
import PopUp from './popUp'; 
import { useAuth0 } from '@auth0/auth0-react';

const LandingForm = () => {
    const { user, isLoading } = useAuth0(); 
    const [userPreferences, setUserPreferences] = useState(null);
    const [showPopUp, setShowPopUp] = useState(false);
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
        if (user?.sub) {
            const fetchUserPreferences = async () => {
                try {
                    console.log("form_data")
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

            fetchUserPreferences();
        }
    }, [user]);

    useEffect(() => {
        if (userPreferences === null) {
            setShowPopUp(true);
        } else {
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
                            placeholder={userPreferences.name}
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
                            placeholder={userPreferences.email}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!userPreferences.e_Permission}
                        />
                    </div>
                    <div>
                        <label>Phone:</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder={userPreferences.phone}
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!userPreferences.p_Permission}
                        />
                    </div>
                    <div>
                        <label>Address:</label>
                        <input
                            type="text"
                            name="address"
                            placeholder={userPreferences.address}
                            value={formData.address}
                            onChange={handleChange}
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
