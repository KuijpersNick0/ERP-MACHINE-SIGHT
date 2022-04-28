class BonCommande {
    constructor(idBonCommande, refFournisseur, description, prixTotal, remise, idProjet0, idFournisseur0, dateCommande, dateEcheance, statut, pseudo0, approbation, numOffreFournisseur, prctageRemiseGlobCommande, acompte, remarques, descriptionProjet, client, nomPrenomFournisseur, fkProjet0, fkFournisseur0, fkClient0, fkUser0){
        this.idBonCommande = idBonCommande;
        this.refFournisseur = refFournisseur;
        this.description = description;
        this.prixTotal = prixTotal;
        this.remise = remise;
        this.idProjet0 = idProjet0;
        this.idFournisseur0 = idFournisseur0;
        this.dateCommande = dateCommande;
        this.dateEcheance = dateEcheance; 
        this.statut = statut;
        this.pseudo0 = pseudo0;
        this.approbation = approbation;
        this.numOffreFournisseur = numOffreFournisseur;
        this.prctageRemiseGlobCommande = prctageRemiseGlobCommande;
        this.acompte = acompte;
        this.remarques = remarques;
        this.descriptionProjet = descriptionProjet;
        this.client = client;
        this.nomPrenomFournisseur = nomPrenomFournisseur;
        this.fkProjet0= fkProjet0
        this.fkFournisseur0=fkFournisseur0
        this.fkClient0=fkClient0
        this.fkUser0=fkUser0
    }   
}
module.exports = BonCommande;