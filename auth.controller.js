const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppDataSource = require('../data-source');
const UserEntity = require('../entities/User.entity');

const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function ensureDB() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email & password required" });

      await ensureDB();
      const repo = AppDataSource.getRepository(UserEntity);

      const existing = await repo.findOneBy({ email });
      if (existing) return res.status(409).json({ message: "Email already used" });

      const hashed = await bcrypt.hash(password, saltRounds);

      const user = repo.create({ name, email, password: hashed });
      const saved = await repo.save(user);

      const { password: _p, ...safe } = saved;
      res.status(201).json({ message: "User created", user: safe });

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email & password required" });

      await ensureDB();
      const repo = AppDataSource.getRepository(UserEntity);

      const user = await repo.findOneBy({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });

      const { password: _p, ...safe } = user;
      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

      res.json({ message: "Logged in", user: safe, token });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      await ensureDB();
      const repo = AppDataSource.getRepository(UserEntity);

      const users = await repo.find({
        select: ["id", "email", "name", "createdAt", "updatedAt"]
      });
      res.json(users);
    } catch (err) {
      console.error("GET USERS ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await ensureDB();
      const repo = AppDataSource.getRepository(UserEntity);

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const user = await repo.findOneBy({ id });
      if (!user) return res.status(404).json({ message: "User not found" });

      await repo.delete(id);

      res.json({ message: "User deleted" });
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // ---------- NEW: updateUser ----------
  updateUser: async (req, res) => {
    try {
      await ensureDB();
      const repo = AppDataSource.getRepository(UserEntity);

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      // authMiddleware should populate req.user with { id, email, name }
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Allow only the user to update their own record (change if you want admin behavior)
      if (req.user.id !== id) {
        return res.status(403).json({ message: "Forbidden: cannot edit other users" });
      }

      const { name, email } = req.body;
      if (!name && !email) {
        return res.status(400).json({ message: "Nothing to update" });
      }

      const user = await repo.findOneBy({ id });
      if (!user) return res.status(404).json({ message: "User not found" });

      // If email is changing, ensure uniqueness
      if (email && email !== user.email) {
        const existing = await repo.findOneBy({ email });
        if (existing) return res.status(409).json({ message: "Email already in use" });
        user.email = email;
      }

      if (name) user.name = name;

      const saved = await repo.save(user);
      const { password: _p, ...safe } = saved;
      res.json({ message: "User updated", user: safe });
    } catch (err) {
      console.error("UPDATE USER ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
};
