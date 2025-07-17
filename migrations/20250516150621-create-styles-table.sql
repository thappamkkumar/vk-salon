
-- Create styles table
CREATE TABLE IF NOT EXISTS styles (
  id SERIAL PRIMARY KEY,
  image text NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

 


-- Create trigger on styles table
CREATE TRIGGER update_styles_updated_at
BEFORE UPDATE ON styles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
