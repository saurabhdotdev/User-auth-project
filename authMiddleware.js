const jwt = require('jsonwebtoken');
const AppDataSource = require('../data-source');

const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const payload = jwt.verify(token, jwtSecret);
    const userRepo = AppDataSource.getRepository('User');
    const user = await userRepo.findOneBy({ id: payload.id });
    if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('Auth error:', err.message || err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
module.exports = authMiddleware;
