// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

function requireAccessToken(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' }); 
  
  const token = auth.split(' ')[1]; 
  try{
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    return next();
  }catch(e){
    return res.status(401).json({ message: 'Invalid token' }); 
  }
}

module.exports = { requireAccessToken };