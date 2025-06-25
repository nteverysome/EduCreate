-- Create tables for Wordwall Clone
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content JSON NOT NULL,
    user_id TEXT NOT NULL,
    template_type TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    player_email TEXT,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, email, username, display_name, role) VALUES
('user1', 'teacher@example.com', 'teacher1', 'Teacher Demo', 'TEACHER'),
('user2', 'student@example.com', 'student1', 'Student Demo', 'STUDENT');

INSERT OR IGNORE INTO activities (id, title, description, content, user_id, template_type, is_public) VALUES
('act1', 'Math Quiz Demo', 'Basic math questions', '{"questions":[{"id":"q1","text":"What is 2+2?","options":[{"id":"a","text":"3"},{"id":"b","text":"4","isCorrect":true}]}]}', 'user1', 'QUIZ', 1);
