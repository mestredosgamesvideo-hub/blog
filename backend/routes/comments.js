// backend/routes/comments.js

const express = require('express');
const { requireAccessToken } = require('../middleware/auth');
const router = express.Router();

// 🚨 CORREÇÃO XSS: Importa a biblioteca de sanitização
const xss = require('xss-filters'); 

// In-memory comments store (Trocar por DB em produção)
const comments = [];

router.get('/', requireAccessToken, (req, res) => {
  res.json({ comments });
});

router.post('/', requireAccessToken, (req, res) => {
  const text = (req.body.text || '').toString().trim();
  if (!text) return res.status(400).json({ message: 'No text' });

  // 🚨 CORREÇÃO XSS APLICADA: Substitui a sanitização mínima pela profissional
  const safeText = xss.inHTMLData(text); 

  const comment = { id: String(comments.length + 1), user: req.user.sub, text: safeText, createdAt: new Date().toISOString() };
  comments.unshift(comment);
  res.json({ comment });
});

module.exports = router;