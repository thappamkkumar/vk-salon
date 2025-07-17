
--  Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,     
  name VARCHAR(255) NOT NULL,      
  image TEXT NOT NULL,            
  address VARCHAR(500) NOT NULL,   
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),  
  message TEXT NOT NULL,           
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
 

-- Create trigger on reviews tableupdate on reviews table
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
