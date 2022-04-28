class Nomenclature {
    constructor(pkNomenclature, idNomenclature, idPiece, denomination, idProjet, rev, qte, unite, matiere, brut, realisation, finition, traitementDeSurface, planEdite, fournisseur, refFournisseur, livraisonPrevue, statut, idBonCommande, commentaire, nomProjet, client, 
        idFournisseur, prixUnitMS, prixUnitClient, remise, prixNetTotal, marge, prixTotalClient, effectue, refCommande, montantDepense, par, fkProjet, fkBonCommande, fkFournisseur, fkClient, fkUser){  
        this.pkNomenclature = pkNomenclature;
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
        this.idBonCommande = idBonCommande;
        this.commentaire = commentaire;
        this.idProjet = idProjet;
        this.nomProjet = nomProjet;
        this.client = client;
        this.idFournisseur = idFournisseur;
        this.effectue = effectue;
        this.refCommande = refCommande;
        this.montantDepense = montantDepense;
        this.par = par;
        this.fkProjet = fkProjet;
        this.fkFournisseur =fkFournisseur ;
        this.fkBonCommande =fkBonCommande ;
        this.fkUser = fkUser;
        this.fkClient =fkClient ;

    }   
}
module.exports = Nomenclature;