import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCalendar, FiSettings, FiSave, FiPlus, FiTrash2, FiEdit3, FiX, FiRefreshCw, FiCheckCircle, FiAlertTriangle } = FiIcons;

export default function TimetableSettings() {
  const [activeTab, setActiveTab] = useState('timeSlots');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Time Slots Configuration
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, name: 'Period 1', startTime: '09:00', endTime: '10:00', type: 'lesson', color: 'blue' },
    { id: 2, name: 'Period 2', startTime: '10:00', endTime: '11:00', type: 'lesson', color: 'blue' },
    { id: 3, name: 'Morning Break', startTime: '11:00', endTime: '11:15', type: 'break', color: 'green' },
    { id: 4, name: 'Period 3', startTime: '11:15', endTime: '12:15', type: 'lesson', color: 'blue' },
    { id: 5, name: 'Period 4', startTime: '12:15', endTime: '13:15', type: 'lesson', color: 'blue' },
    { id: 6, name: 'Lunch Break', startTime: '13:15', endTime: '14:00', type: 'lunch', color: 'orange' },
    { id: 7, name: 'Period 5', startTime: '14:00', endTime: '15:00', type: 'lesson', color: 'blue' },
    { id: 8, name: 'Period 6', startTime: '15:00', endTime: '16:00', type: 'lesson', color: 'blue' }
  ]);

  // Academic Calendar
  const [academicCalendar, setAcademicCalendar] = useState({
    academicYear: '2024-2025',
    termDates: [
      { term: 'Autumn Term', startDate: '2024-09-02', endDate: '2024-12-20' },
      { term: 'Spring Term', startDate: '2025-01-06', endDate: '2025-04-04' },
      { term: 'Summer Term', startDate: '2025-04-22', endDate: '2025-07-18' }
    ],
    holidays: [
      { name: 'Half Term (Autumn)', startDate: '2024-10-28', endDate: '2024-11-01' },
      { name: 'Christmas Holiday', startDate: '2024-12-21', endDate: '2025-01-05' },
      { name: 'Half Term (Spring)', startDate: '2025-02-17', endDate: '2025-02-21' },
      { name: 'Easter Holiday', startDate: '2025-04-05', endDate: '2025-04-21' },
      { name: 'Half Term (Summer)', startDate: '2025-05-26', endDate: '2025-05-30' }
    ]
  });

  // School Schedule Settings
  const [scheduleSettings, setScheduleSettings] = useState({
    schoolDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxPeriodsPerDay: 8,
    defaultPeriodLength: 60,
    breakLength: 15,
    lunchLength: 45,
    allowDoubleBooking: false,
    autoConflictDetection: true,
    requireTeacherApproval: true,
    enableRoomBooking: true,
    timeFormat: '24h',
    weekStartsOn: 'Monday'
  });

  // Room Settings
  const [roomSettings, setRoomSettings] = useState({
    rooms: [
      { id: 1, name: 'DT1', capacity: 30, type: 'Workshop', equipment: ['3D Printer', 'Laser Cutter'], available: true },
      { id: 2, name: 'DT2', capacity: 25, type: 'Electronics Lab', equipment: ['Oscilloscopes', 'Breadboards'], available: true },
      { id: 3, name: 'DT3', capacity: 28, type: 'CAD Suite', equipment: ['Computers', 'Design Software'], available: true },
      { id: 4, name: 'Workshop A', capacity: 20, type: 'Manufacturing', equipment: ['CNC Machine', 'Drill Press'], available: true },
      { id: 5, name: 'Workshop B', capacity: 18, type: 'Textiles', equipment: ['Sewing Machines', 'Overlockers'], available: false }
    ],
    autoAssignRooms: true,
    prioritizeByCapacity: true,
    allowRoomSharing: false
  });

  // Form states for modals
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [timeSlotForm, setTimeSlotForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    type: 'lesson',
    color: 'blue'
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    capacity: 30,
    type: 'Workshop',
    equipment: [],
    available: true
  });

  const tabs = [
    { id: 'timeSlots', label: 'Time Slots', icon: FiClock },
    { id: 'calendar', label: 'Academic Calendar', icon: FiCalendar },
    { id: 'schedule', label: 'Schedule Settings', icon: FiSettings },
    { id: 'rooms', label: 'Room Management', icon: FiSettings }
  ];

  const periodTypes = [
    { value: 'lesson', label: 'Lesson', color: 'blue' },
    { value: 'break', label: 'Break', color: 'green' },
    { value: 'lunch', label: 'Lunch', color: 'orange' },
    { value: 'assembly', label: 'Assembly', color: 'purple' },
    { value: 'tutorial', label: 'Tutorial', color: 'indigo' }
  ];

  const roomTypes = ['Workshop', 'Laboratory', 'Classroom', 'CAD Suite', 'Manufacturing', 'Electronics Lab', 'Textiles'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTimeSlot = () => {
    if (!timeSlotForm.name || !timeSlotForm.startTime || !timeSlotForm.endTime) return;

    const newTimeSlot = {
      id: editingItem ? editingItem.id : Date.now(),
      ...timeSlotForm
    };

    if (editingItem) {
      setTimeSlots(prev => prev.map(slot => slot.id === editingItem.id ? newTimeSlot : slot));
    } else {
      setTimeSlots(prev => [...prev, newTimeSlot]);
    }

    resetTimeSlotForm();
  };

  const resetTimeSlotForm = () => {
    setTimeSlotForm({ name: '', startTime: '', endTime: '', type: 'lesson', color: 'blue' });
    setShowTimeSlotModal(false);
    setEditingItem(null);
  };

  const handleEditTimeSlot = (slot) => {
    setEditingItem(slot);
    setTimeSlotForm(slot);
    setShowTimeSlotModal(true);
  };

  const handleDeleteTimeSlot = (id) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const handleAddHoliday = () => {
    if (!holidayForm.name || !holidayForm.startDate || !holidayForm.endDate) return;

    const newHoliday = {
      id: editingItem ? editingItem.id : Date.now(),
      ...holidayForm
    };

    if (editingItem) {
      setAcademicCalendar(prev => ({
        ...prev,
        holidays: prev.holidays.map(holiday => holiday.id === editingItem.id ? newHoliday : holiday)
      }));
    } else {
      setAcademicCalendar(prev => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday]
      }));
    }

    resetHolidayForm();
  };

  const resetHolidayForm = () => {
    setHolidayForm({ name: '', startDate: '', endDate: '' });
    setShowHolidayModal(false);
    setEditingItem(null);
  };

  const handleAddRoom = () => {
    if (!roomForm.name) return;

    const newRoom = {
      id: editingItem ? editingItem.id : Date.now(),
      ...roomForm
    };

    if (editingItem) {
      setRoomSettings(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => room.id === editingItem.id ? newRoom : room)
      }));
    } else {
      setRoomSettings(prev => ({
        ...prev,
        rooms: [...prev.rooms, newRoom]
      }));
    }

    resetRoomForm();
  };

  const resetRoomForm = () => {
    setRoomForm({ name: '', capacity: 30, type: 'Workshop', equipment: [], available: true });
    setShowRoomModal(false);
    setEditingItem(null);
  };

  const getTypeColor = (type) => {
    const typeConfig = periodTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Settings</h1>
          <p className="text-gray-600 mt-1">Configure time slots, academic calendar, and scheduling preferences</p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? (
            <SafeIcon icon={FiRefreshCw} className="animate-spin" />
          ) : (
            <SafeIcon icon={FiSave} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </motion.button>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            saveStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <SafeIcon icon={saveStatus === 'success' ? FiCheckCircle : FiAlertTriangle} />
          <span>
            {saveStatus === 'success' ? 'Settings saved successfully!' : 'Error saving settings. Please try again.'}
          </span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Time Slots Tab */}
          {activeTab === 'timeSlots' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Daily Time Slots</h2>
                <motion.button
                  onClick={() => setShowTimeSlotModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiPlus} />
                  <span>Add Time Slot</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot, index) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{slot.name}</h3>
                        <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <motion.button
                          onClick={() => handleEditTimeSlot(slot)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <SafeIcon icon={FiEdit3} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <SafeIcon icon={FiTrash2} />
                        </motion.button>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getTypeColor(slot.type)}-100 text-${getTypeColor(slot.type)}-800 capitalize`}>
                      {slot.type}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Academic Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Term Dates */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Term Dates</h2>
                  </div>
                  <div className="space-y-4">
                    {academicCalendar.termDates.map((term, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{term.term}</h3>
                        <p className="text-sm text-gray-600">{term.startDate} to {term.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School Holidays */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">School Holidays</h2>
                    <motion.button
                      onClick={() => setShowHolidayModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SafeIcon icon={FiPlus} />
                      <span>Add Holiday</span>
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {academicCalendar.holidays.map((holiday, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                            <p className="text-sm text-gray-600">{holiday.startDate} to {holiday.endDate}</p>
                          </div>
                          <button className="text-gray-400 hover:text-red-600">
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Schedule Settings Tab */}
          {activeTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">Schedule Configuration</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Periods Per Day</label>
                    <input
                      type="number"
                      value={scheduleSettings.maxPeriodsPerDay}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, maxPeriodsPerDay: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Period Length (minutes)</label>
                    <input
                      type="number"
                      value={scheduleSettings.defaultPeriodLength}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, defaultPeriodLength: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="30"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Break Length (minutes)</label>
                    <input
                      type="number"
                      value={scheduleSettings.breakLength}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, breakLength: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="10"
                      max="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lunch Length (minutes)</label>
                    <input
                      type="number"
                      value={scheduleSettings.lunchLength}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, lunchLength: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="30"
                      max="90"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                    <select
                      value={scheduleSettings.timeFormat}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="24h">24 Hour (09:00)</option>
                      <option value="12h">12 Hour (9:00 AM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week Starts On</label>
                    <select
                      value={scheduleSettings.weekStartsOn}
                      onChange={(e) => setScheduleSettings(prev => ({ ...prev, weekStartsOn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Schedule Options</label>
                    
                    {[
                      { key: 'allowDoubleBooking', label: 'Allow Double Booking' },
                      { key: 'autoConflictDetection', label: 'Auto Conflict Detection' },
                      { key: 'requireTeacherApproval', label: 'Require Teacher Approval' },
                      { key: 'enableRoomBooking', label: 'Enable Room Booking' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{option.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scheduleSettings[option.key]}
                            onChange={(e) => setScheduleSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Room Management Tab */}
          {activeTab === 'rooms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
                <motion.button
                  onClick={() => setShowRoomModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiPlus} />
                  <span>Add Room</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomSettings.rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-600">{room.type}</p>
                        <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.available ? 'Available' : 'Unavailable'}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <SafeIcon icon={FiEdit3} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    </div>
                    
                    {room.equipment.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Equipment:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {item}
                            </span>
                          ))}
                          {room.equipment.length > 2 && (
                            <span className="text-xs text-gray-500">+{room.equipment.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Time Slot Modal */}
      <AnimatePresence>
        {showTimeSlotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetTimeSlotForm}
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
                  {editingItem ? 'Edit Time Slot' : 'Add Time Slot'}
                </h2>
                <button
                  onClick={resetTimeSlotForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={timeSlotForm.name}
                    onChange={(e) => setTimeSlotForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Period 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={timeSlotForm.startTime}
                      onChange={(e) => setTimeSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={timeSlotForm.endTime}
                      onChange={(e) => setTimeSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={timeSlotForm.type}
                    onChange={(e) => setTimeSlotForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {periodTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetTimeSlotForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddTimeSlot}
                  disabled={!timeSlotForm.name || !timeSlotForm.startTime || !timeSlotForm.endTime}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingItem ? 'Update' : 'Add'} Time Slot
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday Modal */}
      <AnimatePresence>
        {showHolidayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetHolidayForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add School Holiday</h2>
                <button
                  onClick={resetHolidayForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                  <input
                    type="text"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Spring Break"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={holidayForm.startDate}
                      onChange={(e) => setHolidayForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={holidayForm.endDate}
                      onChange={(e) => setHolidayForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={resetHolidayForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddHoliday}
                  disabled={!holidayForm.name || !holidayForm.startDate || !holidayForm.endDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Holiday
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}