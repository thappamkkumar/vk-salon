 

require('dotenv').config();
//console.log('Database URL:', process.env.DATABASE_URL); // <-- Add this

module.exports = {
  migrationFolder: 'migrations',
  direction: 'up',
  logFileName: 'migration.log',
  databaseUrl: process.env.DATABASE_URL,
	//schema: 'vk_salon_migrations'
  // require: 'ts-node/register', // if your migrations are TS
};
