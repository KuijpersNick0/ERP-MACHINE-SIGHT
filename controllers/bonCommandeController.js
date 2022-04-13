const { response } = require('express');
let BonCommande = require('../models/bonCommandeModel');
let connection = require('../db');

let bonCommandeList = [];

exports.bonCommandeList = function(request, response){
    //affiche la liste des projet
    connection.query("SELECT * from boncommande;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let bonCommande = new BonCommande(resultSQL[i].idBonCommande,resultSQL[i].refFournisseur,resultSQL[i].description,resultSQL[i].quantite,resultSQL[i].prixUnitaire,resultSQL[i].remise,resultSQL[i].refProjet,resultSQL[i].numFournisseur,resultSQL[i].nom,resultSQL[i].contact,resultSQL[i].dateCommande,resultSQL[i].dateEcheance,resultSQL[i].statut,resultSQL[i].acheteur,resultSQL[i].approbation,resultSQL[i].numOffreFournisseur,resultSQL[i].prctageRemiseGlobCommandeFacultatif,resultSQL[i].acompteFacultatif,resultSQL[i].remarquesFacultatif);
            bonCommandeList.push(bonCommande);
        }
        response.render('bonCommande.ejs', {bonCommande :resultSQL}); 
    });
};

exports.goToFournisseur = function(req, res){
    //on veut afficher fournisseur
    res.redirect('/fournisseurs');
}
exports.goToArticle = function(req, res){
    //on veut afficher article
    res.redirect('/article');
}
exports.goToProjet = function(req, res){
    //on veut afficher projet
    res.redirect('/projet');
}
exports.goToNomenclature = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/nomenclature');
}

exports.enregistrementBonCommande = function(req, res){
    let numOffreFournisseur = req.body.numOffreFournisseur;
    numOffreFournisseur=numOffreFournisseur.replace('-','');
    let idBonCommande = req.body.idBonCommande;
    let nomProjet =  req.body.nomProjet;
    let TVAC = req.body.TVAC;
    let idProjet = req.body.idProjet;
    let idFournisseur = req.body.idFournisseur;
    let societe = req.body.societe;
    let contact = req.body.contact;
    let dateCommande = req.body.dateCommande;
    let newBonCommande = new BonCommande(idBonCommande,nomProjet,TVAC, 0,idProjet, idFournisseur,contact, dateCommande,0,0,societe,numOffreFournisseur,0,0,0,0);
    bonCommandeList.push(newBonCommande);
    const sqlInsert = "INSERT INTO boncommande(idBonCommande, description, prixUnitaire, refProjet, numFournisseur, contact, dateCommande, nom, numOffreFournisseur ) VALUES (?,?,?,?,?,?,?,?,?)";
    let todo = [idBonCommande, nomProjet, TVAC, idProjet,idFournisseur,contact, dateCommande, societe, numOffreFournisseur];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });
    res.redirect('/bonCommande');
}

exports.bonCommandeModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    console.log(req.session.user);
    let newData = request.body.newData;
    let myID = request.body.myID.replace('-','');
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    console.log(myColumn, newData, myID);
    connection.query('UPDATE boncommande SET ?? = ? WHERE idBonCommande = ?;',[myColumn,newData,myID], function(error, resultSQL){
        if (error) throw error;
        else{
            console.log("modif enregistrer en bdd");
        }
    });
    response.redirect('/bonCommande');
}