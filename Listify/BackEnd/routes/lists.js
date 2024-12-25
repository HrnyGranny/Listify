const express = require('express');
const router = express.Router();
const List = require('../models/List'); // Importar el modelo
const authenticate = require('../middleware/authenticate'); // Middleware para token

// Cargar listas del usuario autenticado
router.get('/', authenticate, async (req, res) => {
    try {
        const owner = req.user.username;

        const lists = await List.find({
            $or: [
                { owner: owner },
                { share: owner }
            ]
        });

        res.status(200).json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar las listas' });
    }
});

// Crear nueva lista
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, content, share } = req.body;
        const owner = req.user.username;

        const newList = new List({
            name: name,
            owner: owner,
            content: content,
            share: share
        });

        await newList.save();

        res.status(201).json({
            message: 'Lista creada exitosamente',
            list: newList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la lista' });
    }
});

// Añadir / eliminar / editar productos de una lista
router.put('/:id/content', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const owner = req.user.username;

        const list = await List.findOneAndUpdate(
            { _id: id, owner: owner },
            { content: content },
            { new: true }
        );

        if (!list) {
            return res.status(404).json({ error: 'Lista no encontrada o no tienes permisos' });
        }

        res.status(200).json({
            message: 'Productos actualizados exitosamente',
            list: list
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar los productos' });
    }
});

// Añadir / eliminar miembros compartidos
router.put('/:id/share', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { share } = req.body;
        const owner = req.user.username;

        const list = await List.findOneAndUpdate(
            { _id: id, owner: owner },
            { share: share },
            { new: true }
        );

        if (!list) {
            return res.status(404).json({ error: 'Lista no encontrada o no tienes permisos' });
        }

        res.status(200).json({
            message: 'Miembros compartidos actualizados exitosamente',
            list: list
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar los miembros compartidos' });
    }
});

// Eliminar una lista
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const owner = req.user.username;

        const list = await List.findOneAndDelete({
            _id: id,
            owner: owner
        });

        if (!list) {
            return res.status(404).json({ error: 'Lista no encontrada o no tienes permisos' });
        }

        res.status(200).json({ message: 'Lista eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la lista' });
    }
});

// Notificar cambios (placeholder)
router.post('/:id/notify', authenticate, async (req, res) => {
    try {
        // Lógica para notificar a los miembros compartidos (opcional)
        res.status(200).json({ message: 'Notificación enviada (placeholder)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al notificar cambios' });
    }
});

module.exports = router;
