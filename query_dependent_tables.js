const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "123456789",
    database: "dapm"
});
con.query('SHOW CREATE TABLE thanhtoan', (err, rows) => {
    if(!err) console.log("CREATE THANHTOAN:\n", rows[0]['Create Table']);
    con.query('SHOW CREATE TABLE huy', (err1, rows1) => {
        if(!err1) console.log("CREATE HUY:\n", rows1[0]['Create Table']);
        process.exit(0);
    });
});
