// backend/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { saveRefreshToken, isRefreshTokenValid, revokeRefreshToken } = require('../utils/tokenStore');
const router = express.Router();

// demo users (em produção: DB)
const users = [  
  // senha: senha123 (bcrypt hash)  
  { id: 'user1', email: 'user@example.com', passwordHash: '$2b$10$l1J4H2qv0M3Wm1xVbG3KeOEyvz6m7y3Lqgk0KfYyFboQvZ0Zq5g5C', roles: ['user'] }
];

const loginLimiter = rateLimit({ windowMs: 60_000, max: 8, message: { message: 'Too many attempts' } });

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  
  const ok = await bcrypt.compare(password, user.passwordHash); 
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  
  const accessToken = jwt.sign({ sub: user.id, roles: user.roles }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP || '15m' }); 
  const refreshToken = jwt.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP || '7d' }); 

  // Save refresh token in store to allow revocation
  const decoded = jwt.decode(refreshToken);
  const expMillis = (decoded.exp ? decoded.exp * 1000 : Date.now() + 7*24*3600*1000); 
  saveRefreshToken(refreshToken, { userId: user.id, expiresAt: expMillis }); 

  // Send cookie (httpOnly)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: (process.env.COOKIE_SECURE === 'true'),
    sameSite: 'lax',
    maxAge: expMillis - Date.now()
  });

  return res.json({ accessToken }); 
});

// Refresh endpoint
router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  if (!isRefreshTokenValid(token)) return res.status(401).json({ message: 'Invalid refresh token' });
  
  try{
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    // optionally check user exists in DB
    const accessToken = jwt.sign({ sub: payload.sub }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP || '15m' });
    return res.json({ accessToken });
  }catch(e){
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const token = req.cookies.refreshToken; 
  if (token) revokeRefreshToken(token);
  res.clearCookie('refreshToken');
  return res.json({ ok: true });
});

module.exports = router;