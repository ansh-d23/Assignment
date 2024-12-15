import React, { useState, useEffect } from "react";
import axios from "axios";
import "./stylings/BackendDashboard.css";

const BackendDashboard = () => {
    
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/all_users");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("Received user data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };


    const fetchData = async () => {
      try {
        const response_data = await axios.get("http://localhost:5000/api/all_data");
        if (Array.isArray(response_data.data)) {
          setData(response_data.data);
        } else {
          console.error("Received data is not an array:", response_data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchData();
  }, []);


  const combinedData = users.map((user) => {

    const additionalInfo = data.find((item) => item.userSub === user.userSub);
    return {
      ...user,
      timestamp: additionalInfo ? additionalInfo.timestamp : '',
      ipAddress: additionalInfo ? additionalInfo.ipAddress : '',
      distance: additionalInfo ? additionalInfo.distance : '',
      trustIndex: additionalInfo ? additionalInfo.trustIndex : ''
    };
  });


  return (
    <div className="dashboard-container">
      <div className="card">
        <div className="card-header">
          <h2>User Management</h2>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="loading-message">Loading...</div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Address</th>
                  <th>Last Login - UTC</th>
                  <th>Ip Address </th>
                  <th>Distance - in Km</th>
                  <th>Trust Index - %</th>
                </tr>
              </thead>
              <tbody>
              {combinedData.length > 0 ? (
                  combinedData.map((user) => (
                    <tr key={user.userSub}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                      <td>{user.timestamp || 'N/A'}</td> 
                      <td>{user.ipAddress}</td>
                      <td>{user.distance}</td>
                      <td>{user.trustIndex}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No users available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendDashboard;