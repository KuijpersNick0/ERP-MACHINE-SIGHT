class Client {
    constructor(pkClient,nomPrenom, tel, email, adresse1){
        this.pkClient = pkClient;
        this.nomPrenom = nomPrenom;
        this.tel = tel;
        this.email = email;
        this.adresse1= adresse1;
    }   
}
module.exports = Client;