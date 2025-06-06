-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    description TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on member_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_member_id ON tasks(member_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status); 