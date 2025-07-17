
-- Create posts table
CREATE TABLE IF NOT EXISTS posts(
	id SERIAL PRIMARY KEY,
	attachment JSONB NOT NULL, 
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

 
-- Create trigger on posts table
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();