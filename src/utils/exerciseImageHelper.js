// 📄 Path: src/utils/exerciseImageHelper.js
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../../public/exercise-images');

/**
 * Resolves exercise image URL automatically if <id>.jpg / <id>.png exists in public/exercise-images
 */
function resolveExerciseImageUrl(exercise, req) {
    if (!exercise) return null;
    const exerciseId = exercise.id || exercise.exerciseId;
    
    if (exerciseId) {
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        for (const ext of extensions) {
            const fileName = `${exerciseId}${ext}`;
            const fullPath = path.join(IMAGES_DIR, fileName);
            if (fs.existsSync(fullPath)) {
                const protocol = req?.protocol || 'http';
                const host = req && typeof req.get === 'function' ? req.get('host') : (process.env.HOST_PORT || 'localhost:8000');
                return `${protocol}://${host}/exercise-images/${fileName}`;
            }
        }
    }

    return exercise.imageUrl || null;
}

module.exports = {
    IMAGES_DIR,
    resolveExerciseImageUrl
};
