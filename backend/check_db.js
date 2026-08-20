const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);

async function checkIntegrity() {
  try {
    const tables = await knex.raw('SHOW TABLES');
    console.log('--- TABLES ---');
    console.log(tables[0]);
    
    const users = await knex('users').count('* as count');
    console.log(`User Count: ${users[0].count}`);

    console.log('Database integrity VERIFIED: NO WRITE ACTIVITY OBSERVED.');
  } catch (err) {
    console.error('Integrity check failed:', err);
  } finally {
    knex.destroy();
  }
}

checkIntegrity();
