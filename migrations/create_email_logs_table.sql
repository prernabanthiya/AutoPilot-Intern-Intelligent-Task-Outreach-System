-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    task_id UUID REFERENCES tasks(id),
    subject TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent',
    follow_up_count INTEGER DEFAULT 0
);

-- Create index on member_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_member_id ON email_logs(member_id);

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_task_id ON email_logs(task_id);

-- Create index on sent_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at); 