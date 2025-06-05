import numpy as np
import pandas as pd
from database import main as get_data  # import your DB fetch function

def feature_engineering(df):
    df['received_at'] = pd.to_datetime(df['received_at'], errors='coerce')
    df['sent_at'] = pd.to_datetime(df['sent_at'], errors='coerce')

    df['response_time'] = (df['received_at'] - df['sent_at']).dt.total_seconds() / 3600
    df['response_time'] = df['response_time'].fillna(np.nan)

    reply_map = {
        'Done': 1.0,
        'Will do': 0.75,
        "Can't do": 0.0,
        'Unclear': 0.5,
        None: 0.0
    }
    df['reply_class_num'] = df['reply_classification'].map(reply_map).fillna(0.0)
    df['task_completed'] = df['status'].apply(lambda x: 1 if x == 'completed' else 0)

    followups = df.groupby('task_id')['sent_at'].count().reset_index(name='num_followups')
    df = df.merge(followups, on='task_id', how='left')

    past_success = df.groupby('member_id')['task_completed'].mean().reset_index(name='past_success_rate')
    df = df.merge(past_success, on='member_id', how='left')

    return df

def main():
    df = get_data()  # fetch data from DB
    if df is not None:
        df = feature_engineering(df)

        # ✅ Feature aggregation here:
        features = df.groupby('task_id').agg({
            'member_id': 'first',
            'response_time': 'mean',
            'num_followups': 'first',
            'reply_class_num': 'mean',
            'past_success_rate': 'first',
            'task_completed': 'first'
        }).reset_index()

        print(features.head())
    else:
        print("No data loaded")

if __name__ == "__main__":
    main()
