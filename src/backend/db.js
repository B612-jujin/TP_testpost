// server/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
//jujingood@gmail.com
// zg8eflut
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

module.exports = pool;
