-- Drop existing tables (in reverse order to avoid foreign key constraint issues)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS availabilities;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'gm', 'user', 'new')),
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availabilities table
CREATE TABLE availabilities (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    selected_days TEXT[] NOT NULL,
    time_option TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    repeat_option TEXT NOT NULL,
    repeat_weeks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,  -- For compatibility with existing code
    user_id UUID REFERENCES users(id),
    created_by TEXT,
    gm_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_availabilities_user_id ON availabilities(user_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_gm_id ON sessions(gm_id);