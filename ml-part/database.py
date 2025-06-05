import pandas as pd
import psycopg2
from psycopg2 import OperationalError, Error

def create_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",       # change if needed
            database="Autopilot",   # replace with your DB name
            user="postgres",
            port=5432,
            password="prerna"       # replace with your password
        )
        print("Connection to PostgreSQL DB successful")
        return conn
    except OperationalError as e:
        print(f"The error '{e}' occurred")
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
    except Error as e:
        print(f"Error executing query: {e}")
        return None

def main():
    conn = create_connection()
    if conn:
        df = fetch_data(conn)
        if df is not None:
            print(df.head())
        conn.close()
        return df
    else:
        print("Connection failed, exiting...")
        return None

if __name__ == "__main__":
    main()

