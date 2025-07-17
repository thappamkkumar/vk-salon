
-- Create contact table
CREATE TABLE IF NOT EXISTS contact (
  id SERIAL PRIMARY KEY,
  address VARCHAR(500) NOT NULL,
  address_url TEXT NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
	instagram_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
 

-- Trigger to update updated_at before update on contact table
CREATE TRIGGER update_contact_updated_at
BEFORE UPDATE ON contact
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
