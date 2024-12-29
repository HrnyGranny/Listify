const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://HornyGranny:Ragnarok12.@cluster0.lsfk5ox.mongodb.net/Listify?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conexión a MongoDB Atlas establecida'))
    .catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Middleware
app.use(cors()); // Habilita CORS para todas las solicitudes
app.use(express.json({ limit: 'Infinity' })); // Para manejar JSON
app.use(express.urlencoded({ limit: 'Infinity', extended: true })); // Para formularios URL-encoded

// Rutas
app.use('/api/users', require('./routes/users'));
app.use('/api/lists', require('./routes/lists')(wss)); // Pasar wss a las rutas

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno del servidor' });
});

// Configurar WebSocket
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        console.log('Received:', message);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});