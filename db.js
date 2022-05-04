// var mysql = require("mysql");
// var connection = mysql.createConnection({
//     host    :'localhost',
//     user    :'root',
//     password:'mypass',
//     database:'erp_machinesight3',
//     charset :'utf8'
// });
// connection.connect(function(error) {if(error) console.log(error);});

const mariadb = require("mariadb/callback");
const connection = mariadb.createConnection({
    host    :'192.168.14.200',
    port    :'3306',
    user    :'admin_erp',
    password:'Aye@69OO_ERP',
    database:'ERP_MS',
    charset :'utf8'
});



module.exports = connection; 