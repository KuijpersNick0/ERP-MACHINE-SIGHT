class User {
    constructor(pkUser, pseudo, tel, email, poste, nameUser){
        this.pkUser = pkUser;
        this.pseudo = pseudo;
        this.tel = tel;
        this.email = email;
        this.poste = poste;
        this.nameUser = nameUser;
    }   
}
module.exports = User;