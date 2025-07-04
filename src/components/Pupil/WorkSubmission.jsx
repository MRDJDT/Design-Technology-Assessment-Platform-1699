import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { AIService } from '../../services/aiService'

const { FiUpload, FiFile, FiImage, FiVideo, FiX, FiSend, FiLoader } = FiIcons

export default function WorkSubmission() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [workTitle, setWorkTitle] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const [aiResults, setAiResults] = useState(null)

  const projects = [
    { id: 1, title: 'CAD Design Project', subject: 'Electronics and Control' },
    { id: 2, title: 'Prototype Development', subject: 'Mechanisms and Structures' },
    { id: 3, title: 'Materials Research', subject: 'Materials and Manufacturing' }
  ]

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file) => {
    const type = file.type
    if (type.startsWith('image/')) return FiImage
    if (type.startsWith('video/')) return FiVideo
    return FiFile
  }

  const handleSubmit = async () => {
    if (!workTitle || !selectedProject || selectedFiles.length === 0) return

    setIsSubmitting(true)
    setIsGrading(true)

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Get AI grading
      const workData = {
        title: workTitle,
        description: workDescription,
        files: selectedFiles,
        project: selectedProject
      }
      
      const results = await AIService.gradeWork(workData, {})
      setAiResults(results)
      
      // Reset form
      setWorkTitle('')
      setWorkDescription('')
      setSelectedProject('')
      setSelectedFiles([])
      
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
      setIsGrading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your Work</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Work</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title} - {project.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Title
              </label>
              <input
                type="text"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a title for your work"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Describe your work, challenges faced, or design decisions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <SafeIcon icon={FiUpload} className="text-4xl text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose files or drag here
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Images, videos, documents, CAD files
                </p>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Selected Files</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
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
              onClick={handleSubmit}
              disabled={!workTitle || !selectedProject || selectedFiles.length === 0 || isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <SafeIcon icon={FiLoader} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSend} />
                  <span>Submit Work</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* AI Grading Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Feedback & Grading</h2>

          <AnimatePresence mode="wait">
            {isGrading ? (
              <motion.div
                key="grading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <SafeIcon icon={FiLoader} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI is analyzing your work...</h3>
                <p className="text-gray-600">This may take a few moments</p>
              </motion.div>
            ) : aiResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Overall Grade */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Grade</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {aiResults.overallGrade.toFixed(1)}/5
                  </div>
                  <p className="text-gray-600">
                    {aiResults.overallGrade >= 4 ? 'Excellent work!' :
                     aiResults.overallGrade >= 3 ? 'Good job!' :
                     'Keep working on it!'}
                  </p>
                </div>

                {/* Individual Grades */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Assessment Breakdown</h4>
                  {Object.entries(aiResults.grades).map(([criteria, grade]) => (
                    <div key={criteria} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">{criteria}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        grade >= 4 ? 'bg-green-100 text-green-800' :
                        grade >= 3 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {grade}/5
                      </span>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Detailed Feedback</h4>
                  {Object.values(aiResults.feedback).map((feedback, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Suggestions for Improvement</h4>
                  <ul className="space-y-2">
                    {aiResults.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiUpload} className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Analysis</h3>
                <p className="text-gray-600">Submit your work to receive instant feedback and grading</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}