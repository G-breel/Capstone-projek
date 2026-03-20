-- Migration: Add Google OAuth support
-- Run this on your existing database

USE tabunganqu_db;

-- Make password nullable (for Google users who don't have a password)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;

-- Add google_id column with UNIQUE constraint
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER avatar;
