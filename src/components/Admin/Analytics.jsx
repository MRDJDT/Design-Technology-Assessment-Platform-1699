import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { DatabaseService } from '../../services/databaseService';

const { FiTrendingUp, FiUsers, FiBrain, FiBookOpen, FiCalendar, FiDownload, FiFilter, FiRefreshCw } = FiIcons;

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    aiAnalyses: 0,
    systemLoad: 67
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Loading analytics data...');
      
      const dashboardStats = await DatabaseService.getDashboardStats();
      console.log('Analytics stats loaded:', dashboardStats);
      
      setStats({
        totalUsers: dashboardStats.totalUsers,
        activeUsers: dashboardStats.activeUsers,
        aiAnalyses: dashboardStats.totalAIAnalyses,
        systemLoad: 67
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const overviewStats = {
    totalUsers: {
      value: stats.totalUsers,
      change: 12.5,
      trend: 'up'
    },
    activeUsers: {
      value: stats.activeUsers,
      change: 8.3,
      trend: 'up'
    },
    aiAnalyses: {
      value: stats.aiAnalyses,
      change: 25.7,
      trend: 'up'
    },
    systemLoad: {
      value: stats.systemLoad,
      change: -5.2,
      trend: 'down'
    }
  };

  const userActivityData = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Teachers', 'Pupils', 'Admins'] },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Teachers',
        type: 'line',
        data: [
          Math.floor(stats.totalUsers * 0.05),
          Math.floor(stats.totalUsers * 0.06),
          Math.floor(stats.totalUsers * 0.05),
          Math.floor(stats.totalUsers * 0.07),
          Math.floor(stats.totalUsers * 0.08),
          Math.floor(stats.totalUsers * 0.03),
          Math.floor(stats.totalUsers * 0.02)
        ],
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Pupils',
        type: 'line',
        data: [
          Math.floor(stats.totalUsers * 0.45),
          Math.floor(stats.totalUsers * 0.55),
          Math.floor(stats.totalUsers * 0.50),
          Math.floor(stats.totalUsers * 0.60),
          Math.floor(stats.totalUsers * 0.65),
          Math.floor(stats.totalUsers * 0.25),
          Math.floor(stats.totalUsers * 0.20)
        ],
        itemStyle: { color: '#10B981' }
      },
      {
        name: 'Admins',
        type: 'line',
        data: [1, 2, 1, 2, 2, 1, 1],
        itemStyle: { color: '#8B5CF6' }
      }
    ]
  };

  const aiUsageData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Document Analysis',
        type: 'bar',
        data: [
          Math.floor(stats.aiAnalyses * 0.3),
          Math.floor(stats.aiAnalyses * 0.35),
          Math.floor(stats.aiAnalyses * 0.4),
          Math.floor(stats.aiAnalyses * 0.45)
        ],
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Grading Assistance',
        type: 'bar',
        data: [
          Math.floor(stats.aiAnalyses * 0.2),
          Math.floor(stats.aiAnalyses * 0.25),
          Math.floor(stats.aiAnalyses * 0.3),
          Math.floor(stats.aiAnalyses * 0.35)
        ],
        itemStyle: { color: '#10B981' }
      },
      {
        name: 'Feedback Generation',
        type: 'bar',
        data: [
          Math.floor(stats.aiAnalyses * 0.15),
          Math.floor(stats.aiAnalyses * 0.2),
          Math.floor(stats.aiAnalyses * 0.25),
          Math.floor(stats.aiAnalyses * 0.3)
        ],
        itemStyle: { color: '#F59E0B' }
      }
    ]
  };

  const performanceData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    },
    yAxis: [
      { type: 'value', name: 'Response Time (ms)' },
      { type: 'value', name: 'Concurrent Users' }
    ],
    series: [
      {
        name: 'Response Time',
        type: 'line',
        data: [120, 95, 180, 250, 200, 150],
        itemStyle: { color: '#EF4444' }
      },
      {
        name: 'Concurrent Users',
        type: 'line',
        yAxisIndex: 1,
        data: [
          Math.floor(stats.activeUsers * 0.2),
          Math.floor(stats.activeUsers * 0.1),
          Math.floor(stats.activeUsers * 0.5),
          Math.floor(stats.activeUsers * 0.8),
          Math.floor(stats.activeUsers * 0.7),
          Math.floor(stats.activeUsers * 0.4)
        ],
        itemStyle: { color: '#8B5CF6' }
      }
    ]
  };

  const topClasses = [
    {
      name: 'Year 8A - Electronics',
      students: 28,
      activity: 95,
      avgGrade: 4.2
    },
    {
      name: 'Year 9B - Mechanisms',
      students: 24,
      activity: 88,
      avgGrade: 3.9
    },
    {
      name: 'Year 7C - Materials',
      students: 26,
      activity: 82,
      avgGrade: 3.7
    },
    {
      name: 'Year 10A - CAD Design',
      students: 22,
      activity: 90,
      avgGrade: 4.1
    }
  ];

  const topTeachers = [
    {
      name: 'Mr. David Smith',
      classes: 5,
      students: Math.floor(stats.totalUsers * 0.15),
      aiUsage: 85
    },
    {
      name: 'Mrs. Sarah Johnson',
      classes: 4,
      students: Math.floor(stats.totalUsers * 0.12),
      aiUsage: 78
    },
    {
      name: 'Mr. Mike Wilson',
      classes: 3,
      students: Math.floor(stats.totalUsers * 0.09),
      aiUsage: 92
    },
    {
      name: 'Ms. Emma Brown',
      classes: 4,
      students: Math.floor(stats.totalUsers * 0.11),
      aiUsage: 68
    }
  ];

  const getChangeColor = (change, trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (trend) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive system analytics and performance insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <motion.button
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiDownload} />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiUsers} className="text-2xl text-blue-600" />
            <span className={`text-sm font-medium ${getChangeColor(overviewStats.totalUsers.change, overviewStats.totalUsers.trend)}`}>
              {getChangeIcon(overviewStats.totalUsers.trend)} {Math.abs(overviewStats.totalUsers.change)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{overviewStats.totalUsers.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Registered users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiTrendingUp} className="text-2xl text-green-600" />
            <span className={`text-sm font-medium ${getChangeColor(overviewStats.activeUsers.change, overviewStats.activeUsers.trend)}`}>
              {getChangeIcon(overviewStats.activeUsers.trend)} {Math.abs(overviewStats.activeUsers.change)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-2xl font-bold text-gray-900">{overviewStats.activeUsers.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">This week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiBrain} className="text-2xl text-purple-600" />
            <span className={`text-sm font-medium ${getChangeColor(overviewStats.aiAnalyses.change, overviewStats.aiAnalyses.trend)}`}>
              {getChangeIcon(overviewStats.aiAnalyses.trend)} {Math.abs(overviewStats.aiAnalyses.change)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Analyses</h3>
          <p className="text-2xl font-bold text-gray-900">{overviewStats.aiAnalyses.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiTrendingUp} className="text-2xl text-orange-600" />
            <span className={`text-sm font-medium ${getChangeColor(overviewStats.systemLoad.change, overviewStats.systemLoad.trend)}`}>
              {getChangeIcon(overviewStats.systemLoad.trend)} {Math.abs(overviewStats.systemLoad.change)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">System Load</h3>
          <p className="text-2xl font-bold text-gray-900">{overviewStats.systemLoad.value}%</p>
          <p className="text-sm text-gray-600">Average load</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <ReactECharts option={userActivityData} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Usage Trends</h3>
          <ReactECharts option={aiUsageData} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <ReactECharts option={performanceData} style={{ height: '350px' }} />
      </motion.div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Classes</h3>
          <div className="space-y-4">
            {topClasses.map((classItem, index) => (
              <div key={classItem.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                  <p className="text-sm text-gray-600">{classItem.students} students • {classItem.activity}% activity</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{classItem.avgGrade.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Avg Grade</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Teachers</h3>
          <div className="space-y-4">
            {topTeachers.map((teacher, index) => (
              <div key={teacher.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                  <p className="text-sm text-gray-600">{teacher.classes} classes • {teacher.students} students</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{teacher.aiUsage}%</p>
                  <p className="text-sm text-gray-600">AI Usage</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}