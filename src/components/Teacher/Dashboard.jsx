import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import { DatabaseService } from '../../services/databaseService'
import { useAuth } from '../../contexts/AuthContext'

const { FiUsers, FiFileText, FiBookOpen, FiTrendingUp, FiClock, FiCheckCircle, FiCalendar, FiRefreshCw } = FiIcons

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPupils: 0,
    activeLessons: 0,
    pendingAssessments: 0,
    completedWork: 0,
    totalClasses: 0,
    totalLessonPlans: 0,
    totalSchemes: 0,
    totalEnrolled: 0
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadTeacherStats()
  }, [user])

  const loadTeacherStats = async () => {
    try {
      setLoading(true)
      console.log('Loading teacher dashboard stats...')
      
      const teacherId = user?.userId
      const teacherStats = await DatabaseService.getTeacherDashboardStats(teacherId)
      console.log('Teacher stats loaded:', teacherStats)
      
      setStats(teacherStats)
    } catch (error) {
      console.error('Error loading teacher stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const timetable = [
    {
      id: 1,
      time: '09:00 - 10:00',
      class: 'Reception A - Design & Technology',
      subject: 'Design & Technology',
      pupils: Math.floor(stats.totalEnrolled / 4) || 28,
      day: 'Monday'
    },
    {
      id: 2,
      time: '10:30 - 11:30',
      class: 'Year 2B - Making Skills',
      subject: 'Design & Technology',
      pupils: Math.floor(stats.totalEnrolled / 4) || 24,
      day: 'Monday'
    },
    {
      id: 3,
      time: '13:00 - 14:00',
      class: 'Year 4C - Materials',
      subject: 'Design & Technology',
      pupils: Math.floor(stats.totalEnrolled / 4) || 26,
      day: 'Monday'
    },
    {
      id: 4,
      time: '14:30 - 15:30',
      class: 'Year 6A - Design Project',
      subject: 'Design & Technology',
      pupils: Math.floor(stats.totalEnrolled / 4) || 22,
      day: 'Monday'
    }
  ]

  const handleClassClick = (classData) => {
    navigate('/class-management', { state: { classData } })
  }

  const getCurrentClass = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    return timetable.find(lesson => {
      const [startTime, endTime] = lesson.time.split(' - ')
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes
    })
  }

  const getNextClass = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    return timetable.find(lesson => {
      const [startTime] = lesson.time.split(' - ')
      const [startHour, startMin] = startTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin

      return currentTimeMinutes < startMinutes
    })
  }

  const currentClass = getCurrentClass()
  const nextClass = getNextClass()

  const gradeDistributionData = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Grade Distribution',
        type: 'pie',
        radius: '50%',
        data: [
          { value: Math.floor(stats.totalPupils * 0.15), name: 'Grade 1' },
          { value: Math.floor(stats.totalPupils * 0.20), name: 'Grade 2' },
          { value: Math.floor(stats.totalPupils * 0.30), name: 'Grade 3' },
          { value: Math.floor(stats.totalPupils * 0.25), name: 'Grade 4' },
          { value: Math.floor(stats.totalPupils * 0.10), name: 'Grade 5' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  const recentActivity = [
    {
      id: 1,
      student: 'Sarah Johnson',
      action: 'Submitted simple mechanisms project',
      time: '2 hours ago',
      type: 'submission'
    },
    {
      id: 2,
      student: 'Mike Chen',
      action: 'Completed lesson worksheet',
      time: '4 hours ago',
      type: 'completion'
    },
    {
      id: 3,
      student: 'Emma Wilson',
      action: 'Requested feedback on moving toy',
      time: '1 day ago',
      type: 'feedback'
    },
    {
      id: 4,
      student: 'James Brown',
      action: 'Started construction project',
      time: '2 days ago',
      type: 'start'
    }
  ]

  const statCards = [
    {
      title: 'Total Pupils',
      value: stats.totalPupils,
      icon: FiUsers,
      color: 'blue',
      change: '+3'
    },
    {
      title: 'Active Lessons',
      value: stats.activeLessons,
      icon: FiBookOpen,
      color: 'green',
      change: '+1'
    },
    {
      title: 'Pending Assessments',
      value: stats.pendingAssessments,
      icon: FiClock,
      color: 'yellow',
      change: '-2'
    },
    {
      title: 'Completed Work',
      value: stats.completedWork,
      icon: FiCheckCircle,
      color: 'purple',
      change: '+15'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} • {currentTime.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadTeacherStats}
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
            <SafeIcon icon={FiFileText} />
            <span>Create Lesson</span>
          </motion.button>
        </div>
      </div>

      {/* Current/Next Class Banner */}
      {(currentClass || nextClass) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 ${
            currentClass
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-blue-50 border-2 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentClass ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                <SafeIcon
                  icon={FiCalendar}
                  className={`text-xl ${
                    currentClass ? 'text-green-600' : 'text-blue-600'
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    currentClass ? 'text-green-900' : 'text-blue-900'
                  }`}
                >
                  {currentClass ? 'Current Class' : 'Next Class'}
                </h3>
                <p
                  className={`font-medium ${
                    currentClass ? 'text-green-800' : 'text-blue-800'
                  }`}
                >
                  {(currentClass || nextClass).class}
                </p>
                <p
                  className={`text-sm ${
                    currentClass ? 'text-green-600' : 'text-blue-600'
                  }`}
                >
                  {(currentClass || nextClass).time} • {(currentClass || nextClass).pupils} pupils
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => handleClassClick(currentClass || nextClass)}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentClass
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Class
            </motion.button>
          </div>
        </motion.div>
      )}

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
                <p
                  className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change} this week
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}
              >
                <SafeIcon icon={stat.icon} className={`text-xl text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timetable and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Timetable</h3>
            <span className="text-sm text-gray-500">Monday</span>
          </div>
          <div className="space-y-3">
            {timetable.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  lesson.id === currentClass?.id
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleClassClick(lesson)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          lesson.id === currentClass?.id ? 'bg-green-100' : 'bg-blue-100'
                        }`}
                      >
                        <SafeIcon
                          icon={FiBookOpen}
                          className={`${
                            lesson.id === currentClass?.id ? 'text-green-600' : 'text-blue-600'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{lesson.class}</h4>
                      <p className="text-sm text-gray-600">{lesson.time}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{lesson.pupils} pupils</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.id === currentClass?.id && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Live
                      </span>
                    )}
                    <SafeIcon icon={FiUsers} className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'submission'
                      ? 'bg-blue-100'
                      : activity.type === 'completion'
                      ? 'bg-green-100'
                      : activity.type === 'feedback'
                      ? 'bg-yellow-100'
                      : 'bg-purple-100'
                  }`}
                >
                  <SafeIcon
                    icon={
                      activity.type === 'submission'
                        ? FiFileText
                        : activity.type === 'completion'
                        ? FiCheckCircle
                        : activity.type === 'feedback'
                        ? FiTrendingUp
                        : FiClock
                    }
                    className={`${
                      activity.type === 'submission'
                        ? 'text-blue-600'
                        : activity.type === 'completion'
                        ? 'text-green-600'
                        : activity.type === 'feedback'
                        ? 'text-yellow-600'
                        : 'text-purple-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grade Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Grade Distribution</h3>
        <ReactECharts option={gradeDistributionData} style={{ height: '300px' }} />
      </motion.div>
    </div>
  )
}