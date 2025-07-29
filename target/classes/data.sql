-- Sample data for Splitwise Clone
-- Run this script in your PostgreSQL database

-- Insert sample users
INSERT INTO users (name, email, password) VALUES
('Alice Johnson', 'alice@example.com', 'password123'),
('Bob Smith', 'bob@example.com', 'password123'),
('Charlie Brown', 'charlie@example.com', 'password123'),
('Diana Prince', 'diana@example.com', 'password123'),
('Eve Wilson', 'eve@example.com', 'password123');

-- Insert sample groups
INSERT INTO groups (name) VALUES
('Roommates'),
('Vacation Trip'),
('Dinner Club');

-- Insert group members (many-to-many relationship)
INSERT INTO group_members (group_id, user_id) VALUES
-- Roommates group (Alice, Bob, Charlie)
(1, 1), (1, 2), (1, 3),
-- Vacation Trip group (Alice, Bob, Charlie, Diana, Eve)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
-- Dinner Club group (Alice, Diana, Eve)
(3, 1), (3, 4), (3, 5);

-- Insert sample expenses
INSERT INTO expense (group_id, paid_by_id, amount, description) VALUES
-- Roommates expenses
(1, 1, 1500.00, 'Monthly Rent'),
(1, 2, 200.00, 'Electricity and Water'),
-- Vacation Trip expenses
(2, 4, 800.00, 'Hotel Booking'),
(2, 5, 300.00, 'Group Dinner'),
-- Dinner Club expenses
(3, 1, 120.00, 'Italian Restaurant');

-- Note: Splits will be created automatically by the application when it starts
-- or you can run the application to let the DataLoader create them 