import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import './stylings/DeviceType.css'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DeviceType = () => {
    const [deviceCounts, setDeviceCounts] = useState({ web: 0, mobile: 0, tablet: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/all_data');
                const data = response.data;

                const counts = { web: 0, mobile: 0, tablet: 0 };
                data.forEach(entry => {
                    if (entry.deviceType in counts) {
                        counts[entry.deviceType]++;
                    }
                });

                setDeviceCounts(counts);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = {
        labels: Object.keys(deviceCounts),
        datasets: [
            {
                label: 'Device Types',
                data: Object.values(deviceCounts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverOffset: 4,
            },
        ],
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
        <h2 className="title">Distribution of Device Types</h2>
        <div className="container">
            <div className="chart-container">
                <Pie data={chartData}  width={10} height={10} />
            </div>
        </div>
        </>
    );
};

export default DeviceType;
