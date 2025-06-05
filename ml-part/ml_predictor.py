import pandas as pd
import sys
from sklearn.ensemble import RandomForestClassifier
import json

# Import your existing database connection and fetch functions
from database import create_connection, fetch_data
from Feature_Engineering import feature_engineering

def train_and_predict():
    # Create DB connection
    conn = create_connection()
    if conn is None:
        print("Error: Failed to connect to DB", file=sys.stderr)
        return None

    # Fetch raw data
    df = fetch_data(conn)
    if df is None or df.empty:
        print("Error: No data fetched from DB", file=sys.stderr)
        return None

    # Feature engineering
    df = feature_engineering(df)

    # Aggregate features per task_id
    features = df.groupby('task_id').agg({
        'member_id': 'first',
        'response_time': 'mean',
        'num_followups': 'first',
        'reply_class_num': 'mean',
        'past_success_rate': 'first',
        'task_completed': 'first'
    }).reset_index()

    # Handle cases where there might not be enough data for training
    if features.empty:
        print("Error: No features generated for training", file=sys.stderr)
        return []
        
    # Check if there are tasks with completed status for training
    if features['task_completed'].nunique() < 2 or len(features) < 2:
         print("Warning: Not enough variation in task completion for robust training. Returning default predictions.", file=sys.stderr)
         # Return a default prediction or handle this case appropriately
         result = features[['task_id', 'task_completed']].copy()
         result['completion_prob'] = 0.5 # Default probability
         return result.to_dict(orient='records')

    X = features[['response_time', 'num_followups', 'reply_class_num', 'past_success_rate']].fillna(0)
    y = features['task_completed']

    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)

    proba = model.predict_proba(X)

    if proba.shape[1] == 1:
        if model.classes_[0] == 1:
            completion_prob = proba[:, 0]
        else:
            completion_prob = 1 - proba[:, 0]
    else:
        completion_prob = proba[:, 1]

    features['completion_prob'] = completion_prob

    result = features[['task_id', 'completion_prob', 'task_completed']].to_dict(orient='records')
    return result

if __name__ == '__main__':
    try:
        predictions = train_and_predict()
        if predictions is not None:
            # Explicitly write only the JSON to stdout
            sys.stdout.write(json.dumps(predictions))
            sys.stdout.flush()
    except Exception as e:
        # Catch any unexpected errors and print to stderr
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1) 