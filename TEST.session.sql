CREATE DATABASE IF NOT EXISTS taskmanager;
USE taskmanager;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create
INSERT INTO tasks (title, description, status, priority, due_date)
VALUES ('Buy groceries', 'Milk, eggs, bread', 'pending', 'high', '2026-06-25');

-- Read all
SELECT * FROM tasks;

-- Read one
SELECT * FROM tasks WHERE id = 1;

-- Update
UPDATE tasks SET status = 'completed', priority = 'low' WHERE id = 1;

-- Delete
DELETE FROM tasks WHERE id = 1;