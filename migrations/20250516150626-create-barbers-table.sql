

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(30) NOT NULL,
  experience INTEGER NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
 

-- Create trigger on barbers table
CREATE TRIGGER update_barbers_updated_at
BEFORE UPDATE ON barbers
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
