const { response } = require('express');
let BonCommande = require('../models/bonCommandeModel');
let connection = require('../db');
const { stat } = require('fs');
const res = require('express/lib/response');
let projetController0 = require('../controllers/projetController');
let fournisseurController0 = require('../controllers/fournisseurController');
let userController0 = require('../controllers/userController');

let bonCommandeList = [];
let idBonCommandes = [];

exports.bonCommandeList = function(request, response){
    //affiche la liste des projet
    bonCommandeList.length = 0;
    connection.query("SELECT * from boncommande_view;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let bonCommande = new BonCommande(resultSQL[i].idBonCommande,resultSQL[i].refFournisseur,resultSQL[i].description,resultSQL[i].prixTotal,resultSQL[i].remise, resultSQL[i].idProjet, resultSQL[i].idFournisseur,resultSQL[i].dateCommande,resultSQL[i].dateEcheance,resultSQL[i].statut,resultSQL[i].par,resultSQL[i].approbation,resultSQL[i].numOffreFournisseur,resultSQL[i].prctageRemiseGlobCommande,resultSQL[i].acompte,
                resultSQL[i].remarques, resultSQL[i].descriptionProjet,resultSQL[i].client,resultSQL[i].aliasFournisseur, resultSQL[i].fkProjet0, resultSQL[i].fkFournisseur0, resultSQL[i].fkClient0, resultSQL[i].fkUser0);
            bonCommandeList.push(bonCommande);
        }
        response.render('bonCommande.ejs', {bonCommande :resultSQL}); 
    });
};

exports.enregistrementBonCommande = async function(req, res){
    //Enregistrement depuis géneration PDF
    let idBonCommande = req.body.idBonCommande;
    let idProjet = req.body.idProjet;
    let idFournisseur = req.body.idFournisseur;
    let pseudo = req.body.pseudo;
    let prixTotal = req.body.TVAC;
    let dateCommande = req.body.dateCommande;
    let numOffreFournisseur = req.body.numOffreFournisseur;
    let mesArticles = req.body.mesArticles;
    let monProjet;
    let monFournisseur;
    let monUser;
    let mesProjet = await projetController0.getProjet();
    let mesFournisseur = await fournisseurController0.getFournisseur();
    let mesUser = userController0.getUser();
    for (var i=0; i<mesProjet.length;i++){
        if (idProjet==mesProjet[i].idProjet){
            monProjet = mesProjet[i];
            break;
        }
    }
    for (var i=0; i<mesFournisseur.length;i++){
        if (idFournisseur==mesFournisseur[i].idFournisseur){
            monFournisseur = mesFournisseur[i];
            break;
        }
    }
    for (var i=0; i<mesUser.length;i++){
        if (pseudo==mesUser[i].pseudo){
            monUser = mesUser[i];
            break;
        }
    }
    const sqlSelect = "SELECT idBonCommande FROM boncommande WHERE idBonCommande=?";
    const select_query = connection.query(sqlSelect, [idBonCommande]);
    const sqlInsert = "INSERT INTO boncommande(idBonCommande, description, prixTotal, fkProjet0, fkFournisseur0, dateCommande, fkUser0, numOffreFournisseur) VALUES (?,?,?,?,?,?,?,?);";
    let todo = [idBonCommande, monProjet.description, prixTotal, monProjet.pkProjet, monFournisseur.pkFournisseur, dateCommande, monUser.pkUser, numOffreFournisseur];
    const insert_query = connection.query(sqlInsert, todo);
    const sqlInsertNomenclature = "UPDATE nomenclature SET fkBonCommande=? WHERE pkNomenclature IN (?) ";
    const insertNomenclature_query = connection.query(sqlInsertNomenclature, [idBonCommande,[mesArticles]]);

    let formatGood = false;
    for (elem of todo) {
        if (elem.length<45 || elem.length==undefined){
            formatGood = true;
        }
        else {
            formatGood = false;
            break;
        }
    }
    if (formatGood==true){
        await connection.query(select_query, async (error, resultSQL) => {
            if (resultSQL.length==0){
                await connection.query(insert_query, async (error, resultSQL) =>{
                    if (error){
                        console.log(error);
                    } else {
                        await connection.query(insertNomenclature_query, (error, resultSQL) =>{
                            if (error) throw (error)
                            else{
                                console.log("Ajouté en bdd");
                            }
                        })
                    }
                })
            }else {
                console.log("idBonCommande deja en bdd");
            }
        })
    } else {
        console.log("Format des données dépasse les 45 caractères authorisé")
    }
    res.redirect('/bonCommande');
}

exports.bonCommandeModification = async function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID.replace('-','');
    newData = newData.replace(/^\s+|\s+$/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
        //modification sur une view de plusieurs tableaux impossible, je dois segmenter les modifications
    let bonCommandeArray = ["refFournisseur", "description", "prixTotal", "remise", "dateCommande", "dateEcheance", "statut", "approbation", "numOffreFournisseur", "prctageRemiseGlobCommande", "acompte", "remarques"];
    let projetArray = ["idProjet", "descriptionProjet"];
    let fournisseurArray = ["idFournisseur", "aliasFournisseur"];
    let clientArray = ["client"];
    let userArray = ["par"];
    let monBonCommande;
    let todo;
    for (var i=0; i<bonCommandeList.length; i++){
        if (bonCommandeList[i].idBonCommande==myID){
            monBonCommande = bonCommandeList[i];
            break;
        }
    }
    if (newData.length < 45 && bonCommandeArray.includes(myColumn)) {
        if (myColumn=="statut" && newData=="recept"){
            //Si mon bon de commande est mis en recept j'update tout les articles lié à recept
            connection.query("UPDATE nomenclature SET statut=? WHERE fkBonCommande=?;",[newData,myID], function(error, resultSQL){
                if (error) throw error
                else {
                    console.log('MAJ statut recept NMCLT-BDC');
                }
            })
        } 
        connection.query('UPDATE boncommande SET ' + connection.escapeId(myColumn) + ' = ? WHERE idBonCommande = ?;',[newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        }); 
    } 
    else if (newData.length < 45 && projetArray.includes(myColumn) && monBonCommande.fkProjet0!=null) {
        switch (myColumn) {
            case "descriptionProjet":
                myColumn="description";
                connection.query('UPDATE projet SET ' + connection.escapeId(myColumn) + ' = ? WHERE pkProjet = ?;', [newData,monBonCommande.fkProjet0], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
                break;
            case "idProjet":
                //je dois modifier idProjet et ma fkProjet correspondant au nouveau projet
                const sqlSelect = "SELECT pkProjet FROM projet WHERE idProjet=?";
                const select_query = connection.query(sqlSelect, [newData]);
                const sqlUpdate = "UPDATE boncommande SET fkProjet0=? WHERE idBonCommande=?";
                await connection.query(select_query, async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].pkProjet;
                            }
                            const update_query = connection.query(sqlUpdate, [todo, myID]);
                            await connection.query(update_query, (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ projet et boncommande");
                                }
                            })
                        } else {
                            console.log("idProjet invalide");
                        }
                    }
                })
                break;
            default:
                console.log("défaut switch modif boncommande->projet");
        } 
    } 
    else if (newData.length < 45 && fournisseurArray.includes(myColumn) && monBonCommande.fkFournisseur0!=null ){
        switch(myColumn){
            //Pas modifiable pour le moment dangereux modif alias
            case "aliasFournisseur":
                myColumn = "alias";
                connection.query('UPDATE fournisseur SET ' + connection.escapeId(myColumn) + ' = ? WHERE pkFournisseur = ?;', [newData,monBonCommande.fkFournisseur0], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
                break;
            case "idFournisseur":
                //idem idProjet
                const sqlSelect = "SELECT pkFournisseur FROM fournisseur WHERE idFournisseur=?";
                const select_query = connection.query(sqlSelect, [newData]);
                const sqlUpdate = "UPDATE boncommande SET fkFournisseur0=? WHERE idBonCommande=?";
                await connection.query(select_query, async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].pkFournisseur;
                            }
                            const update_query = connection.query(sqlUpdate, [todo, myID]);
                            await connection.query(update_query, (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ fournisseur et boncommande");
                                }
                            })
                        } else {
                            console.log("idFournisseur invalide");
                        }
                    }
                })
                break;
            default:
                console.log("défaut switch modif boncommande->fournisseur");
        } 
    } 
    else if (newData.length < 45 && clientArray.includes(myColumn)){
        const sqlSelect = "SELECT pkClient FROM client WHERE nomPrenom=?";
        const select_query = connection.query(sqlSelect, [newData]);
        const sqlUpdate = "UPDATE boncommande SET fkClient0=? WHERE idBonCommande=?";
        await connection.query(select_query, async(error, resultSQL) => {
            if (error) throw (error)
            else {
                if (resultSQL.length != 0){
                    for (var j=0; j<resultSQL.length; j++){
                        todo = resultSQL[j].pkClient;
                    }
                    const update_query = connection.query(sqlUpdate, [todo, myID]);
                    await connection.query(update_query, (error, resultSQL) => {
                        if (error) throw error;
                        else {
                            console.log("MAJ boncommande et client");
                        }
                    })
                } else {
                    console.log("nomPrenomClient invalide");
                }
            }
        })
    }
    else if (newData.length < 45 && userArray.includes(myColumn)){
        const sqlSelect = "SELECT pkUser FROM user WHERE pseudo=?";
        const select_query = connection.query(sqlSelect, [newData]);
        const sqlUpdate = "UPDATE boncommande SET fkUser0=? WHERE idBonCommande=?";
        await connection.query(select_query, async(error, resultSQL) => {
            if (error) throw (error)
            else {
                if (resultSQL.length != 0){
                    for (var j=0; j<resultSQL.length; j++){
                        todo = resultSQL[j].pkUser;
                    }
                    const update_query = connection.query(sqlUpdate, [todo, myID]);
                    await connection.query(update_query, (error, resultSQL) => {
                        if (error) throw error;
                        else {
                            console.log("MAJ boncommande et user");
                        }
                    })
                } else {
                    console.log("pseudo invalide");
                }
            }
        })
    }
    else {
        console.log("Caractères maximum authorisé dépassé !")
    }
    response.redirect('/bonCommande');
}

exports.selectAll = function(request, response){
    //Selectionner id visible à mon utilisateur
    idBonCommandes.length = 0; 
    idBonCommandes = request.body.idBonCommandes;
}

exports.modifAllForm = function(request, response){
    //affiche form pour tout modifier
    response.render('modifAllBonCommande.ejs');
}

exports.modifAllBonCommande = function(request, response){
    let description = request.body.description;
    let prixTotal = request.body.prixTotal;
    let remise = request.body.remise;
    let statut = request.body.statut;
    for (var i=0; i<bonCommandeList.length; i++){
        for (var j=0; j<idBonCommandes.length; j++){
            if (bonCommandeList[i].idBonCommande==idBonCommandes[j]) {
                //changement local de la liste des projets
                bonCommandeList[i].description = description;
                bonCommandeList[i].prixTotal = prixTotal;
                bonCommandeList[i].remise = remise;
                bonCommandeList[i].statut = statut;
            }
        }
    } 
    if (prixTotal.length<45 && description.length<45 && remise.length<45 && statut.length<45){
        //update bdd + verif suppl longueur
        const sqlUpdate = "UPDATE boncommande SET description=?, prixTotal=?, remise=?, statut=?  WHERE idBonCommande IN (?)";
        let todo = [description, prixTotal, remise, statut, [idBonCommandes]];
        connection.query(sqlUpdate, todo, function(err, result){
            if (err) throw err;
            console.log("ajout bdd");
        });
    } else {
        console.log("Data trop long");
    }
    response.redirect('/bonCommande');
}

exports.getBonCommande = function (req, res) {
    //retourne liste bon de commande
    bonCommandeList.length = 0;
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM boncommande_view;', function(error, resultSQL){
            if (error){
                console.log(error);
            } 
            for (var i=0; i<resultSQL.length; i++){
                let bonCommande = new BonCommande(resultSQL[i].idBonCommande,resultSQL[i].refFournisseur,resultSQL[i].description,resultSQL[i].prixTotal,resultSQL[i].remise, resultSQL[i].idProjet, resultSQL[i].idFournisseur,resultSQL[i].dateCommande,resultSQL[i].dateEcheance,resultSQL[i].statut,resultSQL[i].par,resultSQL[i].approbation,resultSQL[i].numOffreFournisseur,resultSQL[i].prctageRemiseGlobCommande,resultSQL[i].acompte,
                    resultSQL[i].remarques, resultSQL[i].descriptionProjet,resultSQL[i].client,resultSQL[i].aliasFournisseur, resultSQL[i].fkProjet0, resultSQL[i].fkFournisseur0, resultSQL[i].fkClient0, resultSQL[i].fkUser0);
                bonCommandeList.push(bonCommande);
            }
            return resolve(bonCommandeList);
        })
    })
}

exports.deleteBonCommande = async function(req, res) {
    let idBonCommande = req.params.index;
    let dataDelete = []
    for (var i=0; i<bonCommandeList.length; i++){
        if (idBonCommande==bonCommandeList[i].idBonCommande){
            dataDelete.push(bonCommandeList[i].idBonCommande, bonCommandeList[i].refFournisseur, bonCommandeList[i].description, bonCommandeList[i].prixTotal, bonCommandeList[i].remise, bonCommandeList[i].fkProjet0, bonCommandeList[i].fkFournisseur0, bonCommandeList[i].fkClient0, bonCommandeList[i].fkUser0, bonCommandeList[i].dateCommande, bonCommandeList[i].dateEcheance, bonCommandeList[i].statut, bonCommandeList[i].approbation, bonCommandeList[i].numOffreFournisseur, bonCommandeList[i].prctageRemiseGlobCommande, bonCommandeList[i].acompte, bonCommandeList[i].remarques);
            break;
        }
    }
    const sqlDelete = "DELETE FROM boncommande WHERE idBonCommande = ?";
    const delete_query = connection.query(sqlDelete, [idBonCommande]);
    const sqlInsert = "INSERT INTO boncommande_delete (idBonCommande, refFournisseur, description, prixTotal, remise, fkProjet0, fkFournisseur0, fkClient0, fkUser0, dateCommande, dateEcheance, statut, approbation, numOffreFournisseur, prctageRemiseGlobCommande, acompte, remarques) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const insert_query = connection.query(sqlInsert, dataDelete);
    for (var i=0; i<bonCommandeList.length; i++){
        if (idBonCommande==bonCommandeList[i].idBonCommande){
            bonCommandeList.splice(i,1);
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
                    console.log("Ajouté a table 'boncommande_delete'");
                }
            })
        }
    });
    res.redirect('/bonCommande');
}