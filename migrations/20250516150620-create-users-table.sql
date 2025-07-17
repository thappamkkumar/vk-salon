

-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);


-- Insert one initial user row (e.g., admin)
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@example.com',
  '$2a$12$SkVl.a5MxGO1bNBBC9YbZeM5eWpfY91gmyKgDV9rRiV3xtJ9K18sy',  -- replace with real bcrypt hash
  'admin'
);

--  Create trigger that calls the function before update on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
