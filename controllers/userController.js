const { response } = require('express');
let User = require('../models/userModel');
let connection = require('../db');

let userList = [];

exports.connection = function(req, res) {
    res.render('login.ejs');
}

exports.login = function(req, res) {
    //pour connection
    userList.length = 0;
    let pseudo = req.body.pseudo;
    connection.query('SELECT * FROM user WHERE pseudo = ?;',[pseudo], function(error, resultSQL){
        if (error) throw error;
        else{
            if (resultSQL.length != 0) {
                //User existe deja
                req.session.loggedin = true;
                req.session.user = pseudo;
                req.session.save();
                for (var i=0; i<resultSQL.length; i++){
                    let user = new User(resultSQL[i].pkUser, resultSQL[i].pseudo,resultSQL[i].telephone,resultSQL[i].email, resultSQL[i].poste, resultSQL[i].nomPrenom);
                    userList.push(user);
                } 
                console.log("Authentification réussi");
                res.redirect('/nomenclature');
            } else{
                res.redirect('/connection');
                console.log("Personne d'enregistré !");
            }
        }
    });
}

exports.getUser = function (req, res) {
    //retourne ma liste connecté
    return userList;
  }