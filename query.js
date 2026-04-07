const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "123456789",
    database: "dapm"
});
con.query('DESCRIBE THUTUCDATPHONG', (err, rows) => {
    console.log(rows);
    process.exit(0);
});
