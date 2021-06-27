const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'alex',
    password: '123456',
    database: 'oca',
    port: 3306,
    multipleStatements: true
})

module.exports = db;