import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { DatabaseService } from '../../services/databaseService';

const {
  FiUpload,
  FiUsers,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiSave
} = FiIcons;

export default function PupilImport() {
  const [pupils, setPupils] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddPupilModal, setShowAddPupilModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPupil, setEditingPupil] = useState(null);
  const [pupilForm, setPupilForm] = useState({
    name: '',
    email: '',
    year_group: '',
    class_id: '',
    status: 'active'
  });

  const yearGroups = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pupils and classes
      const [pupilsData, classesData] = await Promise.all([
        DatabaseService.getUsers({ role: 'pupil' }),
        DatabaseService.getClasses()
      ]);

      setPupils(pupilsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setError('File is empty');
          return;
        }

        // Check if first line is header
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('name') && firstLine.includes('email');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        const parsedData = dataLines.map((line, index) => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length < 2) {
            throw new Error(`Row ${index + (hasHeader ? 2 : 1)}: Not enough columns`);
          }

          return {
            id: `import-${index}`,
            name: columns[0] || '',
            email: columns[1] || '',
            year_group: columns[2] || '',
            class_name: columns[3] || '',
            status: 'active',
            original_row: index + (hasHeader ? 2 : 1)
          };
        }).filter(pupil => pupil.name && pupil.email);

        setImportData(parsedData);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        setError(`Error parsing file: ${error.message}`);
      }
    };

    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      for (const pupilData of importData) {
        try {
          // Find matching class if class_name is provided
          let classId = null;
          if (pupilData.class_name) {
            const matchingClass = classes.find(cls => 
              cls.name.toLowerCase().includes(pupilData.class_name.toLowerCase()) ||
              cls.year_group === pupilData.year_group
            );
            if (matchingClass) {
              classId = matchingClass.id;
            }
          }

          const newPupil = await DatabaseService.createUser({
            name: pupilData.name,
            email: pupilData.email,
            role: 'pupil',
            year_group: pupilData.year_group,
            class_id: classId,
            status: 'active'
          });

          // Update class enrollment if assigned
          if (classId) {
            await DatabaseService.assignPupilToClass(newPupil.id, classId);
          }

          results.successful++;
        } catch (error) {
          console.error(`Error importing pupil ${pupilData.name}:`, error);
          results.failed++;
          results.errors.push(`${pupilData.name}: ${error.message}`);
        }
      }

      setImportResults(results);
      setSuccess(`Import completed: ${results.successful} successful, ${results.failed} failed`);
      
      // Reload data to show new pupils
      await loadData();
      
    } catch (error) {
      console.error('Error during bulk import:', error);
      setError('Error during import process');
    } finally {
      setImporting(false);
    }
  };

  const handleAddPupil = async () => {
    if (!pupilForm.name || !pupilForm.email) {
      setError('Name and email are required');
      return;
    }

    try {
      setError(null);
      
      if (editingPupil) {
        const updatedPupil = await DatabaseService.updateUser(editingPupil.id, {
          ...pupilForm,
          role: 'pupil'
        });
        
        // Handle class assignment
        if (pupilForm.class_id && pupilForm.class_id !== editingPupil.class_id) {
          await DatabaseService.assignPupilToClass(editingPupil.id, pupilForm.class_id);
        }
        
        setPupils(prev => prev.map(p => p.id === editingPupil.id ? updatedPupil : p));
        setSuccess('Pupil updated successfully!');
      } else {
        const newPupil = await DatabaseService.createUser({
          ...pupilForm,
          role: 'pupil'
        });
        
        // Assign to class if selected
        if (pupilForm.class_id) {
          await DatabaseService.assignPupilToClass(newPupil.id, pupilForm.class_id);
        }
        
        setPupils(prev => [newPupil, ...prev]);
        setSuccess('Pupil added successfully!');
      }
      
      resetPupilForm();
    } catch (error) {
      console.error('Error saving pupil:', error);
      setError('Error saving pupil. Please try again.');
    }
  };

  const resetPupilForm = () => {
    setPupilForm({
      name: '',
      email: '',
      year_group: '',
      class_id: '',
      status: 'active'
    });
    setShowAddPupilModal(false);
    setEditingPupil(null);
  };

  const handleEditPupil = (pupil) => {
    setEditingPupil(pupil);
    setPupilForm({
      name: pupil.name,
      email: pupil.email,
      year_group: pupil.year_group || '',
      class_id: pupil.class_id || '',
      status: pupil.status || 'active'
    });
    setShowAddPupilModal(true);
  };

  const handleDeletePupil = async (pupilId) => {
    if (!confirm('Are you sure you want to delete this pupil?')) return;

    try {
      await DatabaseService.deleteUser(pupilId);
      setPupils(prev => prev.filter(p => p.id !== pupilId));
      setSuccess('Pupil deleted successfully!');
    } catch (error) {
      console.error('Error deleting pupil:', error);
      setError('Error deleting pupil. Please try again.');
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Year Group,Class Name\nJohn Smith,john.smith@school.com,Year 4,Year 4A\nJane Doe,jane.doe@school.com,Year 5,Year 5B";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pupil_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getPupilClassInfo = (pupil) => {
    if (!pupil.class_id) return 'No class assigned';
    const assignedClass = classes.find(cls => cls.id === pupil.class_id);
    return assignedClass ? assignedClass.name : 'Unknown class';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SafeIcon icon={FiRefreshCw} className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pupils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pupil Management</h1>
          <p className="text-gray-600 mt-1">Import and manage pupils, assign to classes</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={downloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiDownload} />
            <span>Template</span>
          </motion.button>
          <motion.button
            onClick={() => setShowAddPupilModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} />
            <span>Add Pupil</span>
          </motion.button>
          <motion.button
            onClick={loadData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
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

      {/* Import Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Pupils</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <SafeIcon icon={FiUpload} className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
          <p className="text-gray-600 mb-4">
            Upload a CSV file with pupil information. Include columns: Name, Email, Year Group, Class Name
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <div className="flex justify-center space-x-4">
            <label
              htmlFor="csv-upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center space-x-2"
            >
              <SafeIcon icon={FiFileText} />
              <span>Choose CSV File</span>
            </label>
            <motion.button
              onClick={downloadTemplate}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiDownload} />
              <span>Download Template</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pupils</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pupils.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <SafeIcon icon={FiUsers} className="text-xl text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Assigned to Classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pupils.filter(p => p.class_id).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <SafeIcon icon={FiCheckCircle} className="text-xl text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pupils.filter(p => !p.class_id).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <SafeIcon icon={FiAlertTriangle} className="text-xl text-orange-600" />
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
              <p className="text-sm font-medium text-gray-600">Available Classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <SafeIcon icon={FiUsers} className="text-xl text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pupils List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Pupils</h2>
        
        {pupils.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <SafeIcon icon={FiUsers} className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pupils found</h3>
            <p className="text-gray-600 mb-4">Import pupils or add them individually</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Year Group</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pupils.map((pupil) => (
                  <tr key={pupil.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{pupil.name}</td>
                    <td className="py-3 px-4 text-gray-600">{pupil.email}</td>
                    <td className="py-3 px-4 text-gray-600">{pupil.year_group || 'Not set'}</td>
                    <td className="py-3 px-4 text-gray-600">{getPupilClassInfo(pupil)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pupil.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pupil.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEditPupil(pupil)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <SafeIcon icon={FiEdit3} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePupil(pupil.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Import Preview Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Import Preview</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Found {importData.length} pupils to import. Review and confirm:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-900">Name</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-900">Year Group</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-900">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((pupil, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-4">{pupil.name}</td>
                          <td className="py-2 px-4">{pupil.email}</td>
                          <td className="py-2 px-4">{pupil.year_group || 'Not specified'}</td>
                          <td className="py-2 px-4">{pupil.class_name || 'Will auto-assign'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {importResults && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Import Results</h3>
                  <p className="text-green-600">✓ {importResults.successful} pupils imported successfully</p>
                  {importResults.failed > 0 && (
                    <div>
                      <p className="text-red-600">✗ {importResults.failed} pupils failed to import</p>
                      <div className="mt-2 space-y-1">
                        {importResults.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">• {error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleBulkImport}
                  disabled={importing || importResults}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {importing ? (
                    <>
                      <SafeIcon icon={FiRefreshCw} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiUpload} />
                      <span>Import Pupils</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Pupil Modal */}
      <AnimatePresence>
        {showAddPupilModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetPupilForm}
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
                  {editingPupil ? 'Edit Pupil' : 'Add New Pupil'}
                </h2>
                <button
                  onClick={resetPupilForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={pupilForm.name}
                    onChange={(e) => setPupilForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pupil's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={pupilForm.email}
                    onChange={(e) => setPupilForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Group</label>
                  <select
                    value={pupilForm.year_group}
                    onChange={(e) => setPupilForm(prev => ({ ...prev, year_group: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year Group</option>
                    {yearGroups.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Class</label>
                  <select
                    value={pupilForm.class_id}
                    onChange={(e) => setPupilForm(prev => ({ ...prev, class_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No class assigned</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={pupilForm.status}
                    onChange={(e) => setPupilForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetPupilForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddPupil}
                  disabled={!pupilForm.name || !pupilForm.email}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiSave} />
                  <span>{editingPupil ? 'Update Pupil' : 'Add Pupil'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}