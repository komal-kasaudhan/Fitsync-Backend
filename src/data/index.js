// 📄 Path: seeders/index.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Food = require('../src/models/Food');

const dataFiles = [
  'grains.json',
  'fruits.json',
  'vegetables.json',
  'dairy.json',
  'drinks.json',
  'indianMeals.json',
  'northIndian.json',
  'southIndian.json',
  'snacks.json',
  'fastFood.json'
];

const seedModularData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('⚡ Connected to MongoDB Atlas for Seeding...');

    // Clear old food dataset
    await Food.deleteMany({});
    console.log('🧹 Purged existing food items.');

    let totalInserted = 0;

    for (const fileName of dataFiles) {
      const filePath = path.join(__dirname, 'data', fileName);
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const foodsArray = JSON.parse(rawData);

        await Food.insertMany(foodsArray);
        console.log(`✅ Imported ${foodsArray.length} items from ${fileName}`);
        totalInserted += foodsArray.length;
      } else {
        console.warn(`⚠️ Warning: File not found -> ${fileName}`);
      }
    }

    console.log(`🎉 Success! Total ${totalInserted} verified food items seeded into MongoDB!`);
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seedModularData();