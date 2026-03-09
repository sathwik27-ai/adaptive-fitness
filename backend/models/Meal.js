const mongoose = require('mongoose');
const { Schema } = mongoose;

const MealSchema = new Schema({
    name: { type: String, required: true },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fats: { type: Number },
    ingredients: [{ type: String }],
    instructions: { type: String },
    thumbnail: { type: String },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Meal', MealSchema);
