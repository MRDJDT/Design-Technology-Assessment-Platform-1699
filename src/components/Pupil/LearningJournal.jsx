import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { AIService } from '../../services/aiService'
import { DatabaseService } from '../../services/databaseService'
import { useAuth } from '../../contexts/AuthContext'

const { FiBook, FiPlus, FiEdit3, FiSave, FiX, FiMessageCircle, FiUser, FiBot, FiCalendar, FiClock, FiImage, FiFileText, FiHeart, FiStar, FiThumbsUp, FiLoader, FiSend, FiEye, FiTrash2, FiRefreshCw } = FiIcons

export default function LearningJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    subject: 'Design & Technology',
    mood: 'neutral',
    tags: '',
    images: []
  })
  const [aiGenerating, setAiGenerating] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [filter, setFilter] = useState({
    subject: 'all',
    mood: 'all',
    timeRange: 'all'
  })

  const subjects = [
    'Design & Technology',
    'Art & Design',
    'Science',
    'Computing',
    'Mathematics',
    'English'
  ]

  const moods = [
    { value: 'excited', emoji: '😊', label: 'Excited', color: 'yellow' },
    { value: 'proud', emoji: '😄', label: 'Proud', color: 'green' },
    { value: 'confused', emoji: '😕', label: 'Confused', color: 'orange' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'red' },
    { value: 'curious', emoji: '🤔', label: 'Curious', color: 'purple' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'gray' }
  ]

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setLoading(true)
      
      // Get all journal entries and filter by current user
      const allEntries = await DatabaseService.getJournalEntries()
      
      // Filter entries for current user (demo data might not have proper pupil_id)
      const userEntries = allEntries.filter(entry => {
        // Check if entry belongs to current user by pupil_id or name match
        return entry.pupil_id === user?.userId || 
               entry.pupil?.name === user?.user_metadata?.name ||
               (user?.user_metadata?.isDemo && entry.pupil?.name === user?.user_metadata?.name)
      })

      // If no user entries found and this is a demo user, create some sample entries
      if (userEntries.length === 0 && user?.user_metadata?.isDemo) {
        await createSampleEntries()
        // Reload entries after creating samples
        const newAllEntries = await DatabaseService.getJournalEntries()
        const newUserEntries = newAllEntries.filter(entry => {
          return entry.pupil_id === user?.userId || 
                 entry.pupil?.name === user?.user_metadata?.name
        })
        setEntries(newUserEntries)
      } else {
        setEntries(userEntries)
      }
    } catch (error) {
      console.error('Error loading journal entries:', error)
      // If database fails, show sample data for demo
      if (user?.user_metadata?.isDemo) {
        setEntries(getSampleEntries())
      }
    } finally {
      setLoading(false)
    }
  }

  const createSampleEntries = async () => {
    if (!user?.user_metadata?.isDemo) return

    const sampleEntries = [
      {
        title: 'My First CAD Design',
        content: 'Today I learned how to use the CAD software to design a simple box. It was really exciting to see my idea come to life on the computer! I struggled with getting the measurements right at first, but Mr. Jackson helped me understand how to use the constraint tools.',
        subject: 'Design & Technology',
        mood: 'excited',
        tags: ['CAD', 'design', 'first-time'],
        pupil_id: user.userId,
        images: [
          {
            id: 1,
            name: 'cad_design_screenshot.png',
            url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400',
            size: 245000
          }
        ],
        ai_feedback: {
          content: 'Great reflection on your CAD learning! I can see you identified both successes and challenges.',
          suggestions: ['Try sketching ideas before CAD', 'Practice with simpler shapes'],
          encouragement: 'Your positive attitude toward learning new technology is fantastic!'
        },
        teacher_responses: [
          {
            id: 1,
            teacher_name: 'Mr. Jackson',
            content: 'Excellent reflection! I can see you really understood the importance of constraints in CAD. Your enthusiasm for learning new tools is wonderful.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        needs_response: false
      },
      {
        title: 'Working with Wood',
        content: 'We started our woodworking project today. I was nervous about using the tools but the safety demonstration helped. I managed to cut my first piece of wood with the saw. It felt amazing! I want to make a bird house for my garden.',
        subject: 'Design & Technology',
        mood: 'proud',
        tags: ['woodworking', 'safety', 'tools'],
        pupil_id: user.userId,
        images: [
          {
            id: 2,
            name: 'wood_cutting_process.jpg',
            url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
            size: 312000
          }
        ],
        ai_feedback: {
          content: 'Wonderful reflection on overcoming your initial nervousness! Your safety awareness shows maturity.',
          suggestions: ['Plan your birdhouse design', 'Research different wood joints'],
          encouragement: 'Your confidence with tools is growing beautifully!'
        },
        teacher_responses: [],
        needs_response: true
      },
      {
        title: 'Understanding Circuits',
        content: 'Today we learned about electrical circuits. At first I was confused about how electricity flows, but then I made a simple circuit with a battery, wire, and bulb. When the bulb lit up, I finally understood! It\'s like a path that electricity follows.',
        subject: 'Design & Technology',
        mood: 'curious',
        tags: ['circuits', 'electricity', 'understanding'],
        pupil_id: user.userId,
        images: [],
        ai_feedback: {
          content: 'Excellent breakthrough moment! Your analogy of electricity following a path shows real understanding.',
          suggestions: ['Try making different circuit patterns', 'Explore what happens with multiple bulbs', 'Draw circuit diagrams'],
          encouragement: 'Your curiosity and persistence led to a great learning moment!'
        },
        teacher_responses: [],
        needs_response: false
      }
    ]

    try {
      for (const entryData of sampleEntries) {
        await DatabaseService.createJournalEntry(entryData)
      }
    } catch (error) {
      console.error('Error creating sample entries:', error)
    }
  }

  const getSampleEntries = () => {
    return [
      {
        id: 'demo-1',
        title: 'My First CAD Design',
        content: 'Today I learned how to use the CAD software to design a simple box. It was really exciting to see my idea come to life on the computer! I struggled with getting the measurements right at first, but Mr. Jackson helped me understand how to use the constraint tools.',
        subject: 'Design & Technology',
        mood: 'excited',
        tags: ['CAD', 'design', 'first-time'],
        images: [
          {
            id: 1,
            name: 'cad_design_screenshot.png',
            url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400',
            size: 245000
          }
        ],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        pupil: {
          id: user?.userId || 'demo-user',
          name: user?.user_metadata?.name || 'Demo Student',
          class: 'Year 4A',
          avatar: 'DS'
        },
        teacher_responses: [
          {
            id: 1,
            teacher_name: 'Mr. Jackson',
            content: 'Excellent reflection! I can see you really understood the importance of constraints in CAD.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        ai_feedback: {
          content: 'Great reflection on your CAD learning! I can see you identified both successes and challenges.',
          suggestions: ['Try sketching ideas before CAD', 'Practice with simpler shapes'],
          encouragement: 'Your positive attitude toward learning new technology is fantastic!'
        },
        needs_response: false
      },
      {
        id: 'demo-2',
        title: 'Working with Wood',
        content: 'We started our woodworking project today. I was nervous about using the tools but the safety demonstration helped. I managed to cut my first piece of wood with the saw. It felt amazing!',
        subject: 'Design & Technology',
        mood: 'proud',
        tags: ['woodworking', 'safety', 'tools'],
        images: [
          {
            id: 2,
            name: 'wood_cutting_process.jpg',
            url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
            size: 312000
          }
        ],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        pupil: {
          id: user?.userId || 'demo-user',
          name: user?.user_metadata?.name || 'Demo Student',
          class: 'Year 4A',
          avatar: 'DS'
        },
        teacher_responses: [],
        ai_feedback: {
          content: 'Wonderful reflection on overcoming your initial nervousness! Your safety awareness shows maturity.',
          suggestions: ['Plan your birdhouse design', 'Research different wood joints'],
          encouragement: 'Your confidence with tools is growing beautifully!'
        },
        needs_response: true
      },
      {
        id: 'demo-3',
        title: 'Understanding Circuits',
        content: 'Today we learned about electrical circuits. At first I was confused about how electricity flows, but then I made a simple circuit with a battery, wire, and bulb. When the bulb lit up, I finally understood!',
        subject: 'Design & Technology',
        mood: 'curious',
        tags: ['circuits', 'electricity', 'understanding'],
        images: [],
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        pupil: {
          id: user?.userId || 'demo-user',
          name: user?.user_metadata?.name || 'Demo Student',
          class: 'Year 4A',
          avatar: 'DS'
        },
        teacher_responses: [],
        ai_feedback: {
          content: 'Excellent breakthrough moment! Your analogy of electricity following a path shows real understanding.',
          suggestions: ['Try making different circuit patterns', 'Explore what happens with multiple bulbs'],
          encouragement: 'Your curiosity and persistence led to a great learning moment!'
        },
        needs_response: false
      }
    ]
  }

  const handleCreateEntry = async () => {
    if (!entryForm.title || !entryForm.content) return

    try {
      const entryData = {
        title: entryForm.title,
        content: entryForm.content,
        subject: entryForm.subject,
        mood: entryForm.mood,
        images: entryForm.images,
        tags: entryForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        pupil_id: user?.userId,
        needs_response: true
      }

      let savedEntry
      if (editingEntry) {
        // For demo users, update local state
        if (user?.user_metadata?.isDemo) {
          savedEntry = {
            ...editingEntry,
            ...entryData,
            updated_at: new Date().toISOString(),
            pupil: {
              id: user?.userId || 'demo-user',
              name: user?.user_metadata?.name || 'Demo Student',
              class: 'Year 4A',
              avatar: user?.user_metadata?.name?.split(' ').map(n => n[0]).join('') || 'DS'
            }
          }
          setEntries(prev => prev.map(entry => 
            entry.id === editingEntry.id ? savedEntry : entry
          ))
        } else {
          savedEntry = await DatabaseService.updateJournalEntry(editingEntry.id, entryData)
          setEntries(prev => prev.map(entry => 
            entry.id === editingEntry.id ? savedEntry : entry
          ))
        }
      } else {
        // For demo users, add to local state
        if (user?.user_metadata?.isDemo) {
          savedEntry = {
            id: `demo-${Date.now()}`,
            ...entryData,
            created_at: new Date().toISOString(),
            pupil: {
              id: user?.userId || 'demo-user',
              name: user?.user_metadata?.name || 'Demo Student',
              class: 'Year 4A',
              avatar: user?.user_metadata?.name?.split(' ').map(n => n[0]).join('') || 'DS'
            },
            teacher_responses: [],
            ai_feedback: null
          }
          setEntries(prev => [savedEntry, ...prev])
        } else {
          savedEntry = await DatabaseService.createJournalEntry(entryData)
          setEntries(prev => [savedEntry, ...prev])
        }
        
        // Generate AI feedback for new entries
        generateAIFeedback(savedEntry)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Error saving journal entry. Please try again.')
    }
  }

  const generateAIFeedback = async (entry) => {
    setAiGenerating(true)
    try {
      const feedback = await AIService.generateJournalFeedback({
        title: entry.title,
        content: entry.content,
        subject: entry.subject,
        mood: entry.mood,
        tags: entry.tags || []
      })

      // Update the entry with AI feedback
      if (user?.user_metadata?.isDemo) {
        // For demo users, update local state
        setEntries(prev => prev.map(e => 
          e.id === entry.id ? { ...e, ai_feedback: feedback } : e
        ))
      } else {
        const updatedEntry = await DatabaseService.updateJournalEntry(entry.id, {
          ai_feedback: feedback
        })
        setEntries(prev => prev.map(e => 
          e.id === entry.id ? updatedEntry : e
        ))
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error)
    } finally {
      setAiGenerating(false)
    }
  }

  const resetForm = () => {
    setEntryForm({
      title: '',
      content: '',
      subject: 'Design & Technology',
      mood: 'neutral',
      tags: '',
      images: []
    })
    setShowCreateModal(false)
    setEditingEntry(null)
  }

  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    setEntryForm({
      title: entry.title,
      content: entry.content,
      subject: entry.subject,
      mood: entry.mood,
      tags: (entry.tags || []).join(', '),
      images: entry.images || []
    })
    setShowCreateModal(true)
  }

  const handleDeleteEntry = async (entryId) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      try {
        if (user?.user_metadata?.isDemo) {
          // For demo users, remove from local state
          setEntries(prev => prev.filter(entry => entry.id !== entryId))
        } else {
          // In a real app, you would call DatabaseService.deleteJournalEntry(entryId)
          setEntries(prev => prev.filter(entry => entry.id !== entryId))
        }
      } catch (error) {
        console.error('Error deleting journal entry:', error)
        alert('Error deleting journal entry. Please try again.')
      }
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImages(true)
    try {
      // Simulate image upload processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        url: URL.createObjectURL(file), // In production, this would be the uploaded URL
        size: file.size,
        file: file // Keep reference for actual upload in production
      }))

      setEntryForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error uploading images. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index) => {
    setEntryForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const getMoodConfig = (mood) => {
    return moods.find(m => m.value === mood) || moods.find(m => m.value === 'neutral')
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSubject = filter.subject === 'all' || entry.subject === filter.subject
    const matchesMood = filter.mood === 'all' || entry.mood === filter.mood
    
    let matchesTime = true
    if (filter.timeRange !== 'all') {
      const entryDate = new Date(entry.created_at)
      const now = new Date()
      
      switch (filter.timeRange) {
        case 'week':
          matchesTime = now - entryDate < 7 * 24 * 60 * 60 * 1000
          break
        case 'month':
          matchesTime = now - entryDate < 30 * 24 * 60 * 60 * 1000
          break
        default:
          matchesTime = true
      }
    }
    
    return matchesSubject && matchesMood && matchesTime
  })

  const getEntryStats = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      total: entries.length,
      thisWeek: entries.filter(e => {
        const entryDate = new Date(e.created_at)
        return entryDate > weekAgo
      }).length,
      withFeedback: entries.filter(e => 
        (e.ai_feedback && Object.keys(e.ai_feedback).length > 0) || 
        (e.teacher_responses && e.teacher_responses.length > 0)
      ).length,
      withImages: entries.filter(e => e.images && e.images.length > 0).length,
      subjects: new Set(entries.map(e => e.subject)).size
    }
  }

  const stats = getEntryStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Journal</h1>
          <p className="text-gray-600 mt-1">Reflect on your learning journey and get feedback</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadEntries}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} />
            <span>New Entry</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <SafeIcon icon={FiBook} className="text-xl text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.thisWeek}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <SafeIcon icon={FiCalendar} className="text-xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Feedback</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.withFeedback}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiMessageCircle} className="text-xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Images</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.withImages}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <SafeIcon icon={FiImage} className="text-xl text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.subjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100">
              <SafeIcon icon={FiFileText} className="text-xl text-indigo-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Entries</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filter.subject}
              onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
            <select
              value={filter.mood}
              onChange={(e) => setFilter(prev => ({ ...prev, mood: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Moods</option>
              {moods.map(mood => (
                <option key={mood.value} value={mood.value}>
                  {mood.emoji} {mood.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={filter.timeRange}
              onChange={(e) => setFilter(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Journal Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEntries.map((entry, index) => {
          const moodConfig = getMoodConfig(entry.mood)
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${moodConfig.color}-100 text-${moodConfig.color}-800`}>
                      {moodConfig.emoji} {moodConfig.label}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {entry.subject}
                    </span>
                    {entry.images && entry.images.length > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center space-x-1">
                        <SafeIcon icon={FiImage} className="text-xs" />
                        <span>{entry.images.length}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setSelectedEntry(entry)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiEye} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleEditEntry(entry)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiEdit3} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiTrash2} />
                  </motion.button>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{entry.content}</p>

              {/* Image Preview */}
              {entry.images && entry.images.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {entry.images.slice(0, 3).map((image, imgIndex) => (
                      <div key={imgIndex} className="relative aspect-square">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {entry.images.length > 3 && imgIndex === 2 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                            <span className="text-white font-medium text-sm">+{entry.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {entry.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {entry.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{entry.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiClock} />
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  {entry.teacher_responses && entry.teacher_responses.length > 0 && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <SafeIcon icon={FiUser} />
                      <span>Teacher replied</span>
                    </div>
                  )}
                  {entry.ai_feedback && Object.keys(entry.ai_feedback).length > 0 && (
                    <div className="flex items-center space-x-1 text-purple-600">
                      <SafeIcon icon={FiBot} />
                      <span>AI feedback</span>
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View Full →
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBook} className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
          <p className="text-gray-600 mb-4">Start writing about your learning experiences!</p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Your First Entry
          </motion.button>
        </div>
      )}

      {/* Create/Edit Entry Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={entryForm.title}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What did you learn today?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={entryForm.subject}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">How do you feel?</label>
                    <select
                      value={entryForm.mood}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, mood: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {moods.map(mood => (
                        <option key={mood.value} value={mood.value}>
                          {mood.emoji} {mood.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What happened? How did you feel? What did you learn?
                  </label>
                  <textarea
                    value={entryForm.content}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    placeholder="Write about your learning experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={entryForm.tags}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. CAD, design, problem-solving"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <SafeIcon icon={FiImage} className="text-4xl text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer text-blue-600 hover:text-blue-700 font-medium ${uploadingImages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      {uploadingImages ? 'Uploading...' : 'Choose images or drag here'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                  </div>

                  {entryForm.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({entryForm.images.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {entryForm.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <SafeIcon icon={FiX} className="text-xs" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateEntry}
                  disabled={!entryForm.title || !entryForm.content || uploadingImages}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={uploadingImages ? FiLoader : FiSave} className={uploadingImages ? 'animate-spin' : ''} />
                  <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{selectedEntry.pupil?.avatar || 'DS'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedEntry.pupil?.name || user?.user_metadata?.name}</h3>
                      <p className="text-gray-600">{selectedEntry.pupil?.class || 'Year 4A'}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEntry.title}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getMoodConfig(selectedEntry.mood).color}-100 text-${getMoodConfig(selectedEntry.mood).color}-800`}>
                      {getMoodConfig(selectedEntry.mood).emoji} {getMoodConfig(selectedEntry.mood).label}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {selectedEntry.subject}
                    </span>
                    {selectedEntry.images && selectedEntry.images.length > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full flex items-center space-x-1">
                        <SafeIcon icon={FiImage} />
                        <span>{selectedEntry.images.length} images</span>
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(selectedEntry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Journal Entry</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedEntry.content}</p>
              </div>

              {/* Images Gallery */}
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Images ({selectedEntry.images.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedEntry.images.map((image, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2 rounded-b-lg">
                          <p className="truncate">{image.name}</p>
                          <p className="text-xs text-gray-300">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              {selectedEntry.ai_feedback && Object.keys(selectedEntry.ai_feedback).length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <SafeIcon icon={FiBot} className="text-purple-600" />
                    <h4 className="font-medium text-purple-900">AI Feedback</h4>
                  </div>
                  <p className="text-purple-800 mb-3">{selectedEntry.ai_feedback.content}</p>
                  {selectedEntry.ai_feedback.suggestions && selectedEntry.ai_feedback.suggestions.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-purple-900 mb-2">AI Suggestions:</h5>
                      <ul className="space-y-1">
                        {selectedEntry.ai_feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-purple-700 text-sm flex items-start space-x-2">
                            <SafeIcon icon={FiStar} className="text-purple-500 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedEntry.ai_feedback.encouragement && (
                    <div className="p-2 bg-purple-100 rounded text-purple-800 text-sm">
                      <SafeIcon icon={FiHeart} className="inline mr-1" />
                      {selectedEntry.ai_feedback.encouragement}
                    </div>
                  )}
                </div>
              )}

              {/* Teacher Responses */}
              {selectedEntry.teacher_responses && selectedEntry.teacher_responses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Teacher Responses</h4>
                  <div className="space-y-4">
                    {selectedEntry.teacher_responses.map((response) => (
                      <div key={response.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <SafeIcon icon={FiUser} className="text-green-600" />
                          <span className="font-medium text-green-900">{response.teacher_name}</span>
                          <span className="text-green-700 text-sm">
                            {new Date(response.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-green-800">{response.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={() => {
                    handleEditEntry(selectedEntry)
                    setSelectedEntry(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Entry
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}