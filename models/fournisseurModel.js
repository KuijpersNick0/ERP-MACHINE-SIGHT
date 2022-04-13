class Fournisseur {
    constructor(listeFournisseur, idFournisseur, societe, nomPrenom, adresse1, adresse2, cpostal, ville, pays, telephone, portable, site, e_mail, nTVA, tauxTVA, langue, remarques, liste_fournisseurs){
        this.listeFournisseur = listeFournisseur;
        this.idFournisseur = idFournisseur;
        this.societe = societe;
        this.nomPrenom = nomPrenom;
        this.adresse1 = adresse1;
        this.adresse2 = adresse2;
        this.cpostal = cpostal;
        this.ville = ville;
        this.pays = pays;
        this.telephone = telephone;
        this.portable = portable;
        this.site = site;
        this.e_mail = e_mail;
        this.nTVA = nTVA;
        this.tauxTVA = tauxTVA;
        this.langue = langue;
        this.remarques = remarques;
        this.liste_fournisseursFournisseur = liste_fournisseurs;
    }
}
module.exports = Fournisseur;