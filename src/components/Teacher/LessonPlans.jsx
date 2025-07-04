import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { DatabaseService } from '../../services/databaseService'
import { useAuth } from '../../contexts/AuthContext'

const { FiPlus, FiFileText, FiClock, FiUsers, FiTarget, FiEdit3, FiCopy, FiDownload, FiX, FiSave, FiTrash2, FiCheckCircle, FiBook, FiSettings, FiLoader, FiRefreshCw } = FiIcons

export default function LessonPlans() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [errors, setErrors] = useState({})
  const [lessonForm, setLessonForm] = useState({
    title: '',
    subject: '',
    year_group: '',
    duration: '',
    objectives: [''],
    resources: [''],
    activities: [''],
    assessment: '',
    learning_outcomes: [''],
    status: 'draft'
  })

  const yearGroups = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']
  const subjects = [
    'Design and Technology',
    'Art and Design',
    'Computing',
    'Science',
    'Mathematics',
    'English'
  ]
  const durations = ['30 minutes', '45 minutes', '60 minutes', '90 minutes']

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const teacherId = user?.user_metadata?.role === 'teacher' ? user.userId : null
      const data = await DatabaseService.getLessonPlans(teacherId)
      setLessons(data)
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!lessonForm.title.trim()) {
      newErrors.title = 'Lesson title is required'
    }

    if (!lessonForm.year_group) {
      newErrors.year_group = 'Year group is required'
    }

    if (!lessonForm.subject) {
      newErrors.subject = 'Subject is required'
    }

    if (!lessonForm.duration) {
      newErrors.duration = 'Duration is required'
    }

    if (lessonForm.objectives.filter(obj => obj.trim()).length === 0) {
      newErrors.objectives = 'At least one learning objective is required'
    }

    if (lessonForm.resources.filter(res => res.trim()).length === 0) {
      newErrors.resources = 'At least one resource is required'
    }

    if (lessonForm.activities.filter(act => act.trim()).length === 0) {
      newErrors.activities = 'At least one activity is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setLessonForm({
      title: '',
      subject: '',
      year_group: '',
      duration: '',
      objectives: [''],
      resources: [''],
      activities: [''],
      assessment: '',
      learning_outcomes: [''],
      status: 'draft'
    })
    setErrors({})
    setEditingLesson(null)
  }

  const handleCreateLesson = async () => {
    if (!validateForm()) return

    try {
      const lessonData = {
        title: lessonForm.title.trim(),
        subject: `${lessonForm.year_group} - ${lessonForm.subject}`,
        year_group: lessonForm.year_group,
        duration: lessonForm.duration,
        objectives: lessonForm.objectives.filter(obj => obj.trim()),
        resources: lessonForm.resources.filter(res => res.trim()),
        activities: lessonForm.activities.filter(act => act.trim()),
        assessment: lessonForm.assessment.trim(),
        learning_outcomes: lessonForm.learning_outcomes.filter(outcome => outcome.trim()),
        status: lessonForm.status,
        teacher_id: user?.userId
      }

      if (editingLesson) {
        const updatedLesson = await DatabaseService.updateLessonPlan(editingLesson.id, lessonData)
        setLessons(prev => prev.map(lesson => 
          lesson.id === editingLesson.id ? updatedLesson : lesson
        ))

        // Log activity
        await DatabaseService.logActivity({
          action: `Updated lesson plan: ${lessonForm.title}`,
          resource_type: 'lesson',
          user_id: user?.userId
        })
      } else {
        const newLesson = await DatabaseService.createLessonPlan(lessonData)
        setLessons(prev => [newLesson, ...prev])

        // Log activity
        await DatabaseService.logActivity({
          action: `Created lesson plan: ${lessonForm.title}`,
          resource_type: 'lesson',
          user_id: user?.userId
        })
      }

      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Error saving lesson. Please try again.')
    }
  }

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    
    // Extract year group and subject from combined subject field
    const subjectParts = lesson.subject.split(' - ')
    const yearGroup = subjectParts[0] || ''
    const subject = subjectParts.slice(1).join(' - ') || ''

    setLessonForm({
      title: lesson.title,
      year_group: yearGroup,
      subject: subject,
      duration: lesson.duration,
      objectives: lesson.objectives?.length > 0 ? [...lesson.objectives] : [''],
      resources: lesson.resources?.length > 0 ? [...lesson.resources] : [''],
      activities: lesson.activities?.length > 0 ? [...lesson.activities] : [''],
      assessment: lesson.assessment || '',
      learning_outcomes: lesson.learning_outcomes?.length > 0 ? [...lesson.learning_outcomes] : [''],
      status: lesson.status
    })
    setShowCreateModal(true)
  }

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await DatabaseService.deleteLessonPlan(id)
        setLessons(prev => prev.filter(lesson => lesson.id !== id))

        // Log activity
        await DatabaseService.logActivity({
          action: `Deleted lesson plan`,
          resource_type: 'lesson',
          user_id: user?.userId
        })
      } catch (error) {
        console.error('Error deleting lesson:', error)
        alert('Error deleting lesson. Please try again.')
      }
    }
  }

  const duplicateLesson = async (lesson) => {
    try {
      const duplicatedData = {
        title: `${lesson.title} (Copy)`,
        subject: lesson.subject,
        year_group: lesson.year_group,
        duration: lesson.duration,
        objectives: lesson.objectives,
        resources: lesson.resources,
        activities: lesson.activities,
        assessment: lesson.assessment,
        learning_outcomes: lesson.learning_outcomes,
        status: 'draft',
        teacher_id: user?.userId
      }

      const duplicated = await DatabaseService.createLessonPlan(duplicatedData)
      setLessons(prev => [duplicated, ...prev])

      // Log activity
      await DatabaseService.logActivity({
        action: `Duplicated lesson plan: ${lesson.title}`,
        resource_type: 'lesson',
        user_id: user?.userId
      })
    } catch (error) {
      console.error('Error duplicating lesson:', error)
      alert('Error duplicating lesson. Please try again.')
    }
  }

  // Helper functions for managing form arrays
  const addObjective = () => {
    setLessonForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }))
  }

  const addResource = () => {
    setLessonForm(prev => ({
      ...prev,
      resources: [...prev.resources, '']
    }))
  }

  const addActivity = () => {
    setLessonForm(prev => ({
      ...prev,
      activities: [...prev.activities, '']
    }))
  }

  const addLearningOutcome = () => {
    setLessonForm(prev => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, '']
    }))
  }

  const updateObjective = (index, value) => {
    setLessonForm(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }))
  }

  const updateResource = (index, value) => {
    setLessonForm(prev => ({
      ...prev,
      resources: prev.resources.map((res, i) => i === index ? value : res)
    }))
  }

  const updateActivity = (index, value) => {
    setLessonForm(prev => ({
      ...prev,
      activities: prev.activities.map((act, i) => i === index ? value : act)
    }))
  }

  const updateLearningOutcome = (index, value) => {
    setLessonForm(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.map((outcome, i) => i === index ? value : outcome)
    }))
  }

  const removeObjective = (index) => {
    if (lessonForm.objectives.length > 1) {
      setLessonForm(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }))
    }
  }

  const removeResource = (index) => {
    if (lessonForm.resources.length > 1) {
      setLessonForm(prev => ({
        ...prev,
        resources: prev.resources.filter((_, i) => i !== index)
      }))
    }
  }

  const removeActivity = (index) => {
    if (lessonForm.activities.length > 1) {
      setLessonForm(prev => ({
        ...prev,
        activities: prev.activities.filter((_, i) => i !== index)
      }))
    }
  }

  const removeLearningOutcome = (index) => {
    if (lessonForm.learning_outcomes.length > 1) {
      setLessonForm(prev => ({
        ...prev,
        learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index)
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage your lesson plans</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadLessons}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} />
            <span>Create Lesson</span>
          </motion.button>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBook} className="text-green-600 text-xl" />
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => handleEditLesson(lesson)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon icon={FiEdit3} />
                </motion.button>
                <motion.button
                  onClick={() => duplicateLesson(lesson)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon icon={FiCopy} />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon icon={FiTrash2} />
                </motion.button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
            <p className="text-blue-600 text-sm font-medium mb-3">{lesson.subject}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiClock} />
                <span>{lesson.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiTarget} />
                <span>{lesson.objectives?.length || 0} objectives</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Learning Objectives:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {(lesson.objectives || []).slice(0, 2).map((objective, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
                {(lesson.objectives || []).length > 2 && (
                  <li className="text-blue-600 text-sm">+{lesson.objectives.length - 2} more</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                lesson.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lesson.status}
              </span>
              <motion.button
                onClick={() => handleEditLesson(lesson)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}

        {/* Add New Lesson Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: lessons.length * 0.1 }}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
        >
          <SafeIcon icon={FiPlus} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Create New Lesson</h3>
          <p className="text-sm text-gray-500 text-center">
            Build comprehensive lesson plans with objectives, activities, and assessments
          </p>
        </motion.div>
      </div>

      {/* Create/Edit Lesson Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCreateModal(false)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingLesson ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
                  </h2>
                  <p className="text-gray-600">Build a comprehensive lesson plan with clear objectives and activities</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lesson Title *
                        </label>
                        <input
                          type="text"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.title ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Introduction to Simple Machines"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year Group *
                          </label>
                          <select
                            value={lessonForm.year_group}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, year_group: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.year_group ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Year Group</option>
                            {yearGroups.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          {errors.year_group && <p className="text-red-500 text-sm mt-1">{errors.year_group}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration *
                          </label>
                          <select
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.duration ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Duration</option>
                            {durations.map(duration => (
                              <option key={duration} value={duration}>{duration}</option>
                            ))}
                          </select>
                          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          value={lessonForm.subject}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, subject: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.subject ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assessment Method
                        </label>
                        <textarea
                          value={lessonForm.assessment}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, assessment: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                          placeholder="How will you assess learning? e.g., Practical demonstration, simple recording sheet..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={lessonForm.status}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Content */}
                <div className="space-y-6">
                  {/* Learning Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Objectives *
                    </label>
                    {lessonForm.objectives.map((objective, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Learning objective ${index + 1}`}
                        />
                        <button
                          onClick={() => removeObjective(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          disabled={lessonForm.objectives.length === 1}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addObjective}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Objective
                    </button>
                    {errors.objectives && <p className="text-red-500 text-sm mt-1">{errors.objectives}</p>}
                  </div>

                  {/* Resources */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resources Needed *
                    </label>
                    {lessonForm.resources.map((resource, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => updateResource(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Resource ${index + 1}`}
                        />
                        <button
                          onClick={() => removeResource(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          disabled={lessonForm.resources.length === 1}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addResource}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Resource
                    </button>
                    {errors.resources && <p className="text-red-500 text-sm mt-1">{errors.resources}</p>}
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Activities *
                    </label>
                    {lessonForm.activities.map((activity, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Activity ${index + 1}`}
                        />
                        <button
                          onClick={() => removeActivity(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          disabled={lessonForm.activities.length === 1}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addActivity}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Activity
                    </button>
                    {errors.activities && <p className="text-red-500 text-sm mt-1">{errors.activities}</p>}
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Outcomes
                    </label>
                    {lessonForm.learning_outcomes.map((outcome, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => updateLearningOutcome(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Learning outcome ${index + 1}`}
                        />
                        <button
                          onClick={() => removeLearningOutcome(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          disabled={lessonForm.learning_outcomes.length === 1}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLearningOutcome}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Learning Outcome
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateLesson}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiSave} />
                  <span>{editingLesson ? 'Update Lesson' : 'Create Lesson'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}