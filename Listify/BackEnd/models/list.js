const mongoose = require('mongoose');

// Esquema de la lista
const ListSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        owner: { 
            type: String, 
            required: true 
        },
        content: [
            {
                item: { 
                    type: String, 
                    required: true 
                },
                checked: { 
                    type: Boolean, 
                    default: false 
                }
            }
        ],
        share: [
            { 
                type: String 
            }
        ]
    },
    {
        timestamps: true // Añade createdAt y updatedAt
    }
);

module.exports = mongoose.model('List', ListSchema);
