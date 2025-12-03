import React, { useEffect, useState } from "react";
import { FaUsers, FaChartBar, FaList, FaClipboardQuestion, FaBan, FaCircleCheck, FaShield, FaStar, FaUserPlus, FaDownload } from "react-icons/fa6";
import UsersByCollegeChart from './UsersByCollegeChart';
import ItemsByCategoryChart from './ItemsByCategoryChart';
import AuditLog from './AuditLog';
import UserRatings from './UserRatings';
import { exportToCSV, exportToPDF } from '../../utils/exportHelpers';

export default function Dashboard({ ip, refresh }) {
  // Time period state
  const [timePeriod, setTimePeriod] = useState("overall");
  const [activeTab, setActiveTab] = useState("overview");

  // Current stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPendingItems, setTotalPendingItems] = useState(0);
  const [totalArchivedItems, setTotalArchivedItems] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalUserRatings, setTotalUserRatings] = useState(0);
  const [totalPendingRegistrations, setTotalPendingRegistrations] = useState(0);
  const [totalApprovedRegistrations, setTotalApprovedRegistrations] = useState(0);
  const [collegeData, setCollegeData] = useState([]);
  const [itemCategoryData, setItemCategoryData] = useState([]);

  // Historical data
  const [weeklyStats, setWeeklyStats] = useState({
    users: 0,
    items: 0,
    pendingItems: 0,
    archivedItems: 0,
    soldItems: 0,
    userRatings: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    users: 0,
    items: 0,
    pendingItems: 0,
    archivedItems: 0,
    soldItems: 0,
    userRatings: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
  });
  const [yearlyStats, setYearlyStats] = useState({
    users: 0,
    items: 0,
    pendingItems: 0,
    archivedItems: 0,
    soldItems: 0,
    userRatings: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
  });

  // Period selection states
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to fetch stats for a time period
  const fetchStatsByPeriod = (period, weekNum = null, monthNum = null, yearNum = null) => {
    const params = new URLSearchParams({ period });
    if (weekNum !== null) params.append('week', weekNum);
    if (monthNum !== null) params.append('month', monthNum);
    if (yearNum !== null) params.append('year', yearNum);

    //Fetching total users
    fetch(`${ip}/fetchTotalUsers.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalUsers = data.total_users || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, users: totalUsers }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, users: totalUsers }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, users: totalUsers }));
          else setTotalUsers(totalUsers);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, users: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, users: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, users: 0 }));
        else setTotalUsers(0);
      });

    //Fetching total items
    fetch(`${ip}/fetchTotalItems.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalItems = data.total_items || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, items: totalItems }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, items: totalItems }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, items: totalItems }));
          else setTotalItems(totalItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, items: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, items: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, items: 0 }));
        else setTotalItems(0);
      });

    //Fetching total pending items
    fetch(`${ip}/fetchTotalPendingItems.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalPendingItems = data.total_pending_items || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, pendingItems: totalPendingItems }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, pendingItems: totalPendingItems }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, pendingItems: totalPendingItems }));
          else setTotalPendingItems(totalPendingItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching pending items:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, pendingItems: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, pendingItems: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, pendingItems: 0 }));
        else setTotalPendingItems(0);
      });

    //Fetching total archived items
    fetch(`${ip}/fetchTotalArchivedItems.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalArchivedItems = data.total_archived_items || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, archivedItems: totalArchivedItems }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, archivedItems: totalArchivedItems }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, archivedItems: totalArchivedItems }));
          else setTotalArchivedItems(totalArchivedItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching archived items:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, archivedItems: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, archivedItems: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, archivedItems: 0 }));
        else setTotalArchivedItems(0);
      });

    //Fetching total sold items
    fetch(`${ip}/fetchHistoricalSoldItems.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalSoldItems = data.total_sold_items || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, soldItems: totalSoldItems }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, soldItems: totalSoldItems }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, soldItems: totalSoldItems }));
          else setTotalSoldItems(totalSoldItems);
        }
      })
      .catch((error) => {
        console.error("Error fetching sold items:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, soldItems: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, soldItems: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, soldItems: 0 }));
        else setTotalSoldItems(0);
      });

    //Fetching total user ratings
    fetch(`${ip}/fetchTotalUserRatings.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalRatings = data.total_ratings || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, userRatings: totalRatings }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, userRatings: totalRatings }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, userRatings: totalRatings }));
          else setTotalUserRatings(totalRatings);
        }
      })
      .catch((error) => {
        console.error("Error fetching user ratings:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, userRatings: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, userRatings: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, userRatings: 0 }));
        else setTotalUserRatings(0);
      });

    //Fetching total pending registrations
    fetch(`${ip}/fetchTotalPendingRegistrations.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalPendingRegistrations = data.total_pending_registrations || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, pendingRegistrations: totalPendingRegistrations }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, pendingRegistrations: totalPendingRegistrations }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, pendingRegistrations: totalPendingRegistrations }));
          else setTotalPendingRegistrations(totalPendingRegistrations);
        }
      })
      .catch((error) => {
        console.error("Error fetching pending registrations:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, pendingRegistrations: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, pendingRegistrations: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, pendingRegistrations: 0 }));
        else setTotalPendingRegistrations(0);
      });

    //Fetching total approved registrations
    fetch(`${ip}/fetchTotalApprovedRegistrations.php?${params}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const totalApprovedRegistrations = data.total_approved_registrations || 0;
          if (period === "week") setWeeklyStats(prev => ({ ...prev, approvedRegistrations: totalApprovedRegistrations }));
          else if (period === "month") setMonthlyStats(prev => ({ ...prev, approvedRegistrations: totalApprovedRegistrations }));
          else if (period === "year") setYearlyStats(prev => ({ ...prev, approvedRegistrations: totalApprovedRegistrations }));
          else setTotalApprovedRegistrations(totalApprovedRegistrations);
        }
      })
      .catch((error) => {
        console.error("Error fetching approved registrations:", error);
        if (period === "week") setWeeklyStats(prev => ({ ...prev, approvedRegistrations: 0 }));
        else if (period === "month") setMonthlyStats(prev => ({ ...prev, approvedRegistrations: 0 }));
        else if (period === "year") setYearlyStats(prev => ({ ...prev, approvedRegistrations: 0 }));
        else setTotalApprovedRegistrations(0);
      });
  };

  const handleExportOverviewCSV = () => {
    const statsData = [
      { 'Metric': 'Total Users', 'Count': totalUsers || 0, 'Period': 'Overall' },
      { 'Metric': 'Total Items', 'Count': totalItems || 0, 'Period': 'Overall' },
      { 'Metric': 'Sold Items', 'Count': totalSoldItems || 0, 'Period': 'Overall' },
      { 'Metric': 'Pending Items', 'Count': totalPendingItems || 0, 'Period': 'Overall' },
      { 'Metric': 'Archived Items', 'Count': totalArchivedItems || 0, 'Period': 'Overall' },
      { 'Metric': 'User Ratings', 'Count': totalUserRatings || 0, 'Period': 'Overall' },
      { 'Metric': 'Pending Registrations', 'Count': totalPendingRegistrations || 0, 'Period': 'Overall' },
      { 'Metric': 'Approved Registrations', 'Count': totalApprovedRegistrations || 0, 'Period': 'Overall' }
    ];
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(statsData, `dashboard-overview-${timestamp}.csv`);
  };

  const handleExportOverviewPDF = () => {
    const statsData = [
      { 'Metric': 'Total Users', 'Count': totalUsers || 0, 'Description': 'Registered users across all colleges' },
      { 'Metric': 'Total Items', 'Count': totalItems || 0, 'Description': 'Listed items across all categories' },
      { 'Metric': 'Sold Items', 'Count': totalSoldItems || 0, 'Description': 'Items marked as sold' },
      { 'Metric': 'Pending Items', 'Count': totalPendingItems || 0, 'Description': 'Items needed to be reviewed' },
      { 'Metric': 'Archived Items', 'Count': totalArchivedItems || 0, 'Description': 'Items that violated commerce policies' },
      { 'Metric': 'User Ratings', 'Count': totalUserRatings || 0, 'Description': 'App ratings submitted by users' },
      { 'Metric': 'Pending Registrations', 'Count': totalPendingRegistrations || 0, 'Description': 'User registrations awaiting approval' },
      { 'Metric': 'Approved Registrations', 'Count': totalApprovedRegistrations || 0, 'Description': 'User registrations approved' }
    ];

    const chartData = {
      collegeChart: collegeData,
      categoryChart: itemCategoryData
    };

    exportToPDF(
      'Dashboard Statistics - Overall',
      ['Metric', 'Count', 'Description'],
      statsData,
      'dashboard-overview.pdf',
      true,
      chartData
    );
  };

  const handleExportPeriodCSV = (period, stats) => {
    const statsData = [
      { 'Metric': 'Users', 'Count': stats.users || 0 },
      { 'Metric': 'Items', 'Count': stats.items || 0 },
      { 'Metric': 'Sold Items', 'Count': stats.soldItems || 0 },
      { 'Metric': 'Pending Items', 'Count': stats.pendingItems || 0 },
      { 'Metric': 'Archived Items', 'Count': stats.archivedItems || 0 },
      { 'Metric': 'User Ratings', 'Count': stats.userRatings || 0 },
      { 'Metric': 'Pending Registrations', 'Count': stats.pendingRegistrations || 0 },
      { 'Metric': 'Approved Registrations', 'Count': stats.approvedRegistrations || 0 }
    ];
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(statsData, `dashboard-${period}-${timestamp}.csv`);
  };

  const handleExportPeriodPDF = (period, stats) => {
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    const statsData = [
      { 'Metric': 'Users', 'Count': stats.users || 0, 'Description': `New users registered this ${period}` },
      { 'Metric': 'Items', 'Count': stats.items || 0, 'Description': `New items listed this ${period}` },
      { 'Metric': 'Sold Items', 'Count': stats.soldItems || 0, 'Description': `Items sold this ${period}` },
      { 'Metric': 'Pending Items', 'Count': stats.pendingItems || 0, 'Description': `Items pending review this ${period}` },
      { 'Metric': 'Archived Items', 'Count': stats.archivedItems || 0, 'Description': `Items archived this ${period}` },
      { 'Metric': 'User Ratings', 'Count': stats.userRatings || 0, 'Description': `Ratings submitted this ${period}` },
      { 'Metric': 'Pending Registrations', 'Count': stats.pendingRegistrations || 0, 'Description': `Registrations pending this ${period}` },
      { 'Metric': 'Approved Registrations', 'Count': stats.approvedRegistrations || 0, 'Description': `Registrations approved this ${period}` }
    ];

    const chartData = {
      collegeChart: collegeData,
      categoryChart: itemCategoryData
    };

    exportToPDF(
      `Dashboard Statistics - ${periodLabel}`,
      ['Metric', 'Count', 'Description'],
      statsData,
      `dashboard-${period}.pdf`,
      true,
      chartData
    );
  };

  // fetch overall stats on mount
  useEffect(() => {
    fetchStatsByPeriod("overall");
  }, [ip, refresh]);

  // fetch historical stats based on selections
  useEffect(() => {
    if (timePeriod === 'weekly') {
      fetchStatsByPeriod("week", selectedWeek, new Date().getMonth() + 1, new Date().getFullYear());
    }
  }, [ip, refresh, timePeriod, selectedWeek]);

  useEffect(() => {
    if (timePeriod === 'monthly') {
      fetchStatsByPeriod("month", null, selectedMonth, new Date().getFullYear());
    }
  }, [ip, refresh, timePeriod, selectedMonth]);

  useEffect(() => {
    if (timePeriod === 'yearly') {
      fetchStatsByPeriod("year", null, null, selectedYear);
    }
  }, [ip, refresh, timePeriod, selectedYear]);

  // fetch data for charts based on selected time period
  useEffect(() => {
    // Convert timePeriod to backend format (weekly -> week, monthly -> month, yearly -> year)
    const periodMap = {
      'overall': 'overall',
      'weekly': 'week',
      'monthly': 'month',
      'yearly': 'year'
    };
    const backendPeriod = periodMap[timePeriod] || 'overall';

    // Build URL with parameters
    const params = new URLSearchParams({ period: backendPeriod });
    if (timePeriod === 'weekly') {
      params.append('week', selectedWeek);
      params.append('month', new Date().getMonth() + 1);
      params.append('year', new Date().getFullYear());
    } else if (timePeriod === 'monthly') {
      params.append('month', selectedMonth);
      params.append('year', new Date().getFullYear());
    } else if (timePeriod === 'yearly') {
      params.append('year', selectedYear);
    }

    fetch(`${ip}/getCollegeStatsByPeriod.php?${params}`)
      .then(res => res.json())
      .then(data => setCollegeData(data))
      .catch(err => console.error('Failed to fetch college data:', err));
  }, [ip, refresh, timePeriod, selectedWeek, selectedMonth, selectedYear]);

  useEffect(() => {
    // Convert timePeriod to backend format (weekly -> week, monthly -> month, yearly -> year)
    const periodMap = {
      'overall': 'overall',
      'weekly': 'week',
      'monthly': 'month',
      'yearly': 'year'
    };
    const backendPeriod = periodMap[timePeriod] || 'overall';

    // Build URL with parameters
    const params = new URLSearchParams({ period: backendPeriod });
    if (timePeriod === 'weekly') {
      params.append('week', selectedWeek);
      params.append('month', new Date().getMonth() + 1);
      params.append('year', new Date().getFullYear());
    } else if (timePeriod === 'monthly') {
      params.append('month', selectedMonth);
      params.append('year', new Date().getFullYear());
    } else if (timePeriod === 'yearly') {
      params.append('year', selectedYear);
    }

    fetch(`${ip}/getItemCategoryStatsByPeriod.php?${params}`)
      .then(res => res.json())
      .then(data => setItemCategoryData(data))
      .catch(err => console.error('Failed to fetch item category data:', err));
  }, [ip, refresh, timePeriod, selectedWeek, selectedMonth, selectedYear]);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
          onClick={() => setActiveTab("audit")}
        >
          <FaShield /> Audit Log
        </button>
        <button
          className={`tab-btn ${activeTab === "ratings" ? "active" : ""}`}
          onClick={() => setActiveTab("ratings")}
        >
          <FaStar /> User Ratings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Time Period Selector */}
          <div className="time-period-selector">
            <button
              className={`period-btn ${timePeriod === "overall" ? "active" : ""}`}
              onClick={() => setTimePeriod("overall")}
            >
              Overall
            </button>
            <button
              className={`period-btn ${timePeriod === "weekly" ? "active" : ""}`}
              onClick={() => setTimePeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`period-btn ${timePeriod === "monthly" ? "active" : ""}`}
              onClick={() => setTimePeriod("monthly")}
            >
              Monthly
            </button>
            <button
              className={`period-btn ${timePeriod === "yearly" ? "active" : ""}`}
              onClick={() => setTimePeriod("yearly")}
            >
              Yearly
            </button>
          </div>

          {/* Display stats based on selected period */}
          {timePeriod === "overall" && (
            <>
              <div className="export-buttons">
                <button className="export-btn" onClick={handleExportOverviewCSV}>
                  <FaDownload /> Export CSV
                </button>
                <button className="export-btn" onClick={handleExportOverviewPDF}>
                  <FaDownload /> Export PDF
                </button>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Total Users</p>
                    <p className="stat-number">{totalUsers}</p>
                    <p className="stat-description">Registered users across all colleges</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaList className="stat-icon" />
                  <div>
                    <p className="stat-title">Total Items</p>
                    <p className="stat-number">{totalItems}</p>
                    <p className="stat-description">Listed items across all categories</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaCircleCheck className="stat-icon" />
                  <div>
                    <p className="stat-title">Total Sold Items</p>
                    <p className="stat-number">{totalSoldItems}</p>
                    <p className="stat-description">Items marked as sold</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaClipboardQuestion className="stat-icon" />
                  <div>
                    <p className="stat-title">Total Items Pending Review</p>
                    <p className="stat-number">{totalPendingItems}</p>
                    <p className="stat-description">Items needed to be reviewed</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaBan className="stat-icon" />
                  <div>
                    <p className="stat-title">Total Archived Items</p>
                    <p className="stat-number">{totalArchivedItems}</p>
                    <p className="stat-description">Items that violated commerce policies</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaStar className="stat-icon" />
                  <div>
                    <p className="stat-title">Total User Ratings</p>
                    <p className="stat-number">{totalUserRatings}</p>
                    <p className="stat-description">App ratings submitted by users</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUserPlus className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Registrations</p>
                    <p className="stat-number">{totalPendingRegistrations}</p>
                    <p className="stat-description">User registrations awaiting approval</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Approved Registrations</p>
                    <p className="stat-number">{totalApprovedRegistrations}</p>
                    <p className="stat-description">User registrations approved</p>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="usersChart">
                  <h3>Users by College</h3>
                  <UsersByCollegeChart data={collegeData} />
                </div>
                <div className="categoryChart">
                  <h3>Items by Category</h3>
                  <ItemsByCategoryChart data={itemCategoryData} />
                </div>
              </div>
            </>
          )}

          {timePeriod === "weekly" && (
            <>
              <div className="period-header">
                <h2>Weekly Statistics</h2>
                <div className="period-controls">
                  <label htmlFor="week-selector">Week: </label>
                  <select
                    id="week-selector"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="period-selector"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>
                <div className="export-buttons">
                  <button className="export-btn" onClick={() => handleExportPeriodCSV('weekly', weeklyStats)}>
                    <FaDownload /> Export CSV
                  </button>
                  <button className="export-btn" onClick={() => handleExportPeriodPDF('weekly', weeklyStats)}>
                    <FaDownload /> Export PDF
                  </button>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Users (This Week)</p>
                    <p className="stat-number">{weeklyStats.users}</p>
                    <p className="stat-description">New users registered this week</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaList className="stat-icon" />
                  <div>
                    <p className="stat-title">Items (This Week)</p>
                    <p className="stat-number">{weeklyStats.items}</p>
                    <p className="stat-description">New items listed this week</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaCircleCheck className="stat-icon" />
                  <div>
                    <p className="stat-title">Sold Items (This Week)</p>
                    <p className="stat-number">{weeklyStats.soldItems}</p>
                    <p className="stat-description">Items sold this week</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaClipboardQuestion className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Items (This Week)</p>
                    <p className="stat-number">{weeklyStats.pendingItems}</p>
                    <p className="stat-description">Items pending review this week</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaBan className="stat-icon" />
                  <div>
                    <p className="stat-title">Archived Items (This Week)</p>
                    <p className="stat-number">{weeklyStats.archivedItems}</p>
                    <p className="stat-description">Items archived this week</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaStar className="stat-icon" />
                  <div>
                    <p className="stat-title">User Ratings (This Week)</p>
                    <p className="stat-number">{weeklyStats.userRatings}</p>
                    <p className="stat-description">Ratings submitted this week</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUserPlus className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Registrations (This Week)</p>
                    <p className="stat-number">{weeklyStats.pendingRegistrations}</p>
                    <p className="stat-description">Registrations pending this week</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Approved Registrations (This Week)</p>
                    <p className="stat-number">{weeklyStats.approvedRegistrations}</p>
                    <p className="stat-description">Registrations approved this week</p>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="usersChart">
                  <h3>Users by College</h3>
                  <UsersByCollegeChart data={collegeData} />
                </div>
                <div className="categoryChart">
                  <h3>Items by Category</h3>
                  <ItemsByCategoryChart data={itemCategoryData} />
                </div>
              </div>
            </>
          )}

          {timePeriod === "monthly" && (
            <>
              <div className="period-header">
                <h2>Monthly Statistics</h2>
                <div className="period-controls">
                  <label htmlFor="month-selector">Month: </label>
                  <select
                    id="month-selector"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="period-selector"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="export-buttons">
                  <button className="export-btn" onClick={() => handleExportPeriodCSV('monthly', monthlyStats)}>
                    <FaDownload /> Export CSV
                  </button>
                  <button className="export-btn" onClick={() => handleExportPeriodPDF('monthly', monthlyStats)}>
                    <FaDownload /> Export PDF
                  </button>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Users (This Month)</p>
                    <p className="stat-number">{monthlyStats.users}</p>
                    <p className="stat-description">New users registered this month</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaList className="stat-icon" />
                  <div>
                    <p className="stat-title">Items (This Month)</p>
                    <p className="stat-number">{monthlyStats.items}</p>
                    <p className="stat-description">New items listed this month</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaCircleCheck className="stat-icon" />
                  <div>
                    <p className="stat-title">Sold Items (This Month)</p>
                    <p className="stat-number">{monthlyStats.soldItems}</p>
                    <p className="stat-description">Items sold this month</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaClipboardQuestion className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Items (This Month)</p>
                    <p className="stat-number">{monthlyStats.pendingItems}</p>
                    <p className="stat-description">Items pending review this month</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaBan className="stat-icon" />
                  <div>
                    <p className="stat-title">Archived Items (This Month)</p>
                    <p className="stat-number">{monthlyStats.archivedItems}</p>
                    <p className="stat-description">Items archived this month</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaStar className="stat-icon" />
                  <div>
                    <p className="stat-title">User Ratings (This Month)</p>
                    <p className="stat-number">{monthlyStats.userRatings}</p>
                    <p className="stat-description">Ratings submitted this month</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUserPlus className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Registrations (This Month)</p>
                    <p className="stat-number">{monthlyStats.pendingRegistrations}</p>
                    <p className="stat-description">Registrations pending this month</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Approved Registrations (This Month)</p>
                    <p className="stat-number">{monthlyStats.approvedRegistrations}</p>
                    <p className="stat-description">Registrations approved this month</p>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="usersChart">
                  <h3>Users by College</h3>
                  <UsersByCollegeChart data={collegeData} />
                </div>
                <div className="categoryChart">
                  <h3>Items by Category</h3>
                  <ItemsByCategoryChart data={itemCategoryData} />
                </div>
              </div>
            </>
          )}

          {timePeriod === "yearly" && (
            <>
              <div className="period-header">
                <h2>Yearly Statistics</h2>
                <div className="period-controls">
                  <label htmlFor="year-selector">Year: </label>
                  <select
                    id="year-selector"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="period-selector"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="export-buttons">
                  <button className="export-btn" onClick={() => handleExportPeriodCSV('yearly', yearlyStats)}>
                    <FaDownload /> Export CSV
                  </button>
                  <button className="export-btn" onClick={() => handleExportPeriodPDF('yearly', yearlyStats)}>
                    <FaDownload /> Export PDF
                  </button>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Users (This Year)</p>
                    <p className="stat-number">{yearlyStats.users}</p>
                    <p className="stat-description">New users registered this year</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaList className="stat-icon" />
                  <div>
                    <p className="stat-title">Items (This Year)</p>
                    <p className="stat-number">{yearlyStats.items}</p>
                    <p className="stat-description">New items listed this year</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaCircleCheck className="stat-icon" />
                  <div>
                    <p className="stat-title">Sold Items (This Year)</p>
                    <p className="stat-number">{yearlyStats.soldItems}</p>
                    <p className="stat-description">Items sold this year</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaClipboardQuestion className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Items (This Year)</p>
                    <p className="stat-number">{yearlyStats.pendingItems}</p>
                    <p className="stat-description">Items pending review this year</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaBan className="stat-icon" />
                  <div>
                    <p className="stat-title">Archived Items (This Year)</p>
                    <p className="stat-number">{yearlyStats.archivedItems}</p>
                    <p className="stat-description">Items archived this year</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaStar className="stat-icon" />
                  <div>
                    <p className="stat-title">User Ratings (This Year)</p>
                    <p className="stat-number">{yearlyStats.userRatings}</p>
                    <p className="stat-description">Ratings submitted this year</p>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-box">
                  <FaUserPlus className="stat-icon" />
                  <div>
                    <p className="stat-title">Pending Registrations (This Year)</p>
                    <p className="stat-number">{yearlyStats.pendingRegistrations}</p>
                    <p className="stat-description">Registrations pending this year</p>
                  </div>
                </div>
                <div className="stat-box">
                  <FaUsers className="stat-icon" />
                  <div>
                    <p className="stat-title">Approved Registrations (This Year)</p>
                    <p className="stat-number">{yearlyStats.approvedRegistrations}</p>
                    <p className="stat-description">Registrations approved this year</p>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="usersChart">
                  <h3>Users by College</h3>
                  <UsersByCollegeChart data={collegeData} />
                </div>
                <div className="categoryChart">
                  <h3>Items by Category</h3>
                  <ItemsByCategoryChart data={itemCategoryData} />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && <AuditLog ip={ip} />}

      {/* User Ratings Tab */}
      {activeTab === "ratings" && <UserRatings ip={ip} />}
    </div>
  );
}
