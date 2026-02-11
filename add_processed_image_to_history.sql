-- Migration: Add processed_image_uri to paint_sessions table
-- This allows storing the virtual nail polish look photos in history

ALTER TABLE paint_sessions 
ADD COLUMN IF NOT EXISTS processed_image_uri TEXT;

COMMENT ON COLUMN paint_sessions.processed_image_uri IS 'URI of the processed image showing virtual nail polish applied to user hands';
