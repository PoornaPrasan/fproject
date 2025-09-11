import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  //AlertTriangle,
  //User,
  Truck,
  Camera,
  //Upload,
  Route,
  //Filter,
  Search
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  complaintId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: Date;
  equipment: string[];
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  estimatedDuration: number; // in hours
  createdAt: Date;
  completedAt?: Date;
  photos?: string[];
  notes?: string;
}

const TaskManagement: React.FC = () => {
  const { complaints } = useComplaints();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState('');

  // Generate mock tasks from complaints
  const generateTasks = (): Task[] => {
    const assignedComplaints = complaints.filter(c => c.assignedTo === user?.id);
    return assignedComplaints.map((complaint, index) => ({
      id: `task-${complaint.id}`,
      complaintId: complaint.id,
      title: `Resolve: ${complaint.title}`,
      description: complaint.description,
      status: complaint.status === 'resolved' ? 'completed' : 
              complaint.status === 'in_progress' ? 'in_progress' : 'pending',
      priority: complaint.priority,
      assignedTo: user?.id || '',
      dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
      equipment: getRequiredEquipment(complaint.category),
      location: {
        address: complaint.location.address,
        latitude: complaint.location.latitude,
        longitude: complaint.location.longitude
      },
      estimatedDuration: getEstimatedDuration(complaint.category),
      createdAt: complaint.createdAt,
      completedAt: complaint.status === 'resolved' ? complaint.resolvedAt : undefined,
      photos: [],
      notes: complaint.updates.length > 0 ? complaint.updates[complaint.updates.length - 1].message : undefined
    }));
  };

  const getRequiredEquipment = (category: string): string[] => {
    const equipmentMap: Record<string, string[]> = {
      electricity: ['Multimeter', 'Wire strippers', 'Safety gear', 'Ladder'],
      water: ['Pipe wrench', 'Leak detector', 'Replacement pipes', 'Sealant'],
      roads: ['Asphalt mix', 'Compactor', 'Safety cones', 'Measuring tools'],
      sanitation: ['Cleaning supplies', 'Waste bags', 'Protective gear', 'Truck'],
      street_lights: ['Replacement bulbs', 'Ladder', 'Electrical tools', 'Safety gear'],
      drainage: ['Drain snake', 'High-pressure hose', 'Protective gear', 'Pump']
    };
    return equipmentMap[category] || ['Basic tools', 'Safety gear'];
  };

  const getEstimatedDuration = (category: string): number => {
    const durationMap: Record<string, number> = {
      electricity: 3,
      water: 4,
      roads: 8,
      sanitation: 2,
      street_lights: 1,
      drainage: 3
    };
    return durationMap[category] || 2;
  };

  const tasks = generateTasks();
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-600 bg-gray-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleTaskUpdate = (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    // In a real app, this would update the task status
    console.log(`Updating task ${taskId} to ${status}`);
    setSelectedTask(null);
    setTaskNotes('');
  };

  const todaysTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-600 mt-2">Manage field tasks and assignments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
        </div>
        <div className="p-6">
          {todaysTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.location.address}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{task.estimatedDuration}h estimated</span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'in_progress' | 'completed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {task.location.address}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {task.estimatedDuration}h estimated
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Equipment Required */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Required Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.equipment.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Notes */}
                {task.notes && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{task.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Wrench className="w-4 h-4 mr-1" />
                      Update Task
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <Route className="w-4 h-4 mr-1" />
                      Get Directions
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Update Form */}
                {selectedTask === task.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Update Task Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <button
                        onClick={() => handleTaskUpdate(task.id, 'pending')}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          task.status === 'pending'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Clock className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm font-medium">Pending</div>
                      </button>
                      <button
                        onClick={() => handleTaskUpdate(task.id, 'in_progress')}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          task.status === 'in_progress'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Truck className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm font-medium">In Progress</div>
                      </button>
                      <button
                        onClick={() => handleTaskUpdate(task.id, 'completed')}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          task.status === 'completed'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm font-medium">Completed</div>
                      </button>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Task Notes</label>
                      <textarea
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        placeholder="Add notes about the task progress..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
                        <Camera className="w-4 h-4 mr-1" />
                        Add Photos
                      </button>
                      <button
                        onClick={() => setSelectedTask(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "No tasks match your current filters."
                : "No tasks have been assigned to you yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;