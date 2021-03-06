/**
  * @module config/connection
  * Configure database connection
*/
var mongoose = require('mongoose');
var connStr = '';

if(process.env.DATABASE_URL !== undefined) {
    console.log('env connection string');
    connStr = process.env.DATABASE_URL;
    mongoose.defaults.ssl = true;
} else {
    connStr = 'mongodb://localhost:27017/eagleReserveDatabase';
} // end else

console.log("connStr set to: ", connStr);

module.exports = connStr;
