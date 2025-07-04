import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { DatabaseService } from '../../services/databaseService'

const { FiBook, FiMessageCircle, FiSend, FiUser, FiBot, FiCalendar, FiFilter, FiSearch, FiEye, FiHeart, FiStar, FiClock, FiTag, FiImage, FiUsers, FiDownload, FiRefreshCw } = FiIcons

export default function JournalReview() {
  const { user } = useAuth()
  const [journalEntries, setJournalEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [filter, setFilter] = useState({
    needsResponse: false,
    subject: 'all',
    mood: 'all',
    pupil: 'all',
    hasImages: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const moods = [
    { value: 'excited', emoji: '😊', label: 'Excited', color: 'yellow' },
    { value: 'proud', emoji: '😄', label: 'Proud', color: 'green' },
    { value: 'confused', emoji: '😕', label: 'Confused', color: 'orange' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'red' },
    { value: 'curious', emoji: '🤔', label: 'Curious', color: 'purple' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'gray' }
  ]

  const subjects = [
    'Design & Technology',
    'Art & Design',
    'Science',
    'Computing',
    'Mathematics',
    'English'
  ]

  useEffect(() => {
    loadJournalEntries()
  }, [])

  const loadJournalEntries = async () => {
    try {
      setLoading(true)
      const entries = await DatabaseService.getJournalEntries()
      setJournalEntries(entries)
    } catch (error) {
      console.error('Error loading journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResponse = () => {
    if (!responseText.trim() || !selectedEntry) return

    const newResponse = {
      id: Date.now(),
      teacher_name: user?.user_metadata?.name || 'Teacher',
      content: responseText,
      created_at: new Date().toISOString()
    }

    setJournalEntries(prev =>
      prev.map(entry =>
        entry.id === selectedEntry.id
          ? {
              ...entry,
              teacher_responses: [...entry.teacher_responses, newResponse],
              needs_response: false
            }
          : entry
      )
    )

    setResponseText('')
    setSelectedEntry({
      ...selectedEntry,
      teacher_responses: [...selectedEntry.teacher_responses, newResponse],
      needs_response: false
    })
  }

  const getMoodConfig = (mood) => {
    return moods.find(m => m.value === mood) || moods.find(m => m.value === 'neutral')
  }

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.pupil?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesNeedsResponse = !filter.needsResponse || entry.needs_response
    const matchesSubject = filter.subject === 'all' || entry.subject === filter.subject
    const matchesMood = filter.mood === 'all' || entry.mood === filter.mood
    const matchesPupil = filter.pupil === 'all' || entry.pupil?.name === filter.pupil
    const matchesHasImages = !filter.hasImages || (entry.images && entry.images.length > 0)

    return matchesSearch && matchesNeedsResponse && matchesSubject && matchesMood && matchesPupil && matchesHasImages
  })

  const getStats = () => {
    return {
      total: journalEntries.length,
      needsResponse: journalEntries.filter(e => e.needs_response).length,
      thisWeek: journalEntries.filter(e => {
        const entryDate = new Date(e.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return entryDate > weekAgo
      }).length,
      withImages: journalEntries.filter(e => e.images && e.images.length > 0).length,
      totalPupils: new Set(journalEntries.map(e => e.pupil?.id).filter(Boolean)).size
    }
  }

  const stats = getStats()
  const uniquePupils = [...new Set(journalEntries.map(e => e.pupil?.name).filter(Boolean))]

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalEntries: filteredEntries.length,
      entries: filteredEntries.map(entry => ({
        title: entry.title,
        content: entry.content,
        pupil: entry.pupil?.name,
        class: entry.pupil?.class,
        subject: entry.subject,
        mood: entry.mood,
        tags: entry.tags,
        imageCount: entry.images?.length || 0,
        hasTeacherResponse: entry.teacher_responses?.length > 0,
        hasAIFeedback: !!entry.ai_feedback,
        createdAt: entry.created_at
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal_entries_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Journal Review</h1>
          <p className="text-gray-600 mt-1">Review and respond to pupil journal entries</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiDownload} />
            <span>Export</span>
          </motion.button>
          <motion.button
            onClick={loadJournalEntries}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
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
              <p className="text-sm font-medium text-gray-600">Need Response</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.needsResponse}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
              <SafeIcon icon={FiMessageCircle} className="text-xl text-red-600" />
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
              <p className="text-sm font-medium text-gray-600">Active Pupils</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPupils}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiUsers} className="text-xl text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search entries..."
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Pupil</label>
            <select
              value={filter.pupil}
              onChange={(e) => setFilter(prev => ({ ...prev, pupil: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Pupils</option>
              {uniquePupils.map(pupil => (
                <option key={pupil} value={pupil}>{pupil}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700">Filters</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.needsResponse}
                onChange={(e) => setFilter(prev => ({ ...prev, needsResponse: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Needs Response</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.hasImages}
                onChange={(e) => setFilter(prev => ({ ...prev, hasImages: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Has Images</span>
            </label>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p>{filteredEntries.length} entries found</p>
            </div>
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
              className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer ${
                entry.needs_response ? 'border-l-4 border-red-500' : ''
              }`}
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {entry.pupil?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{entry.pupil?.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-600">{entry.pupil?.class || 'No Class'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.needs_response && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Response Needed
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${moodConfig.color}-100 text-${moodConfig.color}-800`}>
                    {moodConfig.emoji}
                  </span>
                  {entry.images && entry.images.length > 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center space-x-1">
                      <SafeIcon icon={FiImage} className="text-xs" />
                      <span>{entry.images.length}</span>
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.title}</h3>
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

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiClock} />
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {entry.subject}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.teacher_responses && entry.teacher_responses.length > 0 && (
                    <SafeIcon icon={FiMessageCircle} className="text-green-600" />
                  )}
                  {entry.ai_feedback && (
                    <SafeIcon icon={FiBot} className="text-purple-600" />
                  )}
                  <SafeIcon icon={FiEye} className="text-blue-600" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBook} className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}

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
                      <span className="text-blue-600 font-semibold">
                        {selectedEntry.pupil?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedEntry.pupil?.name || 'Unknown'}</h3>
                      <p className="text-gray-600">{selectedEntry.pupil?.class || 'No Class'}</p>
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
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
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
              {selectedEntry.ai_feedback && (
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

              {/* Response Input */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Add Response</h4>
                <div className="space-y-4">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    placeholder="Write your response to this journal entry..."
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <motion.button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SafeIcon icon={FiSend} />
                      <span>Send Response</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}