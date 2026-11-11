-- Migration: Create Streak Tables
-- Run this SQL in your MySQL database

-- Table: user_streaks
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id VARCHAR(255) PRIMARY KEY,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE NULL,
    freeze_count INT NOT NULL DEFAULT 0,
    freeze_used_dates JSON NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: streak_activity_logs
CREATE TABLE IF NOT EXISTS streak_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    activity_date DATE NOT NULL,
    type ENUM('checkin', 'freeze_used') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_user_date (user_id, activity_date)
);
