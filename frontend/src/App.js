import React, { useState, useEffect } from 'react';
import {
  FaTachometerAlt,
  FaList,
  FaChartBar,
  FaUsers,
  FaPlus,
  FaPlay,
  FaDesktop,
  FaUser,
  FaCog,
  FaSearch,
  FaFilter,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaPause,
  FaUserCheck,
  FaEnvelope,
  FaBuilding,
  FaBars,
  FaSignOutAlt,
  FaArrowUp,
  FaArrowDown,
  FaVial,
  FaCheck
} from 'react-icons/fa';
import './App.css';

// const socket = io('http://localhost:5001'); // Disabled for static deployment

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '', from: '', assignedTo: '', priority: '' });
  const [isSharing, setIsSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: '', department: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);

  useEffect(() => {
    // Initialize with demo data for static deployment
    initializeDemoData();
  }, []);

  const initializeDemoData = () => {
    // Demo tickets for static deployment
    const demoTickets = [
      {
        id: 1,
        subject: 'Login Issues with SAP System',
        description: 'Users unable to login to SAP system after recent update',
        from: 'john.doe@company.com',
        assignedTo: 1,
        assignedName: 'Alice Johnson',
        priority: 'High',
        status: 'open',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        subject: 'Email Server Down',
        description: 'Email server is not responding, users cannot send/receive emails',
        from: 'jane.smith@company.com',
        assignedTo: 2,
        assignedName: 'Bob Wilson',
        priority: 'Critical',
        status: 'in-progress',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        subject: 'Printer Not Working',
        description: 'Office printer on 3rd floor is not printing documents',
        from: 'mike.brown@company.com',
        assignedTo: 1,
        assignedName: 'Alice Johnson',
        priority: 'Medium',
        status: 'testing',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    const demoUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'IT Support', department: 'IT' },
      { id: 2, name: 'Bob Wilson', email: 'bob@company.com', role: 'SAP Support', department: 'IT' },
      { id: 3, name: 'Carol Davis', email: 'carol@company.com', role: 'Admin', department: 'IT' }
    ];
    
    setTickets(demoTickets);
    setUsers(demoUsers);
  };

  const updateTicket = (id, updates) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === id ? { ...ticket, ...updates } : ticket
      )
    );
    if (updates.assignedTo) {
      showNotification('Ticket assigned successfully!', 'success');
    } else if (updates.status) {
      showNotification('Ticket status updated successfully!', 'success');
    }
  };

  const createTicket = (e) => {
    e.preventDefault();
    const newTicket = {
      id: Math.max(...tickets.map(t => t.id), 0) + 1,
      ...formData,
      assignedName: users.find(u => u.id === parseInt(formData.assignedTo))?.name || 'Unassigned',
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setTickets(prev => [...prev, newTicket]);
    setFormData({ subject: '', description: '', from: '', assignedTo: '', priority: '' });
    setShowForm(false);
    showNotification('Ticket created successfully!', 'success');
  };

  const createUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userFormData
    };
    setUsers(prev => [...prev, newUser]);
    setUserFormData({ name: '', email: '', role: '', department: '' });
    setShowUserForm(false);
    showNotification('User created successfully!', 'success');
  };

  const startScreenShare = async (ticketId) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      setLocalStream(stream);
      setIsSharing(true);

      // Screen sharing demo - would need backend for full functionality
      showNotification('Screen sharing started (demo mode)', 'success');
      console.log('Screen sharing would be initiated for ticket:', ticketId);
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const handleOffer = async (data) => {
    // WebRTC functionality disabled for static deployment
    console.log('WebRTC offer handling disabled in demo mode:', data);
  };

  const handleAnswer = (data) => {
    // Handle answer from support
  };

  const handleIceCandidate = (data) => {
    // Handle ICE candidates
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return <FaExclamationTriangle style={{color: '#DE350B'}} />;
      case 'high': return <FaExclamationTriangle style={{color: '#FF5630'}} />;
      case 'medium': return <FaExclamationTriangle style={{color: '#FFAB00'}} />;
      case 'low': return <FaExclamationTriangle style={{color: '#36B37E'}} />;
      default: return <FaExclamationTriangle style={{color: '#6B778C'}} />;
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.assignedName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `LUX-${ticket.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoteControlCommand = (command) => {
    console.log('Received remote control command:', command);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'Admin' && loginData.password === '#Admin123') {
      setIsAuthenticated(true);
      setLoginError('');
      showNotification('Login successful!', 'success');
    } else {
      setLoginError('Invalid username or password');
      showNotification('Invalid credentials', 'error');
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'tickets':
        return renderTickets();
      case 'users':
        return renderUsers();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const openTicketDetails = (ticket) => {
    setSelectedTicketDetails(ticket);
    setShowTicketDetails(true);
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setCurrentPage('tickets')}>
          <FaList className="stat-icon" />
          <div>
            <h3>{tickets.length}</h3>
            <p>Total Tickets</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setCurrentPage('tickets')}>
          <FaClock className="stat-icon" />
          <div>
            <h3>{tickets.filter(t => t.status === 'open').length}</h3>
            <p>Open Tickets</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setCurrentPage('tickets')}>
          <FaPlay className="stat-icon" />
          <div>
            <h3>{tickets.filter(t => t.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setCurrentPage('tickets')}>
          <FaVial className="stat-icon" />
          <div>
            <h3>{tickets.filter(t => t.status === 'testing').length}</h3>
            <p>Testing</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setCurrentPage('tickets')}>
          <FaCheckCircle className="stat-icon" />
          <div>
            <h3>{tickets.filter(t => t.status === 'done').length}</h3>
            <p>Done</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="tickets-page">
      <div className="page-header">
        <h2>Support Tickets</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> New Ticket
        </button>
      </div>
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="tickets-list">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="ticket-card" onClick={() => openTicketDetails(ticket)}>
            <div className="ticket-header">
              <span className="ticket-id">LUX-{ticket.id}</span>
              {getPriorityIcon(ticket.priority)}
            </div>
            <h3>{ticket.subject}</h3>
            <p>From: {ticket.from}</p>
            <p>Assigned to: {ticket.assignedName}</p>
            <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
              <select 
                value={ticket.assignedTo || ''}
                onChange={(e) => updateTicket(ticket.id, { assignedTo: e.target.value })}
                className="assignee-dropdown"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
              {ticket.status === 'open' && (
                <button onClick={() => updateTicket(ticket.id, { status: 'in-progress' })}>
                  <FaPlay /> Start Working
                </button>
              )}
              {ticket.status === 'in-progress' && (
                <button onClick={() => updateTicket(ticket.id, { status: 'testing' })}>
                  <FaVial /> Testing
                </button>
              )}
              {ticket.status === 'testing' && (
                <button onClick={() => updateTicket(ticket.id, { status: 'done' })}>
                  <FaCheck /> Done
                </button>
              )}
              <button onClick={() => startScreenShare(ticket.id)}>
                <FaDesktop /> Screen Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-page">
      <div className="page-header">
        <h2>Users</h2>
        <button className="btn-primary" onClick={() => setShowUserForm(true)}>
          <FaPlus /> Add User
        </button>
      </div>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <FaUser className="user-avatar" />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="user-role">{user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const calculateAnalytics = () => {
    const now = new Date();
    const completedTickets = tickets.filter(t => t.status === 'done');
    const avgResolutionTime = completedTickets.length > 0 
      ? completedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt);
          const completed = new Date(ticket.completedAt || now);
          return sum + (completed - created);
        }, 0) / completedTickets.length
      : 0;
    
    const priorityStats = {
      critical: tickets.filter(t => t.priority === 'Critical').length,
      high: tickets.filter(t => t.priority === 'High').length,
      medium: tickets.filter(t => t.priority === 'Medium').length,
      low: tickets.filter(t => t.priority === 'Low').length
    };
    
    const assigneeStats = users.map(user => ({
      name: user.name,
      assigned: tickets.filter(t => t.assignedTo === user.id).length,
      completed: tickets.filter(t => t.assignedTo === user.id && t.status === 'done').length
    }));
    
    return { avgResolutionTime, priorityStats, assigneeStats, completedTickets };
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const renderAnalytics = () => {
    const { avgResolutionTime, priorityStats, assigneeStats } = calculateAnalytics();
    
    return (
      <div className="analytics-page">
        <h2>Analytics Dashboard</h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Average Resolution Time</h3>
            <div className="metric-value">{formatTime(avgResolutionTime)}</div>
            <p>Time to resolve tickets</p>
          </div>
          
          <div className="analytics-card">
            <h3>Completion Rate</h3>
            <div className="metric-value">
              {tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'done').length / tickets.length) * 100) : 0}%
            </div>
            <p>Tickets completed</p>
          </div>
          
          <div className="analytics-card">
            <h3>Response Time</h3>
            <div className="metric-value">2.3h</div>
            <p>Average first response</p>
          </div>
          
          <div className="analytics-card">
            <h3>Customer Satisfaction</h3>
            <div className="metric-value">4.2/5</div>
            <p>Average rating</p>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Priority Distribution</h3>
          <div className="priority-chart">
            <div className="priority-bar">
              <span>Critical Priority</span>
              <div className="bar critical" style={{width: `${tickets.length > 0 ? (priorityStats.critical / tickets.length) * 100 : 0}%`}}></div>
              <span>{priorityStats.critical}</span>
            </div>
            <div className="priority-bar">
              <span>High Priority</span>
              <div className="bar high" style={{width: `${tickets.length > 0 ? (priorityStats.high / tickets.length) * 100 : 0}%`}}></div>
              <span>{priorityStats.high}</span>
            </div>
            <div className="priority-bar">
              <span>Medium Priority</span>
              <div className="bar medium" style={{width: `${tickets.length > 0 ? (priorityStats.medium / tickets.length) * 100 : 0}%`}}></div>
              <span>{priorityStats.medium}</span>
            </div>
            <div className="priority-bar">
              <span>Low Priority</span>
              <div className="bar low" style={{width: `${tickets.length > 0 ? (priorityStats.low / tickets.length) * 100 : 0}%`}}></div>
              <span>{priorityStats.low}</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Team Performance</h3>
          <div className="team-stats">
            {assigneeStats.map(stat => (
              <div key={stat.name} className="team-member">
                <div className="member-info">
                  <strong>{stat.name}</strong>
                  <span>Assigned: {stat.assigned} | Completed: {stat.completed}</span>
                </div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{width: `${stat.assigned > 0 ? (stat.completed / stat.assigned) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="percentage">
                  {stat.assigned > 0 ? Math.round((stat.completed / stat.assigned) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="activity-item">
                <div className="activity-info">
                  <strong>LUX-{ticket.id}</strong>
                  <span>{ticket.subject}</span>
                </div>
                <div className="activity-meta">
                  <span className={`status-dot ${ticket.status}`}></span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="settings-page">
      <h2>Settings</h2>
      <p>Settings panel coming soon...</p>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Lux Ticketing Tools</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <button type="submit">Login</button>
            {loginError && <p className="error">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <h1>Lux Ticketing Tools</h1>
        </div>
        <div className="nav-right">
          <FaUser className="user-icon" />
          <span>Admin</span>
          <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => {setCurrentPage('dashboard'); setSidebarOpen(false);}}
          >
            <FaTachometerAlt /> Dashboard
          </div>
          <div 
            className={`menu-item ${currentPage === 'tickets' ? 'active' : ''}`}
            onClick={() => {setCurrentPage('tickets'); setSidebarOpen(false);}}
          >
            <FaList /> Tickets
          </div>
          <div 
            className={`menu-item ${currentPage === 'users' ? 'active' : ''}`}
            onClick={() => {setCurrentPage('users'); setSidebarOpen(false);}}
          >
            <FaUsers /> Users
          </div>
          <div 
            className={`menu-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => {setCurrentPage('analytics'); setSidebarOpen(false);}}
          >
            <FaChartBar /> Analytics
          </div>
          <div 
            className={`menu-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => {setCurrentPage('settings'); setSidebarOpen(false);}}
          >
            <FaCog /> Settings
          </div>
        </div>
      </div>

      <main className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
        {renderPage()}
      </main>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Ticket</h3>
            <form onSubmit={createTicket}>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="From Email"
                value={formData.from}
                onChange={(e) => setFormData({...formData, from: e.target.value})}
                required
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                required
              >
                <option value="">Select Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                required
              >
                <option value="">Select Assignee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New User</h3>
            <form onSubmit={createUser}>
              <input
                type="text"
                placeholder="Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                required
              />
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                required
              >
                <option value="">Select Role</option>
                <option value="IT Support">IT Support</option>
                <option value="SAP Support">SAP Support</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={userFormData.department}
                onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowUserForm(false)}>Cancel</button>
                <button type="submit">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTicketDetails && selectedTicketDetails && (
        <div className="modal">
          <div className="modal-content ticket-details">
            <div className="modal-header">
              <h3>Ticket Details - LUX-{selectedTicketDetails.id}</h3>
              <button onClick={() => setShowTicketDetails(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="ticket-detail-content">
              <div className="detail-row">
                <strong>Subject:</strong> {selectedTicketDetails.subject}
              </div>
              <div className="detail-row">
                <strong>From:</strong> {selectedTicketDetails.from}
              </div>
              <div className="detail-row">
                <strong>Priority:</strong> 
                <span className={`priority-badge ${selectedTicketDetails.priority?.toLowerCase()}`}>
                  {selectedTicketDetails.priority}
                </span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span className={`status-badge ${selectedTicketDetails.status}`}>
                  {selectedTicketDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Assigned to:</strong> {selectedTicketDetails.assignedName || 'Unassigned'}
              </div>
              <div className="detail-row">
                <strong>Created:</strong> {new Date(selectedTicketDetails.createdAt).toLocaleString()}
              </div>
              <div className="detail-row description">
                <strong>Description:</strong>
                <p>{selectedTicketDetails.description}</p>
              </div>
            </div>
            <div className="modal-actions">
              {selectedTicketDetails.status === 'open' && (
                <button onClick={() => updateTicket(selectedTicketDetails.id, { status: 'in-progress' })}>
                  <FaPlay /> Start Working
                </button>
              )}
              {selectedTicketDetails.status === 'in-progress' && (
                <button onClick={() => updateTicket(selectedTicketDetails.id, { status: 'testing' })}>
                  <FaVial /> Move to Testing
                </button>
              )}
              {selectedTicketDetails.status === 'testing' && (
                <button onClick={() => updateTicket(selectedTicketDetails.id, { status: 'done' })}>
                  <FaCheck /> Mark as Done
                </button>
              )}
              <button onClick={() => startScreenShare(selectedTicketDetails.id)}>
                <FaDesktop /> Screen Share
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;