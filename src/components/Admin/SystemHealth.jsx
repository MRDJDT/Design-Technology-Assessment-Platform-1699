import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiServer, FiDatabase, FiCpu, FiHardDrive, FiActivity, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiDownload } = FiIcons;

export default function SystemHealth() {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: { usage: 23, cores: 8, temperature: 42 },
    memory: { usage: 45, total: 32, used: 14.4 },
    storage: { usage: 67.3, total: 500, used: 336.5 },
    network: { inbound: 125.6, outbound: 89.3 },
    uptime: { days: 45, hours: 12, minutes: 34 }
  });

  const [services, setServices] = useState([
    { name: 'Web Server', status: 'running', uptime: '45 days', cpu: 12, memory: 256 },
    { name: 'Database', status: 'running', uptime: '45 days', cpu: 8, memory: 512 },
    { name: 'AI Service', status: 'running', uptime: '32 days', cpu: 25, memory: 1024 },
    { name: 'File Storage', status: 'running', uptime: '45 days', cpu: 3, memory: 128 },
    { name: 'Authentication', status: 'running', uptime: '45 days', cpu: 5, memory: 64 },
    { name: 'Backup Service', status: 'warning', uptime: '2 hours', cpu: 15, memory: 256 }
  ]);

  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2024-01-22 14:30:15', level: 'INFO', service: 'System', message: 'Daily backup completed successfully' },
    { id: 2, timestamp: '2024-01-22 14:25:32', level: 'WARNING', service: 'Storage', message: 'Storage usage approaching 70% threshold' },
    { id: 3, timestamp: '2024-01-22 14:20:45', level: 'INFO', service: 'AI Service', message: 'Model updated to version 2.1.3' },
    { id: 4, timestamp: '2024-01-22 14:15:12', level: 'ERROR', service: 'Backup', message: 'Backup service restarted due to timeout' },
    { id: 5, timestamp: '2024-01-22 14:10:08', level: 'INFO', service: 'Database', message: 'Connection pool optimized' }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const cpuUsageData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    },
    yAxis: { type: 'value', max: 100 },
    series: [{
      name: 'CPU Usage %',
      data: [15, 23, 35, 28, 42, 23],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#3B82F6' },
      areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
    }]
  };

  const memoryUsageData = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    },
    yAxis: { type: 'value', max: 100 },
    series: [{
      name: 'Memory Usage %',
      data: [38, 42, 45, 48, 52, 45],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#10B981' },
      areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }
    }]
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update metrics with random variations
    setSystemMetrics(prev => ({
      ...prev,
      cpu: { ...prev.cpu, usage: Math.floor(Math.random() * 30) + 15 },
      memory: { ...prev.memory, usage: Math.floor(Math.random() * 20) + 40 }
    }));
    
    setIsRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 bg-blue-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health Monitor</h1>
          <p className="text-gray-600 mt-1">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </motion.button>
          <motion.button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiDownload} />
            <span>Export Report</span>
          </motion.button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiCpu} className="text-2xl text-blue-600" />
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              systemMetrics.cpu.usage < 50 ? 'bg-green-100 text-green-800' :
              systemMetrics.cpu.usage < 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {systemMetrics.cpu.usage}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
          <p className="text-sm text-gray-600">{systemMetrics.cpu.cores} cores • {systemMetrics.cpu.temperature}°C</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${systemMetrics.cpu.usage}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiServer} className="text-2xl text-green-600" />
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              systemMetrics.memory.usage < 60 ? 'bg-green-100 text-green-800' :
              systemMetrics.memory.usage < 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {systemMetrics.memory.usage}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
          <p className="text-sm text-gray-600">{systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${systemMetrics.memory.usage}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiHardDrive} className="text-2xl text-orange-600" />
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              systemMetrics.storage.usage < 60 ? 'bg-green-100 text-green-800' :
              systemMetrics.storage.usage < 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {systemMetrics.storage.usage}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
          <p className="text-sm text-gray-600">{systemMetrics.storage.used}GB / {systemMetrics.storage.total}GB</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${systemMetrics.storage.usage}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiActivity} className="text-2xl text-purple-600" />
            <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">System Uptime</h3>
          <p className="text-sm text-gray-600">
            {systemMetrics.uptime.days}d {systemMetrics.uptime.hours}h {systemMetrics.uptime.minutes}m
          </p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </motion.div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Usage (24h)</h3>
          <ReactECharts option={cpuUsageData} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage (24h)</h3>
          <ReactECharts option={memoryUsageData} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Services Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Uptime</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">CPU %</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Memory</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{service.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{service.uptime}</td>
                  <td className="py-3 px-4 text-gray-600">{service.cpu}%</td>
                  <td className="py-3 px-4 text-gray-600">{service.memory}MB</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Restart</button>
                      <button className="text-green-600 hover:text-green-700 text-sm">Logs</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Logs</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Logs
          </button>
        </div>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                {log.level}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{log.service}</p>
                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}