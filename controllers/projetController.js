const { response } = require('express');
let Projet = require('../models/projetModel');
let connection = require('../db');

let projetList = [];

exports.projetList = function(request, response){
    //affiche la liste des projet
    connection.query("SELECT * from projet;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        for (var i=0; i<resultSQL.length; i++){
            let projet = new Projet(resultSQL[i].idProjet,resultSQL[i].Nom,resultSQL[i].Description);
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

exports.ajoutProjet = function(req, res){
    //enregistre le nouveau projet localement et sur bdd
    let idProjet = req.body.idProjet;
    let Nom = req.body.Nom;
    let Description = req.body.Description;
    let newProjet = new Projet(idProjet, Nom, Description);
    projetList.push(newProjet);
    const sqlInsert = "INSERT INTO projet(idProjet,Nom,Description) VALUES (?,?,?)";
    let todo = [idProjet, Nom, Description];
    connection.query(sqlInsert, todo, function(err, result){
        if (err) throw err;
        console.log("ajout bdd");
    });

    res.redirect('/projet');
} 

exports.deleteProjet = function(req, res){
    let idProjet = req.params.index;
    for (var i=0; i<projetList.length; i++){
        if (idProjet==projetList[i].idProjet){
            projetList.splice(i,1);
            console.log("effacé localement");
            break;
        } else {
            console.log("Pas trouver localement");
        }
    }
    connection.query("DELETE FROM projet WHERE idProjet = ?;", [idProjet], function(error, resultSQL){
        if (error){
            console.log(error);
        }else{
            console.log("Effacer bdd");
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
    connection.query('UPDATE projet SET ?? = ? WHERE idProjet = ?;',[myColumn,newData,myID], function(error, resultSQL){
        if (error) throw error;
        else{
            console.log("modif enregistrer en bdd");
        }
    });
    response.redirect('/projet');
}