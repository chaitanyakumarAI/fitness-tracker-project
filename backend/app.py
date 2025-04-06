from flask import Flask, request, jsonify, send_file
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

app = Flask(__name__)

data_file = "fitness_data.csv"

# Ensure CSV file exists
if not os.path.exists(data_file):
    pd.DataFrame(columns=["date", "steps", "workout_time", "workout_type", "weight", "calories", "water_intake"]).to_csv(data_file, index=False)

# Function to calculate calories burned
def calculate_calories(workout_time, workout_type, weight):
    workout_mets = {
        "running": 9.8,
        "walking": 3.8,
        "cycling": 7.5,
        "swimming": 8.0,
        "strength_training": 6.0
    }
    met = workout_mets.get(workout_type.lower(), 5.0)  # Default to 5 METs if unknown
    calories_burned = (met * weight * 3.5 / 200) * workout_time  # Standard MET formula
    return round(calories_burned, 2)

@app.route('/add-data', methods=['POST'])
def add_data():
    data = request.json
    df = pd.read_csv(data_file)
    
    # Ensure required fields are present
    required_fields = {"date", "steps", "workout_time", "workout_type", "weight", "water_intake"}
    if not required_fields.issubset(data.keys()):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Calculate calories
    data["calories"] = calculate_calories(float(data["workout_time"]), data["workout_type"], float(data["weight"]))
    
    df = df.append(data, ignore_index=True)
    df.to_csv(data_file, index=False)
    return jsonify({"message": "Data added successfully!", "calories_calculated": data["calories"]})

@app.route('/get-data', methods=['GET'])
def get_data():
    df = pd.read_csv(data_file)
    return df.to_json(orient='records')

@app.route('/heatmap', methods=['GET'])
def heatmap():
    df = pd.read_csv(data_file)
    if df.empty:
        return jsonify({"error": "No data available for visualization"})
    
    plt.figure(figsize=(8, 5))
    df['date'] = pd.to_datetime(df['date'])
    df['day'] = df['date'].dt.day_name()
    heatmap_data = df.pivot_table(index='day', values='steps', aggfunc='sum')
    sns.heatmap(heatmap_data, annot=True, cmap='coolwarm')
    plt.title("Daily Step Count Heatmap")
    
    image_path = "visualizations/heatmap.png"
    os.makedirs("visualizations", exist_ok=True)
    plt.savefig(image_path)
    plt.close()
    
    return send_file(image_path, mimetype='image/png')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render dynamically assigns the port
    app.run(host='0.0.0.0', port=port)
