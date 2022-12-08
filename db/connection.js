const mysql = require('mysql2');
const PORT = process.env.PORT || 3006;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Junior101$',
    database: 'employee_db'
});

module.exports = db;