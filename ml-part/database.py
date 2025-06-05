import pandas as pd
import sys
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_connection():
    try:
        # Create SQLAlchemy engine
        db_url = f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'relax123')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', 5432)}/{os.getenv('DB_NAME', 'auto-piolet')}"
        engine = create_engine(db_url)
        return engine
    except Exception as e:
        print(f"The error '{e}' occurred", file=sys.stderr)
        return None

def fetch_data(conn):
    query = """
    SELECT
        m.id AS member_id,
        m.name,
        m.email,
        t.id AS task_id,
        t.description,
        t.status,
        t.deadline,
        t.created_at AS task_created_at,
        el.sent_at,
        r.reply_text,
        r.reply_classification,
        r.received_at
    FROM members m
    LEFT JOIN tasks t ON m.id = t.member_id
    LEFT JOIN email_logs el ON t.id = el.task_id
    LEFT JOIN replies r ON t.id = r.task_id
    ORDER BY m.id, t.id, el.sent_at;
    """
    try:
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print(f"Error executing query: {e}", file=sys.stderr)
        return None

def main():
    conn = create_connection()
    if conn:
        df = fetch_data(conn)
        if df is not None:
            print(df.head(), file=sys.stderr)
        return df
    else:
        print("Connection failed, exiting...", file=sys.stderr)
        return None

if __name__ == "__main__":
    main()

