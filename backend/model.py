import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from dishes import DISH_DATABASE, get_dish_meta

def train_catering_model():
    # Reads the active CSV file from disk (contains old baseline data + your new user add-ons)
    csv_path = os.path.join(os.path.dirname(__file__), 'catering_data.csv')
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing critical training dataset file at: {csv_path}")
        
    df = pd.read_csv(csv_path)
    
    X = df.drop(columns=['consumption_factor'])
    y = df['consumption_factor']
    
    categorical_features = ['event_type', 'meal_type', 'cuisine_type']
    numerical_features = ['num_adults', 'num_children']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=200, random_state=42))
    ])
    
    model_pipeline.fit(X, y)
    return model_pipeline

# Initialize the global model object variable on startup
model = train_catering_model()

def reload_trained_model():
    """Triggers an internal re-fit of the random forest without circular module imports"""
    global model
    model = train_catering_model()
    print("🔄 [AI Core] Random Forest pipeline re-fit with updated datasets successfully!")

def generate_culinary_intervention(menu_items):
    lowest_spoilage_life = 24
    critical_dish = ""
    
    for item in menu_items:
        meta = get_dish_meta(item)
        if meta["known"] and meta["spoilage_hours"] < lowest_spoilage_life:
            lowest_spoilage_life = meta["spoilage_hours"]
            critical_dish = item
            
    if lowest_spoilage_life <= 3:
        return f"CRITICAL INTERVENTION ALERT: Your menu contains '{critical_dish}', which has a severe ambient spoilage window of only {lowest_spoilage_life} hours at 35°C. To avoid food poisoning risks or complete batch loss, enforce absolute T-minus 60 min staging or activate chilled holding trace-lines immediately."
    elif lowest_spoilage_life <= 4:
        return f"HIGH SPOILAGE INSIGHT: Fast-degrading elements detected via '{critical_dish}' ({lowest_spoilage_life} hrs safety limit). Ensure immediate thermal kitchen isolation and prioritize service speed during the event."
    return "OPTIMAL MENU PROFILE: Food degradation models look safe. No extreme micro-bacterial risks detected. Maintain standard hot-holding bounds above 60°C."

def get_catering_predictions(num_adults, num_children, event_type, meal_type, menu_items, is_muhurtham=False):
    cuisines = [get_dish_meta(item)["cuisine"] for item in menu_items]
    dominant_cuisine = max(set(cuisines), default="South Indian")
    
    input_data = pd.DataFrame([{
        'num_adults': int(num_adults),
        'num_children': int(num_children),
        'event_type': event_type,
        'meal_type': meal_type,
        'cuisine_type': dominant_cuisine
    }])
    
    ai_multiplier = float(model.predict(input_data)[0])
    
    # Apply Muhurtham dynamic modifier
    if is_muhurtham:
        ai_multiplier = ai_multiplier * 0.82

    effective_guests = (num_adults + num_children) * ai_multiplier
    
    # INITIALIZATION BLOCK
    total_cost = 0
    aggregate_waste_g = 0
    category_raw_allocation = {}
    individual_item_weights = {}
    
    # 🌟 CORE MACRO TARGET PLATE WEIGHT (Total edible mass targeted per active head)
    TOTAL_PLATE_WEIGHT_KG = 0.550 

    # Calculate proportional item weights and build allocations
    for item in menu_items:
        meta = get_dish_meta(item)
        total_cost += meta["cost"] * effective_guests
        
        item_waste = (num_adults * meta["waste_g"]) + (num_children * meta["waste_g"] * 0.5)
        aggregate_waste_g += item_waste * ai_multiplier
        
        # 🌟 DYNAMIC PORTION DISTRIBUTION MATRIX
        # Allocates plate space proportionally by kitchen categories instead of flat multipliers
        cat = meta.get("category", "Fresh Produce/Misc")
        
        if cat in ["Rice", "Veg Biryani (North)", "Chicken Biryani", "Mutton Biryani"]:
            portion_ratio = 0.45  # Rice/Grains take up largest space
        elif cat in ["Bread", "Pasta"]:
            portion_ratio = 0.35  # Breads and secondary carbs
        elif cat in ["Gravy", "Non-Veg Gravy", "Veg Curry"]:
            portion_ratio = 0.25  # Side curries/gravies portioned lighter
        elif cat in ["Dessert", "Beverage"]:
            portion_ratio = 0.15  # Concentrated dessert portions
        elif cat in ["Tiffin", "Combo", "Breakfast"]:
            portion_ratio = 0.40  # Tiffins/Breakfast
        else:
            portion_ratio = 0.20  # Starters, salads, and appalams

        # Calculate dynamic item mass target using its relative category portion ratio
        item_allocated_mass_kg = effective_guests * TOTAL_PLATE_WEIGHT_KG * portion_ratio
        individual_item_weights[item] = f"{round(item_allocated_mass_kg, 1)} kg"
        
        category_raw_allocation[cat] = category_raw_allocation.get(cat, 0.0) + item_allocated_mass_kg

    total_waste_kg = aggregate_waste_g / 1000
    
    # ============================================================
    # 🛒 OPTIMIZED KITCHEN CATEGORIZATION
    # ============================================================
    grain_total = 0.0
    produce_total = 0.0
    dairy_total = 0.0
    sugar_total = 0.0
    spice_total = 0.0

    for cat, mass in category_raw_allocation.items():
        if cat in ["Rice", "Pasta", "Bread"]:
            grain_total += mass * 0.45
            spice_total += mass * 0.05
        elif cat in ["Gravy", "Non-Veg Gravy", "Veg Curry"]:
            produce_total += mass * 0.60
            dairy_total += mass * 0.20
            spice_total += mass * 0.10
        elif cat in ["Tiffin", "Combo", "Breakfast"]:
            grain_total += mass * 0.50
            produce_total += mass * 0.15
        elif cat in ["Dessert", "Beverage"]:
            sugar_total += mass * 0.35
            dairy_total += mass * 0.45
        else:
            produce_total += mass * 0.50
            spice_total += mass * 0.05

    precision_purchase_list = {}
    if grain_total > 0:   precision_purchase_list["Rice & Grains"] = f"{round(grain_total, 1)} kg"
    if produce_total > 0: precision_purchase_list["Vegetables & Produce"] = f"{round(produce_total, 1)} kg"
    if dairy_total > 0:   precision_purchase_list["Dairy"] = f"{round(dairy_total, 1)} kg"
    if sugar_total > 0:   precision_purchase_list["Sugar & Sweeteners"] = f"{round(sugar_total, 1)} kg"
    if spice_total > 0:   precision_purchase_list["Spices & Staples"] = f"{round(spice_total, 1)} kg"

    total_input_raw_mass = sum([effective_guests * TOTAL_PLATE_WEIGHT_KG * 0.25 for _ in menu_items])
    raw_mass_denom = total_input_raw_mass if total_input_raw_mass > 0 else 1
    waste_percentage = (total_waste_kg / raw_mass_denom) * 100

    custom_insight = generate_culinary_intervention(menu_items)
    if is_muhurtham:
        custom_insight = f"🌙 MUHURTHAM DISPATCH ALERT: Venue-hopping filters applied. Headcount scales adjusted down by 18%. {custom_insight}"

    return {
        "total_guests_predicted": round(effective_guests),
        "approximate_expense": f"₹{round(total_cost, -2):,}",
        "shopping_list_preview": precision_purchase_list,
        "individual_item_weights": individual_item_weights,
        "expected_leftover_kg": round(total_waste_kg, 1),
        "waste_percentage": min(round(waste_percentage, 1), 12.0),
        "ai_insight": custom_insight
    }