import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ActiveUsersChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/active-users');
                setData(response.data);
                console.log(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const timeSlots = ['0-6', '6-12', '12-18', '18-24'];

    const totalCounts = timeSlots.map(slot => 
        data.map(entry => 
            entry.counts.find(count => count.k === slot)?.v || 0 
        ).reduce((a, b) => a + b, 0)
    );

    const chartData = {
        labels: timeSlots,
        datasets: [{
            label: 'Active Users',
            data: totalCounts,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Active Users Over Time Slots',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time Slots',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Active Users',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h2>Active Users Bar Chart</h2>
            <Bar data={chartData} options={options} className='container_AC'/>
        </div>
    );
};

export default ActiveUsersChart;
