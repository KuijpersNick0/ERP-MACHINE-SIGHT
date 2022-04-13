class BonCommande {
    constructor(idBonCommande, description, prixUnitaire, remise, refProjet, numFournisseur, nom, contact, dateCommande, dateEcheance, statut, acheteur, approbation, numOffreFournisseur, prctageRemiseGlobCommandeFacultatif, acompteFacultatif, remarquesFacultatif){
        this.idBonCommande = idBonCommande;
        this.description = description;
        this.prixUnitaire = prixUnitaire;
        this.remise = remise;
        this.refProjet = refProjet;
        this.numFournisseur = numFournisseur;
        this.nom = nom;
        this.contact = contact;
        this.dateCommande = dateCommande;
        this.dateEcheance = dateEcheance; 
        this.statut = statut;
        this.acheteur = acheteur;
        this.approbation = approbation;
        this.numOffreFournisseur = numOffreFournisseur;
        this.prctageRemiseGlobCommandeFacultatif = prctageRemiseGlobCommandeFacultatif;
        this.acompteFacultatif = acompteFacultatif;
        this.remarquesFacultatif = remarquesFacultatif;
    }   
}
module.exports = BonCommande;