import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCalendar, FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiBookOpen, FiMapPin, FiUsers } = FiIcons;

export default function TimetableManagement() {
  const [selectedWeek, setSelectedWeek] = useState('2024-W4');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const [timetableData, setTimetableData] = useState({
    'Monday': {
      '09:00-10:00': { class: 'Year 8A - Electronics', teacher: 'Mr. Smith', room: 'DT1', id: 1 },
      '10:30-11:30': { class: 'Year 9B - Mechanisms', teacher: 'Mrs. Johnson', room: 'DT2', id: 2 },
      '13:00-14:00': { class: 'Year 7C - Materials', teacher: 'Mr. Wilson', room: 'DT1', id: 3 },
      '14:30-15:30': { class: 'Year 10A - CAD Design', teacher: 'Ms. Brown', room: 'DT3', id: 4 }
    },
    'Tuesday': {
      '09:00-10:00': { class: 'Year 7A - Mechanisms', teacher: 'Mr. Smith', room: 'DT1', id: 5 },
      '10:30-11:30': { class: 'Year 8B - Electronics', teacher: 'Mrs. Johnson', room: 'DT2', id: 6 },
      '13:00-14:00': { class: 'Year 9A - Materials', teacher: 'Mr. Wilson', room: 'DT3', id: 7 }
    },
    'Wednesday': {
      '09:00-10:00': { class: 'Year 10B - Product Design', teacher: 'Ms. Brown', room: 'DT3', id: 8 },
      '10:30-11:30': { class: 'Year 8C - Electronics', teacher: 'Mr. Smith', room: 'DT1', id: 9 },
      '14:30-15:30': { class: 'Year 9C - CAD Design', teacher: 'Mrs. Johnson', room: 'DT2', id: 10 }
    },
    'Thursday': {
      '09:00-10:00': { class: 'Year 7B - Materials', teacher: 'Mr. Wilson', room: 'DT1', id: 11 },
      '10:30-11:30': { class: 'Year 10C - Advanced Design', teacher: 'Ms. Brown', room: 'DT3', id: 12 },
      '13:00-14:00': { class: 'Year 8D - Mechanisms', teacher: 'Mr. Smith', room: 'DT2', id: 13 }
    },
    'Friday': {
      '09:00-10:00': { class: 'Year 9D - Electronics', teacher: 'Mrs. Johnson', room: 'DT2', id: 14 },
      '10:30-11:30': { class: 'Year 7D - Introduction to DT', teacher: 'Mr. Wilson', room: 'DT1', id: 15 }
    }
  });

  const [slotForm, setSlotForm] = useState({
    day: '',
    timeSlot: '',
    class: '',
    teacher: '',
    room: ''
  });

  const timeSlots = [
    '09:00-10:00',
    '10:30-11:30',
    '13:00-14:00',
    '14:30-15:30',
    '15:45-16:45'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const rooms = ['DT1', 'DT2', 'DT3', 'DT4', 'Workshop A', 'Workshop B', 'CAD Suite'];
  const teachers = ['Mr. Smith', 'Mrs. Johnson', 'Mr. Wilson', 'Ms. Brown', 'Dr. Davis'];
  const classes = [
    'Year 7A - Mechanisms', 'Year 7B - Materials', 'Year 7C - Introduction to DT',
    'Year 8A - Electronics', 'Year 8B - Mechanisms', 'Year 8C - Materials',
    'Year 9A - Advanced Electronics', 'Year 9B - CAD Design', 'Year 9C - Product Design',
    'Year 10A - Engineering', 'Year 10B - Advanced Materials', 'Year 10C - Systems Design'
  ];

  const handleCreateSlot = () => {
    if (!slotForm.day || !slotForm.timeSlot || !slotForm.class || !slotForm.teacher || !slotForm.room) return;

    const newSlot = {
      class: slotForm.class,
      teacher: slotForm.teacher,
      room: slotForm.room,
      id: editingSlot ? editingSlot.id : Date.now()
    };

    setTimetableData(prev => ({
      ...prev,
      [slotForm.day]: {
        ...prev[slotForm.day],
        [slotForm.timeSlot]: newSlot
      }
    }));

    resetForm();
  };

  const handleEditSlot = (day, timeSlot, slot) => {
    setEditingSlot(slot);
    setSlotForm({
      day,
      timeSlot,
      class: slot.class,
      teacher: slot.teacher,
      room: slot.room
    });
    setShowCreateModal(true);
  };

  const handleDeleteSlot = (day, timeSlot) => {
    setTimetableData(prev => {
      const newData = { ...prev };
      delete newData[day][timeSlot];
      return newData;
    });
  };

  const resetForm = () => {
    setSlotForm({
      day: '',
      timeSlot: '',
      class: '',
      teacher: '',
      room: ''
    });
    setShowCreateModal(false);
    setEditingSlot(null);
  };

  const getFilteredTimetable = () => {
    if (selectedRoom === 'all') return timetableData;
    
    const filtered = {};
    Object.keys(timetableData).forEach(day => {
      filtered[day] = {};
      Object.keys(timetableData[day]).forEach(timeSlot => {
        if (timetableData[day][timeSlot].room === selectedRoom) {
          filtered[day][timeSlot] = timetableData[day][timeSlot];
        }
      });
    });
    return filtered;
  };

  const getRoomColor = (room) => {
    const colors = {
      'DT1': 'bg-blue-100 text-blue-800',
      'DT2': 'bg-green-100 text-green-800',
      'DT3': 'bg-purple-100 text-purple-800',
      'DT4': 'bg-orange-100 text-orange-800',
      'Workshop A': 'bg-red-100 text-red-800',
      'Workshop B': 'bg-indigo-100 text-indigo-800',
      'CAD Suite': 'bg-pink-100 text-pink-800'
    };
    return colors[room] || 'bg-gray-100 text-gray-800';
  };

  const filteredTimetable = getFilteredTimetable();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1">Manage class schedules and room allocations</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiPlus} />
          <span>Add Class</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024-W4">Week 4 (22-26 Jan 2024)</option>
              <option value="2024-W5">Week 5 (29 Jan - 2 Feb 2024)</option>
              <option value="2024-W6">Week 6 (5-9 Feb 2024)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Room</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Rooms</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiSave} />
              <span>Export Timetable</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900 sticky left-0 bg-gray-50">Time</th>
                {days.map(day => (
                  <th key={day} className="text-center py-4 px-4 font-medium text-gray-900 min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeSlot} className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium text-gray-900 bg-gray-50 sticky left-0">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="text-gray-400" />
                      <span>{timeSlot}</span>
                    </div>
                  </td>
                  {days.map((day, dayIndex) => {
                    const slot = filteredTimetable[day]?.[timeSlot];
                    return (
                      <td key={day} className="py-4 px-4 text-center relative">
                        {slot ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => handleEditSlot(day, timeSlot, slot)}
                          >
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {slot.class}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <SafeIcon icon={FiUsers} className="text-xs" />
                                <span>{slot.teacher}</span>
                              </div>
                              <div className="flex items-center justify-center space-x-1">
                                <SafeIcon icon={FiMapPin} className="text-xs" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomColor(slot.room)}`}>
                                  {slot.room}
                                </span>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSlot(day, timeSlot, slot);
                                }}
                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <SafeIcon icon={FiEdit3} className="text-xs" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(day, timeSlot);
                                }}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                <SafeIcon icon={FiTrash2} className="text-xs" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSlotForm(prev => ({ ...prev, day, timeSlot }));
                              setShowCreateModal(true);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-gray-400 text-sm">
                              <SafeIcon icon={FiPlus} className="mx-auto mb-1" />
                              <span>Add Class</span>
                            </div>
                          </motion.div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Utilization</h3>
          <div className="space-y-3">
            {rooms.slice(0, 4).map(room => {
              const totalSlots = days.length * timeSlots.length;
              const usedSlots = Object.values(timetableData).reduce((acc, dayData) => {
                return acc + Object.values(dayData).filter(slot => slot.room === room).length;
              }, 0);
              const utilization = Math.round((usedSlots / totalSlots) * 100);
              
              return (
                <div key={room} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{room}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{utilization}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Workload</h3>
          <div className="space-y-3">
            {teachers.slice(0, 4).map(teacher => {
              const classCount = Object.values(timetableData).reduce((acc, dayData) => {
                return acc + Object.values(dayData).filter(slot => slot.teacher === teacher).length;
              }, 0);
              
              return (
                <div key={teacher} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{teacher}</span>
                  <span className="text-sm text-gray-600">{classCount} classes</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Classes:</span>
              <span className="text-sm font-medium text-gray-900">
                {Object.values(timetableData).reduce((acc, dayData) => acc + Object.keys(dayData).length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rooms in Use:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Set(Object.values(timetableData).flatMap(dayData => Object.values(dayData).map(slot => slot.room))).size}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Teachers:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Set(Object.values(timetableData).flatMap(dayData => Object.values(dayData).map(slot => slot.teacher))).size}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create/Edit Slot Modal */}
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
                  {editingSlot ? 'Edit Class Slot' : 'Add Class Slot'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <select
                    value={slotForm.timeSlot}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={slotForm.class}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <select
                    value={slotForm.teacher}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, teacher: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher} value={teacher}>{teacher}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <select
                    value={slotForm.room}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
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
                  onClick={handleCreateSlot}
                  disabled={!slotForm.day || !slotForm.timeSlot || !slotForm.class || !slotForm.teacher || !slotForm.room}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiSave} />
                  <span>{editingSlot ? 'Update' : 'Create'} Slot</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}