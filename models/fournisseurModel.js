class Fournisseur {
    constructor(listeFournisseur, idFournisseur, societe, nomPrenom, adresse1, adresse2, cPostal, ville, pays, telephone, portable, site, email, nTVA, tauxTVA, langue, remarques, tauxEchange){
        this.listeFournisseur = listeFournisseur;
        this.idFournisseur = idFournisseur;
        this.societe = societe;
        this.nomPrenom = nomPrenom;
        this.adresse1 = adresse1;
        this.adresse2 = adresse2;
        this.cPostal = cPostal;
        this.ville = ville;
        this.pays = pays;
        this.telephone = telephone;
        this.portable = portable;
        this.site = site;
        this.email = email;
        this.nTVA = nTVA;
        this.tauxTVA = tauxTVA;
        this.langue = langue;
        this.remarques = remarques;
        this.tauxEchange = tauxEchange;
    }
}
module.exports = Fournisseur;