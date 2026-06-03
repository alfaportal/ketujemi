-- Set free monthly posts per parent category to exactly 10 (Neon production).
UPDATE categories
SET free_listing_limit = 10
WHERE parent_id IS NULL;
