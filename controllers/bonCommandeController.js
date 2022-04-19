const { response } = require('express');
let BonCommande = require('../models/bonCommandeModel');
let connection = require('../db');
const { goToBonCommande } = require('./projetController');

let bonCommandeList = [];

exports.bonCommandeList = function(request, response){
    //affiche la liste des projet
    bonCommandeList.length = 0;
    connection.query("SELECT * from boncommande;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let bonCommande = new BonCommande(resultSQL[i].idBonCommande,resultSQL[i].refFournisseur,resultSQL[i].description,resultSQL[i].prixTotal,resultSQL[i].remise,resultSQL[i].descriptionProjet,resultSQL[i].client,resultSQL[i].nomPrenomProjet,resultSQL[i].idProjet,resultSQL[i].idFournisseur,resultSQL[i].dateCommande,resultSQL[i].dateEcheance,resultSQL[i].statut,resultSQL[i].par,resultSQL[i].approbation,resultSQL[i].numOffreFournisseur,resultSQL[i].prctageRemiseGlobCommande,resultSQL[i].acompte,resultSQL[i].remarques);
            bonCommandeList.push(bonCommande);
        }
        response.render('bonCommande.ejs', {bonCommande :resultSQL}); 
    });
};

exports.goToFournisseur = function(req, res){
    //on veut afficher fournisseur
    res.redirect('/fournisseurs');
}
exports.goToProjet = function(req, res){
    //on veut afficher projet
    res.redirect('/projet');
}
exports.goToNomenclature = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/nomenclature');
}

exports.enregistrementBonCommande = async function(req, res){
    //Enregistrement depuis géneration PDF
    let idBonCommande = req.body.idBonCommande;
    let numOffreFournisseur = req.body.numOffreFournisseur;
    let description = req.body.description
    let descriptionProjet =  req.body.nomProjet;
    let prixTotal = req.body.TVAC;
    let idProjet0 = req.body.idProjet0;
    let idFournisseur0 = req.body.idFournisseur0;
    let nomPrenomFournisseur = req.body.nomPrenomFournisseur;
    let dateCommande = req.body.dateCommande;
    let pseudo0 = req.body.pseudo0;

    let newBonCommande = new BonCommande(idBonCommande, 0, description, prixTotal, 0, idProjet0, idFournisseur0, dateCommande, 0, 0, pseudo0, 0, numOffreFournisseur, 0, 0, 0, descriptionProjet,0, nomPrenomFournisseur);
    bonCommandeList.push(newBonCommande);
    let todo = [idBonCommande, description, prixTotal, idProjet0,idFournisseur0,dateCommande, pseudo0, numOffreFournisseur, descriptionProjet, nomPrenomFournisseur];
    
    const sqlSelect = "SELECT idBonCommande FROM boncommande WHERE idBonCommande=?";
    const select_querty = connection.format(sqlSelect, [idBonCommande]);
    const sqlInsert = "INSERT INTO boncommande(idBonCommande, description, prixTotal, idProjet0, idFournisseur0, dateCommande, pseudo0, numOffreFournisseur, descriptionProjet, nomPrenomFournisseur) VALUES (?,?,?,?,?,?,?,?,?,?)";
    const insert_query = connection.format(sqlInsert, todo);
    
    let formatGood = false;
    for (elem of todo) {
        if (elem.length<45){
            formatGood = true;
        }
        else {
            formatGood = false;
            break;
        }
    }
    if (formatGood==true){
        await connection.query(select_querty, async (error, resultSQL) => {
            if (resultSQL.length==0){
                await connection.query(insert_query, (error, resultSQL) =>{
                    if (error){
                        console.log(error);
                    } else {
                        console.log("Ajouté en bdd");
                    }
                })
            } else {
                console.log("idBonCommande deja en bdd");
            }
        })
    } else {
        console.log("Format des données dépasse les 45 caractères authorisé")
    }
    res.redirect('/bonCommande');
}

exports.bonCommandeModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID.replace('-','');
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    if (newData.length < 45) {
        connection.query('UPDATE boncommande SET ?? = ? WHERE idBonCommande = ?;',[myColumn,newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        }); 
    } else {
        console.log("Caractères maximum authorisé dépassé !")
    }
    response.redirect('/bonCommande');
}