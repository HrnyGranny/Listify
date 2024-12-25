const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

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
app.use('/api/lists', require('./routes/lists'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
