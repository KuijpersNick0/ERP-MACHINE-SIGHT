const { response } = require('express');
let Projet = require('../models/projetModel');
let connection = require('../db');
const { cp } = require('fs');

let projetList = [];
let idProjets = [];

exports.projetList = function(request, response){
    //affiche la liste des projet
    projetList.length = 0;
    connection.query("SELECT * from projet;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let projet = new Projet(resultSQL[i].pkProjet, resultSQL[i].idProjet,resultSQL[i].nom,resultSQL[i].description, resultSQL[i].prixTotalNomenclature, resultSQL[i].prixTotalBonCommande, resultSQL[i].natureProjet);
            projetList.push(projet);
        }
        response.render('projet.ejs', {projet :resultSQL}); 
    });
};

exports.ajoutProjetForm = function(req, res){
    //affiche le formulaire pour enregistrer un nouveau projet
    res.render('ajoutProjet.ejs');
}

exports.getProjet = function (req, res) {
    //retourne liste projets
    projetList.length = 0;
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM projet;', function(error, resultSQL){
            if (error){
                console.log(error);
            } 
            for (var i=0; i<resultSQL.length; i++){
                let projet = new Projet(resultSQL[i].pkProjet, resultSQL[i].idProjet,resultSQL[i].nom,resultSQL[i].description, resultSQL[i].prixTotalNomenclature, resultSQL[i].prixTotalBonCommande, resultSQL[i].natureProjet);
                projetList.push(projet);
            }
            return resolve(projetList);
        })
    })
}

exports.ajoutProjet = function(req, res){
    //enregistre le nouveau projet localement et sur bdd
    let idProjet = req.body.idProjet;
    let nom = req.body.nom;
    let description = req.body.description;
    let newProjet = new Projet(idProjet, nom, description);
    projetList.push(newProjet);
        //Rajouter check idprojet unique
    const sqlInsert = "INSERT INTO projet(idProjet,nom,description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE idProjet=idProjet";
    let todo = [idProjet, nom, description];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });

    res.redirect('/projet');
} 

exports.deleteProjet = async function(req, res){
    //Enlever ds table "projet" et enregistrer ds table des "projet_delete"
    let idProjet = req.params.index;
    let dataDelete = [];
    for (var i=0; i<projetList.length; i++){
        if (idProjet==projetList[i].idProjet){
            dataDelete.push(projetList[i].pkProjet, projetList[i].idProjet, projetList[i].nom, projetList[i].description, projetList[i].prixTotalNomenclature, projetList[i].prixTotalBonCommande, projetList[i].natureProjet);
            break;
        }
    }
    const sqlDelete = "DELETE FROM projet WHERE idProjet = ?";
    const delete_query = connection.query(sqlDelete, [idProjet]);
    const sqlInsert = "INSERT INTO projet_delete (pkProjet, idProjet, nom, description, prixTotalNomenclature, prixTotalBonCommande, natureProjet) VALUES (?,?,?,?,?,?,?)"
    const insert_query = connection.query(sqlInsert, dataDelete);
    for (var i=0; i<projetList.length; i++){
        if (idProjet==projetList[i].idProjet){
            projetList.splice(i,1);
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
                    console.log("Ajouté a table 'projet_delete'");
                }
            })
        }
    });
    res.redirect('/projet');
}

exports.projetModification = function(request, response){
    //Enregistre modification en bdd avec method fetch-POST
    let newData = request.body.newData;
    let myID = request.body.myID;
    newData = newData.replace(/^\s+|\s+$/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    if (newData.length < 45){
        connection.query('UPDATE projet SET ' + connection.escapeId(myColumn) + '=? WHERE idProjet=?;',[newData,myID], function(error, resultSQL){
            if (error) throw error;
            else if (resultSQL.length==0){
                console.log("Erreur aucun element update")
            }else{
                console.log("Modif enregistrer en bdd");
            }
        });
    } else {
        console.log("Caractères maximum authorisé dépassé !")
    }
    response.redirect('/projet');
}

exports.selectAll = function(request, response){
    //Selectionner id visible à mon utilisateur
    idProjets.length = 0; 
    idProjets = request.body.idProjets;
}

exports.modifAllForm = function(request, response){
    //affiche form pour tout modifier
    response.render('modifAllProjet.ejs');
}

exports.modifAllProjet = function(request, response){
    let nom = request.body.nom;
    let description = request.body.description;
    for (var i=0; i<projetList.length; i++){
        //changement local de la liste des projets
        for (var j=0; j<idProjets.length; j++){
            if (projetList[i].idProjet==idProjets[j]){
                projetList[i].nom = nom;
                projetList[i].description = description;
            }
        }
    } 
    if (nom.length<45 && description.length<45){
        //update bdd + verif suppl longueur
        const sqlUpdate = "UPDATE projet SET nom=?, description=? WHERE idProjet IN (?)";
        let todo = [nom, description, [idProjets]];
        connection.query(sqlUpdate, todo, function(err, result){
            if (err) throw err;
            console.log("ajout bdd");
        });
    } else {
        console.log("Data trop long");
    }
    response.redirect('/projet');
}

exports.majPrixTotal = async function(request, response){
    //mise a jour colonne prix total
    const sqlUpdateNomenclature = "UPDATE projet JOIN nomenclature ON projet.pkProjet = nomenclature.fkProjet  SET projet.prixTotalNomenclature = (SELECT SUM(prixTotalClient) FROM nomenclature WHERE nomenclature.fkProjet=projet.pkProjet) WHERE pkProjet = fkProjet;";
    const updateNomenclature_query = connection.query(sqlUpdateNomenclature);
    const sqlUpdateBonCommande = "UPDATE projet JOIN boncommande ON projet.pkProjet = boncommande.fkProjet0  SET projet.prixTotalBonCommande = (SELECT SUM(prixTotal) FROM boncommande WHERE boncommande.fkProjet0=projet.pkProjet) WHERE pkProjet = fkProjet0;";
    const updateBonCommande_query = connection.query(sqlUpdateBonCommande);
    
    await connection.query(updateNomenclature_query, async (error, resultSQL) => {
        if (error){
            console.log(error);
        } else {
            await connection.query(updateBonCommande_query, async (error, resultSQL1) => {
                if (error) {
                    console.log(error)
                } else {                      
                    console.log("MAJ effectué");
                }
            })
        }
    })
    response.redirect('/projet');
}

exports.processStop = function(request, response){
    process.exit(0);
}