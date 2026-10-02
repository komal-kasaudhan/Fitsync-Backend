// 📄 Path: src/data/seedRecipesData.js
// 85+ high-protein Indian & International recipes with full macronutrients, ingredients, preparation steps, seasons & tags

const recipes = [
    {
        "name": "Paneer Bhurji with Whole Wheat Toast",
        "description": "Scrambled cottage cheese tossed with onions, tomatoes, and Indian spices.",
        "imageUrl": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500",
        "calories": 380,
        "protein": 26,
        "carbs": 28,
        "fat": 18,
        "fiber": 5,
        "servingSize": "200g paneer + 2 slices toast",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "200g low-fat Paneer",
            "1 medium Onion",
            "1 medium Tomato",
            "1 Green Chilli",
            "1/2 tsp Turmeric",
            "1 tsp Cumin",
            "2 slices Whole Wheat Bread"
        ],
        "steps": [
            "Heat 1 tsp oil in a pan, add cumin and chopped onions.",
            "Saute till onions turn golden, add tomatoes, chillies, and spices.",
            "Crumble paneer and mix thoroughly for 3-4 minutes.",
            "Serve hot with toasted whole wheat bread."
        ],
        "seasons": [
            "all",
            "winter",
            "spring"
        ],
        "tags": [
            "high_protein",
            "quick",
            "warming"
        ]
    },
    {
        "name": "Grilled Paneer Tikka Salad",
        "description": "Marinated spiced paneer cubes grilled to perfection, served over fresh greens.",
        "imageUrl": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500",
        "calories": 340,
        "protein": 24,
        "carbs": 14,
        "fat": 20,
        "fiber": 4,
        "servingSize": "200g tikka + salad",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "180g Paneer cubes",
            "3 tbsp Greek Yogurt",
            "1 tsp Kashmiri Red Chilli",
            "1/2 tsp Garam Masala",
            "Capsicum & Onion slices",
            "Lemon juice"
        ],
        "steps": [
            "Whisk yogurt with spices and lemon juice to make the marinade.",
            "Coat paneer and veggies, rest for 10 minutes.",
            "Pan grill on high heat for 6-8 minutes until charred.",
            "Toss with cucumber slices and mint chutney."
        ],
        "seasons": [
            "summer",
            "spring",
            "post_monsoon"
        ],
        "tags": [
            "high_protein",
            "light",
            "grilled"
        ]
    },
    {
        "name": "Palak Paneer with Brown Rice",
        "description": "Nutrient-packed spinach puree with pan-seared paneer cubes.",
        "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "calories": 420,
        "protein": 25,
        "carbs": 45,
        "fat": 16,
        "fiber": 6,
        "servingSize": "250g curry + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "150g Paneer",
            "250g fresh Spinach leaves",
            "1 Onion, 1 Tomato",
            "Ginger-Garlic paste",
            "1 cup Cooked Brown Rice"
        ],
        "steps": [
            "Blanch spinach in boiling water for 2 mins, shock in ice water, puree.",
            "Saute ginger, garlic, onions, and tomato in 1 tsp ghee.",
            "Add spinach puree and simmer for 5 mins.",
            "Add paneer cubes and serve with warm brown rice."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "post_monsoon"
        ],
        "tags": [
            "high_protein",
            "iron_rich",
            "warming"
        ]
    },
    {
        "name": "Greek Yogurt Berry Protein Bowl",
        "description": "Thick strained Greek curd loaded with chia seeds, almonds, and mixed berries.",
        "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
        "calories": 290,
        "protein": 25,
        "carbs": 32,
        "fat": 6,
        "fiber": 7,
        "servingSize": "250g yogurt + toppings",
        "mealType": "Breakfast",
        "prepTimeMin": 5,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "nuts"
        ],
        "ingredients": [
            "250g Plain Greek Yogurt (0% or low fat)",
            "1 tbsp Chia seeds",
            "10 crushed Almonds",
            "1/2 cup Blueberries or Strawberries",
            "1 tsp Honey"
        ],
        "steps": [
            "Scoop thick Greek yogurt into a bowl.",
            "Top with berries, soaked chia seeds, and chopped almonds.",
            "Drizzle honey and enjoy chilled."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "high_protein",
            "probiotic",
            "light"
        ]
    },
    {
        "name": "Spiced Masala Buttermilk (Chaas) with Roasted Makhana",
        "description": "Hydrating probiotic curd cooler accompanied by crunchy protein-rich fox nuts.",
        "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
        "calories": 220,
        "protein": 15,
        "carbs": 26,
        "fat": 6,
        "fiber": 4,
        "servingSize": "400ml chaas + 30g makhana",
        "mealType": "Snack",
        "prepTimeMin": 10,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "200g Curd/Dahi",
            "200ml cold Water",
            "Roasted Cumin powder",
            "Black Salt, fresh Mint",
            "30g Fox nuts (Makhana)"
        ],
        "steps": [
            "Blend curd, water, mint, cumin, and black salt until frothy.",
            "Dry roast makhana in a pan with a pinch of turmeric and salt.",
            "Serve chilled buttermilk with warm crunchy makhana."
        ],
        "seasons": [
            "summer",
            "monsoon"
        ],
        "tags": [
            "cooling",
            "light",
            "digestive",
            "snack"
        ]
    },
    {
        "name": "Paneer & Bell Pepper Wrap",
        "description": "Juicy marinated paneer strips wrapped in a whole grain roti with mint sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500",
        "calories": 390,
        "protein": 23,
        "carbs": 40,
        "fat": 15,
        "fiber": 5,
        "servingSize": "1 large wrap",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "150g Paneer fingers",
            "1 Whole wheat Chapati",
            "Sliced Bell Peppers & Onions",
            "1 tbsp Mint yogurt chutney",
            "Chaat masala"
        ],
        "steps": [
            "Saute paneer fingers with peppers, onions, and chaat masala for 5 mins.",
            "Warm the chapati on a tawa.",
            "Spread mint chutney, add filling, roll tightly and slice."
        ],
        "seasons": [
            "all",
            "spring"
        ],
        "tags": [
            "high_protein",
            "fiber",
            "quick"
        ]
    },
    {
        "name": "Cottage Cheese & Spinach Stuffed Paratha",
        "description": "Wholesome flatbread stuffed with finely grated paneer, fresh palak, and carom seeds.",
        "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
        "calories": 360,
        "protein": 20,
        "carbs": 42,
        "fat": 12,
        "fiber": 5,
        "servingSize": "2 parathas",
        "mealType": "Breakfast",
        "prepTimeMin": 20,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "120g Grated low-fat Paneer",
            "1/2 cup finely chopped Spinach",
            "1 cup Whole wheat flour dough",
            "Ajwain, Green chilli, Salt"
        ],
        "steps": [
            "Mix grated paneer, chopped spinach, ajwain, and salt.",
            "Roll small dough ball, stuff paneer mixture, seal and roll gently.",
            "Cook on a hot tawa with a drop of ghee until both sides are speckled."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Kadhai Paneer with Multigrain Roti",
        "description": "Semi-dry paneer curry cooked with freshly ground coriander and roasted bell peppers.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 430,
        "protein": 27,
        "carbs": 44,
        "fat": 16,
        "fiber": 7,
        "servingSize": "200g curry + 2 rotis",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "180g Paneer cubes",
            "Diced Capsicum & Onion",
            "Freshly roasted kadhai masala",
            "Tomato puree",
            "2 Multigrain Rotis"
        ],
        "steps": [
            "Roast coriander and dry red chillies, grind coarsely.",
            "Saute diced veggies, add tomato puree and ground spices.",
            "Add paneer cubes, cook for 5 minutes, garnish with ginger juliennes."
        ],
        "seasons": [
            "winter",
            "post_monsoon",
            "monsoon"
        ],
        "tags": [
            "warming",
            "festive",
            "high_protein"
        ]
    },
    {
        "name": "High-Protein Paneer Besan Chilla",
        "description": "Crispy chickpea flour savory pancake stuffed with crumbled spiced cottage cheese.",
        "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "calories": 350,
        "protein": 24,
        "carbs": 34,
        "fat": 13,
        "fiber": 6,
        "servingSize": "2 chillas",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "60g Besan (Gram flour)",
            "120g grated Paneer",
            "Finely chopped Onions & Coriander",
            "Ajwain, Turmeric, Salt"
        ],
        "steps": [
            "Whisk besan with water, ajwain, turmeric, and salt into a smooth batter.",
            "Pour on a hot non-stick pan, spread into a round crepe.",
            "Top with grated paneer and herbs, fold and toast crisp."
        ],
        "seasons": [
            "all",
            "monsoon"
        ],
        "tags": [
            "high_protein",
            "gluten_free",
            "quick"
        ]
    },
    {
        "name": "Paneer & Broccoli Stir-Fry",
        "description": "Crunchy broccoli florets and tender paneer tossed in ginger soy garlic glaze.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 310,
        "protein": 22,
        "carbs": 16,
        "fat": 18,
        "fiber": 5,
        "servingSize": "1 large bowl",
        "mealType": "Dinner",
        "prepTimeMin": 15,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "soy"
        ],
        "ingredients": [
            "160g Paneer cubes",
            "1.5 cups Broccoli florets",
            "1 tbsp Soy sauce",
            "1 tsp Minced Garlic",
            "Sesame seeds"
        ],
        "steps": [
            "Steam broccoli florets for 3 minutes until vibrant green.",
            "Pan-sear paneer cubes until golden in a wok.",
            "Add garlic, broccoli, soy sauce, toss on high flame for 2 mins, sprinkle sesame."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "light",
            "high_protein",
            "low_carb"
        ]
    },
    {
        "name": "Methi Paneer Curry with Quinoa",
        "description": "Fresh bitter fenugreek leaves tempered with spices and paneer, served with fluffy quinoa.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 390,
        "protein": 25,
        "carbs": 42,
        "fat": 14,
        "fiber": 6,
        "servingSize": "1 bowl curry + 1 cup quinoa",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "150g Paneer",
            "1 cup fresh Methi leaves",
            "Onion-tomato gravy",
            "1 cup Cooked Quinoa",
            "Garam masala"
        ],
        "steps": [
            "Saute methi leaves in a drop of oil to reduce bitterness.",
            "Add prepared onion-tomato masala base and simmer.",
            "Add paneer cubes and cooked quinoa alongside."
        ],
        "seasons": [
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "warming",
            "high_protein",
            "fiber"
        ]
    },
    {
        "name": "Low-Fat Paneer Makhani (No Heavy Cream)",
        "description": "Rich tasting butter paneer made healthy with a cashew-curd silky gravy.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 370,
        "protein": 24,
        "carbs": 22,
        "fat": 20,
        "fiber": 4,
        "servingSize": "250g curry",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "nuts"
        ],
        "ingredients": [
            "180g Paneer",
            "4 boiled Tomatoes pureed",
            "8 soaked Cashews blended",
            "Kasuri methi",
            "1 tsp Butter"
        ],
        "steps": [
            "Simmer tomato-cashew puree with Kashmiri chilli and cardamom.",
            "Add paneer cubes and crushed kasuri methi.",
            "Garnish with a spoonful of milk froth instead of heavy cream."
        ],
        "seasons": [
            "post_monsoon",
            "winter",
            "all"
        ],
        "tags": [
            "festive",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Cottage Cheese Sweet Bowl with Honey & Walnuts",
        "description": "Creamy dessert-style protein snack with crushed nuts and cinnamon.",
        "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
        "calories": 280,
        "protein": 21,
        "carbs": 20,
        "fat": 13,
        "fiber": 2,
        "servingSize": "200g bowl",
        "mealType": "Snack",
        "prepTimeMin": 5,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "nuts"
        ],
        "ingredients": [
            "180g Low fat Cottage cheese or fresh Chenna",
            "1 tbsp Honey",
            "15g Chopped Walnuts",
            "1/4 tsp Cinnamon powder"
        ],
        "steps": [
            "Whisk cottage cheese until smooth and creamy.",
            "Top with chopped walnuts and honey drizzle.",
            "Dust with ground cinnamon and serve cold."
        ],
        "seasons": [
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "festive",
            "high_protein",
            "sweet"
        ]
    },
    {
        "name": "Paneer Stuffed Capsicum",
        "description": "Whole roasted bell peppers packed with a savory filling of spiced paneer and peas.",
        "imageUrl": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500",
        "calories": 320,
        "protein": 22,
        "carbs": 24,
        "fat": 15,
        "fiber": 6,
        "servingSize": "2 stuffed capsicums",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "2 medium Green Capsicums",
            "160g crumbled Paneer",
            "1/4 cup boiled Green Peas",
            "Chaat masala, Cumin"
        ],
        "steps": [
            "Hollow capsicums from the top.",
            "Saute crumbled paneer with peas and spices.",
            "Stuff the capsicums and air-fry or bake at 190C for 15 minutes."
        ],
        "seasons": [
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Paneer Oats Porridge (Savory Upma Style)",
        "description": "Rolled oats tempered with mustard seeds and curry leaves, topped with seared paneer.",
        "imageUrl": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
        "calories": 360,
        "protein": 24,
        "carbs": 38,
        "fat": 12,
        "fiber": 6,
        "servingSize": "1 large bowl",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "50g Rolled Oats",
            "130g Paneer cubes",
            "Mustard seeds, Curry leaves, Green chilli",
            "Diced carrots and peas"
        ],
        "steps": [
            "Heat 1 tsp oil, splutter mustard seeds and curry leaves.",
            "Saute veggies, add 1.5 cups water and oats.",
            "Stir in paneer cubes and simmer until thick and porridge-like."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "all"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Soya Chunks Curry with Basmati Rice",
        "description": "Juicy plant-protein soya nuggets simmered in a homestyle tomato onion masala.",
        "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        "calories": 410,
        "protein": 34,
        "carbs": 52,
        "fat": 6,
        "fiber": 10,
        "servingSize": "60g dry soya + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "60g Soya Chunks (dry)",
            "1 Onion, 1 Tomato",
            "Ginger-garlic paste",
            "Coriander & Garam masala",
            "1 cup Cooked Rice"
        ],
        "steps": [
            "Boil soya chunks in salted water for 6 mins, squeeze out excess water completely.",
            "Saute onions, ginger-garlic, tomatoes, and ground spices.",
            "Add soya chunks and 1 cup water, simmer for 10 mins.",
            "Serve with hot basmati rice."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "all"
        ],
        "tags": [
            "high_protein",
            "comfort",
            "warming"
        ]
    },
    {
        "name": "Spicy Soya Chunks Dry Fry (Bhuna)",
        "description": "Dry roasted soya nuggets coated in caramelized onions and black pepper masala.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 280,
        "protein": 32,
        "carbs": 24,
        "fat": 5,
        "fiber": 9,
        "servingSize": "1 large bowl",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "60g Soya chunks",
            "2 large Sliced Onions",
            "1 tbsp crushed Black Pepper",
            "Curry leaves",
            "1 tsp Mustard oil"
        ],
        "steps": [
            "Boil and squeeze soya chunks.",
            "Heat mustard oil, fry curry leaves and onions until deep brown.",
            "Add soya, black pepper, turmeric, and roast on medium flame until crispy."
        ],
        "seasons": [
            "monsoon",
            "winter"
        ],
        "tags": [
            "warming",
            "high_protein",
            "spicy"
        ]
    },
    {
        "name": "Tofu Scramble with Turmeric & Sourdough",
        "description": "Crumbled organic tofu seasoned with nutritional yeast, kala namak, and greens.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 330,
        "protein": 26,
        "carbs": 30,
        "fat": 11,
        "fiber": 5,
        "servingSize": "200g tofu scramble + 1 toast",
        "mealType": "Breakfast",
        "prepTimeMin": 12,
        "dietType": "Vegan",
        "allergies": [
            "soy",
            "gluten"
        ],
        "ingredients": [
            "200g Firm Tofu pressed",
            "1/2 tsp Turmeric",
            "1/4 tsp Kala namak (black salt)",
            "Chopped Spinach & Bell peppers",
            "1 slice Sourdough Toast"
        ],
        "steps": [
            "Crumble pressed tofu with a fork.",
            "Saute peppers and spinach in a pan for 2 mins.",
            "Add crumbled tofu, turmeric, black salt, and nutritional yeast.",
            "Stir 4 minutes and serve over toasted sourdough."
        ],
        "seasons": [
            "all",
            "winter"
        ],
        "tags": [
            "warming",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Tofu & Mixed Veggies Coconut Curry",
        "description": "Golden tofu cubes in a mildly spiced coconut and lemongrass fragrant broth.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 390,
        "protein": 24,
        "carbs": 26,
        "fat": 22,
        "fiber": 6,
        "servingSize": "1 bowl curry with noodles",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "180g Firm Tofu pan-fried",
            "100ml Light Coconut milk",
            "Zucchini, Carrots, Beans",
            "Thai yellow or Indian curry paste"
        ],
        "steps": [
            "Pan-sear cubed tofu until crispy on edges.",
            "Simmer curry paste and coconut milk with chopped vegetables for 8 mins.",
            "Fold in crispy tofu cubes and garnish with fresh basil."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Soya Keema Matar with Whole Wheat Pav",
        "description": "Minced textured vegetable protein cooked like street-style Mumbai keema.",
        "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        "calories": 380,
        "protein": 31,
        "carbs": 46,
        "fat": 7,
        "fiber": 11,
        "servingSize": "200g keema + 2 pavs",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy",
            "gluten"
        ],
        "ingredients": [
            "50g Soya granules (dry)",
            "1/3 cup Green Peas",
            "1 Onion, 1 Tomato",
            "Pav Bhaji or Garam Masala",
            "2 Whole Wheat Pavs"
        ],
        "steps": [
            "Soak soya granules in hot water for 10 mins, rinse and drain.",
            "Cook onions, ginger, tomatoes, and peas with spices until fragrant.",
            "Stir in soya granules, add a splash of water, simmer for 7 mins.",
            "Serve with toasted pav and onion wedges."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "post_monsoon"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Crispy Air-Fried Sesame Tofu",
        "description": "Crunchy bite-sized tofu tossed in garlic, tamari, and toasted sesame seeds.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 270,
        "protein": 22,
        "carbs": 12,
        "fat": 15,
        "fiber": 3,
        "servingSize": "180g serving",
        "mealType": "Snack",
        "prepTimeMin": 18,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "180g Extra Firm Tofu",
            "1 tbsp Cornstarch",
            "1 tbsp Low-sodium Tamari",
            "1 tsp Sesame oil & seeds",
            "Chilli flakes"
        ],
        "steps": [
            "Cut tofu into cubes, coat gently with tamari and cornstarch.",
            "Air-fry at 200C for 14 minutes shaking halfway.",
            "Toss with sesame oil, seeds, and spring onion greens."
        ],
        "seasons": [
            "monsoon",
            "winter",
            "all"
        ],
        "tags": [
            "crispy",
            "snack",
            "high_protein"
        ]
    },
    {
        "name": "High-Protein Soya Pulao",
        "description": "Aromatic basmati rice cooked with whole spices, veggies, and mini soya nuggets.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 420,
        "protein": 28,
        "carbs": 62,
        "fat": 5,
        "fiber": 8,
        "servingSize": "1 plate (300g)",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "45g Mini Soya chunks",
            "60g Basmati Rice",
            "Star anise, Bay leaf, Cloves",
            "Diced carrots, beans, onions"
        ],
        "steps": [
            "Boil and squeeze soya chunks.",
            "In a cooker, saute whole spices, sliced onions, and veggies.",
            "Add soaked rice, soya, water (1:2 ratio), and pressure cook for 1 whistle."
        ],
        "seasons": [
            "monsoon",
            "winter",
            "all"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Soya Tikki / Kebabs (High Protein Patties)",
        "description": "Oven-baked soya and potato cutlets flavored with mint, coriander, and amchur.",
        "imageUrl": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500",
        "calories": 290,
        "protein": 26,
        "carbs": 32,
        "fat": 5,
        "fiber": 9,
        "servingSize": "4 tikkis",
        "mealType": "Snack",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "50g Soya granules",
            "1 small boiled Potato for binding",
            "Roasted Jeera, Amchur powder",
            "Fresh Coriander, Green chillies"
        ],
        "steps": [
            "Blend boiled soya granules into a coarse paste.",
            "Mash with boiled potato, spices, and chopped herbs.",
            "Shape into 4 flat patties and shallow fry or air fry for 12 mins."
        ],
        "seasons": [
            "monsoon",
            "post_monsoon"
        ],
        "tags": [
            "festive",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Tofu Tikka Masala with Phulkas",
        "description": "Smoky baked tofu cubes served in a rich spiced onion tomato gravy.",
        "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "calories": 380,
        "protein": 25,
        "carbs": 45,
        "fat": 12,
        "fiber": 7,
        "servingSize": "200g curry + 2 phulkas",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy",
            "gluten"
        ],
        "ingredients": [
            "180g Firm Tofu cubes",
            "Tikka marinade spices",
            "Onion-tomato gravy",
            "2 Whole wheat Phulkas"
        ],
        "steps": [
            "Marinate tofu with spices and roast on tawa for 6 mins.",
            "Add to simmering spiced gravy.",
            "Serve hot with whole wheat phulkas."
        ],
        "seasons": [
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "festive",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Soya Manchurian (Indo-Chinese Style)",
        "description": "Crispy soya chunks tossed in dark soy sauce, vinegar, garlic, and spring onions.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 310,
        "protein": 30,
        "carbs": 28,
        "fat": 7,
        "fiber": 8,
        "servingSize": "1 large bowl",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "50g Soya chunks",
            "1 tbsp Soy sauce",
            "1 tsp Vinegar & Chilli sauce",
            "Minced Garlic & Ginger",
            "Spring onions"
        ],
        "steps": [
            "Boil, squeeze, and pan-crisp soya chunks with 1 tsp cornstarch.",
            "Saute plenty of garlic, ginger, and green chillies in a wok.",
            "Add sauces, toss soya chunks to coat, top with spring onions."
        ],
        "seasons": [
            "monsoon",
            "winter"
        ],
        "tags": [
            "comfort",
            "spicy",
            "high_protein"
        ]
    },
    {
        "name": "Tofu Buddha Bowl with Peanut Dressing",
        "description": "Nourishing bowl of quinoa, steamed edamame, purple cabbage, and grilled tofu.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 430,
        "protein": 28,
        "carbs": 45,
        "fat": 16,
        "fiber": 9,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy",
            "nuts"
        ],
        "ingredients": [
            "160g Tofu",
            "1/2 cup Cooked Quinoa",
            "Shredded Cabbage, Cucumber, Carrots",
            "1 tbsp Peanut butter dressing"
        ],
        "steps": [
            "Pan-grill tofu cubes until browned.",
            "Arrange quinoa, raw crunchy vegetables, and warm tofu in segments.",
            "Drizzle creamy peanut-lime dressing over the top."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "Soya Biryani with Cucumber Raita (Vegan Style)",
        "description": "Fragrant layered basmati rice infused with saffron, caramelized onions, and juicy soya.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 440,
        "protein": 30,
        "carbs": 64,
        "fat": 7,
        "fiber": 9,
        "servingSize": "350g biryani",
        "mealType": "Lunch",
        "prepTimeMin": 30,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "50g Soya chunks marinated in biryani spices",
            "65g Basmati rice parboiled",
            "Mint, Saffron water, Fried onions"
        ],
        "steps": [
            "Cook spiced soya chunks in a pot with biryani masala.",
            "Layer half-cooked basmati rice on top with mint and saffron.",
            "Cover tight and 'dum' cook on low flame for 12 minutes."
        ],
        "seasons": [
            "post_monsoon",
            "summer",
            "all"
        ],
        "tags": [
            "festive",
            "high_protein",
            "comfort"
        ]
    },
    {
        "name": "Chilli Garlic Tofu with Stir-Fried Noodles",
        "description": "Seared tofu cubes tossed with whole wheat noodles, bok choy, and spicy schezwan sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 420,
        "protein": 26,
        "carbs": 55,
        "fat": 11,
        "fiber": 6,
        "servingSize": "1 plate",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy",
            "gluten"
        ],
        "ingredients": [
            "160g Tofu",
            "60g Whole wheat noodles",
            "Bok choy or Cabbage",
            "Chilli garlic paste, Soy sauce"
        ],
        "steps": [
            "Boil noodles al dente.",
            "Sear tofu cubes in a smoking wok with sesame oil.",
            "Add greens, sauce, noodles and toss vigorously for 2 mins."
        ],
        "seasons": [
            "monsoon",
            "winter"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Soya Methi Saag with Makki Roti",
        "description": "Traditional winter fenugreek greens cooked with protein soya chunks and maize flatbread.",
        "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        "calories": 390,
        "protein": 28,
        "carbs": 48,
        "fat": 9,
        "fiber": 10,
        "servingSize": "200g saag + 1 makki roti",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "45g Soya chunks",
            "2 cups Fresh Methi and Mustard greens",
            "Ginger, Garlic, Green chillies",
            "1 Makki (Cornmeal) roti"
        ],
        "steps": [
            "Puree blanched greens coarsely.",
            "Saute with generous garlic and ginger, add boiled soya chunks.",
            "Simmer for 10 mins and serve with rustic warm makki roti."
        ],
        "seasons": [
            "winter"
        ],
        "tags": [
            "warming",
            "traditional",
            "high_protein"
        ]
    },
    {
        "name": "Teriyaki Tofu Steaks with Steamed Jasmine Rice",
        "description": "Thick cut tofu steaks glazed in sweet savory teriyaki sauce with steamed broccoli.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 370,
        "protein": 25,
        "carbs": 44,
        "fat": 10,
        "fiber": 4,
        "servingSize": "2 slabs tofu + 1 cup rice",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "180g Extra firm Tofu slabs",
            "2 tbsp Teriyaki sauce",
            "1 cup Steamed Rice",
            "Steamed Broccoli florets"
        ],
        "steps": [
            "Score tofu steaks lightly and pan-fry on each side for 4 mins.",
            "Pour teriyaki sauce into pan, let it reduce and coat the steaks.",
            "Plate beside fragrant jasmine rice and broccoli."
        ],
        "seasons": [
            "all",
            "spring"
        ],
        "tags": [
            "light",
            "high_protein",
            "lean"
        ]
    },
    {
        "name": "Sprouted Moong & Kala Chana Chaat",
        "description": "Tangy protein-dense salad of steamed sprouts, onions, tomatoes, and lemon chaat masala.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 280,
        "protein": 19,
        "carbs": 44,
        "fat": 3,
        "fiber": 12,
        "servingSize": "250g bowl",
        "mealType": "Breakfast",
        "prepTimeMin": 10,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "1 cup Sprouted Green Moong",
            "1/2 cup Boiled Kala Chana",
            "Diced Cucumber, Tomato, Onion",
            "Chaat Masala, Lemon juice, Green chilli"
        ],
        "steps": [
            "Steam sprouts lightly for 3 minutes (or keep raw for extra crunch).",
            "Toss in a bowl with diced tomatoes, onions, cucumbers, and coriander.",
            "Add lemon juice and chaat masala, mix well."
        ],
        "seasons": [
            "summer",
            "spring",
            "monsoon"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein",
            "fiber"
        ]
    },
    {
        "name": "High-Protein Dal Tadka with Jeera Rice",
        "description": "Toor and yellow moong dal tempered with ghee, garlic, hing, and cumin seeds.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 390,
        "protein": 20,
        "carbs": 62,
        "fat": 7,
        "fiber": 9,
        "servingSize": "1 bowl dal + 1 cup jeera rice",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "70g Mixed Toor & Moong dal (dry)",
            "1 cup Cooked Jeera Rice",
            "1 tsp Ghee, Cumin, Hing",
            "Garlic, Tomato, Green chilli"
        ],
        "steps": [
            "Pressure cook dal with turmeric and salt until creamy.",
            "Prepare tadka: heat ghee, crackle cumin, add chopped garlic and tomatoes.",
            "Pour sizzling tadka over dal and serve alongside jeera rice."
        ],
        "seasons": [
            "all",
            "monsoon",
            "winter"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Pindi Chana with Whole Wheat Bhatura / Toast",
        "description": "Dark, spicy Amritsari chickpeas infused with tea bag decoction and anardana.",
        "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        "calories": 410,
        "protein": 21,
        "carbs": 65,
        "fat": 7,
        "fiber": 14,
        "servingSize": "1 bowl chana + 2 toasts",
        "mealType": "Lunch",
        "prepTimeMin": 30,
        "dietType": "Vegan",
        "allergies": [
            "gluten"
        ],
        "ingredients": [
            "1.5 cups Boiled Chickpeas (Kabuli Chana)",
            "Anardana (pomegranate seed) powder",
            "Chana Masala, Amchur",
            "Ginger juliennes, Green chillies"
        ],
        "steps": [
            "Boil soaked chickpeas with black tea bag for rich dark color.",
            "Cook chickpeas with roasted spice powders and splash of cooking water.",
            "Simmer until dry and aromatic, garnish with ginger juliennes."
        ],
        "seasons": [
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "comfort",
            "festive",
            "high_protein"
        ]
    },
    {
        "name": "Rajma Masala with Steamed Rice",
        "description": "Slow-cooked Kashmiri red kidney beans in an aromatic ginger-tomato curry.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 430,
        "protein": 22,
        "carbs": 70,
        "fat": 6,
        "fiber": 13,
        "servingSize": "1 bowl rajma + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 35,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "80g Raw Kidney beans (Rajma) soaked",
            "Onion-tomato gravy base",
            "Ginger, Garlic, Garam masala",
            "1 cup Cooked Basmati Rice"
        ],
        "steps": [
            "Pressure cook soaked rajma until melt-in-mouth soft.",
            "Saute onion, tomato, and spices in a pan until oil separates.",
            "Add boiled rajma, mash a few beans to thicken gravy, simmer for 15 mins."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "all"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Mediterranean Chickpea & Quinoa Salad",
        "description": "Kalamata olives, crisp cucumbers, chickpeas, and fresh parsley with lemon vinaigrette.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 360,
        "protein": 18,
        "carbs": 52,
        "fat": 10,
        "fiber": 11,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 15,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "1 cup Boiled Chickpeas",
            "1/2 cup Cooked Quinoa",
            "Diced Cucumber, Cherry Tomatoes, Olives",
            "Extra Virgin Olive Oil, Lemon juice, Oregano"
        ],
        "steps": [
            "Combine cooked quinoa and drained chickpeas in a large salad bowl.",
            "Toss with chopped Mediterranean vegetables.",
            "Whisk olive oil, lemon juice, salt, and oregano; pour over and chill."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "Moong Dal Khichdi with Curd & Flaxseeds",
        "description": "Comforting Ayurvedic one-pot blend of split yellow lentils and rice with ghee.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 380,
        "protein": 21,
        "carbs": 58,
        "fat": 8,
        "fiber": 8,
        "servingSize": "1 bowl khichdi + 100g curd",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "50g Moong dal split",
            "40g Rice",
            "1 tsp Ghee, Cumin, Hing",
            "100g Plain Curd",
            "1 tsp Roasted Flaxseed powder"
        ],
        "steps": [
            "Wash dal and rice, pressure cook with 3.5 cups water, turmeric, and salt for 3 whistles.",
            "Temper with ghee, cumin, and hing.",
            "Serve warm with cool probiotic curd and flaxseeds."
        ],
        "seasons": [
            "monsoon",
            "summer",
            "winter"
        ],
        "tags": [
            "comfort",
            "cooling",
            "digestive",
            "high_protein"
        ]
    },
    {
        "name": "Sprouted Methi & Moong Paratha",
        "description": "Whole wheat flatbread kneaded with blended sprout puree and fenugreek leaves.",
        "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
        "calories": 340,
        "protein": 17,
        "carbs": 54,
        "fat": 6,
        "fiber": 9,
        "servingSize": "2 parathas",
        "mealType": "Breakfast",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [
            "gluten"
        ],
        "ingredients": [
            "1 cup Sprouted Moong blended",
            "1 cup Whole wheat flour",
            "1/2 cup fresh Methi leaves",
            "Ajwain, Green chillies, Salt"
        ],
        "steps": [
            "Knead wheat flour with sprout puree, chopped methi, and spices into a pliable dough.",
            "Roll into round parathas.",
            "Cook on hot griddle with minimal oil until crisp."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "fiber",
            "high_protein"
        ]
    },
    {
        "name": "Black Eyed Peas (Lobia) Masala with Roti",
        "description": "Earthy cowpeas cooked in a flavorful Punjabi gravy with whole wheat rotis.",
        "imageUrl": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        "calories": 370,
        "protein": 21,
        "carbs": 60,
        "fat": 5,
        "fiber": 12,
        "servingSize": "200g curry + 2 rotis",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Vegan",
        "allergies": [
            "gluten"
        ],
        "ingredients": [
            "70g Raw Lobia soaked",
            "Onion, Tomato, Ginger-garlic",
            "Coriander, Cumin, Kasuri Methi",
            "2 Rotis"
        ],
        "steps": [
            "Pressure cook soaked lobia for 2 whistles.",
            "Simmer with spiced onion-tomato masala for 10 mins.",
            "Serve with hot phulkas."
        ],
        "seasons": [
            "all",
            "monsoon"
        ],
        "tags": [
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Lentil & Vegetable High-Protein Soup",
        "description": "Hearty European style brown lentil soup simmered with carrots, celery, and garlic.",
        "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
        "calories": 290,
        "protein": 19,
        "carbs": 46,
        "fat": 3,
        "fiber": 11,
        "servingSize": "1 large bowl (350ml)",
        "mealType": "Dinner",
        "prepTimeMin": 30,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "60g Brown or Green Lentils",
            "Carrots, Celery, Onions, Spinach",
            "Vegetable broth, Garlic, Thyme",
            "Black pepper, Lemon"
        ],
        "steps": [
            "Saute garlic, onions, celery, and carrots in a deep pot.",
            "Add lentils and vegetable broth, bring to boil and simmer 25 mins.",
            "Stir in baby spinach, season with lemon and black pepper."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "light",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Hummus with Spiced Chickpeas & Baked Pita",
        "description": "Creamy tahini garlic chickpea dip topped with warm cumin-roasted whole chickpeas.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 360,
        "protein": 17,
        "carbs": 48,
        "fat": 12,
        "fiber": 10,
        "servingSize": "100g hummus + 1 pita",
        "mealType": "Snack",
        "prepTimeMin": 15,
        "dietType": "Vegan",
        "allergies": [
            "gluten"
        ],
        "ingredients": [
            "1.5 cups Boiled Chickpeas",
            "2 tbsp Tahini (sesame paste)",
            "Garlic cloves, Lemon juice, Olive oil",
            "Whole wheat pita bread wedges"
        ],
        "steps": [
            "Blend chickpeas, tahini, garlic, lemon juice, and ice water until ultra-smooth.",
            "Spread in a shallow bowl, top with roasted paprika chickpeas.",
            "Serve with toasted whole wheat pita wedges."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "cooling",
            "snack",
            "high_protein"
        ]
    },
    {
        "name": "Edamame & Corn Chaat",
        "description": "Tender steamed green soybeans tossed with sweet corn, chaat masala, and lime.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 260,
        "protein": 20,
        "carbs": 28,
        "fat": 8,
        "fiber": 8,
        "servingSize": "1 bowl (200g)",
        "mealType": "Snack",
        "prepTimeMin": 10,
        "dietType": "Vegan",
        "allergies": [
            "soy"
        ],
        "ingredients": [
            "1.5 cups Shelled Edamame (green soy)",
            "1/2 cup Sweet Corn",
            "Chilli powder, Chaat masala",
            "Lemon juice, Coriander"
        ],
        "steps": [
            "Boil or steam shelled edamame and corn for 4 minutes.",
            "Drain and toss while warm with chaat masala and fresh lime.",
            "Enjoy as a quick high-protein snack."
        ],
        "seasons": [
            "summer",
            "monsoon"
        ],
        "tags": [
            "light",
            "snack",
            "high_protein"
        ]
    },
    {
        "name": "Chana Dal Stuffed Cheela",
        "description": "Golden mung bean crepes filled with coarsely crushed spiced Bengal gram.",
        "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "calories": 340,
        "protein": 21,
        "carbs": 50,
        "fat": 6,
        "fiber": 10,
        "servingSize": "2 cheelas",
        "mealType": "Breakfast",
        "prepTimeMin": 20,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "60g Moong dal batter",
            "1/2 cup Boiled and mashed Chana Dal",
            "Ginger, Green chillies, Cumin",
            "Salt, Turmeric"
        ],
        "steps": [
            "Prepare filling by sauteing mashed chana dal with cumin and ginger.",
            "Pour moong batter on a hot griddle to form a thin crepe.",
            "Add chana dal filling, fold over and toast until crisp."
        ],
        "seasons": [
            "monsoon",
            "winter",
            "all"
        ],
        "tags": [
            "comfort",
            "high_protein",
            "quick"
        ]
    },
    {
        "name": "Horsegram (Kulthi) Soup with Rice",
        "description": "Superfood South Indian Rasam made with iron and protein packed horsegram pulse.",
        "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
        "calories": 350,
        "protein": 22,
        "carbs": 58,
        "fat": 4,
        "fiber": 11,
        "servingSize": "1 large bowl rasam + rice",
        "mealType": "Dinner",
        "prepTimeMin": 30,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "50g Horsegram (Kulthi dal)",
            "Tamarind pulp, Pepper, Cumin",
            "Garlic, Mustard seeds, Curry leaves",
            "1 cup Cooked Rice"
        ],
        "steps": [
            "Pressure cook horsegram until tender, strain cooking broth.",
            "Boil broth with tamarind, tomatoes, crushed pepper, and cumin.",
            "Temper with mustard and garlic, serve hot over rice."
        ],
        "seasons": [
            "winter"
        ],
        "tags": [
            "warming",
            "traditional",
            "high_protein"
        ]
    },
    {
        "name": "Peanut & Sprout Salad with Pomegranate",
        "description": "Crunchy boiled raw peanuts tossed with green gram sprouts and juicy ruby pomegranate.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 330,
        "protein": 18,
        "carbs": 32,
        "fat": 15,
        "fiber": 7,
        "servingSize": "200g serving",
        "mealType": "Snack",
        "prepTimeMin": 10,
        "dietType": "Vegan",
        "allergies": [
            "nuts"
        ],
        "ingredients": [
            "1/2 cup Boiled raw Peanuts",
            "1 cup Moong sprouts",
            "1/3 cup Pomegranate pearls",
            "Lemon juice, Chaat masala"
        ],
        "steps": [
            "Combine boiled peanuts and fresh moong sprouts in a bowl.",
            "Mix in sweet pomegranate pearls for juicy contrast.",
            "Dress with lemon juice, black salt, and roasted cumin."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "crunchy",
            "high_protein"
        ]
    },
    {
        "name": "Lentil Shepherd's Pie (Vegan Protein Bake)",
        "description": "Rich brown lentil and vegetable stew topped with a golden crust of mashed sweet potato.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 380,
        "protein": 21,
        "carbs": 60,
        "fat": 6,
        "fiber": 12,
        "servingSize": "1 large slice",
        "mealType": "Dinner",
        "prepTimeMin": 35,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "1 cup Cooked Brown Lentils",
            "Diced carrots, peas, mushrooms",
            "Tomato paste, Rosemary",
            "1 large Sweet Potato mashed"
        ],
        "steps": [
            "Cook lentils and vegetables in a savory rosemary herb gravy.",
            "Transfer to a baking dish.",
            "Spread mashed sweet potato on top and bake at 200C for 20 mins until browned."
        ],
        "seasons": [
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Masala Egg Bhurji with Multigrain Toast",
        "description": "Classic Indian spiced scrambled eggs with chopped onions, tomatoes, and green chillies.",
        "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
        "calories": 340,
        "protein": 24,
        "carbs": 26,
        "fat": 16,
        "fiber": 4,
        "servingSize": "3 whole eggs + 2 toasts",
        "mealType": "Breakfast",
        "prepTimeMin": 12,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "3 Whole Eggs whisked",
            "1 Onion, 1 Tomato finely chopped",
            "Green chillies, Turmeric, Cumin",
            "2 slices Multigrain Bread"
        ],
        "steps": [
            "Saute onions, green chillies, and tomatoes in 1 tsp oil.",
            "Pour in whisked eggs with a pinch of turmeric and salt.",
            "Scramble vigorously on medium heat for 3 minutes.",
            "Serve alongside toasted multigrain bread."
        ],
        "seasons": [
            "all",
            "winter",
            "monsoon"
        ],
        "tags": [
            "quick",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Boiled Eggs (3) with Spiced Hummus & Avocado",
        "description": "Perfect medium boiled eggs served with creamy chickpea dip and sliced avocado.",
        "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500",
        "calories": 350,
        "protein": 22,
        "carbs": 16,
        "fat": 22,
        "fiber": 6,
        "servingSize": "3 boiled eggs + toppings",
        "mealType": "Breakfast",
        "prepTimeMin": 10,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "3 Large Eggs",
            "2 tbsp Hummus",
            "1/4 sliced Avocado",
            "Everything bagel seasoning or Chaat masala"
        ],
        "steps": [
            "Boil eggs for 7 minutes in water, transfer to ice bath, peel.",
            "Halve eggs, plate with 2 dollops of hummus and avocado slices.",
            "Sprinkle seasoning over yolks and serve."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "light",
            "cooling",
            "high_protein"
        ]
    },
    {
        "name": "Punjabi Egg Curry with Steamed Rice",
        "description": "Hard-boiled eggs shallow fried in turmeric and simmered in a spiced onion gravy.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 420,
        "protein": 22,
        "carbs": 48,
        "fat": 16,
        "fiber": 5,
        "servingSize": "3 eggs in gravy + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "3 Boiled Eggs prickled with fork",
            "1 Onion, 2 Tomatoes pureed",
            "Ginger-garlic, Garam Masala",
            "1 cup Cooked Basmati Rice"
        ],
        "steps": [
            "Pan-sear boiled eggs in 1/2 tsp oil with turmeric until golden blistered.",
            "Prepare aromatic onion-tomato curry base in the same pan.",
            "Add eggs and 1/2 cup water, simmer 5 mins, serve with warm rice."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "post_monsoon"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Spanish Spinach & Mushroom Omelette (Tortilla)",
        "description": "Thick fluffy open-face omelette packed with baby spinach, sauteed mushrooms, and herbs.",
        "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500",
        "calories": 310,
        "protein": 23,
        "carbs": 10,
        "fat": 19,
        "fiber": 3,
        "servingSize": "1 large omelette (3 eggs)",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "3 Whole Eggs",
            "1 cup Sliced Mushrooms",
            "1 cup Baby Spinach",
            "1 clove Garlic, Black pepper, Salt"
        ],
        "steps": [
            "Saute mushrooms and garlic until caramelized, wilt spinach.",
            "Pour whisked eggs seasoned with salt and pepper over vegetables.",
            "Cook on low flame until set, flip gently or finish under broiler."
        ],
        "seasons": [
            "all",
            "spring"
        ],
        "tags": [
            "high_protein",
            "light"
        ]
    },
    {
        "name": "Egg White Veggie Scramble with Avocado Toast",
        "description": "Low fat, high protein scramble of 5 egg whites paired with creamy avocado sourdough.",
        "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
        "calories": 320,
        "protein": 27,
        "carbs": 26,
        "fat": 12,
        "fiber": 5,
        "servingSize": "5 egg whites + 1 toast",
        "mealType": "Breakfast",
        "prepTimeMin": 12,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "5 Egg Whites + 1 Whole Egg",
            "Diced Bell Peppers, Spinach, Onions",
            "1 slice Sourdough Bread",
            "1/4 Avocado mashed"
        ],
        "steps": [
            "Saute diced peppers and spinach for 2 mins.",
            "Add egg whites and scramble softly on medium-low heat.",
            "Spread mashed avocado on toasted sourdough and top with scramble."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "light",
            "high_protein",
            "clean"
        ]
    },
    {
        "name": "Egg Fried Rice with Extra Veggies",
        "description": "Fluffy basmati rice stir-fried in a hot wok with 3 scrambled eggs, carrots, and spring onions.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 430,
        "protein": 23,
        "carbs": 58,
        "fat": 12,
        "fiber": 5,
        "servingSize": "1 large bowl (300g)",
        "mealType": "Dinner",
        "prepTimeMin": 15,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "soy"
        ],
        "ingredients": [
            "3 Whole Eggs",
            "1 cup Cooked cold Basmati Rice",
            "Diced Carrots, Green beans, Spring onions",
            "1 tbsp Soy sauce, 1 tsp Sesame oil"
        ],
        "steps": [
            "Scramble eggs softly in wok and set aside.",
            "Stir-fry vegetables on high flame with garlic for 2 mins.",
            "Add cold rice, soy sauce, and cooked eggs; toss vigorously."
        ],
        "seasons": [
            "all",
            "monsoon"
        ],
        "tags": [
            "quick",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Shakshuka (North African Poached Eggs in Tomato Stew)",
        "description": "Eggs gently poached in a simmering skillet of spiced tomatoes, bell peppers, and cumin.",
        "imageUrl": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=500",
        "calories": 340,
        "protein": 21,
        "carbs": 24,
        "fat": 18,
        "fiber": 5,
        "servingSize": "3 eggs in stew + 1 toast",
        "mealType": "Breakfast",
        "prepTimeMin": 20,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "3 Fresh Eggs",
            "1 can Crushed Tomatoes",
            "1 Bell pepper, 1 Onion",
            "Smoked Paprika, Cumin, Garlic",
            "1 slice Crusty Bread"
        ],
        "steps": [
            "Cook onions, peppers, and garlic with paprika and cumin until tender.",
            "Add tomatoes and simmer into a thick chunky sauce.",
            "Make 3 wells, crack eggs inside, cover pan and cook 5 mins until whites set."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Egg & Cheese Breakfast Quesadilla",
        "description": "Crispy toasted tortilla stuffed with scrambled eggs, cheddar, and fresh salsa.",
        "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
        "calories": 390,
        "protein": 26,
        "carbs": 30,
        "fat": 18,
        "fiber": 4,
        "servingSize": "1 whole quesadilla",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "3 Eggs scrambled",
            "30g Shredded Mozzarella or Cheddar",
            "1 Whole wheat Tortilla",
            "Fresh Pico de gallo salsa"
        ],
        "steps": [
            "Scramble eggs softly.",
            "Place tortilla in pan, scatter cheese and warm scrambled eggs on one half.",
            "Fold over and toast until golden and cheese is melted."
        ],
        "seasons": [
            "all",
            "winter"
        ],
        "tags": [
            "comfort",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Chettinad Spicy Egg Roast with Parotta",
        "description": "Fiery South Indian dry roast with boiled eggs, black pepper, and curry leaves.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 410,
        "protein": 22,
        "carbs": 45,
        "fat": 17,
        "fiber": 5,
        "servingSize": "3 eggs + 1 wheat parotta",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "3 Hard-boiled Eggs sliced",
            "2 Sliced Onions, 1 Tomato",
            "Chettinad pepper masala, Curry leaves",
            "1 Wheat Parotta or 2 Rotis"
        ],
        "steps": [
            "Caramelize onions with curry leaves and ginger.",
            "Add tomatoes and freshly ground pepper-fennel Chettinad masala.",
            "Toss boiled eggs gently in the thick paste until coated."
        ],
        "seasons": [
            "monsoon",
            "winter"
        ],
        "tags": [
            "warming",
            "spicy",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Avocado Egg Salad Wrap",
        "description": "Chopped boiled eggs combined with creamy mashed avocado, Dijon mustard, and celery.",
        "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
        "calories": 360,
        "protein": 22,
        "carbs": 28,
        "fat": 18,
        "fiber": 6,
        "servingSize": "1 large wrap",
        "mealType": "Lunch",
        "prepTimeMin": 10,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "3 Boiled Eggs chopped",
            "1/2 Ripe Avocado mashed",
            "1 tsp Dijon mustard, Lemon juice",
            "Chopped Celery, Romaine lettuce",
            "1 Whole wheat wrap"
        ],
        "steps": [
            "Mash avocado with lemon juice, mustard, salt, and pepper.",
            "Fold in chopped boiled eggs and crunchy celery.",
            "Spoon into a whole wheat wrap lined with lettuce, roll and enjoy."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "French Style Rolled Herb Omelette with Mushrooms",
        "description": "Velvety French rolled omelette studded with fresh chives, parsley, and sauteed garlic mushrooms.",
        "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500",
        "calories": 290,
        "protein": 21,
        "carbs": 6,
        "fat": 20,
        "fiber": 2,
        "servingSize": "1 rolled omelette",
        "mealType": "Breakfast",
        "prepTimeMin": 10,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "dairy"
        ],
        "ingredients": [
            "3 Large Eggs",
            "1 tsp Butter",
            "Fresh Chives, Parsley, Tarragon",
            "1/2 cup Sauteed Button Mushrooms"
        ],
        "steps": [
            "Whisk eggs thoroughly with salt and pepper.",
            "Melt butter in non-stick pan over medium heat, pour eggs, shake pan rapidly while stirring with fork.",
            "Add herbs and mushrooms, roll smoothly into an oval cylinder."
        ],
        "seasons": [
            "spring",
            "summer",
            "all"
        ],
        "tags": [
            "light",
            "clean",
            "high_protein"
        ]
    },
    {
        "name": "Egg White Oats Pancake with Berry Compote",
        "description": "Fluffy protein pancakes made from blended oats and egg whites with warm blueberries.",
        "imageUrl": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
        "calories": 330,
        "protein": 25,
        "carbs": 46,
        "fat": 5,
        "fiber": 6,
        "servingSize": "3 pancakes",
        "mealType": "Breakfast",
        "prepTimeMin": 15,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "gluten"
        ],
        "ingredients": [
            "4 Egg Whites + 1 Whole Egg",
            "50g Rolled Oats ground",
            "1/2 tsp Baking powder, Cinnamon",
            "1/2 cup Warm simmered Blueberries"
        ],
        "steps": [
            "Blend oats, eggs, cinnamon, and baking powder into a smooth batter.",
            "Ladle onto a hot pan and cook 2 mins per side until bubbles form.",
            "Stack and pour warm crushed blueberries over the top."
        ],
        "seasons": [
            "all",
            "spring"
        ],
        "tags": [
            "sweet",
            "high_protein",
            "clean"
        ]
    },
    {
        "name": "Hard Boiled Egg Chaat with Mint Chutney",
        "description": "Street-style tangy snack of sliced eggs layered with spicy mint-coriander chutney.",
        "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500",
        "calories": 240,
        "protein": 19,
        "carbs": 8,
        "fat": 15,
        "fiber": 2,
        "servingSize": "3 boiled eggs",
        "mealType": "Snack",
        "prepTimeMin": 8,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "3 Hard-boiled Eggs sliced",
            "2 tbsp Spicy Mint Coriander chutney",
            "Chopped Onions, Chaat masala, Lemon"
        ],
        "steps": [
            "Arrange boiled egg halves on a plate.",
            "Top with finely diced onions and drizzle spicy green chutney.",
            "Dust with chaat masala and squeeze fresh lime."
        ],
        "seasons": [
            "summer",
            "monsoon",
            "all"
        ],
        "tags": [
            "cooling",
            "snack",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Egg & Soya Keema Fusion Bowl",
        "description": "Double protein powerhouse combining textured soya mince with 2 sunny side up eggs.",
        "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
        "calories": 420,
        "protein": 36,
        "carbs": 32,
        "fat": 16,
        "fiber": 8,
        "servingSize": "1 large bowl",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs",
            "soy"
        ],
        "ingredients": [
            "40g Soya granules cooked keema style",
            "2 Eggs fried sunny side up",
            "1 Whole wheat roti or brown rice"
        ],
        "steps": [
            "Cook spiced soya keema with onions, peas, and tomatoes.",
            "Fry 2 eggs sunny side up with runny yolks in a separate pan.",
            "Bowl the soya keema and place eggs on top so yolk coats the keema."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Egg & Lentil Kedgeree Bowl",
        "description": "Anglo-Indian seasoned rice and yellow lentils topped with halved soft-boiled eggs.",
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "calories": 390,
        "protein": 23,
        "carbs": 52,
        "fat": 11,
        "fiber": 6,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "Eggitarian",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "2 Soft-boiled Eggs",
            "1 cup Cooked Basmati Rice & Lentils",
            "Curry powder, Mustard seeds, Parsley",
            "Green peas"
        ],
        "steps": [
            "Warm cooked rice and lentils with curry powder and peas.",
            "Top with soft-boiled eggs cut in halves.",
            "Garnish with fresh parsley and a squeeze of lemon."
        ],
        "seasons": [
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Tandoori Grilled Chicken Breast with Salad",
        "description": "Juicy chicken breast marinated in yogurt and tandoori spices, grilled char-broiled.",
        "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
        "calories": 360,
        "protein": 48,
        "carbs": 8,
        "fat": 14,
        "fiber": 3,
        "servingSize": "220g cooked breast + salad",
        "mealType": "Dinner",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "250g Skinless Chicken Breast",
            "3 tbsp Greek Yogurt",
            "1 tbsp Tandoori Masala, Kashmiri Chilli",
            "Ginger-garlic paste, Lemon juice"
        ],
        "steps": [
            "Cut deep slashes in chicken breast, rub with lemon, salt, and ginger-garlic.",
            "Coat in spiced yogurt marinade and rest 15 mins.",
            "Grill in a hot skillet for 6-7 minutes per side until internal temp is 75C.",
            "Rest 5 minutes before slicing; serve with green salad."
        ],
        "seasons": [
            "all",
            "summer",
            "post_monsoon"
        ],
        "tags": [
            "grilled",
            "lean",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Tikka Masala with Brown Basmati Rice",
        "description": "Oven-roasted chicken chunks simmered in a light tomato-fenugreek spiced gravy.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        "calories": 450,
        "protein": 42,
        "carbs": 46,
        "fat": 12,
        "fiber": 5,
        "servingSize": "220g curry + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 30,
        "dietType": "NonVeg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "200g Chicken Breast cubes",
            "Tikka marinade",
            "Onion-tomato gravy base",
            "1 cup Cooked Brown Rice",
            "Kasuri methi"
        ],
        "steps": [
            "Pan-sear marinated chicken pieces on high heat.",
            "Simmer with tomato-onion gravy and crushed fenugreek leaves.",
            "Serve with wholesome brown basmati rice."
        ],
        "seasons": [
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "festive",
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Keema Matar with Whole Wheat Phulkas",
        "description": "Lean minced chicken breast cooked with sweet green peas and whole fragrant spices.",
        "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        "calories": 410,
        "protein": 44,
        "carbs": 38,
        "fat": 10,
        "fiber": 6,
        "servingSize": "200g keema + 2 phulkas",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "NonVeg",
        "allergies": [
            "gluten"
        ],
        "ingredients": [
            "220g Lean Minced Chicken (Keema)",
            "1/3 cup Green Peas",
            "1 Onion, 1 Tomato",
            "Coriander, Cumin, Garam masala",
            "2 Phulkas"
        ],
        "steps": [
            "Saute whole spices and chopped onions in 1 tsp oil.",
            "Add ginger-garlic, tomatoes, and ground chicken mince.",
            "Cook on high heat breaking clumps, add peas, simmer 10 mins.",
            "Serve with warm phulkas."
        ],
        "seasons": [
            "winter",
            "monsoon"
        ],
        "tags": [
            "comfort",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Herb & Garlic Grilled Chicken with Quinoa & Veggies",
        "description": "Tender chicken breast seared with rosemary, thyme, garlic, and fluffy quinoa.",
        "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
        "calories": 420,
        "protein": 45,
        "carbs": 38,
        "fat": 11,
        "fiber": 5,
        "servingSize": "1 plate",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "220g Chicken Breast",
            "1/2 cup Cooked Quinoa",
            "Steamed Zucchini & Green beans",
            "Fresh Rosemary, Thyme, Garlic, Olive oil"
        ],
        "steps": [
            "Pound chicken breast evenly, marinate in garlic, olive oil, and fresh herbs.",
            "Pan-grill 6 mins per side until golden.",
            "Serve over seasoned warm quinoa with steamed greens."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "clean",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Stir-Fry with Broccoli & Cashews",
        "description": "Wok-seared chicken strips and crisp broccoli florets in a savory ginger sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 390,
        "protein": 40,
        "carbs": 22,
        "fat": 16,
        "fiber": 5,
        "servingSize": "1 large bowl",
        "mealType": "Dinner",
        "prepTimeMin": 18,
        "dietType": "NonVeg",
        "allergies": [
            "soy",
            "nuts"
        ],
        "ingredients": [
            "200g Chicken Breast strips",
            "2 cups Broccoli florets",
            "15g Toasted Cashews",
            "Soy sauce, Garlic, Ginger, 1 tsp Sesame oil"
        ],
        "steps": [
            "Sear chicken strips in smoking wok with ginger and garlic.",
            "Toss in broccoli florets and splash of water to steam-fry.",
            "Add soy sauce and toasted cashews, stir on high flame for 2 mins."
        ],
        "seasons": [
            "all",
            "spring"
        ],
        "tags": [
            "light",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Shawarma Salad Bowl",
        "description": "Middle Eastern spiced chicken slices over crunchy romaine, cucumber, and garlic yogurt.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 370,
        "protein": 43,
        "carbs": 14,
        "fat": 16,
        "fiber": 4,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "220g Chicken Breast strips",
            "Shawarma spice mix (cumin, coriander, paprika, garlic)",
            "Romaine lettuce, Pickled cucumbers, Tomatoes",
            "2 tbsp Greek Yogurt garlic sauce"
        ],
        "steps": [
            "Marinate chicken in shawarma spices and olive oil, sear in cast iron skillet.",
            "Chop into thin gyro slices.",
            "Assemble on fresh crisp lettuce with diced veggies and drizzle garlic yogurt sauce."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "South Indian Pepper Chicken (Kozhi Milagu)",
        "description": "Dry rustic South Indian chicken tossed with freshly cracked black pepper and curry leaves.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        "calories": 380,
        "protein": 44,
        "carbs": 12,
        "fat": 16,
        "fiber": 3,
        "servingSize": "220g chicken portion",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "220g Boneless Chicken cubes",
            "2 tbsp coarsely ground Black Pepper",
            "Curry leaves, Mustard seeds, Shallots",
            "Ginger-garlic, Turmeric"
        ],
        "steps": [
            "Heat 1 tsp oil, splutter mustard seeds and curry leaves.",
            "Saute shallots, add chicken, turmeric, and ginger-garlic.",
            "Cook covered in its own juices, finish with lots of black pepper until dry and glossy."
        ],
        "seasons": [
            "monsoon",
            "winter"
        ],
        "tags": [
            "warming",
            "spicy",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Grilled Chicken Breast Burrito Bowl",
        "description": "Fiesta bowl with seasoned chicken, black beans, sweet corn, salsa, and brown rice.",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        "calories": 440,
        "protein": 42,
        "carbs": 48,
        "fat": 10,
        "fiber": 8,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "200g Chicken breast spiced with cumin & paprika",
            "1/2 cup Cooked Brown Rice",
            "1/3 cup Black beans",
            "Pico de gallo, Lime juice, Coriander"
        ],
        "steps": [
            "Grill seasoned chicken breast and dice into cubes.",
            "Assemble bowl: rice base, black beans, sweet corn, and diced chicken.",
            "Top with fresh tomato-onion pico de gallo and fresh cilantro."
        ],
        "seasons": [
            "all",
            "summer"
        ],
        "tags": [
            "comfort",
            "lean",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Sukka (Mangalorean Style)",
        "description": "Flavor-packed chicken cooked with dry roasted spices and fresh grated coconut.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        "calories": 420,
        "protein": 43,
        "carbs": 14,
        "fat": 21,
        "fiber": 5,
        "servingSize": "220g portion",
        "mealType": "Dinner",
        "prepTimeMin": 30,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "220g Chicken pieces",
            "2 tbsp Fresh grated Coconut roasted",
            "Mangalorean sukka masala",
            "Onions, Curry leaves, Tamarind"
        ],
        "steps": [
            "Dry roast coriander, cumin, dry chillies, and coconut; grind to paste.",
            "Cook chicken with onions and tamarind water until tender.",
            "Add roasted coconut spice blend and dry-roast on low flame until aromatic."
        ],
        "seasons": [
            "monsoon",
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "festive",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Lemon Herb Baked Chicken Thighs (Skinless)",
        "description": "Tender skinless chicken thighs marinated in oregano, garlic, and fresh lemon juice.",
        "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
        "calories": 370,
        "protein": 38,
        "carbs": 4,
        "fat": 22,
        "fiber": 1,
        "servingSize": "2 skinless thighs (220g)",
        "mealType": "Dinner",
        "prepTimeMin": 30,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "2 Skinless Boneless Chicken Thighs (220g)",
            "Juice of 1 Lemon",
            "1 tsp Dried Oregano, Minced Garlic",
            "1 tsp Olive oil, Sea salt"
        ],
        "steps": [
            "Marinate chicken thighs in lemon juice, garlic, oregano, and olive oil.",
            "Bake at 200C in an oven for 25 minutes until caramelized and tender.",
            "Rest 5 mins and serve with lemon wedges."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "light",
            "lean",
            "high_protein"
        ]
    },
    {
        "name": "Butter Chicken (Macro-Friendly Light Version)",
        "description": "Silky spiced tomato makhani sauce made without heavy cream, using hung curd.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        "calories": 410,
        "protein": 44,
        "carbs": 18,
        "fat": 16,
        "fiber": 4,
        "servingSize": "250g curry",
        "mealType": "Dinner",
        "prepTimeMin": 25,
        "dietType": "NonVeg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "220g Tandoori Chicken chunks",
            "Pureed ripe tomatoes",
            "6 Cashews soaked and blended",
            "Kasuri methi, Cardamom, 1 tsp Butter"
        ],
        "steps": [
            "Simmer pureed tomatoes with cashew paste and spices for 15 mins.",
            "Add pre-grilled tandoori chicken chunks.",
            "Finish with crushed kasuri methi and 1 tsp butter for aroma."
        ],
        "seasons": [
            "post_monsoon",
            "winter"
        ],
        "tags": [
            "festive",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Chicken & Egg Protein Salad",
        "description": "Powerhouse salad combining sliced grilled chicken breast with 2 halved boiled eggs.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 430,
        "protein": 52,
        "carbs": 8,
        "fat": 20,
        "fiber": 3,
        "servingSize": "1 large salad",
        "mealType": "Lunch",
        "prepTimeMin": 15,
        "dietType": "NonVeg",
        "allergies": [
            "eggs"
        ],
        "ingredients": [
            "180g Grilled Chicken Breast",
            "2 Boiled Eggs halved",
            "Mixed Salad Greens, Cherry tomatoes",
            "Dijon Mustard & Lemon dressing"
        ],
        "steps": [
            "Slice warm grilled chicken breast.",
            "Layer greens, tomatoes, and sliced chicken in a bowl.",
            "Place boiled eggs on side, drizzle tangy Dijon dressing."
        ],
        "seasons": [
            "summer",
            "spring",
            "all"
        ],
        "tags": [
            "cooling",
            "light",
            "high_protein"
        ]
    },
    {
        "name": "Mutton Sukka (Lean Goat Meat)",
        "description": "Tender lean goat meat slow-cooked in traditional South Indian Chettinad masala.",
        "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
        "calories": 390,
        "protein": 38,
        "carbs": 10,
        "fat": 22,
        "fiber": 3,
        "servingSize": "180g meat",
        "mealType": "Dinner",
        "prepTimeMin": 40,
        "dietType": "NonVeg",
        "allergies": [],
        "ingredients": [
            "200g Lean Goat Meat (Mutton)",
            "Onions, Ginger-garlic, Curry leaves",
            "Roasted ground pepper, Coriander, Fennel"
        ],
        "steps": [
            "Pressure cook mutton with turmeric and salt for 4 whistles until tender.",
            "Saute onions, curry leaves, and freshly ground pepper-fennel masala.",
            "Add cooked mutton and reduce until gravy clings to the meat."
        ],
        "seasons": [
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "festive",
            "warming",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Katsu with Steamed Rice (Air-Fried)",
        "description": "Japanese style panko-breaded chicken cutlet air-fried crunchy with tonkatsu sauce.",
        "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
        "calories": 420,
        "protein": 43,
        "carbs": 45,
        "fat": 8,
        "fiber": 3,
        "servingSize": "1 cutlet + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 22,
        "dietType": "NonVeg",
        "allergies": [
            "eggs",
            "gluten",
            "soy"
        ],
        "ingredients": [
            "200g Chicken breast pounded flat",
            "30g Panko breadcrumbs",
            "1 Egg white for dipping",
            "1 cup Steamed Rice, Tonkatsu sauce"
        ],
        "steps": [
            "Dip pounded chicken in egg white, coat thoroughly with seasoned panko crumbs.",
            "Air-fry at 200C for 12 minutes until deeply crunchy.",
            "Slice into strips and serve over rice with sauce."
        ],
        "seasons": [
            "all",
            "monsoon"
        ],
        "tags": [
            "comfort",
            "crispy",
            "high_protein"
        ]
    },
    {
        "name": "Chicken Tikka Whole Wheat Kathi Roll",
        "description": "Charred tandoori chicken rolled in a soft paratha with mint chutney and pickled onions.",
        "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500",
        "calories": 430,
        "protein": 40,
        "carbs": 42,
        "fat": 12,
        "fiber": 5,
        "servingSize": "1 roll",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "180g Tandoori Chicken chunks",
            "1 Whole Wheat Paratha",
            "Mint yogurt chutney",
            "Sliced pickled onions, Chaat masala"
        ],
        "steps": [
            "Warm the paratha on a tawa.",
            "Lay grilled tandoori chicken pieces along the center.",
            "Add pickled onions, mint chutney, roll tightly and wrap in paper."
        ],
        "seasons": [
            "all",
            "post_monsoon"
        ],
        "tags": [
            "festive",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Grilled Fish Tikka (Amritsari Style)",
        "description": "Tender Basa or Rohu fish fillets marinated in carom seeds, ginger, and lemon, pan-grilled.",
        "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
        "calories": 280,
        "protein": 38,
        "carbs": 6,
        "fat": 11,
        "fiber": 2,
        "servingSize": "220g fish",
        "mealType": "Dinner",
        "prepTimeMin": 18,
        "dietType": "NonVeg",
        "allergies": [
            "seafood"
        ],
        "ingredients": [
            "220g White Fish Fillet (Basa / Rohu / Tilapia)",
            "1 tsp Ajwain (carom seeds)",
            "1 tbsp Gram flour (besan)",
            "Lemon juice, Turmeric, Chilli powder"
        ],
        "steps": [
            "Marinate fish with lemon, ajwain, turmeric, and light besan dusting.",
            "Rest for 10 minutes.",
            "Pan-grill in 1 tsp mustard oil for 4 minutes per side until flaky.",
            "Serve with onion rings and lemon."
        ],
        "seasons": [
            "post_monsoon",
            "winter",
            "all"
        ],
        "tags": [
            "festive",
            "crispy",
            "high_protein"
        ]
    },
    {
        "name": "Pan-Seared Salmon with Garlic Green Beans",
        "description": "Crispy skin salmon fillet rich in Omega-3 fatty acids, paired with tender green beans.",
        "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
        "calories": 420,
        "protein": 40,
        "carbs": 8,
        "fat": 25,
        "fiber": 3,
        "servingSize": "200g fillet + beans",
        "mealType": "Dinner",
        "prepTimeMin": 15,
        "dietType": "NonVeg",
        "allergies": [
            "seafood"
        ],
        "ingredients": [
            "200g Fresh Salmon Fillet",
            "1.5 cups French Green Beans",
            "1 clove Minced Garlic",
            "1 tsp Butter / Olive oil, Lemon"
        ],
        "steps": [
            "Season salmon fillet with sea salt and cracked pepper.",
            "Sear skin-side down in a hot pan for 5 mins, flip and cook 3 mins.",
            "Saute green beans in the pan drippings with garlic, serve together."
        ],
        "seasons": [
            "all",
            "winter"
        ],
        "tags": [
            "omega3",
            "clean",
            "high_protein"
        ]
    },
    {
        "name": "Spicy Prawns Masala with Steamed Rice",
        "description": "Juicy prawns cooked in a coastal coconut, tomato, and black pepper curry.",
        "imageUrl": "https://images.unsplash.com/photo-1559742811-822873691df8?w=500",
        "calories": 360,
        "protein": 35,
        "carbs": 42,
        "fat": 7,
        "fiber": 4,
        "servingSize": "180g prawns + 1 cup rice",
        "mealType": "Lunch",
        "prepTimeMin": 20,
        "dietType": "NonVeg",
        "allergies": [
            "seafood"
        ],
        "ingredients": [
            "200g Cleaned Deveined Prawns",
            "1 Onion, 1 Tomato",
            "Curry leaves, Mustard seeds, Pepper",
            "1 cup Cooked Rice"
        ],
        "steps": [
            "Marinate prawns in turmeric and lemon for 5 mins.",
            "Saute onions, tomatoes, and curry leaves with spices until fragrant.",
            "Add prawns, cook on medium heat for 4-5 mins (avoid overcooking).",
            "Serve hot with steamed rice."
        ],
        "seasons": [
            "monsoon",
            "winter",
            "post_monsoon"
        ],
        "tags": [
            "spicy",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Tuna & Boiled Egg Salad",
        "description": "Quick lean salad with canned light tuna, boiled eggs, sweet corn, and lemon herbs.",
        "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        "calories": 350,
        "protein": 46,
        "carbs": 12,
        "fat": 13,
        "fiber": 3,
        "servingSize": "1 large bowl",
        "mealType": "Lunch",
        "prepTimeMin": 8,
        "dietType": "NonVeg",
        "allergies": [
            "seafood",
            "eggs"
        ],
        "ingredients": [
            "1 can (150g) Tuna in spring water drained",
            "2 Hard-boiled Eggs sliced",
            "Sweet corn, Diced Red onion, Parsley",
            "Lemon juice, Black pepper"
        ],
        "steps": [
            "Flake drained tuna into a bowl.",
            "Add sliced boiled eggs, corn, and chopped herbs.",
            "Season with black pepper, sea salt, and fresh lemon juice."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "quick",
            "high_protein"
        ]
    },
    {
        "name": "Goan Fish Curry with Steamed Rice",
        "description": "Authentic coastal fish curry made with coconut milk, kokum, and Kashmiri chillies.",
        "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
        "calories": 410,
        "protein": 34,
        "carbs": 48,
        "fat": 10,
        "fiber": 4,
        "servingSize": "200g fish curry + rice",
        "mealType": "Lunch",
        "prepTimeMin": 25,
        "dietType": "NonVeg",
        "allergies": [
            "seafood"
        ],
        "ingredients": [
            "220g Kingfish or Pomfret steaks",
            "1/2 cup Light Coconut milk",
            "Kokum petals, Garlic, Coriander",
            "1 cup Cooked Rice"
        ],
        "steps": [
            "Grind fresh coconut with chillies, coriander seeds, and garlic.",
            "Boil the curry base with kokum petals for authentic tanginess.",
            "Gently slide in fish steaks, simmer 6 mins until tender."
        ],
        "seasons": [
            "monsoon",
            "summer"
        ],
        "tags": [
            "comfort",
            "traditional",
            "high_protein"
        ]
    },
    {
        "name": "Classic Whey Protein Shake with Banana & Peanut Butter",
        "description": "Post-workout powerhouse smoothie with 30g whey, ripe banana, and creamy peanut butter.",
        "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
        "calories": 340,
        "protein": 32,
        "carbs": 34,
        "fat": 8,
        "fiber": 4,
        "servingSize": "400ml smoothie",
        "mealType": "Snack",
        "prepTimeMin": 5,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "nuts"
        ],
        "ingredients": [
            "1 scoop (33g) Whey Protein Isolate (Chocolate or Vanilla)",
            "1 medium Ripe Banana",
            "1 tbsp Peanut Butter",
            "250ml Skimmed Milk or Almond Milk",
            "Ice cubes"
        ],
        "steps": [
            "Add milk, protein powder, banana, peanut butter, and ice to blender.",
            "Blend on high speed for 45 seconds until velvety smooth.",
            "Pour and drink immediately post-workout."
        ],
        "seasons": [
            "all",
            "summer"
        ],
        "tags": [
            "quick",
            "shake",
            "high_protein"
        ]
    },
    {
        "name": "High-Protein Chocolate Proats (Protein Oatmeal)",
        "description": "Warm comforting bowl of rolled oats cooked in milk and stirred with whey protein.",
        "imageUrl": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
        "calories": 380,
        "protein": 34,
        "carbs": 48,
        "fat": 6,
        "fiber": 7,
        "servingSize": "1 large bowl",
        "mealType": "Breakfast",
        "prepTimeMin": 10,
        "dietType": "Veg",
        "allergies": [
            "dairy",
            "gluten"
        ],
        "ingredients": [
            "50g Rolled Oats",
            "1 scoop Whey Protein powder",
            "250ml Milk or Water",
            "1 tbsp Chia seeds",
            "Sliced strawberries"
        ],
        "steps": [
            "Cook oats in milk on medium heat for 4 minutes until thick.",
            "Remove from heat, let cool for 1 minute (prevents whey from curdling).",
            "Vigorously whisk in protein powder and chia seeds.",
            "Top with berries and serve warm."
        ],
        "seasons": [
            "winter",
            "monsoon",
            "all"
        ],
        "tags": [
            "warming",
            "comfort",
            "high_protein"
        ]
    },
    {
        "name": "Coffee Mocha Whey Protein Shake",
        "description": "Morning kickstart blending instant espresso, chocolate whey, and chilled almond milk.",
        "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
        "calories": 190,
        "protein": 28,
        "carbs": 6,
        "fat": 4,
        "fiber": 2,
        "servingSize": "350ml shake",
        "mealType": "Snack",
        "prepTimeMin": 3,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "1 scoop Chocolate Whey Protein",
            "1 tsp Instant Espresso Coffee",
            "300ml Chilled Skimmed Milk",
            "4-5 Ice cubes"
        ],
        "steps": [
            "Dissolve espresso in 2 tbsp warm water.",
            "Add to shaker cup with protein powder, chilled milk, and ice.",
            "Shake vigorously for 20 seconds and enjoy cold."
        ],
        "seasons": [
            "all",
            "summer"
        ],
        "tags": [
            "cooling",
            "energizing",
            "shake",
            "high_protein"
        ]
    },
    {
        "name": "Overnight Protein Chia Pudding",
        "description": "Creamy make-ahead breakfast pudding with vanilla whey, chia seeds, and almond milk.",
        "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
        "calories": 290,
        "protein": 29,
        "carbs": 22,
        "fat": 9,
        "fiber": 10,
        "servingSize": "1 jar (300g)",
        "mealType": "Breakfast",
        "prepTimeMin": 5,
        "dietType": "Veg",
        "allergies": [
            "dairy"
        ],
        "ingredients": [
            "3 tbsp Chia seeds",
            "1 scoop Vanilla Whey Protein",
            "250ml Almond or Soy Milk",
            "1/2 cup Mixed Berries"
        ],
        "steps": [
            "Whisk whey protein thoroughly into milk in a mason jar.",
            "Stir in chia seeds, let sit for 10 mins, stir again to prevent clumping.",
            "Refrigerate overnight; top with berries in the morning."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "make_ahead",
            "high_protein"
        ]
    },
    {
        "name": "Plant-Protein Berry Smoothie Bowl (Pea & Brown Rice)",
        "description": "Vegan protein smoothie bowl topped with pumpkin seeds, sliced kiwi, and cacao nibs.",
        "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
        "calories": 320,
        "protein": 27,
        "carbs": 36,
        "fat": 7,
        "fiber": 8,
        "servingSize": "1 bowl",
        "mealType": "Breakfast",
        "prepTimeMin": 8,
        "dietType": "Vegan",
        "allergies": [],
        "ingredients": [
            "1 scoop Plant-based Pea Protein powder",
            "1 cup Frozen Berries",
            "200ml Coconut water or Oat milk",
            "1 tbsp Pumpkin seeds",
            "Cacao nibs"
        ],
        "steps": [
            "Blend plant protein powder with frozen berries and liquid until thick and frosty.",
            "Spoon into a bowl.",
            "Decorate with crunchy pumpkin seeds and cacao nibs."
        ],
        "seasons": [
            "summer",
            "spring"
        ],
        "tags": [
            "cooling",
            "light",
            "smoothie",
            "high_protein"
        ]
    }
];

module.exports = recipes;
