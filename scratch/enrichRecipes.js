// Scratch script to enrich seedRecipesData.js with seasons and tags
const fs = require('fs');
const path = require('path');

const recipes = require('../src/data/seedRecipesData');

const seasonalTagsMap = {
    "Paneer Bhurji with Whole Wheat Toast": { seasons: ["all", "winter", "spring"], tags: ["high_protein", "quick", "warming"] },
    "Grilled Paneer Tikka Salad": { seasons: ["summer", "spring", "post_monsoon"], tags: ["high_protein", "light", "grilled"] },
    "Palak Paneer with Brown Rice": { seasons: ["winter", "monsoon", "post_monsoon"], tags: ["high_protein", "iron_rich", "warming"] },
    "Greek Yogurt Berry Protein Bowl": { seasons: ["summer", "spring"], tags: ["cooling", "high_protein", "probiotic", "light"] },
    "Spiced Masala Buttermilk (Chaas) with Roasted Makhana": { seasons: ["summer", "monsoon"], tags: ["cooling", "light", "digestive", "snack"] },
    "Paneer & Bell Pepper Wrap": { seasons: ["all", "spring"], tags: ["high_protein", "fiber", "quick"] },
    "Cottage Cheese & Spinach Stuffed Paratha": { seasons: ["winter", "monsoon"], tags: ["warming", "comfort", "high_protein"] },
    "Kadhai Paneer with Multigrain Roti": { seasons: ["winter", "post_monsoon", "monsoon"], tags: ["warming", "festive", "high_protein"] },
    "High-Protein Paneer Besan Chilla": { seasons: ["all", "monsoon"], tags: ["high_protein", "gluten_free", "quick"] },
    "Paneer & Broccoli Stir-Fry": { seasons: ["summer", "spring", "all"], tags: ["light", "high_protein", "low_carb"] },
    "Methi Paneer Curry with Quinoa": { seasons: ["winter", "post_monsoon"], tags: ["warming", "high_protein", "fiber"] },
    "Low-Fat Paneer Makhani (No Heavy Cream)": { seasons: ["post_monsoon", "winter", "all"], tags: ["festive", "comfort", "high_protein"] },
    "Cottage Cheese Sweet Bowl with Honey & Walnuts": { seasons: ["post_monsoon", "winter"], tags: ["festive", "high_protein", "sweet"] },
    "Paneer Stuffed Capsicum": { seasons: ["post_monsoon", "winter"], tags: ["comfort", "high_protein"] },
    "Paneer Oats Porridge (Savory Upma Style)": { seasons: ["winter", "monsoon", "all"], tags: ["warming", "comfort", "high_protein"] },

    "Soya Chunks Curry with Basmati Rice": { seasons: ["winter", "monsoon", "all"], tags: ["high_protein", "comfort", "warming"] },
    "Spicy Soya Chunks Dry Fry (Bhuna)": { seasons: ["monsoon", "winter"], tags: ["warming", "high_protein", "spicy"] },
    "Tofu Scramble with Turmeric & Sourdough": { seasons: ["all", "winter"], tags: ["warming", "quick", "high_protein"] },
    "Tofu & Mixed Veggies Coconut Curry": { seasons: ["winter", "monsoon"], tags: ["warming", "comfort", "high_protein"] },
    "Soya Keema Matar with Whole Wheat Pav": { seasons: ["winter", "monsoon", "post_monsoon"], tags: ["comfort", "warming", "high_protein"] },
    "Crispy Air-Fried Sesame Tofu": { seasons: ["monsoon", "winter", "all"], tags: ["crispy", "snack", "high_protein"] },
    "High-Protein Soya Pulao": { seasons: ["monsoon", "winter", "all"], tags: ["comfort", "warming", "high_protein"] },
    "Soya Tikki / Kebabs (High Protein Patties)": { seasons: ["monsoon", "post_monsoon"], tags: ["festive", "comfort", "high_protein"] },
    "Tofu Tikka Masala with Phulkas": { seasons: ["post_monsoon", "winter"], tags: ["festive", "warming", "high_protein"] },
    "Soya Manchurian (Indo-Chinese Style)": { seasons: ["monsoon", "winter"], tags: ["comfort", "spicy", "high_protein"] },
    "Tofu Buddha Bowl with Peanut Dressing": { seasons: ["summer", "spring"], tags: ["cooling", "light", "high_protein"] },
    "Soya Biryani with Cucumber Raita (Vegan Style)": { seasons: ["post_monsoon", "summer", "all"], tags: ["festive", "high_protein", "comfort"] },
    "Chilli Garlic Tofu with Stir-Fried Noodles": { seasons: ["monsoon", "winter"], tags: ["warming", "comfort", "high_protein"] },
    "Soya Methi Saag with Makki Roti": { seasons: ["winter"], tags: ["warming", "traditional", "high_protein"] },
    "Teriyaki Tofu Steaks with Steamed Jasmine Rice": { seasons: ["all", "spring"], tags: ["light", "high_protein", "lean"] },

    "Sprouted Moong & Kala Chana Chaat": { seasons: ["summer", "spring", "monsoon"], tags: ["cooling", "light", "high_protein", "fiber"] },
    "High-Protein Dal Tadka with Jeera Rice": { seasons: ["all", "monsoon", "winter"], tags: ["comfort", "warming", "high_protein"] },
    "Pindi Chana with Whole Wheat Bhatura / Toast": { seasons: ["winter", "post_monsoon"], tags: ["comfort", "festive", "high_protein"] },
    "Rajma Masala with Steamed Rice": { seasons: ["winter", "monsoon", "all"], tags: ["comfort", "warming", "high_protein"] },
    "Mediterranean Chickpea & Quinoa Salad": { seasons: ["summer", "spring"], tags: ["cooling", "light", "high_protein"] },
    "Moong Dal Khichdi with Curd & Flaxseeds": { seasons: ["monsoon", "summer", "winter"], tags: ["comfort", "cooling", "digestive", "high_protein"] },
    "Sprouted Methi & Moong Paratha": { seasons: ["winter", "monsoon"], tags: ["warming", "fiber", "high_protein"] },
    "Black Eyed Peas (Lobia) Masala with Roti": { seasons: ["all", "monsoon"], tags: ["comfort", "high_protein"] },
    "Lentil & Vegetable High-Protein Soup": { seasons: ["winter", "monsoon"], tags: ["warming", "light", "comfort", "high_protein"] },
    "Hummus with Spiced Chickpeas & Baked Pita": { seasons: ["summer", "spring", "all"], tags: ["cooling", "snack", "high_protein"] },
    "Edamame & Corn Chaat": { seasons: ["summer", "monsoon"], tags: ["light", "snack", "high_protein"] },
    "Chana Dal Stuffed Cheela": { seasons: ["monsoon", "winter", "all"], tags: ["comfort", "high_protein", "quick"] },
    "Horsegram (Kulthi) Soup with Rice": { seasons: ["winter"], tags: ["warming", "traditional", "high_protein"] },
    "Peanut & Sprout Salad with Pomegranate": { seasons: ["summer", "spring"], tags: ["cooling", "light", "crunchy", "high_protein"] },
    "Lentil Shepherd's Pie (Vegan Protein Bake)": { seasons: ["winter", "post_monsoon"], tags: ["comfort", "warming", "high_protein"] },

    "Masala Egg Bhurji with Multigrain Toast": { seasons: ["all", "winter", "monsoon"], tags: ["quick", "warming", "high_protein"] },
    "Boiled Eggs (3) with Spiced Hummus & Avocado": { seasons: ["summer", "spring", "all"], tags: ["light", "cooling", "high_protein"] },
    "Punjabi Egg Curry with Steamed Rice": { seasons: ["winter", "monsoon", "post_monsoon"], tags: ["warming", "comfort", "high_protein"] },
    "Spanish Spinach & Mushroom Omelette (Tortilla)": { seasons: ["all", "spring"], tags: ["high_protein", "light"] },
    "Egg White Veggie Scramble with Avocado Toast": { seasons: ["summer", "spring", "all"], tags: ["light", "high_protein", "clean"] },
    "Egg Fried Rice with Extra Veggies": { seasons: ["all", "monsoon"], tags: ["quick", "comfort", "high_protein"] },
    "Shakshuka (North African Poached Eggs in Tomato Stew)": { seasons: ["winter", "monsoon"], tags: ["warming", "comfort", "high_protein"] },
    "Egg & Cheese Breakfast Quesadilla": { seasons: ["all", "winter"], tags: ["comfort", "quick", "high_protein"] },
    "Chettinad Spicy Egg Roast with Parotta": { seasons: ["monsoon", "winter"], tags: ["warming", "spicy", "comfort", "high_protein"] },
    "Avocado Egg Salad Wrap": { seasons: ["summer", "spring"], tags: ["cooling", "light", "high_protein"] },
    "French Style Rolled Herb Omelette with Mushrooms": { seasons: ["spring", "summer", "all"], tags: ["light", "clean", "high_protein"] },
    "Egg White Oats Pancake with Berry Compote": { seasons: ["all", "spring"], tags: ["sweet", "high_protein", "clean"] },
    "Hard Boiled Egg Chaat with Mint Chutney": { seasons: ["summer", "monsoon", "all"], tags: ["cooling", "snack", "quick", "high_protein"] },
    "Egg & Soya Keema Fusion Bowl": { seasons: ["winter", "monsoon"], tags: ["warming", "comfort", "high_protein"] },
    "Egg & Lentil Kedgeree Bowl": { seasons: ["winter", "post_monsoon"], tags: ["comfort", "warming", "high_protein"] },

    "Tandoori Grilled Chicken Breast with Salad": { seasons: ["all", "summer", "post_monsoon"], tags: ["grilled", "lean", "high_protein"] },
    "Chicken Tikka Masala with Brown Basmati Rice": { seasons: ["post_monsoon", "winter"], tags: ["festive", "comfort", "warming", "high_protein"] },
    "Chicken Keema Matar with Whole Wheat Phulkas": { seasons: ["winter", "monsoon"], tags: ["comfort", "warming", "high_protein"] },
    "Herb & Garlic Grilled Chicken with Quinoa & Veggies": { seasons: ["summer", "spring", "all"], tags: ["clean", "light", "high_protein"] },
    "Chicken Stir-Fry with Broccoli & Cashews": { seasons: ["all", "spring"], tags: ["light", "quick", "high_protein"] },
    "Chicken Shawarma Salad Bowl": { seasons: ["summer", "spring"], tags: ["cooling", "light", "high_protein"] },
    "South Indian Pepper Chicken (Kozhi Milagu)": { seasons: ["monsoon", "winter"], tags: ["warming", "spicy", "comfort", "high_protein"] },
    "Grilled Chicken Breast Burrito Bowl": { seasons: ["all", "summer"], tags: ["comfort", "lean", "high_protein"] },
    "Chicken Sukka (Mangalorean Style)": { seasons: ["monsoon", "post_monsoon", "winter"], tags: ["festive", "warming", "high_protein"] },
    "Lemon Herb Baked Chicken Thighs (Skinless)": { seasons: ["summer", "spring", "all"], tags: ["light", "lean", "high_protein"] },
    "Butter Chicken (Macro-Friendly Light Version)": { seasons: ["post_monsoon", "winter"], tags: ["festive", "comfort", "high_protein"] },
    "Chicken & Egg Protein Salad": { seasons: ["summer", "spring", "all"], tags: ["cooling", "light", "high_protein"] },
    "Mutton Sukka (Lean Goat Meat)": { seasons: ["winter", "post_monsoon"], tags: ["festive", "warming", "high_protein"] },
    "Chicken Katsu with Steamed Rice (Air-Fried)": { seasons: ["all", "monsoon"], tags: ["comfort", "crispy", "high_protein"] },
    "Chicken Tikka Whole Wheat Kathi Roll": { seasons: ["all", "post_monsoon"], tags: ["festive", "quick", "high_protein"] },

    "Grilled Fish Tikka (Amritsari Style)": { seasons: ["post_monsoon", "winter", "all"], tags: ["festive", "crispy", "high_protein"] },
    "Pan-Seared Salmon with Garlic Green Beans": { seasons: ["all", "winter"], tags: ["omega3", "clean", "high_protein"] },
    "Spicy Prawns Masala with Steamed Rice": { seasons: ["monsoon", "winter", "post_monsoon"], tags: ["spicy", "comfort", "high_protein"] },
    "Tuna & Boiled Egg Salad": { seasons: ["summer", "spring"], tags: ["cooling", "light", "quick", "high_protein"] },
    "Goan Fish Curry with Steamed Rice": { seasons: ["monsoon", "summer"], tags: ["comfort", "traditional", "high_protein"] },

    "Classic Whey Protein Shake with Banana & Peanut Butter": { seasons: ["all", "summer"], tags: ["quick", "shake", "high_protein"] },
    "High-Protein Chocolate Proats (Protein Oatmeal)": { seasons: ["winter", "monsoon", "all"], tags: ["warming", "comfort", "high_protein"] },
    "Coffee Mocha Whey Protein Shake": { seasons: ["all", "summer"], tags: ["cooling", "energizing", "shake", "high_protein"] },
    "Overnight Protein Chia Pudding": { seasons: ["summer", "spring"], tags: ["cooling", "light", "make_ahead", "high_protein"] },
    "Plant-Protein Berry Smoothie Bowl (Pea & Brown Rice)": { seasons: ["summer", "spring"], tags: ["cooling", "light", "smoothie", "high_protein"] }
};

const enriched = recipes.map(r => {
    const extra = seasonalTagsMap[r.name] || { seasons: ["all"], tags: ["high_protein"] };
    return {
        ...r,
        seasons: extra.seasons,
        tags: extra.tags
    };
});

const content = `// 📄 Path: src/data/seedRecipesData.js
// 85+ high-protein Indian & International recipes with full macronutrients, ingredients, preparation steps, seasons & tags

const recipes = ${JSON.stringify(enriched, null, 4)};

module.exports = recipes;
`;

const targetPath = path.join(__dirname, '../src/data/seedRecipesData.js');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`✅ Successfully enriched and wrote ${enriched.length} recipes to seedRecipesData.js`);
