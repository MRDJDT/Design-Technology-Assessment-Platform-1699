import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { DatabaseService } from '../../services/databaseService';

const {
  FiCalendar,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiUsers,
  FiClock,
  FiBookOpen,
  FiSave,
  FiX,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle
} = FiIcons;

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: '',
    subject: 'Design & Technology',
    year_group: '',
    description: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const yearGroups = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
  const subjects = ['Design & Technology', 'Engineering', 'Product Design', 'Food Technology'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading classes data...");
      const classesData = await DatabaseService.getClasses();
      console.log("Classes loaded:", classesData);
      setClasses(classesData);
      
      const teachersData = await DatabaseService.getUsers({ role: 'teacher' });
      
      // Add Mr Jackson as default teacher if not present
      const hasJackson = teachersData.some(teacher => teacher.name === 'Mr Jackson');
      if (!hasJackson) {
        teachersData.unshift({
          id: 'jackson-default',
          name: 'Mr Jackson',
          email: 'jackson@school.com'
        });
      }

      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!classForm.name || !classForm.year_group) {
      setError('Class name and year group are required');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log("Creating class with data:", classForm);
      
      if (editingClass) {
        const updatedClass = await DatabaseService.updateClass(editingClass.id, classForm);
        console.log("Class updated:", updatedClass);
        setClasses(prev => prev.map(c => c.id === editingClass.id ? updatedClass : c));
        setSuccess('Class updated successfully!');
      } else {
        const newClass = await DatabaseService.createClass(classForm);
        console.log("New class created:", newClass);
        setClasses(prev => [newClass, ...prev]);
        setSuccess('Class created successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      setError('Error saving class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClassForm({
      name: '',
      subject: 'Design & Technology',
      year_group: '',
      description: ''
    });
    setShowCreateModal(false);
    setEditingClass(null);
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setClassForm({
      name: classItem.name,
      subject: classItem.subject,
      year_group: classItem.year_group,
      description: classItem.description || ''
    });
    setShowCreateModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log("Deleting class:", id);
      await DatabaseService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      setSuccess('Class deleted successfully!');
    } catch (error) {
      console.error('Error deleting class:', error);
      setError('Error deleting class. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-1">Manage classes and track enrollment</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadData}
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
            <span>Create Class</span>
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button onClick={clearMessages} className="text-red-600 hover:text-red-700">
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
          <button onClick={clearMessages} className="text-green-600 hover:text-green-700">
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <SafeIcon icon={FiBookOpen} className="text-xl text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {classes.reduce((acc, c) => acc + (c.enrolled || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <SafeIcon icon={FiUsers} className="text-xl text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(classes.map(c => c.subject)).size}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiBookOpen} className="text-xl text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Year Groups</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(classes.map(c => c.year_group)).size}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
              <SafeIcon icon={FiCalendar} className="text-xl text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Classes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Classes</h2>
        
        {classes.length === 0 && !loading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <SafeIcon icon={FiBookOpen} className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">Create your first class to get started</p>
            <motion.button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center space-x-2">
                <SafeIcon icon={FiPlus} />
                <span>Create First Class</span>
              </span>
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-blue-600">{classItem.subject}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      onClick={() => handleEditClass(classItem)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiEdit3} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiTrash2} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiCalendar} className="text-xs" />
                    <span>{classItem.year_group}</span>
                  </div>
                  {classItem.enrolled > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiUsers} className="text-xs" />
                      <span>{classItem.enrolled} students</span>
                    </div>
                  )}
                </div>

                {classItem.description && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{classItem.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Class Modal */}
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
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                  <input
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Reception A - Design Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={classForm.subject}
                    onChange={(e) => setClassForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Group *</label>
                  <select
                    value={classForm.year_group}
                    onChange={(e) => setClassForm(prev => ({ ...prev, year_group: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year Group</option>
                    {yearGroups.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={classForm.description}
                    onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                    placeholder="Brief description of the class content..."
                  />
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
                  onClick={handleCreateClass}
                  disabled={!classForm.name || !classForm.year_group || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <SafeIcon icon={FiRefreshCw} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiSave} />
                      <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}