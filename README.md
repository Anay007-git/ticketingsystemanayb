# Lux Ticketing Tools

A rule-based IT and SAP support ticketing system that automatically creates tickets from escalation emails, assigns them to appropriate users using keyword analysis, and provides screen sharing capabilities for support.

## Features

- **Automated Ticket Creation**: Automatically parses incoming emails and creates support tickets
- **Rule-Based Assignment**: Uses keyword analysis to assign tickets to IT Support, SAP Support, or Admin based on subject and content
- **Priority Classification**: Automatically determines ticket priority (Low, Medium, High) based on urgency keywords
- **Real-time Screen Sharing**: WebRTC-based screen sharing for remote support
- **Modern UI**: Clean, responsive interface built with React
- **Real-time Updates**: Socket.io for real-time communication

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm
- Email account with IMAP access

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lux-ticketing-tools
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   - Copy `backend/.env` and update with your credentials:
     ```
     EMAIL_USER=your_email@example.com
     EMAIL_PASSWORD=your_email_password
     IMAP_HOST=imap.example.com
     PORT=5000
     ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Automatic Ticket Creation**: The system checks for new emails every 5 minutes and creates tickets automatically.

2. **Viewing Tickets**: All tickets are displayed in the main dashboard with details like subject, sender, assigned user, priority, and status.

3. **Managing Tickets**: Click "Start Working" to change ticket status to "in-progress".

4. **Screen Sharing**: Click "Screen Share" to initiate a WebRTC screen sharing session with the user.

## Architecture

- **Backend**: Node.js with Express, Socket.io for real-time communication, IMAP for email parsing, rule-based keyword analysis for ticket assignment
- **Frontend**: React with modern hooks, Axios for API calls, Socket.io client for real-time updates
- **Communication**: WebRTC for peer-to-peer screen sharing, Socket.io for signaling

## Security Notes

- Store API keys and email credentials securely
- Use HTTPS in production
- Implement proper authentication and authorization
- Consider using a database instead of in-memory storage for production

## Future Enhancements

- User authentication and role-based access
- Database integration (MongoDB/PostgreSQL)
- Advanced AI features (sentiment analysis, auto-resolution)
- Mobile app support
- Integration with existing ticketing systems
