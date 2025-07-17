
--  Create table appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL, 
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
	 
);

-- Optional: Add foreign key to styles table if needed
-- ALTER TABLE requests
-- ADD CONSTRAINT fk_style
-- FOREIGN KEY (style_id) REFERENCES styles(id);

--  Trigger only (assumes function `update_updated_at_column` already exists)
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
