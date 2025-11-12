// backend/utils/tokenStore.js

// --- AVISO: ESTE É UM CÓDIGO CONCEITUAL QUE EXIGE UM SERVIDOR REDIS ---
// Substitui a lógica de Map() por Redis para escalabilidade e revogação segura.

const Redis = require('ioredis');
// A conexão seria configurada aqui, lendo o host/port/password de um novo campo no .env
const redisClient = new Redis({
  // host: process.env.REDIS_HOST,
  // port: process.env.REDIS_PORT
});

// Chave no Redis para o Refresh Token
const getKey = (token) => `refresh_token:${token}`;

/**
 * Salva o Refresh Token no Redis, usando o TTL (Time To Live) para expirar.
 * @param {string} token - O Refresh Token.
 * @param {object} metadata - Objeto com userId e expiresAt (timestamp em milissegundos).
 */
function saveRefreshToken(token, { expiresAt }){
  const key = getKey(token);
  // Calcula o tempo de vida (TTL) em segundos
  const ttlSeconds = Math.floor((expiresAt - Date.now()) / 1000); 

  if (ttlSeconds > 0) {
    // SET com opção EX (expiração em segundos). O Redis cuida da expiração.
    redisClient.set(key, 'true', 'EX', ttlSeconds); 
    console.log(`Token salvo no Redis com TTL: ${ttlSeconds}s`);
  }
}

/**
 * Verifica se o Refresh Token é válido (existente e não expirado).
 * @param {string} token - O Refresh Token.
 * @returns {Promise<boolean>} True se o token ainda existe no Redis.
 */
async function isRefreshTokenValid(token){
  const key = getKey(token);
  // O Redis retorna 1 se a chave existe (e não expirou), 0 se não existe.
  const exists = await redisClient.exists(key); 
  return exists === 1; 
}

/**
 * Revoga o Refresh Token (Blacklist instantânea).
 * @param {string} token - O Refresh Token.
 */
function revokeRefreshToken(token){
  const key = getKey(token);
  // DEL remove o token instantaneamente.
  redisClient.del(key); 
  console.log(`Token revogado no Redis: ${token}`);
}

module.exports = { saveRefreshToken, isRefreshTokenValid, revokeRefreshToken, redisClient };