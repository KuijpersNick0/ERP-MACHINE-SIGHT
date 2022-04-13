const { response } = require('express');
let Fournisseur = require('../models/fournisseurModel');
let connection = require('../db');

var fournisseurList0 = [];

exports.fournisseurList = function(req, res){
    //affiche liste fournisseur
    connection.query("SELECT * from fournisseur;", function(error, resultSQL){
        if (error) {
            console.log(error);
        }
        for (var i=0; i<resultSQL.length; i++){
            let fournisseur = new Fournisseur(resultSQL[i].listeFournisseur,resultSQL[i].idFournisseur,resultSQL[i].societe,resultSQL[i].nomPrenom,resultSQL[i].adresse1,resultSQL[i].adresse2,resultSQL[i].cpostal,resultSQL[i].ville,resultSQL[i].pays,resultSQL[i].telephone,resultSQL[i].portable,resultSQL[i].site,resultSQL[i].e_mail,resultSQL[i].nTVA,resultSQL[i].tauxTVA,resultSQL[i].langue,resultSQL[i].remarques,resultSQL[i].liste_fournisseurs);
            fournisseurList0.push(fournisseur);
        }
        res.render('fournisseur.ejs', {fournisseur :resultSQL}); 
    })
}

exports.goToProjet = function(req, res){
    //on veut afficher projets
    res.redirect('/projet');
}
exports.goToArticle = function(req, res){
    //on veut afficher articles
    res.redirect('/article');
}
exports.goToBonCommande = function(req, res){
    //on veut afficher bon de commande
    res.redirect('/bonCommande');
}
exports.goToNomenclature = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/nomenclature');
}

exports.getFournisseur = function (req, res) {
    //retourne fournisseurs
    return fournisseurList0;
  }

exports.deleteFournisseur = function(req, res){
    let idFournisseur = req.params.index;
    for (var i=0; i<fournisseurList0.length; i++){
        if (idFournisseur==fournisseurList0[i].idFournisseur){
            fournisseurList0.splice(i,1);
            console.log("effacé localement");
            break;
        } else {
            console.log("Pas trouver localement");
        }
    }
    connection.query("DELETE FROM fournisseur WHERE idFournisseur = ?;", [idFournisseur], function(error, resultSQL){
        if (error){
            console.log(error);
        }else{
            console.log("Effacer bdd");
        }
    });
    res.redirect('/fournisseurs');
}

exports.ajoutFournisseurForm = function(req, res){
    //affiche le formulaire pour enregistrer un nouveau fournisseur
    res.render('ajoutFournisseur.ejs');
}

exports.ajoutFournisseur = function(req, res){
    //enregistre le nouveau projet localement et sur bdd
    let idFournisseur = req.body.idFournisseur;
    let listeFournisseur = req.body.listeFournisseur;
    let nomPrenom = req.body.nomPrenom;
    let societe = req.body.societe;
    let adresse1 = req.body.adresse1;
    let adresse2 = req.body.adresse2;
    let cpostal = req.body.cpostal;
    let ville = req.body.ville;
    let pays = req.body.pays;
    let telephone = req.body.telephone;
    let portable = req.body.portable;
    let site = req.body.site;
    let e_mail = req.body.email;
    let nTVA = req.body.nTVA;
    let tauxTVA = req.body.tauxTVA;
    let langue = req.body.langue;
    let remarques = req.body.remarques;
    let tauxEchange = req.body.tauxEchange;
    let newFournisseur = new Fournisseur(idFournisseur, listeFournisseur, nomPrenom, societe, adresse1, adresse2, cpostal, ville, pays, telephone, portable, site, e_mail, nTVA, tauxTVA, langue, remarques); //tauxECHange a rajout
    fournisseurList0.push(newFournisseur);
    const sqlInsert = "INSERT INTO fournisseur(idFournisseur,listeFournisseur,nomPrenom, societe, adresse1, adresse2, cpostal, ville, pays, telephone, portable, site, e_mail, nTVA, tauxTVA, langue, remarques) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let todo = [idFournisseur, listeFournisseur, nomPrenom, societe, adresse1, adresse2, cpostal, ville, pays, telephone, portable, site, e_mail, nTVA, tauxTVA, langue, remarques];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });

    res.redirect('/fournisseurs');
} 

exports.fournisseurModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID;
    console.log(request.session);
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    connection.query('UPDATE fournisseur SET ?? = ? WHERE idFournisseur = ?;',[myColumn,newData,myID], function(error, resultSQL){
        if (error) throw error;
        else{
            console.log("modif enregistrer en bdd");
        }
    });
    response.redirect('/fournisseurs');
}

exports.connection = function(req, res) {
    //pour connection
    let pseudo = req.body.pseudo;
    connection.query('SELECT * FROM user WHERE pseudo = ?;',[pseudo], function(error, resultSQL){
        if (error) throw error;
        else{
            if (resultSQL.length != 0) {
                //User existe deja
                req.session.loggedin = true;
                req.session.user = pseudo;
                console.log("Authentification réussi");
            } else{
                console.log("Personne d'enregistré !");
            }
        }
    });
    res.redirect('/fournisseurs');
}