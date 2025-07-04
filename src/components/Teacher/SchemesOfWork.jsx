import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { AIService } from '../../services/aiService'
import { DatabaseService } from '../../services/databaseService'
import { useAuth } from '../../contexts/AuthContext'

const { FiPlus, FiUpload, FiBookOpen, FiEdit3, FiTrash2, FiFileText, FiX, FiLoader, FiCheckCircle, FiEye, FiDownload, FiTarget, FiClock, FiUsers, FiAward, FiRefreshCw, FiPlay, FiSave, FiAlertTriangle } = FiIcons

export default function SchemesOfWork() {
  const { user } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSchemeDetail, setShowSchemeDetail] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingScheme, setEditingScheme] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null,
    year_group: '',
    subject: 'Design and Technology'
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)

  const yearGroups = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']
  const subjects = [
    'Design and Technology',
    'Art and Design',
    'Computing',
    'Science',
    'Mathematics',
    'English'
  ]

  useEffect(() => {
    loadSchemes()
  }, [])

  const loadSchemes = async () => {
    try {
      setLoading(true)
      const teacherId = user?.user_metadata?.role === 'teacher' ? user.userId : null
      const data = await DatabaseService.getSchemes(teacherId)
      setSchemes(data)
    } catch (error) {
      console.error('Error loading schemes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    setUploadData(prev => ({ ...prev, file }))
  }

  const handleAnalyzeScheme = async () => {
    if (!uploadData.file || !uploadData.title) return

    setIsAnalyzing(true)
    try {
      const results = await AIService.analyzeSchemeDocument(uploadData)
      setAnalysisResults(results)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveScheme = async () => {
    if (analysisResults && uploadData.title) {
      try {
        const schemeData = {
          title: uploadData.title,
          description: uploadData.description,
          year_group: uploadData.year_group,
          subject: uploadData.subject,
          lessons: analysisResults.lessons,
          assessment_criteria: analysisResults.assessmentCriteria,
          status: 'active',
          analysis_complete: true,
          original_file: uploadData.file.name,
          teacher_id: user?.userId
        }

        const newScheme = await DatabaseService.createScheme(schemeData)
        setSchemes(prev => [newScheme, ...prev])
        closeUploadModal()

        // Log activity
        await DatabaseService.logActivity({
          action: `Created new scheme: ${uploadData.title}`,
          resource_type: 'scheme',
          user_id: user?.userId
        })
      } catch (error) {
        console.error('Error saving scheme:', error)
        alert('Error saving scheme. Please try again.')
      }
    }
  }

  const closeUploadModal = () => {
    setShowCreateModal(false)
    setUploadData({
      title: '',
      description: '',
      file: null,
      year_group: '',
      subject: 'Design and Technology'
    })
    setAnalysisResults(null)
    setIsAnalyzing(false)
  }

  const handleEditScheme = (scheme) => {
    setEditingScheme({ ...scheme })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (editingScheme) {
      try {
        const updatedScheme = await DatabaseService.updateScheme(editingScheme.id, {
          title: editingScheme.title,
          description: editingScheme.description,
          year_group: editingScheme.year_group,
          subject: editingScheme.subject,
          lessons: editingScheme.lessons,
          assessment_criteria: editingScheme.assessment_criteria,
          status: editingScheme.status
        })

        setSchemes(prev => prev.map(scheme => 
          scheme.id === editingScheme.id ? updatedScheme : scheme
        ))
        setShowEditModal(false)
        setEditingScheme(null)

        // Log activity
        await DatabaseService.logActivity({
          action: `Updated scheme: ${editingScheme.title}`,
          resource_type: 'scheme',
          user_id: user?.userId
        })
      } catch (error) {
        console.error('Error updating scheme:', error)
        alert('Error updating scheme. Please try again.')
      }
    }
  }

  const handleDeleteScheme = async (schemeId) => {
    try {
      await DatabaseService.deleteScheme(schemeId)
      setSchemes(prev => prev.filter(scheme => scheme.id !== schemeId))
      setShowDeleteConfirm(null)

      // Log activity
      await DatabaseService.logActivity({
        action: `Deleted scheme`,
        resource_type: 'scheme',
        user_id: user?.userId
      })
    } catch (error) {
      console.error('Error deleting scheme:', error)
      alert('Error deleting scheme. Please try again.')
    }
  }

  const handleDuplicateScheme = async (scheme) => {
    try {
      const duplicatedData = {
        title: `${scheme.title} (Copy)`,
        description: scheme.description,
        year_group: scheme.year_group,
        subject: scheme.subject,
        lessons: scheme.lessons,
        assessment_criteria: scheme.assessment_criteria,
        status: 'draft',
        analysis_complete: scheme.analysis_complete,
        original_file: scheme.original_file,
        teacher_id: user?.userId
      }

      const duplicated = await DatabaseService.createScheme(duplicatedData)
      setSchemes(prev => [duplicated, ...prev])

      // Log activity
      await DatabaseService.logActivity({
        action: `Duplicated scheme: ${scheme.title}`,
        resource_type: 'scheme',
        user_id: user?.userId
      })
    } catch (error) {
      console.error('Error duplicating scheme:', error)
      alert('Error duplicating scheme. Please try again.')
    }
  }

  const handleReanalyze = async (schemeId) => {
    const scheme = schemes.find(s => s.id === schemeId)
    if (!scheme) return

    setIsAnalyzing(true)
    try {
      const results = await AIService.analyzeSchemeDocument({
        title: scheme.title,
        description: scheme.description,
        file: { name: scheme.original_file || 'scheme.pdf' }
      })

      const updatedScheme = await DatabaseService.updateScheme(schemeId, {
        lessons: results.lessons,
        assessment_criteria: results.assessmentCriteria
      })

      setSchemes(prev => prev.map(s => 
        s.id === schemeId ? updatedScheme : s
      ))
    } catch (error) {
      console.error('Re-analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExportScheme = (scheme) => {
    const exportData = {
      title: scheme.title,
      description: scheme.description,
      year_group: scheme.year_group,
      subject: scheme.subject,
      lessons: scheme.lessons,
      assessment_criteria: scheme.assessment_criteria,
      exportDate: new Date().toISOString()
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${scheme.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Keep all the existing helper functions for editing schemes...
  const addLesson = () => {
    if (editingScheme) {
      const newLesson = {
        id: Date.now(),
        title: '',
        duration: '45 minutes',
        objectives: [''],
        resources: [''],
        assessment: '',
        weekNumber: editingScheme.lessons.length + 1,
        learningOutcomes: ['']
      }
      setEditingScheme(prev => ({
        ...prev,
        lessons: [...prev.lessons, newLesson]
      }))
    }
  }

  const updateLesson = (lessonIndex, field, value) => {
    setEditingScheme(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, index) => 
        index === lessonIndex ? { ...lesson, [field]: value } : lesson
      )
    }))
  }

  const deleteLesson = (lessonIndex) => {
    setEditingScheme(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, index) => index !== lessonIndex)
    }))
  }

  const addAssessmentCriteria = () => {
    if (editingScheme) {
      const newCriteria = {
        category: '',
        criteria: [''],
        weightage: 10
      }
      setEditingScheme(prev => ({
        ...prev,
        assessment_criteria: [...prev.assessment_criteria, newCriteria]
      }))
    }
  }

  const updateAssessmentCriteria = (criteriaIndex, field, value) => {
    setEditingScheme(prev => ({
      ...prev,
      assessment_criteria: prev.assessment_criteria.map((criteria, index) => 
        index === criteriaIndex ? { ...criteria, [field]: value } : criteria
      )
    }))
  }

  const deleteAssessmentCriteria = (criteriaIndex) => {
    setEditingScheme(prev => ({
      ...prev,
      assessment_criteria: prev.assessment_criteria.filter((_, index) => index !== criteriaIndex)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading schemes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schemes of Work</h1>
          <p className="text-gray-600 mt-1">Upload and analyze curriculum documents with AI</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadSchemes}
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
            <SafeIcon icon={FiUpload} />
            <span>Upload & Analyze Scheme</span>
          </motion.button>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {schemes.map((scheme, index) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBookOpen} className="text-blue-600 text-xl" />
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setShowSchemeDetail(scheme)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="View Details"
                >
                  <SafeIcon icon={FiEye} />
                </motion.button>
                <motion.button
                  onClick={() => handleEditScheme(scheme)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Edit Scheme"
                >
                  <SafeIcon icon={FiEdit3} />
                </motion.button>
                <motion.button
                  onClick={() => handleDuplicateScheme(scheme)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Duplicate"
                >
                  <SafeIcon icon={FiUpload} />
                </motion.button>
                <motion.button
                  onClick={() => handleExportScheme(scheme)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Export"
                >
                  <SafeIcon icon={FiDownload} />
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteConfirm(scheme.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete"
                >
                  <SafeIcon icon={FiTrash2} />
                </motion.button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{scheme.description}</p>
            <p className="text-blue-600 text-sm font-medium mb-3">{scheme.year_group} • {scheme.subject}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Lessons:</span>
                <span className="font-medium">{scheme.lessons?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Assessment Criteria:</span>
                <span className="font-medium">{scheme.assessment_criteria?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Analysis:</span>
                <span className={`font-medium ${scheme.analysis_complete ? 'text-green-600' : 'text-orange-600'}`}>
                  {scheme.analysis_complete ? 'Complete' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                scheme.status === 'active' ? 'bg-green-100 text-green-800' :
                scheme.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {scheme.status}
              </span>
              
              {scheme.analysis_complete ? (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleReanalyze(scheme.id)}
                    disabled={isAnalyzing}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Re-analyze"
                  >
                    {isAnalyzing ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiRefreshCw} />}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowSchemeDetail(scheme)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Analyze Now
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add New Scheme Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: schemes.length * 0.1 }}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          <SafeIcon icon={FiPlus} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Upload New Scheme</h3>
          <p className="text-sm text-gray-500 text-center">
            Upload a curriculum document and let AI extract lessons and assessment criteria
          </p>
        </motion.div>
      </div>

      {/* Upload and Analysis Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeUploadModal}
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
                  <h2 className="text-xl font-bold text-gray-900">Upload & Analyze Scheme of Work</h2>
                  <p className="text-gray-600">Upload a document and let AI extract lessons and assessment criteria</p>
                </div>
                <button onClick={closeUploadModal} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scheme Title</label>
                      <input
                        type="text"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Year 3 Mechanisms"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year Group</label>
                      <select
                        value={uploadData.year_group}
                        onChange={(e) => setUploadData(prev => ({ ...prev, year_group: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Year Group</option>
                        {yearGroups.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={uploadData.subject}
                      onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                      placeholder="Brief description of the scheme"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Scheme Document</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <SafeIcon icon={FiFileText} className="text-4xl text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="scheme-upload"
                      />
                      <label htmlFor="scheme-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        Choose file or drag here
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      {uploadData.file && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700 font-medium">{uploadData.file.name}</p>
                          <p className="text-xs text-gray-500">{(uploadData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={handleAnalyzeScheme}
                    disabled={!uploadData.file || !uploadData.title || isAnalyzing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? (
                      <>
                        <SafeIcon icon={FiLoader} className="animate-spin" />
                        <span>Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiPlay} />
                        <span>Analyze Scheme</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Analysis Results */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Results</h3>
                  
                  <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                      <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing scheme document...</h3>
                        <p className="text-gray-600">Extracting lessons and assessment criteria</p>
                      </motion.div>
                    ) : analysisResults ? (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Analysis Summary */}
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Analysis Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Lessons Found:</span>
                              <span className="font-medium">{analysisResults.lessons.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Assessment Areas:</span>
                              <span className="font-medium">{analysisResults.assessmentCriteria.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Duration:</span>
                              <span className="font-medium">{analysisResults.totalDuration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <span className="font-medium text-green-600">{analysisResults.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Extracted Lessons */}
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Extracted Lessons ({analysisResults.lessons.length})</h4>
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {analysisResults.lessons.slice(0, 3).map((lesson, index) => (
                              <div key={index} className="border-l-4 border-blue-500 pl-3">
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-gray-600">{lesson.duration} • {lesson.objectives.length} objectives</p>
                              </div>
                            ))}
                            {analysisResults.lessons.length > 3 && (
                              <p className="text-xs text-blue-600">+{analysisResults.lessons.length - 3} more lessons</p>
                            )}
                          </div>
                        </div>

                        {/* Assessment Criteria */}
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Assessment Criteria ({analysisResults.assessmentCriteria.length})</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {analysisResults.assessmentCriteria.map((criteria, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">{criteria.category}</span>
                                <span className="font-medium">{criteria.weightage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <motion.button
                          onClick={handleSaveScheme}
                          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Save Analyzed Scheme
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <SafeIcon icon={FiUpload} className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h3>
                        <p className="text-gray-600">Upload a scheme document to extract lessons and assessment criteria</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keep all other existing modals (Edit, Delete, Detail) with the same structure but updated to use real data */}
      {/* ... (other modals remain the same but should use DatabaseService for operations) */}
    </div>
  )
}