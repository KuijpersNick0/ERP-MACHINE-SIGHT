var mysql = require("mysql");
var connection = mysql.createConnection({
    host    :'localhost',
    user    :'root',
    password:'mypass',
    database:'erp_machinesight3',
    charset :'utf8'
});
connection.connect(function(error) {if(error) console.log(error);});


// const mariadb = require("mariadb");
// const connection = mariadb.createPool({
    //      host: 'mydb.com', 
    //      user:'myUser', 
    //      password: 'myPassword',
    //      connectionLimit: 25
    // });
//connection.connect(function(error) {if(error) console.log(error);});
    
module.exports = connection; 