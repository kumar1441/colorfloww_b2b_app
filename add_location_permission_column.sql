-- Add location_permission column to user_profile table
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS location_permission BOOLEAN DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN user_profile.location_permission IS 'Whether the user has granted approximate location permissions during profile setup.';
