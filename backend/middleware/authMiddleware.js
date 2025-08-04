const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // ✅ שינוי מ־userId ל־id
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
