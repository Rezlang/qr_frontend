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
import {
  Container,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

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

  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!analyticsData.referrersData || !analyticsData.accessDatesData) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare Pie Chart (Referrers)
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

  // Prepare Bar Chart (Access Dates)
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

  // Prepare Line Chart (Hourly Patterns)
  const sortedHours = Object.keys(analyticsData.hourlyPatternsData.hourly_patterns)
    .map((hour) => Number(hour))
    .filter((hour) => !isNaN(hour))
    .sort((a, b) => a - b);

  const hourlyPatternChart = {
    labels: sortedHours,
    datasets: [
      {
        data: sortedHours.map((hour) =>
          Math.max(0, Number(analyticsData.hourlyPatternsData.hourly_patterns[hour]) || 0)),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => "",
          label: (tooltipItem) => `${tooltipItem.raw}`,
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Referrer Distribution
              </Typography>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Access Dates Histogram
              </Typography>
              <Bar data={accessDateChart} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Hourly Access Patterns
              </Typography>
              <Line data={hourlyPatternChart} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Unique Visitors: {analyticsData.uniqueVisitorsData.unique_visitors}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Short URL: {shortenedUrl}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" align="center">
                Redirects to:<br />{analyticsData.originalURLData.url}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
