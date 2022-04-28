const { response } = require('express');
let Client = require('../models/clientModel');
let connection = require('../db');

let clientList = [];

exports.clientList = function(request, response){
    //affiche la liste des clients
    clientList.length = 0;
    connection.query("SELECT * from client;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let client = new Client(resultSQL[i].pkClient,resultSQL[i].nomPrenom,resultSQL[i].tel, resultSQL[i].email,resultSQL[i].adresse1);
            clientList.push(client);
        }
        response.render('client.ejs', {client :resultSQL}); 
    });
};
