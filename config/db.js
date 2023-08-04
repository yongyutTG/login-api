let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "mydata"
})

connection.connect((error) => {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected...');
    }
})

module.exports = connection;