const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
// const OpenAI = require('openai'); // Removed OpenAI dependency

const nodemailer = require('nodemailer');
const imaps = require('imap-simple');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for users and tickets (use database in production)
let users = [
  { id: 1, name: 'Sayantan Betal', email: 'sayantan.betal@luxcozi.com', role: 'SAP Support', department: 'IT' },
  { id: 2, name: 'Anay Biswas', email: 'anay.biswas@luxinnerwear.com', role: 'Tableau Support', department: 'IT' },
  { id: 3, name: 'Bijoy Ojha', email: 'bijoy.ojha@luxinnerwear.com', role: 'Apps Support', department: 'IT' },
  { id: 4, name: 'Animesh Mondal', email: 'animesh.mondal@luxinnerwear.com', role: 'Apps Support', department: 'IT' },
  { id: 5, name: 'Subrata Roy', email: 'subrata.roy@luxinnerwear.com', role: 'Admin', department: 'IT' }
];
let userIdCounter = 6;

let tickets = [
  {
    id: 1,
    subject: 'Cannot access SAP system',
    description: 'User unable to login to SAP ERP system',
    from: 'user@company.com',
    userName: 'user',
    userRequest: 'Cannot access SAP system',
    assignedTo: 1,
    assignedName: 'Sayantan Betal',
    priority: 'High',
    status: 'open',
    createdAt: new Date()
  },
  {
    id: 2,
    subject: 'Tableau dashboard not loading',
    description: 'Dashboard showing error when trying to load',
    from: 'admin@company.com',
    userName: 'admin',
    userRequest: 'Tableau dashboard not loading',
    assignedTo: 2,
    assignedName: 'Anay Biswas',
    priority: 'Medium',
    status: 'open',
    createdAt: new Date()
  }
];
let ticketIdCounter = 3;

// Email configuration
const emailConfig = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.IMAP_HOST,
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    },
    authTimeout: 15000,
    connTimeout: 15000
  }
};

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send notification emails to assignees
async function sendNotificationEmails(ticket, assigneeEmails) {
  console.log(`Attempting to send notification emails for ticket ${ticket.id} to:`, assigneeEmails);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured, skipping email notification');
    return;
  }

  const ccEmails = ['subrata.roy@luxinnerwear.com'];

  for (const email of assigneeEmails) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      cc: ccEmails.join(','),
      subject: `Ticket Assigned: LUX-${ticket.id} - ${ticket.subject}`,
      html: `
        <h2>Ticket Assignment Notification</h2>
        <p>A support ticket has been assigned to you:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Ticket ID:</td><td style="padding: 8px; border: 1px solid #ddd;">LUX-${ticket.id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subject:</td><td style="padding: 8px; border: 1px solid #ddd;">${ticket.subject}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Reporter:</td><td style="padding: 8px; border: 1px solid #ddd;">${ticket.from}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Priority:</td><td style="padding: 8px; border: 1px solid #ddd;">${ticket.priority}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ddd;">${ticket.status}</td></tr>
        </table>
        <h3>Description:</h3>
        <p>${ticket.description}</p>
        <p>Please address this issue promptly.</p>
        <hr>
        <p><small>This is an automated notification from Lux Ticketing System</small></p>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Notification email sent to ${email} for ticket LUX-${ticket.id}. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`✗ Error sending notification email to ${email}:`, error.message);
    }
  }

  // Also send a copy to the sender for confirmation
  const testMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `[COPY] Ticket Assigned: LUX-${ticket.id} - ${ticket.subject}`,
    html: `
      <h2>Ticket Assignment Confirmation</h2>
      <p>This is a copy of the assignment notification sent for ticket LUX-${ticket.id}.</p>
      <p><strong>Assigned to:</strong> ${assigneeEmails.join(', ')}</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Reporter:</strong> ${ticket.from}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
    `
  };

  try {
    const info = await transporter.sendMail(testMailOptions);
    console.log(`✓ Confirmation email sent for ticket LUX-${ticket.id}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('✗ Error sending confirmation email:', error.message);
  }
}

// Send acknowledgment email to user
async function sendAcknowledgmentEmail(ticket) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ticket.from,
    subject: `Ticket Acknowledgment: ${ticket.subject}`,
    text: `Your support request has been received and assigned.\n\nTicket ID: ${ticket.id}\nAssigned to: ${ticket.assignedName}\nPriority: ${ticket.priority}\n\nWe will get back to you soon.`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending acknowledgment email:', error);
  }
}

// Send welcome email with login credentials to new user
async function sendWelcomeEmail(user, password) {
  const loginLink = 'http://localhost:3000'; // Frontend URL
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to Lux Ticketing Tools - Your Account Details`,
    text: `Welcome ${user.name}!\n\nYour account has been created successfully.\n\nLogin Details:\nUsername: ${user.email}\nPassword: ${password}\n\nLogin Link: ${loginLink}\n\nPlease change your password after first login.\n\nBest regards,\nLux Support Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

// Generate random password
function generatePassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to process emails from Gmail
async function processEmails() {
  console.log('Checking for new emails...');
  try {
    const connection = await imaps.connect(emailConfig);
    console.log('Connected to Gmail IMAP');

    await connection.openBox('INBOX');
    console.log('Opened INBOX');

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false
    };

    let messages = [];
    try {
      console.log('Trying to search for all messages...');
      const allMessages = await connection.search(['ALL'], fetchOptions);
      console.log(`Found ${allMessages.length} total messages`);
      // Filter for unseen messages
      messages = allMessages.filter(msg => {
        const flags = msg.attributes.flags || [];
        const isSeen = flags.includes('\\Seen');
        console.log(`Message ${msg.attributes.uid} flags: ${flags.join(', ')}, isSeen: ${isSeen}`);
        return !isSeen;
      });
      console.log(`Filtered to ${messages.length} unseen messages`);
    } catch (searchError) {
      console.error('Error searching for emails:', searchError);
      messages = [];
    }

    for (let message of messages) {
      console.log(`Processing message UID: ${message.attributes.uid}`);

      const header = message.parts.filter(part => part.which === 'HEADER')[0].body;
      const text = message.parts.filter(part => part.which === 'TEXT')[0].body;

      const subject = header.subject ? header.subject[0] : 'No Subject';
      const fromHeader = header.from ? header.from[0] : 'unknown';
      console.log(`Raw from header: ${fromHeader}`);

      const emailMatch = fromHeader.match(/<([^>]+)>/);
      const from = emailMatch ? emailMatch[1] : fromHeader;
      console.log(`Extracted from email: ${from}`);

      // Check if sender is from allowed domains
      const allowedDomains = ['@luxinnerwear.com', '@luxcozi.com'];
      const isAllowed = allowedDomains.some(domain => from && from.toLowerCase().endsWith(domain));
      console.log(`Is allowed domain: ${isAllowed} (domains: ${allowedDomains.join(', ')})`);

      if (isAllowed) {
        console.log(`Creating ticket for allowed sender: ${from}`);
        const ticket = await createTicket({ subject, description: text, from });
        console.log(`Created ticket #${ticket.id} for ${from}`);
      } else {
        console.log(`Skipping email from ${from} - not from allowed domains`);
      }

      await connection.addFlags(message.attributes.uid, '\\Seen');
    }

    connection.end();
    console.log('Email check completed');
  } catch (error) {
    console.error('Error processing emails:', error.message);
  }
}

// Function to create ticket manually
async function createTicket(ticketData) {
  const assignment = assignTicket(ticketData.subject, ticketData.description);
  const assignedUser = users.find(u => u.id === assignment.userId) || users[0];

  const ticket = {
    id: ticketIdCounter++,
    subject: ticketData.subject,
    description: ticketData.description,
    from: ticketData.from,
    userName: ticketData.from.split('@')[0],
    userRequest: ticketData.subject,
    assignedTo: assignment.userId,
    assignedName: assignedUser.name,
    priority: assignment.priority,
    status: 'open',
    createdAt: new Date()
  };

  tickets.push(ticket);
  io.emit('new-ticket', ticket);

  // Send notification emails
  await sendNotificationEmails(ticket, [assignedUser.email]);
  await sendAcknowledgmentEmail(ticket);

  return ticket;
}

// Rule-based function to assign tickets
function assignTicket(subject, body) {
  const text = (subject + ' ' + body).toLowerCase();

  // Keywords for different support types
  const tableauKeywords = ['tableau', 'dashboard', 'visualization', 'report'];
  const sapKeywords = ['sap', 'abap', 'transaction', 'module', 'erp', 'hana', 'fiori', 'bw', 'mm', 'sd', 'fi', 'co'];
  const appKeywords = ['app', 'application', 'web', 'website', 'portal', 'system'];

  // Priority keywords
  const highPriorityKeywords = ['urgent', 'critical', 'emergency', 'down', 'broken', 'not working', 'cannot access', 'production issue'];
  const mediumPriorityKeywords = ['issue', 'problem', 'error', 'bug', 'slow', 'performance'];

  // Determine assignment
  let userId = 1; // Default to first user

  const tableauScore = tableauKeywords.filter(keyword => text.includes(keyword)).length;
  const sapScore = sapKeywords.filter(keyword => text.includes(keyword)).length;
  const appScore = appKeywords.filter(keyword => text.includes(keyword)).length;

  if (tableauScore > 0) {
    userId = users.find(u => u.role === 'Tableau Support')?.id || 2;
  } else if (sapScore > appScore) {
    userId = users.find(u => u.role === 'SAP Support')?.id || 1;
  } else if (appScore > 0) {
    userId = users.find(u => u.role === 'Apps Support')?.id || 3;
  }

  // Determine priority
  let priority = 'Low';
  if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
    priority = 'High';
  } else if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
    priority = 'Medium';
  }

  return { userId, priority };
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/check-email', async (req, res) => {
  console.log('Manual email check triggered');
  try {
    await processEmails();
    res.json({ status: 'Email check completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-email', async (req, res) => {
  console.log('Testing email sending...');
  const testMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Lux Ticketing Tools - Manual Email Test',
    html: `
      <h2>Email Test Successful</h2>
      <p>This is a manual test email to verify email functionality.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
    `
  };

  try {
    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', info.messageId);
    res.json({ status: 'Test email sent', messageId: info.messageId });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ error: 'Test email failed', details: error.message });
  }
});

app.post('/api/test-assignment-email', async (req, res) => {
  console.log('Testing assignment email...');
  const { ticketId, userId } = req.body;
  
  const ticket = tickets.find(t => t.id == ticketId);
  const user = users.find(u => u.id == userId);
  
  if (!ticket || !user) {
    return res.status(404).json({ error: 'Ticket or user not found' });
  }
  
  try {
    await sendNotificationEmails(ticket, [user.email]);
    res.json({ status: 'Assignment email sent', ticket: ticket.id, user: user.name });
  } catch (error) {
    console.error('Assignment email test failed:', error);
    res.status(500).json({ error: 'Assignment email failed', details: error.message });
  }
});

app.get('/api/tickets', (req, res) => {
  const ticketsWithUserDetails = tickets.map(ticket => {
    const assignedUser = users.find(u => u.id === ticket.assignedTo);
    return {
      ...ticket,
      assignedUserEmail: assignedUser ? assignedUser.email : null,
      assignedUserRole: assignedUser ? assignedUser.role : null
    };
  });
  res.json(ticketsWithUserDetails);
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { subject, description, from, assignedTo } = req.body;
    let ticket;
    
    if (assignedTo) {
      // Manual assignment
      const assignedUser = users.find(u => u.id == assignedTo);
      ticket = {
        id: ticketIdCounter++,
        subject,
        description,
        from,
        userName: from.split('@')[0],
        userRequest: subject,
        assignedTo: parseInt(assignedTo),
        assignedName: assignedUser ? assignedUser.name : 'Unknown',
        priority: 'Medium',
        status: 'open',
        createdAt: new Date()
      };
      tickets.push(ticket);
      io.emit('new-ticket', ticket);
    } else {
      // Auto assignment
      ticket = await createTicket({ subject, description, from });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Webhook endpoint for email forwarding services
app.post('/api/webhook/email', async (req, res) => {
  try {
    const { subject, text, from, to } = req.body;

    // Check if sender is from allowed domains
    const allowedDomains = ['@luxinnerwear.com', '@luxcozi.com'];
    const isAllowed = allowedDomains.some(domain => from && from.toLowerCase().endsWith(domain));

    if (isAllowed) {
      const ticket = await createTicket({
        subject: subject || 'No Subject',
        description: text || 'No Description',
        from: from || 'unknown@email.com'
      });
      console.log('Ticket created from email:', ticket.id);
      res.json({ success: true, ticketId: ticket.id });
    } else {
      res.json({ success: false, message: 'Email not from allowed domains' });
    }
  } catch (error) {
    console.error('Error processing email webhook:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// User management routes
app.get('/api/users', (req, res) => {
  // Don't return passwords in the response
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const password = generatePassword();
    const user = {
      id: userIdCounter++,
      name,
      email,
      role,
      department,
      password, // Store password (in production, hash it)
      createdAt: new Date()
    };
    users.push(user);

    // Send welcome email with credentials
    await sendWelcomeEmail(user, password);

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, department } = req.body;
  const user = users.find(u => u.id == id);
  if (user) {
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;
  const ticket = tickets.find(t => t.id == id);
  
  if (ticket) {
    console.log(`Updating ticket ${id}:`, { status, assignedTo, currentAssignedTo: ticket.assignedTo });
    
    // Update status if provided
    if (status) {
      ticket.status = status;
      console.log(`Ticket ${id} status updated to: ${status}`);
    }
    
    // Handle assignment change
    if (assignedTo && assignedTo != ticket.assignedTo) {
      const oldAssignedTo = ticket.assignedTo;
      ticket.assignedTo = parseInt(assignedTo);
      const assignedUser = users.find(u => u.id == assignedTo);
      ticket.assignedName = assignedUser ? assignedUser.name : 'Unknown';

      console.log(`Ticket ${id} being reassigned from ${oldAssignedTo} to ${assignedUser ? assignedUser.name : 'Unknown'} (ID: ${assignedTo})`);
      
      // Send notification email to new assignee
      if (assignedUser && assignedUser.email) {
        console.log(`Sending assignment email to: ${assignedUser.email}`);
        try {
          await sendNotificationEmails(ticket, [assignedUser.email]);
          console.log(`✓ Assignment notification sent for ticket ${id}`);
        } catch (error) {
          console.error(`✗ Failed to send assignment notification for ticket ${id}:`, error);
        }
      } else {
        console.log(`No email address found for user ID ${assignedTo}`);
      }
    }
    
    res.json(ticket);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Socket.io for screen sharing
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-support', (ticketId) => {
    socket.join(`support-${ticketId}`);
  });

  socket.on('offer', (data) => {
    socket.to(`support-${data.ticketId}`).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(`support-${data.ticketId}`).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(`support-${data.ticketId}`).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use((req, res, next) => {
  // Allow connections to your API and devtools probe
  res.setHeader('Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' data:; connect-src 'self' http://localhost:5001; img-src 'self' data:; script-src 'self' 'unsafe-inline'");
  next();
});

// Test email connection and send test email
console.log('Starting email processing...');
console.log('Testing email configuration...');
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Send a test email on startup
const testMailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to self for testing
  subject: 'Lux Ticketing Tools - Email Test',
  text: 'This is a test email to verify email configuration is working.'
};

transporter.sendMail(testMailOptions, (error, info) => {
  if (error) {
    console.error('Test email failed:', error);
  } else {
    console.log('Test email sent successfully:', info.messageId);
  }
});

processEmails();

// Process emails every 2 minutes
console.log('Setting up email check interval (every 2 minutes)');
setInterval(() => {
  console.log('Running scheduled email check...');
  processEmails();
}, 2 * 60 * 1000);

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API endpoints available:');
  console.log(`- GET http://localhost:${PORT}/api/tickets`);
  console.log(`- PUT http://localhost:${PORT}/api/tickets/:id`);
});
