class Article {
    constructor(refFournisseur, refMachineSight, prevu, effectue, description, fournisseur, refProjet, client, refFacture, refCommande, quantite, prixUnitaire, remise, montantDepense, par, nePasToucher){
        this.refFournisseur = refFournisseur;
        this.refMachineSight = refMachineSight;
        this.prevu = prevu;
        this.effectue = effectue;
        this.description = description;
        this.fournisseur = fournisseur;
        this.refProjet = refProjet;
        this.client = client;
        this.refFacture = refFacture;
        this.refCommande = refCommande;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
        this.remise = remise;
        this.montantDepense = montantDepense;
        this.par = par;
        this.nePasToucher = nePasToucher;
    }   
}
module.exports = Article;