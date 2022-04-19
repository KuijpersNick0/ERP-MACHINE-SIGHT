const { response } = require('express');
let Fournisseur = require('../models/fournisseurModel');
let connection = require('../db');

var fournisseurList0 = [];

exports.fournisseurList = function(req, res){
    //affiche liste fournisseur
    fournisseurList0.length = 0;
    connection.query("SELECT * from fournisseur;", function(error, resultSQL){
        if (error) {
            console.log(error);
        }
        for (var i=0; i<resultSQL.length; i++){
            let fournisseur = new Fournisseur(resultSQL[i].listeFournisseur,resultSQL[i].idFournisseur,resultSQL[i].societe,resultSQL[i].nomPrenom,resultSQL[i].adresse1,resultSQL[i].adresse2,resultSQL[i].cPostal,resultSQL[i].ville,resultSQL[i].pays,resultSQL[i].telephone,resultSQL[i].portable,resultSQL[i].site,resultSQL[i].email,resultSQL[i].nTVA,resultSQL[i].tauxTVA,resultSQL[i].langue,resultSQL[i].remarques,resultSQL[i].tauxEchange);
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
    fournisseurList0.length = 0;
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM fournisseur;", function(error, resultSQL){
            if (error) throw error
            for (var i=0; i<resultSQL.length; i++){
                let fournisseur = new Fournisseur(resultSQL[i].listeFournisseur,resultSQL[i].idFournisseur,resultSQL[i].societe,resultSQL[i].nomPrenom,resultSQL[i].adresse1,resultSQL[i].adresse2,resultSQL[i].cPostal,resultSQL[i].ville,resultSQL[i].pays,resultSQL[i].telephone,resultSQL[i].portable,resultSQL[i].site,resultSQL[i].email,resultSQL[i].nTVA,resultSQL[i].tauxTVA,resultSQL[i].langue,resultSQL[i].remarques,resultSQL[i].tauxEchange);
                fournisseurList0.push(fournisseur);
            }
            return resolve(fournisseurList0);
        });
    });
}

exports.deleteFournisseur = async function(req, res){
    let idFournisseur = req.params.index;
    let dataDelete = [];
    for (var i=0; i<fournisseurList0.length; i++){
        if (idFournisseur==fournisseurList0[i].idFournisseur){
            dataDelete.push(fournisseurList0[i].listeFournisseur, fournisseurList0[i].idFournisseur, fournisseurList0[i].societe, fournisseurList0[i].nomPrenom, fournisseurList0[i].adresse1, fournisseurList0[i].adresse2, fournisseurList0[i].cPostal, fournisseurList0[i].ville, fournisseurList0[i].pays, fournisseurList0[i].telephone,
                 fournisseurList0[i].portable, fournisseurList0[i].site, fournisseurList0[i].email, fournisseurList0[i].nTVA, fournisseurList0[i].tauxTVA, fournisseurList0[i].langue, fournisseurList0[i].remarques, fournisseurList0[i].tauxEchange);
            break;
        }
    }

    const sqlDelete = "DELETE FROM fournisseur WHERE idFournisseur = ?";
    const delete_query = connection.format(sqlDelete, [idFournisseur]);
    const sqlInsert = "INSERT INTO fournisseur_delete VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const insert_query = connection.format(sqlInsert, dataDelete);
    for (var i=0; i<fournisseurList0.length; i++){
        if (idFournisseur==fournisseurList0[i].idFournisseur){
            fournisseurList0.splice(i,1);
            console.log("effacé localement");
            break;
        }
    }
    await connection.query (delete_query, async (error, resultSQL) => {
        if (error){
            console.log(error);
        }else{
            console.log("Effacé bdd");
            await connection.query(insert_query, (error, resultSQL) =>{
                if (error) {
                    console.log(error);
                }
                else{
                    console.log("Ajouté a table 'fournisseur_delete'");
                }
            })
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
    let cPostal = req.body.cPostal;
    let ville = req.body.ville;
    let pays = req.body.pays;
    let telephone = req.body.telephone;
    let portable = req.body.portable;
    let site = req.body.site;
    let email = req.body.email;
    let nTVA = req.body.nTVA;
    let tauxTVA = req.body.tauxTVA;
    let langue = req.body.langue;
    let remarques = req.body.remarques;
    let tauxEchange = req.body.tauxEchange;
    let newFournisseur = new Fournisseur(idFournisseur, listeFournisseur, nomPrenom, societe, adresse1, adresse2, cPostal, ville, pays, telephone, portable, site, email, nTVA, tauxTVA, langue, remarques, tauxEchange); //tauxECHange a rajout
    fournisseurList0.push(newFournisseur);
    const sqlInsert = "INSERT INTO fournisseur(idFournisseur,listeFournisseur,nomPrenom, societe, adresse1, adresse2, cPostal, ville, pays, telephone, portable, site, email, nTVA, tauxTVA, langue, remarques, tauxEchange) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let todo = [idFournisseur, listeFournisseur, nomPrenom, societe, adresse1, adresse2, cPostal, ville, pays, telephone, portable, site, email, nTVA, tauxTVA, langue, remarques, tauxEchange];
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
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    if (newData.length < 45) {
        connection.query('UPDATE fournisseur SET ?? = ? WHERE idFournisseur = ?;',[myColumn,newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        });
    } else {
        console.log("Caractères maximum authorisé dépassé !")
    }
    response.redirect('/fournisseurs');
}
