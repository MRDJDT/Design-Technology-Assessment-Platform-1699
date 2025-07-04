import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import { DatabaseService } from '../../services/databaseService'
import { useAuth } from '../../contexts/AuthContext'

const { FiBookOpen, FiUpload, FiTrendingUp, FiAward, FiClock, FiCheckCircle, FiRefreshCw } = FiIcons

export default function PupilDashboard() {
  const { user } = useAuth()
  const [pupilStats, setPupilStats] = useState({
    completedWork: 0,
    averageGrade: 0,
    pendingTasks: 0,
    feedback: 0,
    totalJournalEntries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPupilStats()
  }, [user])

  const loadPupilStats = async () => {
    try {
      setLoading(true)
      console.log('Loading pupil dashboard stats...')
      
      const pupilId = user?.userId
      const stats = await DatabaseService.getPupilDashboardStats(pupilId)
      console.log('Pupil stats loaded:', stats)
      
      setPupilStats(stats)
    } catch (error) {
      console.error('Error loading pupil stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const progressData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
    },
    yAxis: { type: 'value', min: 1, max: 5 },
    series: [{
      data: [
        Math.max(1, pupilStats.averageGrade - 0.5),
        Math.max(1, pupilStats.averageGrade - 0.3),
        Math.max(1, pupilStats.averageGrade - 0.1),
        pupilStats.averageGrade,
        Math.min(5, pupilStats.averageGrade + 0.1),
        pupilStats.averageGrade
      ],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#3B82F6' }
    }]
  }

  const recentWork = [
    {
      id: 1,
      title: 'CAD Design Project',
      subject: 'Electronics',
      grade: Math.min(5, Math.max(1, Math.round(pupilStats.averageGrade))),
      feedback: 'Excellent technical skills',
      date: '2024-01-20'
    },
    {
      id: 2,
      title: 'Prototype Testing',
      subject: 'Mechanisms',
      grade: Math.min(5, Math.max(1, Math.round(pupilStats.averageGrade - 0.5))),
      feedback: 'Good problem solving approach',
      date: '2024-01-18'
    },
    {
      id: 3,
      title: 'Materials Research',
      subject: 'Materials',
      grade: Math.min(5, Math.max(1, Math.round(pupilStats.averageGrade + 0.5))),
      feedback: 'Thorough research and analysis',
      date: '2024-01-15'
    }
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: 'Electronics Circuit Design',
      dueDate: '2024-01-25',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Evaluation Report',
      dueDate: '2024-01-28',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Final Prototype',
      dueDate: '2024-02-01',
      status: 'not-started'
    }
  ]

  const statCards = [
    {
      title: 'Completed Work',
      value: pupilStats.completedWork,
      icon: FiCheckCircle,
      color: 'green'
    },
    {
      title: 'Average Grade',
      value: pupilStats.averageGrade.toFixed(1),
      icon: FiTrendingUp,
      color: 'blue'
    },
    {
      title: 'Pending Tasks',
      value: pupilStats.pendingTasks,
      icon: FiClock,
      color: 'yellow'
    },
    {
      title: 'Feedback Received',
      value: pupilStats.feedback,
      icon: FiAward,
      color: 'purple'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and submit your work</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadPupilStats}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiUpload} />
            <span>Upload Work</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <SafeIcon icon={stat.icon} className={`text-xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Progress</h3>
          <ReactECharts option={progressData} style={{ height: '300px' }} />
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                <p className="text-xs text-gray-600 mt-1">Due: {task.dueDate}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    task.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : task.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Work</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Feedback</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentWork.map((work) => (
                <tr key={work.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{work.title}</td>
                  <td className="py-3 px-4 text-gray-600">{work.subject}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        work.grade >= 4
                          ? 'bg-green-100 text-green-800'
                          : work.grade >= 3
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      Grade {work.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{work.feedback}</td>
                  <td className="py-3 px-4 text-gray-600">{work.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}