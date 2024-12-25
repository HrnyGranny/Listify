const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

const ACCESS_TOKEN_SECRET = 'Listify123';

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ message: 'El email ya está en uso' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            admin: req.body.admin || false,
            ispaid: req.body.ispaid || false
        });

        const newUser = await user.save();

        // Generar un token
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, email: newUser.email, admin: newUser.admin, ispaid: newUser.ispaid },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
    
        res.status(201).json(newUser, token);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Generar un token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email, admin: user.admin, ispaid: user.ispaid },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los usuarios sin autenticación TEST
router.get('/test', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los usuarios (protegido, solo admins)
router.get('/', authenticateToken, async (req, res) => {
    if (!req.user.admin) return res.status(403).json({ message: 'Acceso denegado' });

    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un usuario por ID (protegido)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un usuario por ID (protegido)
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        // Solo un admin o el mismo usuario pueden actualizar
        if (req.user.id !== req.params.id && !req.user.admin) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar un usuario por ID (protegido)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Solo un admin puede eliminar usuarios
        if (!req.user.admin) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;