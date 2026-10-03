// 📄 Path: src/data/seedExercisesData.js
// Loads all modular exercise JSON files from data/exercises/
const fs = require('fs');
const path = require('path');

const exercisesDir = path.join(__dirname, '../../data/exercises');

function loadAllExercises() {
    let all = [];
    if (!fs.existsSync(exercisesDir)) {
        return all;
    }

    const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
        try {
            const raw = fs.readFileSync(path.join(exercisesDir, file), 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
                all.push(...data);
            }
        } catch (err) {
            console.error(`⚠️ Failed to parse ${file}:`, err.message);
        }
    }

    return all;
}

const exercises = loadAllExercises();

module.exports = exercises;
