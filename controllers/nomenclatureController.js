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
let idNomenclatures = [];

exports.nomenclatureList = async function(request, response){
    //affiche la liste des projet
    nomenclatureList.length = 0;
    const sqlProcedure = "call maj_fk_nomenclature()";
    const procedure_query = connection.format(sqlProcedure);
    const sqlSelect = "SELECT * FROM nomenclature_view";
    const select_query = connection.format(sqlSelect);

    await connection.query(procedure_query, async (error0, resultSQL0) => {
        if (error0){
            console.log(error0);
        } else {
            await connection.query(select_query, (error, resultSQL) => {
                if (error){
                    console.log(error);
                } else {
                    for (var i=0; i<resultSQL.length; i++){
                        let nomenclature = new Nomenclature(resultSQL[i].pkNomenclature, resultSQL[i].idNomenclature, resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].idProjet,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,
                            resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur, resultSQL[i].refFournisseur,resultSQL[i].livraisonPrevue,resultSQL[i].statut
                            ,resultSQL[i].idBonCommande, resultSQL[i].commentaire,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur,resultSQL[i].prixUnitMS,resultSQL[i].prixUnitClient,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge
                            ,resultSQL[i].prixTotalClient, resultSQL[i].effectue,resultSQL[i].refCommande,resultSQL[i].montantDepense,resultSQL[i].par, resultSQL[i].fkProjet, resultSQL[i].fkBonCommande, resultSQL[i].fkFournisseur, resultSQL[i].fkClient, resultSQL[i].fkUser);
                        nomenclatureList.push(nomenclature);
                    }
                    response.render('nomenclature.ejs', {nomenclature:resultSQL}); 
                }
            })
        }
    })
};

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
    //Recuperer dernier idboncommande incrementé afin de le génerer en visualisation pdf sans confirmation d'insert sql (Auto increment)
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
    }else{
        let mesFournisseur = await fournisseurController0.getFournisseur();
        monFournisseurID = nomenclatureListPDF[0].idFournisseur;   
        let mesUser = userController0.getUser();
        monPseudo = request.session.user;
        let mesProjet = await projetController0.getProjet();
        monProjetID = nomenclatureListPDF[0].idProjet;
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
        if (monFournisseur!=null & monUser!=null & monProjet!=null){
            response.render('pdfTemplate.ejs', {nomenclatureElemPDF:nomenclatureListPDF, fournisseur :monFournisseur, reference :reference, user : monUser, projet: monProjet, idBonCommande: idBonCommandeTemp}); 
        } else {
            console.log("Erreur element null");
        }
    }
};

exports.nomenclatureModification = async function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID;
    newData = newData.replace(/^\s+|\s+$/gm,"");
    myID = myID.replace(/(\r\n|\n|\r)/gm,"").trim();
    let myColumn = request.body.myColumn;
        //modification sur une view de plusieurs tableaux impossible, je dois segmenter les modifications
        //Contrairement au bon de commande idFournisseur et idProjet son dans la table et modifié avec "stored procedures" mysql. 
        //Ce choix est fait car l'upload de nomenclature ne permet pas d'initier les fkeys 
    let nomenclatureArray = ["idFournisseur", "idProjet", "denomination", "rev", "qte", "unite", "matiere" , "brut", "realisation", "finition", "traitementDeSurface", "planEdite", "livraisonPrevue", "statut", "commentaire", "prixUnitMS", "prixUnitClient", "remise", "prixNetTotal", "marge", "prixTotalClient", "effectue", "refCommande", "montantDepense", "refFournisseur"];
    let projetArray = ["nomProjet"];
    let fournisseurArray = ["fournisseur"];
    let clientArray = ["client"];
    let userArray = ["par"];
    let bonCommandeArray = ["idBonCommande"];
    let monArticle;
    let todo;
    for (var i=0; i<nomenclatureList.length; i++){
        if (nomenclatureList[i].idNomenclature==myID){
            monArticle = nomenclatureList[i];
            break;
        }
    }
    if (newData.length<45 && nomenclatureArray.includes(myColumn)) {
        connection.query('UPDATE nomenclature SET ?? = ? WHERE idNomenclature = ?;',[myColumn,newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        });
    } 
    else if(newData.length<45 && projetArray.includes(myColumn) && monArticle.fkProjet!=null) {
        switch (myColumn) {
            case "nomProjet":
                myColumn="nom";
                connection.query('UPDATE projet SET ?? = ? WHERE pkProjet = ?;', [myColumn,newData,monArticle.fkProjet], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
                break;
            default:
                console.log("défaut switch modif nomenclature->projet");
        } 
    }
    else if (newData.length<45 && fournisseurArray.includes(myColumn) && monArticle.fkFournisseur!=null ){
        switch(myColumn){
            case "fournisseur":
                myColumn = "listeFournisseur";
                connection.query('UPDATE fournisseur SET ?? = ? WHERE pkFournisseur = ?;', [myColumn,newData,monArticle.fkFournisseur], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
            break;
            default:
                console.log("défaut switch modif nomenclature->fournisseur");
        } 
    } 
    else if (newData.length<45 && clientArray.includes(myColumn) && monArticle.fkClient!=null ){
        switch(myColumn){
            case "client":
                myColumn = "nomPrenom";
                connection.query('UPDATE client SET ?? = ? WHERE pkClient = ?;', [myColumn,newData,monArticle.fkClient], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
            break;
            default:
                console.log("défaut switch modif nomenclature->client");
        } 
    } 
    else if (newData.length<45 && userArray.includes(myColumn) && monArticle.fkUser!=null ){
        switch(myColumn){
            case "par":
                myColumn = "pseudo";
                connection.query('UPDATE user SET ?? = ? WHERE pkUser = ?;', [myColumn,newData,monArticle.fkUser], function(error, resultSQL) {
                    if (error) throw error;
                    else{
                        console.log("modif enregistrer en bdd");
                    }
                });
            break;
            default:
                console.log("défaut switch modif nomenclature->user");
        } 
    } 
    else if (newData.length<45 && bonCommandeArray.includes(myColumn)){
        switch(myColumn){
            case "idBonCommande":
                const sqlSelect = "SELECT idBonCommande FROM boncommande WHERE idBonCommande=?";
                const select_query = connection.format(sqlSelect, [newData]);
                const sqlUpdate = "UPDATE nomenclature SET fkBonCommande=? WHERE idNomenclature=?";
                await connection.query(select_query, async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].idBonCommande;
                            }
                            const update_query = connection.format(sqlUpdate, [todo, myID]);
                            await connection.query(update_query, (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ nomenclature et boncommande");
                                }
                            })
                        } else {
                            console.log("idBonCommande invalide");
                        }
                    }
                })
                break;
            default:
                console.log("défaut switch modif nomenclature->boncommande");
        } 
    } 
    else {
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

exports.selectAll = function(request, response){
    //Selectionner id visible à mon utilisateur
    idNomenclatures.length = 0; 
    idNomenclatures = request.body.idNomenclatures;
}

exports.modifAllForm = function(request, response){
    //affiche form pour tout modifier
    response.render('modifAllNomenclature.ejs');
}

exports.modifAllNomenclature = function(request, response){
    let rev = request.body.rev;
    let matiere = request.body.matiere;
    let remise = request.body.remise;
    let effectue = request.body.effectue;
    for (var i=0; i<nomenclatureList.length; i++){
        //changement local de la liste des projets
        for (var j=0; j<idNomenclatures.length; j++){
            if (nomenclatureList[i].idNomenclature==idNomenclatures[j]){
                nomenclatureList[i].rev = rev;
                nomenclatureList[i].matiere = matiere;
                nomenclatureList[i].remise = remise;
                nomenclatureList[i].effectue = effectue;
            }
        }
    } 
    if (rev.length<45 && matiere.length<45 && remise.length<45 && effectue.length<45){
        //update bdd + verif suppl longueur
        const sqlUpdate = "UPDATE nomenclature SET rev=?, matiere=?, remise=?, effectue=? WHERE idNomenclature IN ?";
        let todo = [rev, matiere, remise, effectue, [idNomenclatures]];
        connection.query(sqlUpdate, todo, function(err, result){
            if (err) throw err;
            console.log("ajout bdd");
        });
    } else {
        console.log("Data trop long");
    }
    response.redirect('/nomenclature');
}

exports.majPrixTotal = async function(request, response){
    //mise a jour colonne prix total client
    let idNomenclatureList = [];
    let pkNomenclatureList = [];
    for (var i=0; i<nomenclatureList.length; i++){
        idNomenclatureList.push(nomenclatureList[i].idNomenclature);
    }
    const sqlSelect = "SELECT pkNomenclature FROM nomenclature WHERE idNomenclature IN ?";
    const select_query = connection.format(sqlSelect, [[idNomenclatureList]]);
    if (idNomenclatureList.length!=null) {
        await connection.query (select_query, async (error, resultSQL) => {
            if (error){
                console.log(error);
            } else{
                for (var j=0; j<resultSQL.length; j++){
                    pkNomenclatureList.push(resultSQL[j].pkNomenclature);
                }
                if (resultSQL.length==pkNomenclatureList.length){
                    const sqlUpdate = "UPDATE nomenclature, fournisseur SET nomenclature.prixTotalClient= nomenclature.qte*nomenclature.prixUnitClient*(1-(nomenclature.remise)/100)*(1+ fournisseur.tauxTVA) WHERE nomenclature.fkFournisseur=fournisseur.pkFournisseur AND pkNomenclature IN ?";
                    const update_query= connection.format(sqlUpdate, [[pkNomenclatureList]]);
                    await connection.query(update_query, (error, resultSQL) =>{
                        if (error) {
                            console.log(error);
                        }
                        else{
                            console.log("Mis à jour !");
                        }
                    })    
                }else {
                    console.log("erreur");
                }
            }
        });
    } else {
        console.log("Rafraichir la page correctement");
    } 
    response.redirect('/nomenclature');
}

exports.ajoutNomenclatureForm = function(req, res){
    //affiche le formulaire pour enregistrer une nouvelle nomenclature
    res.render('ajoutNomenclature.ejs');
}

exports.ajoutNomenclature = function(req, res){
    //enregistre la nouvelle nomenclature localement et sur bdd
    let idNomenclature = req.body.idNomenclature;
    let idPiece = req.body.idPiece;
    let idProjet = req.body.idProjet;
    let idFournisseur = req.body.idFournisseur;
    let newNomenclature = new Nomenclature(idNomenclature, idPiece, idProjet, idFournisseur);
    nomenclatureList.push(newNomenclature);
        //Rajouter check idprojet unique
    const sqlInsert = "INSERT INTO nomenclature(idNomenclature, idPiece, idProjet, idFournisseur) VALUES (?,?,?,?)";
    let todo = [idNomenclature, idPiece, idProjet, idFournisseur];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });

    res.redirect('/nomenclature');
} 

exports.getNomenclature = async function(req,res){
    nomenclatureList.length = 0;
    const sqlProcedure = "call maj_fk_nomenclature()";
    const procedure_query = connection.format(sqlProcedure);
    const sqlSelect = "SELECT * FROM nomenclature_view";
    const select_query = connection.format(sqlSelect);
    return new Promise((resolve, reject) => {
        connection.query(procedure_query, async (error0, resultSQL0) => {
            if (error0){
                console.log(error0);
            } else {
                await connection.query(select_query, (error, resultSQL) => {
                    if (error){
                        console.log(error);
                    } else {
                        for (var i=0; i<resultSQL.length; i++){
                            let nomenclature = new Nomenclature(resultSQL[i].pkNomenclature, resultSQL[i].idNomenclature, resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].idProjet,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,
                                resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur, resultSQL[i].refFournisseur,resultSQL[i].livraisonPrevue,resultSQL[i].statut
                                ,resultSQL[i].idBonCommande, resultSQL[i].commentaire,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur,resultSQL[i].prixUnitMS,resultSQL[i].prixUnitClient,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge
                                ,resultSQL[i].prixTotalClient, resultSQL[i].effectue,resultSQL[i].refCommande,resultSQL[i].montantDepense,resultSQL[i].par, resultSQL[i].fkProjet, resultSQL[i].fkBonCommande, resultSQL[i].fkFournisseur, resultSQL[i].fkClient, resultSQL[i].fkUser);
                            nomenclatureList.push(nomenclature);
                        }
                        return resolve(nomenclatureList); 
                    }
                })
            }
        })
    })
}