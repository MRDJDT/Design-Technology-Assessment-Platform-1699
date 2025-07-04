import React,{useState,useEffect} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import {DatabaseService} from '../../services/databaseService';

const {FiCalendar,FiPlus,FiEdit3,FiTrash2,FiUsers,FiClock,FiBookOpen,FiSave,FiX,FiRefreshCw} = FiIcons;

export default function ClassManagement() {
  const [classes,setClasses] = useState([]);
  const [teachers,setTeachers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [showCreateModal,setShowCreateModal] = useState(false);
  const [editingClass,setEditingClass] = useState(null);
  const [classForm,setClassForm] = useState({
    name: '',
    subject: 'Design & Technology',
    teacher_id: '',
    capacity: 30,
    year_group: '',
    term: 'Autumn',
    description: ''
  });

  const yearGroups = ['Reception','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'];
  const terms = ['Autumn','Spring','Summer'];
  const subjects = ['Design & Technology','Engineering','Product Design','Food Technology'];

  useEffect(() => {
    loadData();
  },[]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData,teachersData] = await Promise.all([
        DatabaseService.getClasses(),
        DatabaseService.getUsers({role: 'teacher'})
      ]);
      
      // Add Mr Jackson as default teacher if not present
      const hasJackson = teachersData.some(teacher => teacher.name === 'Mr Jackson');
      if (!hasJackson) {
        teachersData.unshift({
          id: 'jackson-default',
          name: 'Mr Jackson',
          email: 'jackson@school.com'
        });
      }
      
      setClasses(classesData);
      setTeachers(teachersData);
      
      // Set Mr Jackson as default teacher
      const jacksonTeacher = teachersData.find(teacher => teacher.name === 'Mr Jackson');
      if (jacksonTeacher && !classForm.teacher_id) {
        setClassForm(prev => ({...prev,teacher_id: jacksonTeacher.id}));
      }
    } catch (error) {
      console.error('Error loading data:',error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!classForm.name || !classForm.teacher_id || !classForm.year_group) return;

    try {
      if (editingClass) {
        await DatabaseService.updateClass(editingClass.id,classForm);
      } else {
        await DatabaseService.createClass(classForm);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving class:',error);
      alert('Error saving class. Please try again.');
    }
  };

  const resetForm = () => {
    const jacksonTeacher = teachers.find(teacher => teacher.name === 'Mr Jackson');
    setClassForm({
      name: '',
      subject: 'Design & Technology',
      teacher_id: jacksonTeacher?.id || '',
      capacity: 30,
      year_group: '',
      term: 'Autumn',
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
      teacher_id: classItem.teacher_id,
      capacity: classItem.capacity,
      year_group: classItem.year_group,
      term: classItem.term,
      description: classItem.description || ''
    });
    setShowCreateModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await DatabaseService.deleteClass(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting class:',error);
      alert('Error deleting class. Please try again.');
    }
  };

  const getCapacityColor = (enrolled,capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityBg = (enrolled,capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading) {
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
          <p className="text-gray-600 mt-1">Manage classes, assign teachers, and track enrollment</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={loadData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={FiPlus} />
            <span>Create Class</span>
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
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
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{delay: 0.1}}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {classes.reduce((acc,c) => acc + (c.enrolled || 0),0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <SafeIcon icon={FiUsers} className="text-xl text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Active Teachers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(classes.map(c => c.teacher_id)).size}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiUsers} className="text-xl text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Avg. Capacity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {classes.length > 0 
                  ? Math.round((classes.reduce((acc,c) => acc + (c.enrolled || 0),0) / classes.reduce((acc,c) => acc + c.capacity,0)) * 100)
                  : 0}%
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
        initial={{opacity: 0,y: 20}}
        animate={{opacity: 1,y: 0}}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem,index) => (
            <motion.div
              key={classItem.id}
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{delay: index * 0.1}}
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
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                  >
                    <SafeIcon icon={FiEdit3} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                  >
                    <SafeIcon icon={FiTrash2} />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <SafeIcon icon={FiUsers} className="text-xs" />
                  <span>{classItem.teacher?.name || 'No teacher assigned'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <SafeIcon icon={FiCalendar} className="text-xs" />
                  <span>{classItem.year_group} • {classItem.term} Term</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Enrolled:</span>
                  <span className={`font-medium ${getCapacityColor(classItem.enrolled || 0,classItem.capacity)}`}>
                    {classItem.enrolled || 0}/{classItem.capacity}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCapacityBg(classItem.enrolled || 0,classItem.capacity)} ${getCapacityColor(classItem.enrolled || 0,classItem.capacity)}`}>
                  {Math.round(((classItem.enrolled || 0) / classItem.capacity) * 100)}%
                </div>
              </div>
              
              {classItem.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{classItem.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create/Edit Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetForm}
          >
            <motion.div
              initial={{scale: 0.9,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.9,opacity: 0}}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm(prev => ({...prev,name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Reception A - Design Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={classForm.subject}
                    onChange={(e) => setClassForm(prev => ({...prev,subject: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <select
                    value={classForm.teacher_id}
                    onChange={(e) => setClassForm(prev => ({...prev,teacher_id: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Group</label>
                  <select
                    value={classForm.year_group}
                    onChange={(e) => setClassForm(prev => ({...prev,year_group: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year Group</option>
                    {yearGroups.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                  <select
                    value={classForm.term}
                    onChange={(e) => setClassForm(prev => ({...prev,term: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {terms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm(prev => ({...prev,capacity: parseInt(e.target.value) || 30}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={classForm.description}
                  onChange={(e) => setClassForm(prev => ({...prev,description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                  placeholder="Brief description of the class content..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateClass}
                  disabled={!classForm.name || !classForm.teacher_id || !classForm.year_group}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                >
                  <SafeIcon icon={FiSave} />
                  <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}