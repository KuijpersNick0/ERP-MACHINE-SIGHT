const { response } = require('express');
let connection = require('../db');
const { cp } = require('fs');
let fournisseurController0 = require('../controllers/fournisseurController');
let userController0 = require('../controllers/userController');
let projetController0 = require('../controllers/projetController');
let bonCommandeController0 = require('../controllers/bonCommandeController');
let nomenclatureController0 = require('../controllers/nomenclatureController');

exports.projetPage = async function (request, response) {
    //Page perso du projet
    let idProjet = request.params.index;
    let mesProjet = await projetController0.getProjet();
    let mesFournisseur = await fournisseurController0.getFournisseur();
    let mesBonCommande = await bonCommandeController0.getBonCommande();
    let mesNomenclature = await nomenclatureController0.getNomenclature();
    //let mesUser = userController0.getUser();
    let monProjet;
    let mesFournisseurNMCLT = [];
    let mesBonCommandeProjet = [];
    //let mesUserProjet = [];
    let fournisseurList = [];

    const myFournisseurSet = new Set()

    for (var i=0; i<mesProjet.length; i++){
        //Projet
        if (mesProjet[i].idProjet==idProjet){
            monProjet=mesProjet[i];
            break;
        }
    }
    for (var i=0; i<mesBonCommande.length; i++){
        //Bons de commande
        //Fournisseur unique
        if (mesBonCommande[i].fkProjet0==monProjet.pkProjet){
            mesBonCommandeProjet.push(mesBonCommande[i]);
            myFournisseurSet.add(mesBonCommande[i].fkFournisseur0);
        }
    }
    myFournisseurArray=[...myFournisseurSet];
    for (var i=0; i<mesFournisseur.length;i++){
        //Fournisseur unique en liste
        for (var j=0; j<myFournisseurArray.length;j++){
            if (mesFournisseur[i].pkFournisseur==myFournisseurArray[j]){
                fournisseurList.push(mesFournisseur[i].alias);
            }
        }
    }

    let dictTable = {};
    for (var i=0; i<mesNomenclature.length; i++){
        //Fournisseur-Articles
        for (var j=0; j<fournisseurList.length;j++){
            if (mesNomenclature[i].fournisseur==fournisseurList[j]){
                if (fournisseurList[j] in dictTable) {
                    dictTable[fournisseurList[j]].push([mesNomenclature[i].idNomenclature, mesNomenclature[i].denomination]);
                } else{
                    dictTable[fournisseurList[j]] = [[mesNomenclature[i].idNomenclature, mesNomenclature[i].denomination]];
                }
            }
        }
    }
    response.render('pagePersoProjet.ejs', {monProjet:monProjet, dictTable:dictTable});
}