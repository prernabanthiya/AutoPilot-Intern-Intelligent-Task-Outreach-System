import numpy as np
import pandas as pd
from database import fetch_data  # Corrected import
import pytz # Import pytz for timezone handling if needed elsewhere, but pandas handles it internally here

def feature_engineering(df):
    # Convert datetime columns to timezone-aware UTC
    # Localize to UTC first.
    df['received_at'] = pd.to_datetime(df['received_at'], errors='coerce')
    # Check if timezone-naive before localizing
    if df['received_at'].dt.tz is None:
        # Remove errors='coerce' as it's not supported in older pandas versions
        df['received_at'] = df['received_at'].dt.tz_localize('UTC')

    df['sent_at'] = pd.to_datetime(df['sent_at'], errors='coerce')
     # Check if timezone-naive before localizing
    if df['sent_at'].dt.tz is None:
         # Remove errors='coerce' as it's not supported in older pandas versions
         df['sent_at'] = df['sent_at'].dt.tz_localize('UTC')

    # Calculate response time in hours, handling potential NaT values
    # Ensure both columns are timezone-aware before subtraction
    # Also handle potential errors from tz_localize by checking if tz is None
    if df['received_at'].dt.tz is not None and df['sent_at'].dt.tz is not None:
        df['response_time'] = (df['received_at'] - df['sent_at']).dt.total_seconds() / 3600
    else:
         df['response_time'] = np.nan # Set to NaN if timezone handling failed

    df['response_time'] = df['response_time'].fillna(np.nan) # Keep NaN for missing responses

    # Map reply classifications to numerical values
    reply_map = {
        'Done': 1.0,
        'Will do': 0.75,
        "Can't do": 0.0,
        'Unclear': 0.5,
        None: 0.0
    }
    df['reply_class_num'] = df['reply_classification'].map(reply_map).fillna(0.0)
    
    # Create a binary column for task completion status
    df['task_completed'] = df['status'].apply(lambda x: 1 if x == 'completed' else 0)

    # Calculate number of follow-ups (emails sent for a task)
    followups = df.groupby('task_id')['sent_at'].count().reset_index(name='num_followups')
    df = df.merge(followups, on='task_id', how='left')

    # Calculate past success rate for each member
    past_success = df.groupby('member_id')['task_completed'].mean().reset_index(name='past_success_rate')
    df = df.merge(past_success, on='member_id', how='left')

    return df

# Removed the main function and direct data fetching as it's called from ml_predictor.py
# def main():
#     df = get_data() # fetch data from DB
#     if df is not None:
#         df = feature_engineering(df)
#         print(df.head())
#     else:
#         print("No data loaded")
#
# if __name__ == "__main__":
#     main()
