const pool = require('./config/db');
pool.query("SELECT enum_range(NULL::user_role)").then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
