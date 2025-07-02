-- Add default value for session_id to automatically generate unique IDs
-- This ensures new sessions get a session_id even if not provided

-- Create a function to generate session IDs
CREATE OR REPLACE FUNCTION generate_session_id()
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    'S', 
    EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT,
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
    SUBSTRING(MD5(CLOCK_TIMESTAMP()::TEXT), 1, 3)
  );
END;
$$ LANGUAGE plpgsql;

-- Add default value using the function
ALTER TABLE analysis_sessions 
ALTER COLUMN session_id SET DEFAULT generate_session_id(); 