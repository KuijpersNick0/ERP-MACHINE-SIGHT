class User {
    constructor(pkUser, pseudo, tel, email, poste, nomPrenom){
        this.pkUser = pkUser;
        this.pseudo = pseudo;
        this.tel = tel;
        this.email = email;
        this.poste = poste;
        this.nomPrenom = nomPrenom;
    }   
}
module.exports = User;