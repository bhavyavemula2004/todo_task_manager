import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import { 
  Home, BarChart2, PieChart, Box, Moon, Settings, 
  Search, Bell, Plus, Calendar, Edit2, Trash2, MoreVertical, FileText, Eye 
} from 'lucide-react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Accepted Tasks');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('In progress');
  const [createdBy, setCreatedBy] = useState('Maia');
  const [dueDate, setDueDate] = useState('');
  
  // Filter States
  const [selectedDate, setSelectedDate] = useState('2023-07-29');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask({
        title,
        priority,
        status,
        created_by: createdBy,
        due_date: dueDate ? formatDate(dueDate) : '28/04/2023'
      });
      setTitle('');
      setDueDate('');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'In progress' : 'Completed';
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">UI</div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active"><Home size={20} /></a>
          <a href="#" className="nav-item"><BarChart2 size={20} /></a>
          <a href="#" className="nav-item"><PieChart size={20} /></a>
          <a href="#" className="nav-item"><Box size={20} /></a>
          <a href="#" className="nav-item"><Moon size={20} /></a>
          <a href="#" className="nav-item"><Settings size={20} /></a>
        </nav>
      </aside>

      {/* Main View */}
      <main className="main-wrapper">
        {/* Top Header Controls */}
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search task..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="header-right">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/100?img=12" alt="User Avatar" />
            </div>
          </div>
        </header>

        {/* Title & Tabs */}
        <div className="content-header">
          <h1 className="page-title">My Tasks</h1>
          <div className="task-tabs">
            <button 
              className={`tab-btn ${activeTab === 'Assigned Tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('Assigned Tasks')}
            >
              Assigned Tasks
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Accepted Tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('Accepted Tasks')}
            >
              Accepted Tasks
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Review Tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('Review Tasks')}
            >
              Review Tasks
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="date-input-wrapper">
              <Calendar size={18} className="calendar-icon" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <select 
              className="status-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Choose Status</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button className="btn-filter">Filter</button>
          </div>

          <button className="btn-create-task" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create New Task
          </button>
        </div>

        {/* Data Table */}
        <div className="table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created by</th>
                <th>Date Assigned</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="task-title-cell">{task.title}</td>
                    <td>
                      <span className={`pill priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`pill status-${task.status.toLowerCase().replace(' ', '-')}`}
                        onClick={() => toggleStatus(task)}
                        style={{ cursor: 'pointer' }}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="created-by-cell">{task.created_by}</td>
                    <td className="date-cell">{task.date_assigned}</td>
                    <td className="date-cell">{task.due_date}</td>
                    <td className="actions-cell">
                      <button className="action-btn download"><FileText size={15} /></button>
                      <button className="action-btn edit"><Edit2 size={15} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(task.id)}>
                        <Trash2 size={15} />
                      </button>
                      <button className="action-btn more"><MoreVertical size={15} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">No tasks available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-wrapper">
            <div className="rows-per-page">
              <span>Rows per page:</span>
              <select defaultValue="10">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="page-info">1-50 of 100</div>
            <div className="pagination-arrows">
              <button className="arrow-btn">&lt;</button>
              <button className="arrow-btn">&gt;</button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Popup for Create Task */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="New test task title"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Created By</label>
                  <input 
                    type="text" 
                    value={createdBy} 
                    onChange={(e) => setCreatedBy(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;