const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateToken = require('../middleware/authenticateToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

        // Send registration confirmation email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'alvaroruizroldan@gmail.com',
                pass: 'pptb qjlh wsln wzuv'
            }
        });

        const mailOptions = {
            from: 'noreply@listify.com',
            to: newUser.email,
            subject: 'Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #343a40;">
                    <header style="background-color: #007bff; padding: 10px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">Listify</h1>
                    </header>
                    <div style="padding: 20px;">
                        <h2 style="color: #fff;">Registration Successful</h2>
                        <p style="font-size: 16px; color: #ddd;">Welcome to Listify, ${newUser.username}!</p>
                        <p style="font-size: 16px; color: #ddd;">You have successfully registered. You can now start using Listify to manage your shopping lists efficiently.</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:4200/" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #64a19d; border-radius: 5px; text-decoration: none;">Go to Website</a>
                        </div>
                    </div>
                    <footer style="background-color: #007bff; padding: 10px; border-radius: 0 0 10px 10px; text-align: center; color: #fff;">
                        <p style="margin: 0;">&copy; Listify 2024</p>
                    </footer>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            }
        });

        res.status(201).json({ user: newUser, token });
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

// Ruta para cambiar la contraseña de un usuario (protegido)
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verificar que el usuario esté autenticado
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verificar la contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

        // Hash la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new random password
        const newPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Send the new password to the user's email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'alvaroruizroldan@gmail.com',
                pass: 'pptb qjlh wsln wzuv'
            }
        });

        const mailOptions = {
            from: 'noreply@listify.com',
            to: user.email,
            subject: 'Password Reset',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #343a40;">
                    <header style="background-color: #007bff; padding: 10px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">Listify</h1>
                    </header>
                    <div style="padding: 20px;">
                        <h2 style="color: #fff;">Password Reset</h2>
                        <p style="font-size: 16px; color: #ddd;">Your new password is:</p>
                        <p style="font-size: 20px; font-weight: bold; color: #fff; text-align: center;">${newPassword}</p>
                        <p style="font-size: 16px; color: #ddd;">Please change your password after logging in.</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:4200/" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #64a19d; border-radius: 5px; text-decoration: none;">Go to Website</a>
                        </div>
                    </div>
                    <footer style="background-color: #007bff; padding: 10px; border-radius: 0 0 10px 10px; text-align: center; color: #fff;">
                        <p style="margin: 0;">&copy; Listify 2024</p>
                    </footer>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'Password reset email sent' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para actualizar el estado del usuario a premium
router.post('/upgrade-to-premium', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isPremium = true;
        await user.save();

        res.status(200).json({ message: 'User upgraded to premium successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
