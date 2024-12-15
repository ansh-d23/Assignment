import React from "react";
import DeviceType from './DeviceType.jsx';
import ActiveUsersChart from "./ActiveUsers.jsx";
import './stylings/analytics.css';

const Analytics = () => {
    return (
        <div className="dashboard">
            <h1 className="dashboard-header">Analytics Dashboard</h1>
            <div className="charts-container">
                <div className="chart-box">
                    <DeviceType />
                </div>
                <div className="chart-box">
                    <ActiveUsersChart />
                </div>
            </div>
        </div>
    );
};

export default Analytics;