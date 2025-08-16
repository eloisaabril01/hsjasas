
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Load environment variables
require('dotenv').config();

// Secure admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variables
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map();

// Generate secure token
function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Verify session
function verifySession(token) {
    const session = activeSessions.get(token);
    if (!session) return false;
    
    const now = Date.now();
    const sessionAge = now - session.createdAt;
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    
    if (sessionAge > maxAge) {
        activeSessions.delete(token);
        return false;
    }
    
    return true;
}

// Login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password required'
        });
    }
    
    // Simulate processing delay
    setTimeout(() => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = generateSecureToken();
            const session = {
                token,
                username,
                createdAt: Date.now()
            };
            
            activeSessions.set(token, session);
            
            res.json({
                success: true,
                token,
                expiresIn: 7200 // 2 hours in seconds
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
    }, 1000);
});

// Verify session endpoint
app.post('/api/admin/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, valid: false, message: 'Token required' });
    }
    
    if (verifySession(token)) {
        res.json({ success: true, valid: true });
    } else {
        res.status(401).json({ success: false, valid: false, message: 'Invalid or expired token' });
    }
});

// Logout endpoint
app.post('/api/admin/logout', (req, res) => {
    const { token } = req.body;
    activeSessions.delete(token);
    res.json({ success: true });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure server running on port ${PORT}`);
    console.log('Admin credentials loaded from environment variables');
});
