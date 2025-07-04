import React,{useState,useEffect} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import {AIService} from '../../services/aiService'

const {FiFileText,FiUsers,FiCalendar,FiDownload,FiPlay,FiLoader,FiSettings,FiRefreshCw,FiFilter,FiSearch,FiEye,FiX} = FiIcons

export default function Reports() {
  const [pupils,setPupils] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      yearGroup: 'Year 4',
      class: 'Year 4A - Design Technology',
      grades: [
        {subject: 'Design Skills',grade: 4.2,feedback: 'Excellent creative thinking and problem-solving',date: '2024-01-20'},
        {subject: 'Making Skills',grade: 3.8,feedback: 'Good technical execution, room for improvement in tool use',date: '2024-01-18'},
        {subject: 'Evaluation',grade: 4.0,feedback: 'Strong reflection skills and thoughtful analysis',date: '2024-01-15'}
      ],
      attendance: 95,
      behaviour: 'Excellent',
      lastReport: '2024-01-15',
      hasRecentReport: false
    },
    {
      id: 2,
      name: 'Mike Chen',
      yearGroup: 'Year 5',
      class: 'Year 5B - Design Technology',
      grades: [
        {subject: 'Design Skills',grade: 3.5,feedback: 'Shows good understanding of design principles',date: '2024-01-22'},
        {subject: 'Making Skills',grade: 4.1,feedback: 'Excellent practical skills and attention to detail',date: '2024-01-19'},
        {subject: 'Problem Solving',grade: 3.7,feedback: 'Good systematic approach to challenges',date: '2024-01-17'}
      ],
      attendance: 92,
      behaviour: 'Good',
      lastReport: '2024-01-10',
      hasRecentReport: true
    },
    {
      id: 3,
      name: 'Emma Wilson',
      yearGroup: 'Year 3',
      class: 'Year 3C - Design Technology',
      grades: [
        {subject: 'Design Skills',grade: 3.2,feedback: 'Developing creativity and design thinking',date: '2024-01-21'},
        {subject: 'Making Skills',grade: 3.0,feedback: 'Improving tool handling and construction techniques',date: '2024-01-16'},
        {subject: 'Communication',grade: 3.8,feedback: 'Excellent presentation and sharing skills',date: '2024-01-14'}
      ],
      attendance: 88,
      behaviour: 'Good',
      lastReport: null,
      hasRecentReport: false
    },
    {
      id: 4,
      name: 'James Brown',
      yearGroup: 'Year 6',
      class: 'Year 6A - Design Technology',
      grades: [
        {subject: 'Design Skills',grade: 4.5,feedback: 'Outstanding creativity and innovative solutions',date: '2024-01-23'},
        {subject: 'Making Skills',grade: 4.3,feedback: 'Excellent technical skills and precision',date: '2024-01-20'},
        {subject: 'Leadership',grade: 4.2,feedback: 'Strong leadership and collaboration skills',date: '2024-01-18'}
      ],
      attendance: 97,
      behaviour: 'Outstanding',
      lastReport: '2024-01-20',
      hasRecentReport: true
    }
  ])

  const [selectedPupils,setSelectedPupils] = useState([])
  const [reportType,setReportType] = useState('individual')
  const [reportPeriod,setReportPeriod] = useState('term')
  const [customPrompt,setCustomPrompt] = useState('')
  const [isGenerating,setIsGenerating] = useState(false)
  const [generatedReports,setGeneratedReports] = useState([])
  const [searchTerm,setSearchTerm] = useState('')
  const [filterYear,setFilterYear] = useState('all')
  const [showPromptModal,setShowPromptModal] = useState(false)
  const [selectedReport,setSelectedReport] = useState(null)

  const yearGroups = ['all','Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6']
  const reportTypes = [
    {value: 'individual',label: 'Individual Reports',description: 'Detailed report for each selected pupil'},
    {value: 'class',label: 'Class Summary',description: 'Overview report for the entire class'},
    {value: 'progress',label: 'Progress Report',description: 'Focus on progress and development over time'},
    {value: 'parents',label: 'Parent Report',description: 'Parent-friendly summary with next steps'}
  ]

  const reportPeriods = [
    {value: 'week',label: 'This Week'},
    {value: 'month',label: 'This Month'},
    {value: 'term',label: 'This Term'},
    {value: 'year',label: 'This Year'}
  ]

  // Default AI prompts for different report types
  const defaultPrompts = {
    individual: `Create a comprehensive individual report for this pupil based on their grades and feedback. Include:
- Overall performance summary
- Key strengths and achievements
- Areas for development
- Specific next steps and recommendations
- Celebration of progress made
Keep the tone encouraging and constructive, suitable for both pupils and parents to read.`,

    class: `Generate a class overview report summarizing the performance of all pupils. Include:
- Class performance overview
- Common strengths across the group
- Areas where the class could improve
- Teaching recommendations
- Notable individual achievements
Focus on patterns and trends across the whole class.`,

    progress: `Create a progress-focused report highlighting development over time. Include:
- Progress made since last assessment
- Skills that have improved
- Challenges overcome
- Growth in confidence and independence
- Future learning goals
Emphasize the journey of learning and celebrate growth.`,

    parents: `Write a parent-friendly report that is warm and accessible. Include:
- What their child has been learning
- How their child is progressing
- Specific examples of good work
- How parents can support at home
- Positive next steps
Use simple language and focus on celebrating achievements while being honest about areas for growth.`
  }

  useEffect(() => {
    // Set default prompt when report type changes
    setCustomPrompt(defaultPrompts[reportType] || '')
  },[reportType])

  const filteredPupils = pupils.filter(pupil => {
    const matchesSearch = pupil.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = filterYear === 'all' || pupil.yearGroup === filterYear
    return matchesSearch && matchesYear
  })

  const handlePupilSelection = (pupilId) => {
    setSelectedPupils(prev => 
      prev.includes(pupilId) 
        ? prev.filter(id => id !== pupilId)
        : [...prev,pupilId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPupils.length === filteredPupils.length) {
      setSelectedPupils([])
    } else {
      setSelectedPupils(filteredPupils.map(p => p.id))
    }
  }

  const generateReports = async () => {
    if (selectedPupils.length === 0) {
      alert('Please select at least one pupil')
      return
    }

    setIsGenerating(true)
    try {
      const selectedPupilsData = pupils.filter(p => selectedPupils.includes(p.id))
      
      if (reportType === 'class') {
        // Generate single class report
        const classReport = await AIService.generateClassReport({
          pupils: selectedPupilsData,
          period: reportPeriod,
          prompt: customPrompt,
          reportType
        })
        
        setGeneratedReports([{
          id: Date.now(),
          type: 'class',
          title: 'Class Report',
          pupils: selectedPupilsData.map(p => p.name),
          content: classReport,
          generatedAt: new Date().toISOString(),
          period: reportPeriod
        }])
      } else {
        // Generate individual reports
        const reports = []
        for (const pupil of selectedPupilsData) {
          const report = await AIService.generatePupilReport({
            pupil,
            period: reportPeriod,
            prompt: customPrompt,
            reportType
          })
          
          reports.push({
            id: Date.now() + pupil.id,
            type: reportType,
            title: `${pupil.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
            pupil: pupil.name,
            content: report,
            generatedAt: new Date().toISOString(),
            period: reportPeriod
          })
        }
        setGeneratedReports(reports)
      }
    } catch (error) {
      console.error('Error generating reports:',error)
      alert('Error generating reports. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportReport = (report) => {
    const exportData = {
      title: report.title,
      generatedAt: report.generatedAt,
      period: report.period,
      content: report.content,
      type: report.type
    }

    const dataStr = JSON.stringify(exportData,null,2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${report.title.replace(/[^a-z0-9]/gi,'_').toLowerCase()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href',dataUri)
    linkElement.setAttribute('download',exportFileDefaultName)
    linkElement.click()
  }

  const exportAllReports = () => {
    if (generatedReports.length === 0) return

    const exportData = {
      reports: generatedReports,
      exportedAt: new Date().toISOString(),
      totalReports: generatedReports.length
    }

    const dataStr = JSON.stringify(exportData,null,2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href',dataUri)
    linkElement.setAttribute('download',`all_reports_${new Date().toISOString().split('T')[0]}.json`)
    linkElement.click()
  }

  const getGradeColor = (grade) => {
    if (grade >= 4) return 'text-green-600'
    if (grade >= 3) return 'text-blue-600'
    if (grade >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAverageGrade = (pupil) => {
    if (pupil.grades.length === 0) return 0
    return pupil.grades.reduce((sum,grade) => sum + grade.grade,0) / pupil.grades.length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Reports</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports using AI analysis</p>
        </div>
        <div className="flex space-x-3">
          {generatedReports.length > 0 && (
            <motion.button
              onClick={exportAllReports}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <SafeIcon icon={FiDownload} />
              <span>Export All</span>
            </motion.button>
          )}
          <motion.button
            onClick={() => setShowPromptModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiSettings} />
            <span>Customize Prompt</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pupil Selection */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Pupils</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pupils..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {yearGroups.map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>
                <motion.button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  whileHover={{scale: 1.05}}
                >
                  {selectedPupils.length === filteredPupils.length ? 'Deselect All' : 'Select All'}
                </motion.button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPupils.map((pupil) => (
                <div
                  key={pupil.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPupils.includes(pupil.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePupilSelection(pupil.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedPupils.includes(pupil.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedPupils.includes(pupil.id) && (
                          <SafeIcon icon={FiUsers} className="text-white text-xs" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{pupil.name}</h3>
                        <p className="text-sm text-gray-600">{pupil.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Grade: </span>
                          <span className={`font-medium ${getGradeColor(getAverageGrade(pupil))}`}>
                            {getAverageGrade(pupil).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Attendance: </span>
                          <span className="font-medium">{pupil.attendance}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {pupil.grades.length} assessments
                        </span>
                        {pupil.hasRecentReport && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Recent Report
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPupils.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  {selectedPupils.length} pupil{selectedPupils.length !== 1 ? 's' : ''} selected for report generation
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Report Configuration */}
        <div className="space-y-6">
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            transition={{delay: 0.1}}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {reportTypes.find(t => t.value === reportType)?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {reportPeriods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              onClick={generateReports}
              disabled={selectedPupils.length === 0 || isGenerating}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              {isGenerating ? (
                <>
                  <SafeIcon icon={FiLoader} className="animate-spin" />
                  <span>Generating Reports...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiPlay} />
                  <span>Generate Reports</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            transition={{delay: 0.2}}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Pupils:</span>
                <span className="font-medium">{pupils.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium text-blue-600">{selectedPupils.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reports Generated:</span>
                <span className="font-medium text-green-600">{generatedReports.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Class Grade:</span>
                <span className="font-medium">
                  {pupils.length > 0 ? (
                    pupils.reduce((sum,pupil) => sum + getAverageGrade(pupil),0) / pupils.length
                  ).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">
                      {report.type === 'class' ? `${report.pupils.length} pupils` : report.pupil}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      whileHover={{scale: 1.1}}
                      whileTap={{scale: 0.9}}
                      title="View Report"
                    >
                      <SafeIcon icon={FiEye} />
                    </motion.button>
                    <motion.button
                      onClick={() => exportReport(report)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      whileHover={{scale: 1.1}}
                      whileTap={{scale: 0.9}}
                      title="Export Report"
                    >
                      <SafeIcon icon={FiDownload} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Generated: {new Date(report.generatedAt).toLocaleString()}</div>
                  <div>Period: {report.period}</div>
                  <div>Type: {report.type}</div>
                </div>
                
                <div className="mt-3">
                  <motion.button
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    whileHover={{scale: 1.05}}
                  >
                    View Full Report →
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Custom Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPromptModal(false)}
          >
            <motion.div
              initial={{scale: 0.9,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.9,opacity: 0}}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Customize AI Report Prompt</h2>
                <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type: {reportTypes.find(t => t.value === reportType)?.label}
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    {reportTypes.find(t => t.value === reportType)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-64"
                    placeholder="Enter your custom prompt for AI report generation..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This prompt will guide how the AI generates reports. Be specific about what information to include and the tone to use.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Prompt Tips:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific about what information to include</li>
                    <li>• Specify the tone (encouraging, formal, parent-friendly)</li>
                    <li>• Mention key areas to focus on (strengths, improvements, next steps)</li>
                    <li>• Include any specific formatting requirements</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setCustomPrompt(defaultPrompts[reportType] || '')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset to Default
                </button>
                <motion.button
                  onClick={() => setShowPromptModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                >
                  Save Prompt
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report View Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReport(null)}
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
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <p className="text-gray-600">
                    Generated on {new Date(selectedReport.generatedAt).toLocaleString()} • {selectedReport.period}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => exportReport(selectedReport)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                  >
                    <SafeIcon icon={FiDownload} />
                    <span>Export</span>
                  </motion.button>
                  <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                    <SafeIcon icon={FiX} className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedReport.content}
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