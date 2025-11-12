// backend/server.js

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 4000; 

app.use(helmet()); 
app.use(express.json());
app.use(cookieParser());

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000'; 

app.use(cors({ origin: FRONTEND, credentials: true })); 

app.use('/api', authRoutes);
app.use('/api/comments', commentsRoutes);

app.get('/', (req, res) => res.send('JWT Auth Demo'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));