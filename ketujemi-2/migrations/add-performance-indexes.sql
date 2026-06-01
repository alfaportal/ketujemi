CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_user ON listings(user_id);
