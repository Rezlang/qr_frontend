import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchReferrers,
  fetchAccessDates,
  fetchUniqueVisitors,
  fetchHourlyPatterns,
  fetchOriginalURLNoRedirect,
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
  const [analyticsData, setAnalyticsData] = useState({
    referrersData: null,
    accessDatesData: null,
    uniqueVisitorsData: null,
    hourlyPatternsData: null,
    originalURLData: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [refData, datesData, uniqueVisitors, hourlyPatterns, originalURL] = await Promise.all([
          fetchReferrers(shortenedUrl),
          fetchAccessDates(shortenedUrl),
          fetchUniqueVisitors(shortenedUrl),
          fetchHourlyPatterns(shortenedUrl),
          fetchOriginalURLNoRedirect(shortenedUrl),
        ]);

        setAnalyticsData({
          referrersData: refData.referrers,
          accessDatesData: datesData.access_dates,
          uniqueVisitorsData: uniqueVisitors,
          hourlyPatternsData: hourlyPatterns,
          originalURLData: originalURL,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAnalytics();
  }, [shortenedUrl]);

  if (error) return <div>Error: {error}</div>;
  if (!analyticsData.referrersData || !analyticsData.accessDatesData) return <div>Loading analytics...</div>;

  // Prepare data for the Pie Chart (Referrers)
  const pieChartData = {
    labels: Object.keys(analyticsData.referrersData),
    datasets: [
      {
        data: Object.values(analyticsData.referrersData),
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
  const sortedDates = Object.keys(analyticsData.accessDatesData).sort();
  const accessDateChart = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Access Count',
        data: sortedDates.map((date) => analyticsData.accessDatesData[date]),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  // Prepare data for the Line Chart (Hourly Patterns)
  const sortedHours = Object.keys(analyticsData.hourlyPatternsData.hourly_patterns)
  .map((hour) => Number(hour))
  .filter((hour) => !isNaN(hour))
  .sort((a, b) => a - b);
  
  const hourlyPatternChart = {
    labels: sortedHours,
    datasets: [
      {
        data: sortedHours.map((hour) => 
          Math.max(0, Number(analyticsData.hourlyPatternsData.hourly_patterns[hour]) 
        || 0)), 
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        callbacks: {
          title: () => "", // Hide title in tooltip
          label: (tooltipItem) => `${tooltipItem.raw}`, // Show only value
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  
  return (
    <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Analytics</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ textAlign: 'center' }}>Referrer Distribution</h3>
            <Pie data={pieChartData} />
          </div>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ textAlign: 'center' }}>Access Dates Histogram</h3>
            <Bar data={accessDateChart} options={chartOptions} />
          </div>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ textAlign: 'center' }}>Hourly Access Patterns</h3>
            <Line data={hourlyPatternChart} options={chartOptions} />
          </div>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3>Unique Visitors: {analyticsData.uniqueVisitorsData.unique_visitors}</h3>
          </div>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3>Short URL: {shortenedUrl}</h3>
          </div>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3>Redirects to: <br /> {analyticsData.originalURLData.url}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
