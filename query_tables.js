const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "123456789",
    database: "dapm"
});
con.query('SHOW TABLES', (err, rows) => {
    if(err) { console.error(err); process.exit(1); }
    console.log("TABLES:", rows);
    
    // Check if HOADON or similar exists
    con.query('SHOW CREATE TABLE THUTUCDATPHONG', (e, r) => {
        if(!e) console.log("CREATE THUTUCDATPHONG:\n", r[0]['Create Table']);
        process.exit(0);
    });
});
