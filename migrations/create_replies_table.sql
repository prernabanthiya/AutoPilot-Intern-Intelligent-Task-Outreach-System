-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reply_classification VARCHAR(50) DEFAULT 'general',
    task_id INTEGER REFERENCES tasks(id),
    member_id INTEGER REFERENCES members(id),
    email_log_id INTEGER REFERENCES email_logs(id)
);

-- Create index on received_at for faster queries
CREATE INDEX IF NOT EXISTS idx_replies_received_at ON replies(received_at);

-- Create index on reply_classification for faster filtering
CREATE INDEX IF NOT EXISTS idx_replies_classification ON replies(reply_classification); 