const { response } = require('express');
let Nomenclature = require('../models/nomenclatureModel');
let connection = require('../db');
const { cp } = require('fs');
const res = require('express/lib/response');
let fournisseurController0 = require('../controllers/fournisseurController');
let userController0 = require('../controllers/userController');
let projetController0 = require('../controllers/projetController');

let nomenclatureList = [];
let nomenclatureListPDF = [];
let nomenclatureDejaInscrit = [];
let monFournisseur;
let monFournisseurID;
let reference; 
let monPseudo;
let monUser;
let monProjet;
let monProjetID;
let idBonCommandeTemp;

exports.nomenclatureList = function(request, response){
    //affiche la liste des projet
    nomenclatureList.length = 0;
    connection.query("SELECT * FROM nomenclature;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let nomenclature = new Nomenclature(resultSQL[i].idNomenclature, resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].idProjet1,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,
                resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur,resultSQL[i].refFournisseur,resultSQL[i].livraisonPrevue,resultSQL[i].statut
                ,resultSQL[i].idBonCommande1, resultSQL[i].commentaire,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur1,resultSQL[i].prixUnitMS,resultSQL[i].prixUnitClient,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge
                ,resultSQL[i].prixTotalClient, resultSQL[i].effectue,resultSQL[i].refCommande,resultSQL[i].montantDepense,resultSQL[i].par);
            nomenclatureList.push(nomenclature);
        }
        response.render('nomenclature.ejs', {nomenclature:resultSQL}); 
    });
};

exports.goToFournisseur = function(req, res){
    //on veut afficher fournisseur
    res.redirect('/fournisseurs');
}
exports.goToArticle = function(req, res){
    //on veut afficher articles
    res.redirect('/article');
}
exports.goToBonCommande = function(req, res){
    //on veut afficher bon commande
    res.redirect('/bonCommande');
}
exports.goToProjet = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/projet');
}

exports.nomenclatureAjoutListePDF = function(req, res) {
    //Ajout dans une liste locale les elements sélectionnées pour ensuite les afficher dans mon PDF
    let id = req.params.index;
    for (var i=0; i<nomenclatureList.length; i++){
        if (id==nomenclatureList[i].idNomenclature){
            let monIndex = i;
            if (nomenclatureDejaInscrit.includes(nomenclatureList[monIndex].idNomenclature)){
                console.log("deja inscrit");
                break;
            } else{
                nomenclatureDejaInscrit.push(nomenclatureList[monIndex].idNomenclature);
                nomenclatureListPDF.push(nomenclatureList[monIndex]);
                console.log("ajout réussi");
                break;
            }
        } 
    }
    res.redirect('/nomenclature');
}

nomenclatureGetidBonCommandeTemp = function(request, response){
    //Recuperer dernier id incrementé
    idBonCommandeTemp = 0;
    return new Promise((resolve, reject) => {
        connection.query("SELECT max(idBonCommande) AS res FROM boncommande;", function(error, resultSQL){
            if (error){
                console.log(error);
            } else {
                idBonCommandeTemp = resultSQL[0].res + 1;
                return resolve(idBonCommandeTemp);
            }
        });
    })
}


exports.nomenclatureToPDF = async function(request, response){
    //Gere le print PDF avec la liste générée par nomenclatureAjoutListePDF
    if(nomenclatureListPDF.length==0){
        console.log("Erreur rien n'a été ajouté");
        response.redirect('/nomenclature');
    }
    else if (request.session.user == null){
        console.log("Veuillez vous connecter d'abord");
    } else{
        let mesFournisseur = await fournisseurController0.getFournisseur();
        monFournisseurID = nomenclatureListPDF[0].idFournisseur1;   
        let mesUser = userController0.getUser();
        monPseudo = request.session.user;
        let mesProjet = await projetController0.getProjet();
        monProjetID = nomenclatureListPDF[0].idProjet1;

        idBonCommandeTemp = await nomenclatureGetidBonCommandeTemp();
        
        for (var i=0;i<mesFournisseur.length;i++){
            if (monFournisseurID==mesFournisseur[i].idFournisseur){
                //je prends seulement 1 fournisseur en compte
                monFournisseur = mesFournisseur[i];
                break;
            }
        }
        for (var i=0;i<mesUser.length; i++){
            if (monPseudo==mesUser[i].pseudo){
                monUser = mesUser[i];
                break;
            }
        }
        for (var i=0;i<mesProjet.length;i++){
            if (monProjetID==mesProjet[i].idProjet){
                monProjet = mesProjet[i];
                break;
            }
        }
        
        if (monFournisseur.length!=0 & monUser!=null & monProjet!=null){
            response.render('pdfTemplate.ejs', {nomenclatureElemPDF:nomenclatureListPDF, fournisseur :monFournisseur, reference :reference, user : monUser, projet: monProjet, idBonCommande: idBonCommandeTemp}); 
        } else {
            console.log("Erreur element null");
        }
    }
};

exports.nomenclatureModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID;
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r)/gm,"").trim();
    let myColumn = request.body.myColumn;
    if (newData.length < 45) {
        connection.query('UPDATE nomenclature SET ?? = ? WHERE idNomenclature = ?;',[myColumn,newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        });
    } else {
        console.log("Caracteres maximum autorisé dépassé !")
    }
    response.redirect('/nomenclature');
}

exports.resetPanier = function(request, response){
    //apres une modification les articles mis ne sont pas remis a jour, ce bouton reset le panier à 0
    nomenclatureListPDF.length = 0;
    monFournisseur = 0;
    monFournisseurID = 0;
    nomenclatureDejaInscrit.length=0;
    monProjet=0;
    monProjetID=0;
    console.log("Reset effectué");
    response.redirect('/nomenclature');
}

exports.nomenclatureAjoutPDF = function(request, response){
    //information supplementaire pour generation bon de commande
    reference = request.body.reference;
    console.log('Reference enregistré');
}

