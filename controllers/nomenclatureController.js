const { response } = require('express');
let Nomenclature = require('../models/nomenclatureModel');
let connection = require('../db');
let fournisseurController0 = require('../controllers/fournisseurController');
let userController0 = require('../controllers/userController');
let projetController0 = require('../controllers/projetController');
var fs = require('fs');
const csv = require('fast-csv');

let nomenclatureList = [];
let nomenclatureListPDF = [];
let nomenclatureDejaInscrit = [];
let monFournisseur;
let monPseudo;
let monUser;
let monProjet;
let monProjetID;
let idBonCommandeTemp;
let idNomenclatures = [];
let dictFournisseurNMCLT = {};

let nomenclatureListUpload = [];
const idNomenclatureSet = new Set();
let uncleanListUpload = [];

exports.nomenclatureList = async function(request, response){
    //affiche la liste des projet
    nomenclatureList.length = 0;
    const sqlProcedure = "call maj_fk_nomenclature()";
    const sqlSelect = "SELECT * FROM nomenclature_view";
    
    await connection.query(sqlProcedure, async (error0, resultSQL0) => {
        if (error0){
            console.log(error0);
        } else {
            await connection.query(sqlSelect, (error, resultSQL) => {
                if (error){
                    console.log(error);
                } else {
                    for (var i=0; i<resultSQL.length; i++){
                        let nomenclature = new Nomenclature(resultSQL[i].pkNomenclature, resultSQL[i].idNomenclature, resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].idProjet,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,
                            resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur, resultSQL[i].refFournisseur,resultSQL[i].livraisonPrevue,resultSQL[i].statut
                            ,resultSQL[i].idBonCommande, resultSQL[i].commentaire,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur,resultSQL[i].prixUnitMS,resultSQL[i].prixUnitClient,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge
                            ,resultSQL[i].prixTotalClient, resultSQL[i].effectue,resultSQL[i].refCommande,resultSQL[i].montantDepense,resultSQL[i].par, resultSQL[i].fkProjet, resultSQL[i].fkBonCommande, resultSQL[i].fkFournisseur, resultSQL[i].fkClient, resultSQL[i].fkUser, resultSQL[i].spareParts);
                            nomenclatureList.push(nomenclature);
                        }
                        response.render('nomenclature.ejs', {nomenclature:resultSQL}); 
                    }
            })
        }
    })
};

exports.nomenclatureAjoutListePDF = async function(req, res) {
    //Ajout dans une liste locale les elements sélectionnées pour ensuite les afficher dans mon PDF
    let id = req.params.index;
    const myFournisseurSet = new Set();
    let mesFournisseur = await fournisseurController0.getFournisseur();
    dictFournisseurNMCLT = {};
    
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
    for (var i=0;i<nomenclatureListPDF.length;i++){
        for (var j=0; j<mesFournisseur.length; j++){
            if (nomenclatureListPDF[i].idFournisseur==mesFournisseur[j].idFournisseur){
                myFournisseurSet.add(mesFournisseur[j].alias)
            }
        }
    }
    myFournisseurArray =[...myFournisseurSet];
    for (var j=0; j<nomenclatureListPDF.length;j++){
        for (var i=0;i<myFournisseurArray.length;i++){
            if (nomenclatureListPDF[j].fournisseur==myFournisseurArray[i]){
                if (myFournisseurArray[i] in dictFournisseurNMCLT ) {
                    dictFournisseurNMCLT[myFournisseurArray[i]].push(nomenclatureListPDF[j]);
                } else{
                    dictFournisseurNMCLT[myFournisseurArray[i]] = [nomenclatureListPDF[j]];
                }
            }
        }
    }
    //console.log(dictFournisseurNMCLT)
    res.redirect('/nomenclature');
}

exports.nomenclatureGetidBonCommandeTemp = function(request, response){
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

exports.resetPanier = function(request, response){
    //apres une modification les articles mis ne sont pas remis a jour, ce bouton reset le panier à 0
    nomenclatureListPDF.length = 0;
    monFournisseur = 0;
    nomenclatureDejaInscrit.length=0;
    monProjet=0;
    monProjetID=0;
    idBonCommandeTemp = 'init';
    console.log("Reset effectué");
}

exports.nomenclatureToPDF = async function(request, response){
    //Gere le print PDF avec la liste générée par nomenclatureAjoutListePDF
    if(nomenclatureListPDF.length==0){
        console.log("Erreur rien n'a été ajouté");
        response.redirect('/nomenclature');
    }
    else if (request.session.user == null){
        console.log("Veuillez vous connecter d'abord");
        response.redirect('/connection');
    }else {
        let mesFournisseur = await fournisseurController0.getFournisseur();
        let mesUser = userController0.getUser();
        let mesProjet = await projetController0.getProjet();
        monPseudo = request.session.user;
        monProjetID = nomenclatureListPDF[0].idProjet;
        let [firstFournisseur] = Object.keys(dictFournisseurNMCLT)
        let valeurFournisseur = (dictFournisseurNMCLT[firstFournisseur]);
        
        if (idBonCommandeTemp==null || idBonCommandeTemp=='init'){
            //Plusieurs BDC "en visualisation"
            idBonCommandeTemp = await module.exports.nomenclatureGetidBonCommandeTemp();  
        } else {
            idBonCommandeTemp+=1;
        }
        for (var i=0;i<mesUser.length; i++){
            if (monPseudo.toUpperCase()==mesUser[i].pseudo.toUpperCase()){
                monUser = mesUser[i];
                break;
            }
        }
        for (var i=0;i<mesProjet.length;i++){
            if (monProjetID==mesProjet[i].idProjet){
                //Pour idBonCommande qu'un seul projet..
                monProjet = mesProjet[i];
                break;
            }
        }
        for (var j=0; j<mesFournisseur.length;j++){
            if (firstFournisseur==mesFournisseur[j].alias){
                monFournisseur=mesFournisseur[j];
                break;
            }
        }
        let iterate = Object.keys(dictFournisseurNMCLT).length; 
        if (monFournisseur!=null && monUser!=null && monProjet!=null && Object.keys(dictFournisseurNMCLT).length!=0){
            response.render('pdfTemplate.ejs', {nomenclatureElemPDF:valeurFournisseur, fournisseur :monFournisseur, user : monUser, projet: monProjet, idBonCommande: idBonCommandeTemp, iterate : iterate}); 
            //Je loop mes fournisseurs : nodejs me permet d ouvrir qu'une seule fenetre à la fois  
            if (iterate>1){
                delete dictFournisseurNMCLT[monFournisseur.alias];
            }
        } else {
            console.log("Erreur element null");
            module.exports.resetPanier()
            response.redirect('/nomenclature');
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
    let nomenclatureArray = ["idFournisseur", "idProjet", "fournisseur", "rev", "qte", "unite", "matiere" , "brut", "realisation", "finition", "traitementDeSurface", "planEdite", "livraisonPrevue", "statut", "commentaire", "prixUnitMS", "prixUnitClient", "remise", "prixNetTotal", "marge", "prixTotalClient", "effectue", "refCommande", "montantDepense", "refFournisseur", "spareParts"];
    let nomenclatureArrayBIG = ["denomination"];
    let projetArray = ["nomProjet"];
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
    if (newData.length<45 && nomenclatureArray.includes(myColumn) || newData.length<70 && nomenclatureArrayBIG.includes(myColumn)) {
        connection.query('UPDATE nomenclature SET ' + connection.escapeId(myColumn) + '=? WHERE idNomenclature=?;',[newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        });
        if (myColumn=="statut" && newData=="recept" && monArticle.fkBonCommande!=null){
            //Si tout mes statuts lié au bon de commande sont en recept j'update le bon de commande en recept
            const sqlSelect = 'SELECT (SELECT COUNT(fkBonCommande) FROM nomenclature WHERE fkBonCommande=? AND statut=?) AS sum0, (SELECT COUNT(statut) FROM nomenclature WHERE fkBonCommande=?) AS sum1 FROM nomenclature';
            const sqlUpdate = 'UPDATE boncommande SET statut=? WHERE idBonCommande=?';
            await connection.query(sqlSelect, [monArticle.fkBonCommande, newData, monArticle.fkBonCommande], async (error, resultSQL) => {
                if (error) throw error
                else if (resultSQL[0].sum0 == resultSQL[0].sum1){
                    await connection.query(sqlUpdate, [newData, monArticle.fkBonCommande],(error, resultSQL) => {
                        if (error) throw error;
                        else {
                            console.log("MAJ dans bon de commande recept all")
                        }
                    })
                }
            })
        }
    } 
    else if(newData.length<45 && projetArray.includes(myColumn) && monArticle.fkProjet!=null) {
        switch (myColumn) {
            case "nomProjet":
                myColumn='nom';
                const sqlSelect = "SELECT pkProjet FROM projet WHERE nom=?";
                const sqlUpdate = "UPDATE nomenclature SET fkProjet=? WHERE idNomenclature=?";
                await connection.query(sqlSelect, [newData], async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].pkProjet;
                            }
                            await connection.query(sqlUpdate, [todo, myID], (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ nomenclature et projet");
                                }
                            })
                        } else {
                            console.log("pkProjet invalide");
                        }
                    }
                })
                break;
            default:
                console.log("défaut switch modif nomenclature->projet");
        } 
    }
    // else if (newData.length<45 && fournisseurArray.includes(myColumn) && monArticle.fkFournisseur!=null ){
    //     switch(myColumn){
    //         case "fournisseur":
    //             myColumn = "listeFournisseur";
    //             connection.query('UPDATE fournisseur SET ' + connection.escapeId(myColumn) + ' = ? WHERE pkFournisseur = ?;', [newData,monArticle.fkFournisseur], function(error, resultSQL) {
    //                 if (error) throw error;
    //                 else{
    //                     console.log("modif enregistrer en bdd");
    //                 }
    //             });
    //         break;
    //         default:
    //             console.log("défaut switch modif nomenclature->fournisseur");
    //     } 
    // } 
    else if (newData.length<45 && clientArray.includes(myColumn) && monArticle.fkClient!=null ){
        switch(myColumn){
            case "client":
                myColumn = "nomPrenom";
                const sqlSelect = "SELECT pkClient FROM client WHERE nomPrenom=?";
                const sqlUpdate = "UPDATE nomenclature SET fkClient=? WHERE idNomenclature=?";
                await connection.query(sqlSelect, [newData], async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].pkClient;
                            }
                            await connection.query(sqlUpdate, [todo, myID], (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ nomenclature et client");
                                }
                            })
                        } else {
                            console.log("pkClient invalide");
                        }
                    }
                })
                break;
            default:
                console.log("défaut switch modif nomenclature->client");
        } 
    } 
    else if (newData.length<45 && userArray.includes(myColumn) && monArticle.fkUser!=null ){
        switch(myColumn){
            case "par":
                myColumn = "fkUser";
                const sqlSelect = "SELECT pkUser FROM user WHERE UPPER(pseudo)=?";
                const sqlUpdate = "UPDATE nomenclature SET fkUser=? WHERE idNomenclature=?";
                await connection.query(sqlSelect, [newData.toUpperCase()], async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].pkUser;
                            }
                            await connection.query(sqlUpdate, [todo, myID], (error, resultSQL) => {
                                if (error) throw error;
                                else {
                                    console.log("MAJ nomenclature et user");
                                }
                            })
                        } else {
                            console.log("pkUser invalide");
                        }
                    }
                })
            break;
            default:
                console.log("défaut switch modif nomenclature->user");
        } 
    } 
    else if (newData.length<45 && bonCommandeArray.includes(myColumn)){
        switch(myColumn){
            case "idBonCommande":
                const sqlSelect = "SELECT idBonCommande FROM boncommande WHERE idBonCommande=?";
                const sqlUpdate = "UPDATE nomenclature SET fkBonCommande=? WHERE idNomenclature=?";
                await connection.query(sqlSelect, [newData], async(error, resultSQL) => {
                    if (error) throw (error)
                    else {
                        if (resultSQL.length != 0){
                            for (var j=0; j<resultSQL.length; j++){
                                todo = resultSQL[j].idBonCommande;
                            }
                            await connection.query(sqlUpdate, [todo, myID], (error, resultSQL) => {
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
    let fournisseur = request.body.fournisseur;
    let idProjet = request.body.idProjet;
    for (var i=0; i<nomenclatureList.length; i++){
        //changement local de la liste des projets
        for (var j=0; j<idNomenclatures.length; j++){
            if (nomenclatureList[i].idNomenclature==idNomenclatures[j]){
                nomenclatureList[i].rev = rev;
                nomenclatureList[i].matiere = matiere;
                nomenclatureList[i].remise = remise;
                nomenclatureList[i].effectue = effectue;
                nomenclatureList[i].fournisseur = fournisseur;
                nomenclatureList[i].idProjet = idProjet;
            }
        }
    } 
    if (rev.length<45 && matiere.length<45 && remise.length<45 && effectue.length<45){
        //update bdd + verif suppl longueur
        const sqlUpdate = "UPDATE nomenclature SET rev=?, matiere=?, remise=?, effectue=?, fournisseur=?, idProjet=? WHERE idNomenclature IN (?)";
        let todo = [rev, matiere, remise, effectue, fournisseur, idProjet, [idNomenclatures]];
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
    let dataFormat = true;
    for (var i=0; i<nomenclatureList.length; i++){
        idNomenclatureList.push(nomenclatureList[i].idNomenclature);
    }
    const sqlSelect = "SELECT pkNomenclature, prixUnitClient, qte FROM nomenclature WHERE idNomenclature IN (?)";
    if (idNomenclatureList.length!=null) {
        await connection.query (sqlSelect, [[idNomenclatureList]], async (error, resultSQL) => {
            if (error){
                console.log(error);
            } else{
                for (var j=0; j<resultSQL.length; j++){
                    pkNomenclatureList.push(resultSQL[j].pkNomenclature);
                    if (resultSQL[j].prixUnitClient==null || resultSQL[j].qte==null){
                        dataFormat=false;
                    }
                }
                if (resultSQL.length==pkNomenclatureList.length && dataFormat){
                    const sqlUpdate = "UPDATE nomenclature, fournisseur SET nomenclature.prixTotalClient= nomenclature.qte*nomenclature.prixUnitClient*(1-(nomenclature.remise)/100)*(1+ fournisseur.tauxTVA) WHERE nomenclature.fkFournisseur=fournisseur.pkFournisseur AND pkNomenclature IN (?)";
                    await connection.query(sqlUpdate, [[pkNomenclatureList]], (error, resultSQL) =>{
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
    const sqlInsert = "INSERT INTO nomenclature(idNomenclature, idPiece, idProjet, idFournisseur) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE idNomenclature=idNomenclature";
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
    const sqlSelect = "SELECT * FROM nomenclature_view";
    return new Promise((resolve, reject) => {
        connection.query(sqlProcedure, async (error0, resultSQL0) => {
            if (error0){
                console.log(error0);
            } else {
                await connection.query(sqlSelect, (error, resultSQL) => {
                    if (error){
                        console.log(error);
                    } else {
                        for (var i=0; i<resultSQL.length; i++){
                            let nomenclature = new Nomenclature(resultSQL[i].pkNomenclature, resultSQL[i].idNomenclature, resultSQL[i].idPiece,resultSQL[i].denomination,resultSQL[i].idProjet,resultSQL[i].rev,resultSQL[i].qte,resultSQL[i].unite,resultSQL[i].matiere,
                                resultSQL[i].brut,resultSQL[i].realisation,resultSQL[i].finition,resultSQL[i].traitementDeSurface,resultSQL[i].planEdite,resultSQL[i].fournisseur, resultSQL[i].refFournisseur,resultSQL[i].livraisonPrevue,resultSQL[i].statut
                                ,resultSQL[i].idBonCommande, resultSQL[i].commentaire,resultSQL[i].nomProjet,resultSQL[i].client,resultSQL[i].idFournisseur,resultSQL[i].prixUnitMS,resultSQL[i].prixUnitClient,resultSQL[i].remise,resultSQL[i].prixNetTotal,resultSQL[i].marge
                                ,resultSQL[i].prixTotalClient, resultSQL[i].effectue,resultSQL[i].refCommande,resultSQL[i].montantDepense,resultSQL[i].par, resultSQL[i].fkProjet, resultSQL[i].fkBonCommande, resultSQL[i].fkFournisseur, resultSQL[i].fkClient, resultSQL[i].fkUser, resultSQL[i].spareParts);
                            nomenclatureList.push(nomenclature);
                        }
                        return resolve(nomenclatureList); 
                    }
                })
            }
        })
    })
}

exports.upload = async function(req, res) {
    let fkUser;
    let fdata;
    let par = req.session.user;
    uncleanListUpload.length = 0;
    nomenclatureListUpload.length = 0;
    idNomenclatureSet.clear();
    //Determine fkUser
    if (par==null || par==undefined){
        fkUser = 1; //NUMERO SI PAS CONNECTE
        fdata = await UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);
    } else{
        fkUser = await get_fkUser(par);
        fdata = await UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);
    }
    if (fdata[0]==true) {
        let stringVal = fdata[2];
        let csvData = fdata[1];
        let query = 'INSERT INTO nomenclature(idPiece, denomination, qte, fournisseur, matiere, brut, realisation, finition, refFournisseur, idProjet, idNomenclature, prixUnitClient, fkUser) VALUES '+ stringVal +' ON DUPLICATE KEY UPDATE idNomenclature=idNomenclature';
        connection.query(query, csvData, async(error, response) => {
            if (error){
                console.log(error);
            }
            else{
                console.log('CSV file data has been uploaded in mysql database');
                await connection.query("call nomenclature_fournisseur_upload();", (error, response) => {
                    if (error) throw error;
                    else {
                        console.log('MAJ lien fournisseur-nomenclature');
                    }
                })
            }
        });
        res.redirect('/nomenclature');
    } else {
        res.render('erreurNomenclature.ejs', {uncleanListUpload: fdata[3]});
    }
}

function get_fkUser(par){
    //Eviter js callback hell
    return new Promise(function(resolve, reject){
        const sqlSelect = "SELECT pkUser FROM user WHERE pseudo=?;";
        connection.query(sqlSelect, [par], (error, resultSQL) => {
            if (error) throw error;
            else if (resultSQL.length!=0) {
                resolve(resultSQL[0].pkUser);
            } else {
                reject(new Error("No result"));
            }
        })
    })
}

function UploadCsvDataToMySQL(filePath, fkUser){
    let fichierClean = true;
    if (filePath.charCodeAt(0) === 0xFEFF) {
        //Fichier excell en UTF8-BOM et non pas UTF8, ce if strip le BOM qui génere caractère défectueux
        filePath = stream.substr(filePath);
    }

    //Encodage de solidwork en ANSI, caractère chelou => je fait un changement en UTF8
    //Hardcode ascii car librairie permettant détectage ont trop de dépendances ou indisponible x64
    var file = fs.readFileSync(filePath, {encoding:'ascii'});
    fs.writeFileSync(filePath, file, 'UTF-8');
    
    //Debut lecture fichier
    return new Promise((resolve, reject) => {
        let stream = fs.createReadStream(filePath);
        let csvData = [];
        let csvStream = csv
        .parse()
        .on('error', () => {
            console.log("Fichier csv illisible");
            reject(error);
        })
        .on("data", (row) => {
            let dataGoodFormat = true;
            if (row.length<13){
                for (var i=0; i<row.length; i++){
                    if (row[i].length<70){                   
                        //console.log("data bonne taille");
                        //VARCHAR(70) pour row[2] le reste est varchar(45) enftt
                    } else {
                        console.log("Element de colonne dépasse les 70 caractères authorisé");
                        csvData.length = 0;
                        dataGoodFormat = false;
                        break;
                    }
                }
                if (dataGoodFormat){ 
                    while (row.length<12){
                        //Fichier qui n'ont pas toutes les colonnes (prixUnitaire pas toujours)
                        row.push('');
                    }
                    row.push(fkUser);
                    csvData.push(row);
                }
            } else {
                console.log("Erreur pas les bonnes dimensions colonnes mysql")
            }
        })
        .on("end", function () {
            // Remove Header ROW
            csvData.shift();
            if (csvData.length>0){
                let stringVal = '';
                for (var i=0; i<csvData.length; i++){
                    nomenclatureListUpload.push([csvData[i][0], csvData[i][1], csvData[i][2], csvData[i][3],csvData[i][4],csvData[i][5],csvData[i][6],csvData[i][7],csvData[i][8],csvData[i][9],csvData[i][10],csvData[i][11],csvData[i][12]]);
                    if (idNomenclatureSet.has(csvData[i][10]) || csvData[i][10]==''){
                        //idNomenclature existe deja ou est null
                        fichierClean = false;
                        uncleanListUpload.push([csvData[i][10], csvData[i][8], csvData[i][9]]);
                    } else{
                        idNomenclatureSet.add(csvData[i][10]);
                    }
                    if (i==(csvData.length-1)){
                        //Pour insert mariadb demande plusieurs (?) par element d'insert
                        stringVal += '(?)';
                        break;
                    }
                    stringVal += '(?),';
                }
                for (var j=0; j<nomenclatureList.length; j++){
                    for (var k=0; k<nomenclatureListUpload.length; k++){
                        if(nomenclatureList[j].idNomenclature==nomenclatureListUpload[k][10]){
                            fichierClean = false;
                            uncleanListUpload.push([nomenclatureListUpload[k][10],nomenclatureListUpload[k][8], nomenclatureListUpload[k][9]])
                        }
                    }
                }
                
                let fdata = [fichierClean, csvData, stringVal, uncleanListUpload];
                resolve(fdata);
            } else {
                console.log("Donnée dans le mauvais format");
            }
            // On delete apres avoir enregistrer le fichier
            fs.unlinkSync(filePath)
        }); 
        stream.pipe(csvStream);
    })
}   

exports.uploadSpecial = async function(req, res) {
    let fkUser;
    let fdata;
    let par = req.session.user;
    uncleanListUpload.length = 0;
    nomenclatureListUpload.length = 0;
    idNomenclatureSet.clear();
    //Determine fkUser
    if (par==null || par==undefined){
        fkUser = 1; //NUMERO SI PAS CONNECTE
        fdata = await UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);
    } else{
        fkUser = await get_fkUser(par);
        fdata = await UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);    
    }
    idProjet = fdata[3][0][2];
    fdata = await get_idNomenclature(idProjet, fdata);
    let stringVal = fdata[2];
    let csvData = fdata[1];
    let query = 'INSERT INTO nomenclature(idPiece, denomination, qte, fournisseur, matiere, brut, realisation, finition, refFournisseur, idProjet, idNomenclature, prixUnitClient, fkUser) VALUES '+ stringVal +' ON DUPLICATE KEY UPDATE idNomenclature=idNomenclature';
    connection.query(query, csvData, async(error, response) => {
        if (error){
            console.log(error);
        }
        else{
            console.log('CSV file data has been uploaded in mysql database');
            await connection.query("call nomenclature_fournisseur_upload();", (error, response) => {
                if (error) throw error;
                else {
                    console.log('MAJ lien fournisseur-nomenclature');
                }
            })
        }
    });
    res.redirect('/nomenclature');

}

function get_idNomenclature(idProjet, fdata){
    //Eviter js callback hell
    let pkNomenclature;
    return new Promise(function(resolve, reject){
        const sqlSelect = "SELECT max(pkNomenclature) as pkNomenclature FROM nomenclature WHERE idProjet=? ;";
        connection.query(sqlSelect, [idProjet], (error, resultSQL) => {
            if (error) throw error;
            else if (resultSQL.length!=0) {
                if (resultSQL[0].pkNomenclature==null){
                    pkNomenclature = 0;
                } else {
                    pkNomenclature = resultSQL[0].pkNomenclature;
                }
                for (var i=0; i<fdata[3].length; i++){
                    fdata[1][i][10]=idProjet +'_'+ "100 00 "+ pkNomenclature +" "+ i;
                }
                console.log(fdata[1])
                resolve(fdata);
            } else {
                reject(new Error("No result"));
            }
        })
    })
}