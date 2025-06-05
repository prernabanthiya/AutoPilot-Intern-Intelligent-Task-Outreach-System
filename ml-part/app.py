from flask import Flask, jsonify, request

import pandas as pd
import smtplib
from email.mime.text import MIMEText
from sklearn.ensemble import RandomForestClassifier

# Import your existing database connection and fetch functions
from database import create_connection, fetch_data
from Feature_Engineering import feature_engineering

app = Flask(__name__)

def train_model():
    # Create DB connection
    conn = create_connection()
    if conn is None:
        raise Exception("Failed to connect to DB")

    # Fetch raw data
    df = fetch_data(conn)
    conn.close()  # close connection ASAP after fetching data

    if df is None or df.empty:
        raise Exception("No data fetched from DB")

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

    X = features[['response_time', 'num_followups', 'reply_class_num', 'past_success_rate']].fillna(0)
    y = features['task_completed']

    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)

    return model, features

# Train model on app start
try:
    model, features = train_model()
except Exception as e:
    print(f"Error during model training: {e}")
    model, features = None, None


@app.route('/predictions')
def get_predictions():
    X = features[['response_time', 'num_followups', 'reply_class_num', 'past_success_rate']].fillna(0)
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
    return jsonify(result)


def send_email(to_email, subject, body):
    from_email = "your_email@example.com"
    password = "your_email_password"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(from_email, password)
        server.send_message(msg)

@app.route('/send-emails', methods=['POST'])
def send_emails():
    data = request.json
    recipients = data.get('recipients')
    template = data.get('template')

    if not recipients or not template:
        return jsonify({"error": "Missing recipients or template"}), 400

    for recipient in recipients:
        try:
            email_body = template.format(**recipient)
            send_email(recipient['email'], "Task Automation Email", email_body)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"status": f"Sent emails to {len(recipients)} recipients"})

if __name__ == '__main__':
    app.run(debug=True)
