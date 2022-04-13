const { response } = require('express');
let Article = require('../models/articleModel');
let connection = require('../db');

let articleList = [];

exports.articleList = function(req, res){
    //affiche la liste des articles
    connection.query("SELECT * from article;", function(error, resultSQL){
        if (error) {
            console.log(error);
        }
        for (var i=0; i<resultSQL.length; i++){
            let article = new Article(resultSQL[i].refFournisseur,resultSQL[i].refMachineSight,resultSQL[i].prevu,resultSQL[i].effectue,resultSQL[i].description,resultSQL[i].fournisseur,resultSQL[i].refProjet,resultSQL[i].client,resultSQL[i].refFacture,resultSQL[i].refCommande,resultSQL[i].quantite,resultSQL[i].prixUnitaire,resultSQL[i].remise,resultSQL[i].montantDepense,resultSQL[i].par,resultSQL[i].nePasToucher);
            articleList.push(article);
        }
        res.render('article.ejs', {article :resultSQL}); 
    })
}

exports.goToFournisseur = function(req, res){
    //on veut afficher fournisseur
    res.redirect('/fournisseurs');
}
exports.goToProjet = function(req, res){
    //on veut afficher les projets
    res.redirect('/projet');
}
exports.goToBonCommande = function(req, res){
    //on veut afficher bon de commande
    res.redirect('/bonCommande');
}
exports.goToNomenclature = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/nomenclature');
}