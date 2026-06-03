-- Raise per–parent-category free monthly posts (production often still at 5 from old default).
UPDATE categories
SET free_listing_limit = 20
WHERE parent_id IS NULL
  AND free_listing_limit < 20;
