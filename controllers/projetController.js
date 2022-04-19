const { response } = require('express');
let Projet = require('../models/projetModel');
let connection = require('../db');

let projetList = [];

exports.projetList = function(request, response){
    //affiche la liste des projet
    projetList.length = 0;
    connection.query("SELECT * from projet;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let projet = new Projet(resultSQL[i].idProjet,resultSQL[i].nom,resultSQL[i].description, resultSQL[i].prixTotal);
            projetList.push(projet);
        }
        response.render('projet.ejs', {projet :resultSQL}); 
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
exports.goToNomenclature = function(req, res){
    //on veut afficher nomenclature
    res.redirect('/nomenclature');
}

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
                let projet = new Projet(resultSQL[i].idProjet,resultSQL[i].nom,resultSQL[i].description, resultSQL[i].prixTotal);
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
    const sqlInsert = "INSERT INTO projet(idProjet,nom,description) VALUES (?,?,?)";
    let todo = [idProjet, nom, description];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });

    res.redirect('/projet');
} 

exports.deleteProjet = async function(req, res){
    //Delet projet: enlever ds table "projet" et enregistrer ds table des "projets delete"
    let idProjet = req.params.index;
    let dataDelete = [];
    for (var i=0; i<projetList.length; i++){
        if (idProjet==projetList[i].idProjet){
            dataDelete.push(projetList[i].idProjet, projetList[i].nom, projetList[i].description, projetList[i].prixTotal);
            break;
        }
    }
    const sqlDelete = "DELETE FROM projet WHERE idProjet = ?";
    const delete_query = connection.format(sqlDelete, [idProjet]);
    const sqlInsert = "INSERT INTO projet_delete VALUES (?,?,?,?)"
    const insert_query = connection.format(sqlInsert, dataDelete);
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
    newData = newData.replace(/(\r\n|\n|\r|\s)/gm,"");
    myID = myID.replace(/(\r\n|\n|\r|\s)/gm,"");
    let myColumn = request.body.myColumn;
    if (newData.length < 45){
        connection.query('UPDATE projet SET ?? = ? WHERE idProjet = ?;',[myColumn,newData,myID], function(error, resultSQL){
            if (error) throw error;
            else{
                console.log("modif enregistrer en bdd");
            }
        });
    } else {
        console.log("Caractères maximum authorisé dépassé !")
    }
    response.redirect('/projet');
}