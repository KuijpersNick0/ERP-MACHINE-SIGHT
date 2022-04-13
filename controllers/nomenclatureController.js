const { response } = require('express');
let Nomenclature = require('../models/nomenclatureModel');
let connection = require('../db');
const { cp } = require('fs');
const res = require('express/lib/response');
let fournisseurController0 = require('../controllers/fournisseurController');

let nomenclatureList = [];
let nomenclatureListPDF = [];
let nomenclatureDejaInscrit = [];
let monFournisseur;
let monFournisseurID;
let reference; 

exports.nomenclatureList = function(request, response){
    //affiche la liste des projet
    connection.query("SELECT * FROM nomenclature; ;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let nomenclature = new Nomenclature(resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].n_piece_plan,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur,resultSQL[i].refDescriptionFournisseur,resultSQL[i].prixnetUnitaireMS,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge,resultSQL[i].prixunitclient,resultSQL[i].prixtotalclient,resultSQL[i].datedelivraisonprevue,resultSQL[i].statut,resultSQL[i].bonDeCommande, resultSQL[i].commentaire,resultSQL[i].numProjet,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur0,resultSQL[i].idNomenclature);
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
        if (id==nomenclatureList[i].idPiece){
            let monID = i;
            if (nomenclatureDejaInscrit.includes(nomenclatureList[monID])){
                console.log("deja inscrit");
                break;
            }
            else{
                console.log("ajout réussi");
                nomenclatureDejaInscrit.push(nomenclatureList[monID]);
                nomenclatureListPDF.push(nomenclatureList[monID]);
                break;
            }
        }
    }
    res.redirect('/nomenclature');
}

exports.nomenclatureToPDF = function(request, response){
    //Gere le print PDF avec la liste générée par nomenclatureAjoutListePDF
    if(nomenclatureListPDF.length==0){
        console.log("Erreur rien n'a été ajouté");
        response.redirect('/nomenclature');
    }else{
        let mesFournisseur = fournisseurController0.getFournisseur();
        monFournisseurID = nomenclatureListPDF[0].idFournisseur0;   
        for (var i=0;i<mesFournisseur.length;i++){
            if (monFournisseurID==mesFournisseur[i].idFournisseur){
                //je prends seulement 1 fournisseur en compte
                monFournisseur = mesFournisseur[i];
                break;
            }
        }
        response.render('pdfTemplate.ejs', {nomenclatureElemPDF:nomenclatureListPDF, fournisseur :monFournisseur, reference :reference}); 
    }
};

exports.nomenclatureModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID;
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    connection.query('UPDATE nomenclature SET ?? = ? WHERE idPiece = ?;',[myColumn,newData,myID], function(error, resultSQL){
        if (error) throw error;
        else{
            console.log("modif enregistrer en bdd");
        }
    });
    response.redirect('/nomenclature');
}

exports.resetPanier = function(request, response){
    //apres une modification les articles mis ne sont pas remis a jour, ce bouton reset le panier à 0
    nomenclatureListPDF.length = 0;
    monFournisseur = 0;
    monFournisseurID = 0;
    nomenclatureDejaInscrit.length=0;
    console.log("Reset effectué");
    response.redirect('/nomenclature');
}

exports.nomenclatureAjoutPDF = function(request, response){
    //information supplementaire pour generation bon de commande
    reference = request.body.reference;
}
