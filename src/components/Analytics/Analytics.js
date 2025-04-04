import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchReferrers,
  fetchAccessDates,
  fetchUniqueVisitors,
  fetchHourlyPatterns
} from '../../services/api';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Analytics = () => {
  const { shortenedUrl } = useParams();
  const [referrersData, setReferrersData] = useState(null);
  const [accessDatesData, setAccessDatesData] = useState(null);
  const [uniqueVisitorsData, setUniqueVisitorsData] = useState(null);
  const [hourlyPatternsData, setHourlyPatternsData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const refData = await fetchReferrers(shortenedUrl);
        const datesData = await fetchAccessDates(shortenedUrl);
        const uniqueVisitors = await fetchUniqueVisitors(shortenedUrl);
        const hourlyPatterns = await fetchHourlyPatterns(shortenedUrl);

        console.log("ref data", refData)
        console.log("date data", datesData)
        console.log("unique visitors", uniqueVisitors)
        console.log("hourly patterns", hourlyPatterns)

        setReferrersData(refData.referrers);
        setAccessDatesData(datesData.access_dates);
        setUniqueVisitorsData(uniqueVisitors);
        setHourlyPatternsData(hourlyPatterns);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAnalytics();
  }, [shortenedUrl]);

  if (error) return <div>Error: {error}</div>;
  if (!referrersData || !accessDatesData) return <div>Loading analytics...</div>;

  // Prepare data for the Pie Chart (Referrers)
  const pieChartData = {
    labels: Object.keys(referrersData),
    datasets: [
      {
        data: Object.values(referrersData),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  // Prepare data for the Bar Chart (Access Dates)
  const sortedDates = Object.keys(accessDatesData).sort();
  const barChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Access Count',
        data: sortedDates.map((date) => accessDatesData[date]),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  // Prepare data for the Line Chart (Hourly Patterns)
  const sortedHours = Object.keys(hourlyPatternsData.hourly_patterns)
  .map((hour) => Number(hour))
  .filter((hour) => !isNaN(hour)) // Filter out any non-numeric values
  .sort((a, b) => a - b);
  
  const lineChartData = {
    labels: sortedHours,
    datasets: [
      {
        data: sortedHours.map((hour) => Math.max(0, Number(hourlyPatternsData.hourly_patterns[hour]) || 0)), 
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
    ],
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Analytics</h2>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Referrer Distribution</h3>
        <Pie data={pieChartData} />
      </div>
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h3>Access Dates Histogram</h3>
        <Bar data={barChartData} />
      </div>
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h3>Hourly Access Patterns</h3>
        <Line data={lineChartData} />
      </div>
      <div>
        Unique Visitors: {uniqueVisitorsData.unique_visitors}
      </div>
    </div>
  );
};

export default Analytics;
