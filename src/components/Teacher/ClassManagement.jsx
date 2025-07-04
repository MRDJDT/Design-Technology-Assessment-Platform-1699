import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {useLocation,useNavigate} from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import {AIService} from '../../services/aiService'

const {FiUsers,FiArrowLeft,FiEdit3,FiMail,FiPhone,FiCalendar,FiTrendingUp,FiBookOpen,FiCheckCircle,FiClock,FiAward,FiFilter,FiDownload,FiPlus,FiUpload,FiFile,FiImage,FiFileText,FiX,FiLoader,FiSend,FiEye} = FiIcons

export default function ClassManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const {classData} = location.state || {}

  const [pupils,setPupils] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.com',
      currentGrade: 4.2,
      attendance: 95,
      assignments: {completed: 8,pending: 2,total: 10},
      recentWork: [
        {title: 'CAD Design Project',grade: 4,date: '2024-01-20',feedback: 'Excellent technical skills'},
        {title: 'Simple Mechanisms',grade: 4,date: '2024-01-18',feedback: 'Good problem solving'}
      ],
      aiAnalysis: [
        {
          id: 1,
          document: 'Design Portfolio.pdf',
          uploadDate: '2024-01-20',
          analysis: {
            overallGrade: 4.2,
            grades: {creativity: 4,technical: 5,problemSolving: 4,evaluation: 4},
            feedback: {
              creativity: 'Shows strong creative thinking with innovative design solutions',
              technical: 'Excellent technical execution and attention to detail',
              problemSolving: 'Good systematic approach to problem solving',
              evaluation: 'Thoughtful reflection on design decisions'
            },
            suggestions: ['Continue exploring advanced CAD techniques','Consider sustainability factors in future designs']
          }
        }
      ],
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@school.com',
      currentGrade: 3.8,
      attendance: 92,
      assignments: {completed: 7,pending: 3,total: 10},
      recentWork: [
        {title: 'Moving Toys Project',grade: 4,date: '2024-01-19',feedback: 'Creative approach'},
        {title: 'Materials Investigation',grade: 3,date: '2024-01-17',feedback: 'Needs more detail'}
      ],
      aiAnalysis: [],
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.wilson@school.com',
      currentGrade: 3.5,
      attendance: 88,
      assignments: {completed: 6,pending: 4,total: 10},
      recentWork: [
        {title: 'Design Analysis',grade: 3,date: '2024-01-21',feedback: 'Good understanding'},
        {title: 'Safety Assessment',grade: 4,date: '2024-01-16',feedback: 'Thorough evaluation'}
      ],
      aiAnalysis: [],
      avatar: 'EW'
    },
    {
      id: 4,
      name: 'James Brown',
      email: 'james.brown@school.com',
      currentGrade: 4.0,
      attendance: 97,
      assignments: {completed: 9,pending: 1,total: 10},
      recentWork: [
        {title: 'Construction Project',grade: 4,date: '2024-01-22',feedback: 'Well structured'},
        {title: 'Tool Safety',grade: 4,date: '2024-01-19',feedback: 'Excellent attention to detail'}
      ],
      aiAnalysis: [],
      avatar: 'JB'
    }
  ])

  const [selectedPupil,setSelectedPupil] = useState(null)
  const [filterGrade,setFilterGrade] = useState('all')
  const [sortBy,setSortBy] = useState('name')
  const [showUploadModal,setShowUploadModal] = useState(false)
  const [selectedFiles,setSelectedFiles] = useState([])
  const [uploadingPupil,setUploadingPupil] = useState(null)
  const [isAnalyzing,setIsAnalyzing] = useState(false)
  const [analysisResults,setAnalysisResults] = useState(null)

  // Redirect if no class data
  useEffect(() => {
    if (!classData) {
      navigate('/dashboard')
    }
  },[classData,navigate])

  if (!classData) return null

  const classStats = {
    totalPupils: pupils.length,
    averageGrade: pupils.reduce((acc,pupil) => acc + pupil.currentGrade,0) / pupils.length,
    averageAttendance: pupils.reduce((acc,pupil) => acc + pupil.attendance,0) / pupils.length,
    completedAssignments: pupils.reduce((acc,pupil) => acc + pupil.assignments.completed,0)
  }

  const gradeDistributionData = {
    tooltip: {trigger: 'axis'},
    xAxis: {type: 'category',data: pupils.map(p => p.name.split(' ')[0])},
    yAxis: {type: 'value',min: 0,max: 5},
    series: [{
      name: 'Current Grade',
      data: pupils.map(p => p.currentGrade),
      type: 'bar',
      itemStyle: {color: '#3B82F6'}
    }]
  }

  const attendanceData = {
    tooltip: {trigger: 'item'},
    series: [{
      name: 'Attendance',
      type: 'pie',
      radius: ['40%','70%'],
      data: [
        {value: pupils.filter(p => p.attendance >= 95).length,name: 'Excellent (95%+)'},
        {value: pupils.filter(p => p.attendance >= 85 && p.attendance < 95).length,name: 'Good (85-94%)'},
        {value: pupils.filter(p => p.attendance < 85).length,name: 'Needs Improvement (<85%)'}
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
  }

  const filteredPupils = pupils
    .filter(pupil => {
      if (filterGrade === 'all') return true
      if (filterGrade === 'high') return pupil.currentGrade >= 4
      if (filterGrade === 'medium') return pupil.currentGrade >= 3 && pupil.currentGrade < 4
      if (filterGrade === 'low') return pupil.currentGrade < 3
      return true
    })
    .sort((a,b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'grade') return b.currentGrade - a.currentGrade
      if (sortBy === 'attendance') return b.attendance - a.attendance
      return 0
    })

  const getGradeColorClasses = (grade) => {
    if (grade >= 4) return 'bg-green-100 text-green-800'
    if (grade >= 3) return 'bg-blue-100 text-blue-800'
    if (grade >= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getAttendanceColorClasses = (attendance) => {
    if (attendance >= 95) return 'bg-green-100 text-green-800'
    if (attendance >= 85) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev,...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_,i) => i !== index))
  }

  const getFileIcon = (file) => {
    const type = file.type
    if (type.includes('pdf')) return FiFileText
    if (type.startsWith('image/')) return FiImage
    return FiFile
  }

  const handleUploadForPupil = (pupil) => {
    setUploadingPupil(pupil)
    setShowUploadModal(true)
    setSelectedFiles([])
    setAnalysisResults(null)
  }

  const handleAnalyzeDocuments = async () => {
    if (!uploadingPupil || selectedFiles.length === 0) return

    setIsAnalyzing(true)
    try {
      // Simulate document analysis
      const workData = {
        title: `Document Analysis for ${uploadingPupil.name}`,
        description: 'AI analysis of uploaded documents',
        files: selectedFiles,
        pupilId: uploadingPupil.id
      }

      const results = await AIService.analyzeDocuments(workData)
      setAnalysisResults(results)

      // Update pupil data with analysis
      setPupils(prev => prev.map(pupil =>
        pupil.id === uploadingPupil.id
          ? {
              ...pupil,
              aiAnalysis: [
                ...pupil.aiAnalysis,
                {
                  id: Date.now(),
                  document: selectedFiles.map(f => f.name).join(', '),
                  uploadDate: new Date().toISOString().split('T')[0],
                  analysis: results
                }
              ]
            }
          : pupil
      ))
    } catch (error) {
      console.error('Analysis error:',error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAnalysis = () => {
    setShowUploadModal(false)
    setSelectedFiles([])
    setUploadingPupil(null)
    setAnalysisResults(null)
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setSelectedFiles([])
    setUploadingPupil(null)
    setAnalysisResults(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.9}}
          >
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classData.class}</h1>
            <p className="text-gray-600 mt-1">
              {classData.time} • {classData.pupils} pupils
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiDownload} />
            <span>Export</span>
          </motion.button>
          <motion.button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiPlus} />
            <span>Add Pupil</span>
          </motion.button>
        </div>
      </div>

      {/* Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pupils</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.totalPupils}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <SafeIcon icon={FiUsers} className="text-xl text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{delay: 0.1}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.averageGrade.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <SafeIcon icon={FiTrendingUp} className="text-xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{delay: 0.2}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.averageAttendance.toFixed(0)}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiCalendar} className="text-xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{delay: 0.3}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Work</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.completedAssignments}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
              <SafeIcon icon={FiCheckCircle} className="text-xl text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{opacity: 0,x: -20}}
          animate={{opacity: 1,x: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Grades</h3>
          <ReactECharts option={gradeDistributionData} style={{height: '300px'}} />
        </motion.div>

        <motion.div
          initial={{opacity: 0,x: 20}}
          animate={{opacity: 1,x: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <ReactECharts option={attendanceData} style={{height: '300px'}} />
        </motion.div>
      </div>

      {/* Pupils List */}
      <motion.div
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Class List</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="high">High Performers (4+)</option>
              <option value="medium">Average (3-4)</option>
              <option value="low">Needs Support (&lt;3)</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="attendance">Sort by Attendance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPupils.map((pupil,index) => (
            <motion.div
              key={pupil.id}
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{delay: index * 0.1}}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{pupil.avatar}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{pupil.name}</h4>
                  <p className="text-sm text-gray-600">{pupil.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Grade:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColorClasses(pupil.currentGrade)}`}>
                    {pupil.currentGrade.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attendance:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAttendanceColorClasses(pupil.attendance)}`}>
                    {pupil.attendance}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignments:</span>
                  <span className="text-sm text-gray-900">
                    {pupil.assignments.completed}/{pupil.assignments.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Analysis:</span>
                  <span className="text-sm text-gray-900">
                    {pupil.aiAnalysis.length} reports
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  onClick={() => setSelectedPupil(pupil)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center space-x-1"
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                >
                  <SafeIcon icon={FiEye} className="text-sm" />
                  <span>View</span>
                </motion.button>
                <motion.button
                  onClick={() => handleUploadForPupil(pupil)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center space-x-1"
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                >
                  <SafeIcon icon={FiUpload} className="text-sm" />
                  <span>Upload</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Document Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{scale: 0.9,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.9,opacity: 0}}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload Documents for {uploadingPupil?.name}
                  </h2>
                  <p className="text-gray-600">Upload PDFs or images for AI analysis</p>
                </div>
                <button onClick={closeUploadModal} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <SafeIcon icon={FiUpload} className="text-4xl text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="document-upload"
                        accept=".pdf,image/*"
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Choose files or drag here
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        PDF documents and images (max 10MB each)
                      </p>
                    </div>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Selected Files ({selectedFiles.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedFiles.map((file,index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <SafeIcon icon={getFileIcon(file)} className="text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <SafeIcon icon={FiX} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={handleAnalyzeDocuments}
                    disabled={selectedFiles.length === 0 || isAnalyzing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                  >
                    {isAnalyzing ? (
                      <>
                        <SafeIcon icon={FiLoader} className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} />
                        <span>Analyze Documents ({selectedFiles.length})</span>
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
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="text-center py-12"
                      >
                        <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing documents...</h3>
                        <p className="text-gray-600">AI is processing the uploaded content</p>
                      </motion.div>
                    ) : analysisResults ? (
                      <motion.div
                        key="results"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="space-y-6"
                      >
                        {/* Overall Grade */}
                        <div className="text-center p-4 bg-white rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Overall Assessment</h4>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {analysisResults.overallGrade.toFixed(1)}/5
                          </div>
                          <p className="text-gray-600">
                            {analysisResults.overallGrade >= 4 ? 'Excellent work!' : 
                             analysisResults.overallGrade >= 3 ? 'Good progress!' : 'Needs improvement'}
                          </p>
                        </div>

                        {/* Individual Grades */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Assessment Breakdown</h4>
                          {Object.entries(analysisResults.grades).map(([criteria,grade]) => (
                            <div key={criteria} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="font-medium text-gray-900 capitalize">{criteria}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColorClasses(grade)}`}>
                                {grade}/5
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Detailed Feedback</h4>
                          {Object.values(analysisResults.feedback).map((feedback,index) => (
                            <div key={index} className="p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-700">{feedback}</p>
                            </div>
                          ))}
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Improvement Suggestions</h4>
                          <ul className="space-y-2">
                            {analysisResults.suggestions.map((suggestion,index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span className="text-sm text-gray-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <motion.button
                          onClick={handleSaveAnalysis}
                          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                          whileHover={{scale: 1.02}}
                          whileTap={{scale: 0.98}}
                        >
                          Save Analysis to Pupil Record
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <SafeIcon icon={FiUpload} className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h3>
                        <p className="text-gray-600">Upload documents to receive AI feedback</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pupil Detail Modal */}
      <AnimatePresence>
        {selectedPupil && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPupil(null)}
          >
            <motion.div
              initial={{scale: 0.9,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.9,opacity: 0}}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xl">{selectedPupil.avatar}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPupil.name}</h2>
                    <p className="text-gray-600">{selectedPupil.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPupil(null)} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <SafeIcon icon={FiTrendingUp} className="text-2xl text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Current Grade</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPupil.currentGrade.toFixed(1)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <SafeIcon icon={FiCalendar} className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPupil.attendance}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <SafeIcon icon={FiCheckCircle} className="text-2xl text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPupil.assignments.completed}/{selectedPupil.assignments.total}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Work */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Work</h3>
                  <div className="space-y-3">
                    {selectedPupil.recentWork.map((work,index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{work.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColorClasses(work.grade)}`}>
                            Grade {work.grade}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{work.feedback}</p>
                        <p className="text-xs text-gray-500">{work.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis History</h3>
                  {selectedPupil.aiAnalysis.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPupil.aiAnalysis.map((analysis) => (
                        <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{analysis.document}</h4>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColorClasses(analysis.analysis.overallGrade)}`}>
                              {analysis.analysis.overallGrade.toFixed(1)}/5
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Uploaded: {analysis.uploadDate}</p>
                          <div className="space-y-1">
                            {Object.entries(analysis.analysis.grades).map(([criteria,grade]) => (
                              <div key={criteria} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{criteria}:</span>
                                <span className="font-medium">{grade}/5</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <SafeIcon icon={FiFileText} className="text-4xl mx-auto mb-2" />
                      <p>No AI analysis reports yet</p>
                      <p className="text-sm">Upload documents to generate analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}