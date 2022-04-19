class Nomenclature {
    constructor(idNomenclature, idPiece, denomination,idProjet1, rev, qte, unite, matiere, brut, realisation, finition, traitementDeSurface, planEdite, fournisseur, refFournisseur, livraisonPrevue, statut, idBonCommande1, commentaire, nomProjet, client, 
        idFournisseur1, prixUnitMS, prixUnitClient, remise, prixNetTotal, marge, prixTotalClient, effectue, refCommande, montantDepense, par){
        
        this.idNomenclature = idNomenclature;
        this.idPiece = idPiece;
        this.denomination = denomination;
        this.rev = rev;
        this.qte = qte;
        this.unite = unite;
        this.matiere = matiere;
        this.brut = brut;
        this.realisation = realisation;
        this.finition = finition;
        this.traitementDeSurface = traitementDeSurface;
        this.planEdite = planEdite;
        this.fournisseur = fournisseur;
        this.refFournisseur = refFournisseur;
        this.prixUnitMS = prixUnitMS;
        this.remise = remise;
        this.prixNetTotal = prixNetTotal;
        this.marge = marge;
        this.prixUnitClient = prixUnitClient;
        this.prixTotalClient = prixTotalClient;
        this.livraisonPrevue = livraisonPrevue;
        this.statut = statut;
        this.idBonCommande1 = idBonCommande1;
        this.commentaire = commentaire;
        this.idProjet1 = idProjet1;
        this.nomProjet = nomProjet;
        this.client = client;
        this.idFournisseur1 = idFournisseur1;
        this.effectue = effectue;
        this.refCommande = refCommande;
        this.montantDepense = montantDepense;
        this.par = par;
    }   
}
module.exports = Nomenclature;