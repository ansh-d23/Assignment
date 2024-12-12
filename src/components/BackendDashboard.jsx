import React, { useState, useEffect } from "react";
import axios from "axios";
import "./stylings/BackendDashboard.css";

const BackendDashboard = () => {
    
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/all_users");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("Received data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
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