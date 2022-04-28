class Projet {
    constructor(pkProjet, idProjet, nom, description, prixTotalNomenclature, prixTotalBonCommande, natureProjet){
        this.pkProjet = pkProjet;
        this.idProjet = idProjet;
        this.nom = nom;
        this.description = description;
        this.prixTotalNomenclature = prixTotalNomenclature;
        this.prixTotalBonCommande = prixTotalBonCommande;
        this.natureProjet = natureProjet;
    }   
}
module.exports = Projet;