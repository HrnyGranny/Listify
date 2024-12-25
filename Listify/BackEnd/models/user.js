const mongoose = require('mongoose');

// Definición del esquema para el usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Obligatorio
        trim: true, // Elimina espacios al principio y al final
        unique: true // Garantiza que no se repita el username
    },
    password: {
        type: String,
        required: true // Obligatorio
    },
    email: {
        type: String,
        required: true, // Obligatorio
        unique: true, // Garantiza que no se repita el email
        match: [/.+\@.+\..+/, 'Por favor ingrese un email válido'] // Validación de formato de email
    },
    admin: {
        type: Boolean,
        default: false // Por defecto, no es administrador
    },
    ispaid: {
        type: Boolean,
        default: false // Por defecto, el usuario no es de pago
    }
});

// Exportar el modelo
module.exports = mongoose.model('User', userSchema);