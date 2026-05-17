const { sequelize } = require('./config/db');

async function dump() {
  const result = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Applications';");
  console.log(result[0][0].sql);
  
  const indexes = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='Applications';");
  console.log(indexes[0]);
}

dump();
