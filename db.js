var mysql = require("mysql");
var connection = mysql.createConnection({
    host    :'localhost',
    user    :'root',
    password:'mypass',
    database:'erp_machinesight2',
    charset :'utf8mb4'
});
connection.connect(function(error) {if(error) console.log(error);});

module.exports = connection; 