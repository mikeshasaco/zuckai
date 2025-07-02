-- Add session identifier to analysis_sessions table
-- This adds a unique human-readable identifier for each session

-- Add session_id column to analysis_sessions table
ALTER TABLE analysis_sessions 
ADD COLUMN session_id TEXT UNIQUE;

-- Create index for session_id lookups
CREATE INDEX idx_analysis_sessions_session_id ON analysis_sessions(session_id);

-- Update existing sessions with generated session IDs
UPDATE analysis_sessions 
SET session_id = CONCAT(
  'S', 
  EXTRACT(EPOCH FROM created_at)::BIGINT::TEXT,
  SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
  SUBSTRING(MD5(CLOCK_TIMESTAMP()::TEXT), 1, 3)
)
WHERE session_id IS NULL;

-- Make session_id NOT NULL after populating existing records
ALTER TABLE analysis_sessions 
ALTER COLUMN session_id SET NOT NULL; 