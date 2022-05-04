let express = require('express');
let router = express.Router();
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
let connection = require('../ERP_Code/db');
var fs = require('fs');
const csv = require('fast-csv');

//Enable CORS
router.use(cors());
//Parse application/JSON
router.use(bodyParser.json());
//Parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({extended: true}));
//serving static files
router.use('/uploads', express.static('uploads'));

let projetController = require('./controllers/projetController');
let fournisseurController = require('./controllers/fournisseurController');
let bonCommandeController = require('./controllers/bonCommandeController');
let nomenclatureController = require('./controllers/nomenclatureController');
let userController = require('./controllers/userController');
let clientController = require('./controllers/clientController');
let pagePersoController = require('./controllers/pagePersoController');

//utilisation session log-in
let session = require('express-session');
router.use(session({
    secret: 'my secret',    //clé unique de la session
    resave: false,  
    saveUninitialized: true
}));

//Liste des routes vers controlleurs
router.get('/', (req, res) => res.redirect('/connection'));

router.get('/projet', projetController.projetList);
router.get('/projet/processStop', projetController.processStop);
router.post('/projet/selectAll', projetController.selectAll);
router.get('/projet/modifAllForm',projetController.modifAllForm);
router.post('/projet/modifAllProjet', projetController.modifAllProjet);
router.get('/projet/ajoutProjet', projetController.ajoutProjetForm);
router.post('/projet/ajoutProjet', projetController.ajoutProjet);
router.get('/projet/majPrixTotal', projetController.majPrixTotal);
router.post('/projet/inter/modification', projetController.projetModification);
router.get('/projet/:index', projetController.deleteProjet);

router.get('/fournisseurs', fournisseurController.fournisseurList);
router.post('/fournisseurs/selectAll', fournisseurController.selectAll);
router.get('/fournisseurs/resetAll', fournisseurController.resetAll);
router.get('/fournisseurs/modifAllForm',fournisseurController.modifAllForm);
router.post('/fournisseurs/modifAllFournisseur', fournisseurController.modifAllFournisseur);
router.get('/fournisseurs/ajoutFournisseur', fournisseurController.ajoutFournisseurForm);
router.post('/fournisseurs/ajoutFournisseur', fournisseurController.ajoutFournisseur);
router.post('/fournisseurs/inter/modification', fournisseurController.fournisseurModification);
router.get('/fournisseurs/:index', fournisseurController.deleteFournisseur);

router.get('/bonCommande', bonCommandeController.bonCommandeList);
router.post('/bonCommande/selectAll', bonCommandeController.selectAll);
router.get('/bonCommande/modifAllForm',bonCommandeController.modifAllForm);
router.post('/bonCommande/modifAllBonCommande', bonCommandeController.modifAllBonCommande);
router.post('/bonCommande/enregistrement', bonCommandeController.enregistrementBonCommande);
router.post('/bonCommande/inter/modification', bonCommandeController.bonCommandeModification);
router.get('/bonCommande/:index', bonCommandeController.deleteBonCommande);

router.get('/nomenclature', nomenclatureController.nomenclatureList);
router.get('/nomenclature/resetPanier', nomenclatureController.resetPanier);
router.post('/nomenclature/selectAll', nomenclatureController.selectAll);
router.get('/nomenclature/modifAllForm',nomenclatureController.modifAllForm);
router.post('/nomenclature/modifAllNomenclature', nomenclatureController.modifAllNomenclature);
router.get('/nomenclature/majPrixTotal', nomenclatureController.majPrixTotal);
router.get('/nomenclature/ajoutNomenclature', nomenclatureController.ajoutNomenclatureForm);
router.post('/nomenclature/ajoutNomenclature', nomenclatureController.ajoutNomenclature);
router.post('/nomenclature/inter/modification', nomenclatureController.nomenclatureModification);
router.get('/nomenclature/inter/commandePDF', nomenclatureController.nomenclatureToPDF)
router.get('/nomenclature/:index', nomenclatureController.nomenclatureAjoutListePDF);

router.get('/connection', userController.connection);
router.post('/connection/login', userController.login);

router.get('/client', clientController.clientList);

router.get('/pagePerso/projet/:index', pagePersoController.projetPage);

//gere le stockage local pour upload nomenclature
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({storage: storage });
router.use(express.json({limit :'1mb'}));

// upload csv to database
router.post('/upload', upload.single("fileUpload"), (req, res) =>{
    let par = req.session.user;
    let fkUser;
    const sqlSelect = "SELECT pkUser FROM user WHERE pseudo=?;";
    const select_query = connection.query(sqlSelect, [par]);
    //Determine fkUser
    if (par==null || par==undefined){
        fkUser = 1; //NUMERO SI PAS CONNECTE
        UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);
    } else{
        get_fkUser = function(){
            //Eviter js callback hell
            return new Promise(function(resolve, reject){
                connection.query(select_query, (error, resultSQL) => {
                    if (error) throw error;
                    else if (resultSQL.length!=0) {
                        resolve(resultSQL[0].pkUser);
                    } else {
                        reject(new Error("No result"));
                    }
                })
            })
        }
        get_fkUser()
        .then(function(result){
            fkUser = result;
            UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename, fkUser);
        })
        .catch(function(error){
            console.log("Promise rejection error: " + error);
        })
    }
    res.redirect('/nomenclature');
});

function UploadCsvDataToMySQL(filePath, fkUser){
    if (filePath.charCodeAt(0) === 0xFEFF) {
        //Fichier excell en UTF8-BOM et non pas UTF8, ce if strip le BOM qui génere caractère défectueux
        filePath = stream.substr(filePath);
    }
    let stream = fs.createReadStream(filePath);
    let csvData = [];
    let csvStream = csv
    .parse()
    .on('error', () => {
        console.log("Fichier csv illisible");
    })
    .on("data", (row) => {
        let dataGoodFormat = true;
        if (row.length < 14){
            for (var i=0; i<row.length; i++){
                if (row[i].length<70){                   
                    //console.log("data bonne taille");
                } else {
                    console.log("Element de colonne dépasse les 70 caractères authorisé");
                    csvData.length = 0;
                    dataGoodFormat = false;
                    break;
                }
            }
            if (dataGoodFormat){ 
                while (row.length<12){
                    row.push('');
                }
                row.push(fkUser);
                csvData.push(row);
                // if (row.length==12){
                //     console.log(row)
                // }
            }
        } else {
            console.log("Erreur pas les bonnes dimensions colonnes mysql")
        }
    })
    .on("end", function () {
        // Remove Header ROW
        csvData.shift();
        if (csvData.length>0){
            let stringVal = '';
            for (var i=1;i<csvData.length;i++){
                console.log(csvData.length)
                console.log(i)
                stringVal += '(?),';
                if (csvData[i][10]=='') {
                    date = new Date();
                    csvData[i][10]= csvData[i][9] + '-' + i + date.getHours() + date.getMonth() + date.getFullYear();
                } 
                if (i==(csvData.length-1)){
                    stringVal += '(?)';
                    break;
                }
            }
            let query = 'INSERT INTO nomenclature(idPiece, denomination, qte, aliasFournisseur, matiere, brut, realisation, finition, refFournisseur, idProjet, idNomenclature, prixUnitClient, fkUser) VALUES '+ stringVal +' ON DUPLICATE KEY UPDATE idNomenclature=idNomenclature';
            console.log(stringVal);
            console.log(csvData[0])
            connection.query(query, csvData, async(error, response) => {
                if (error){
                    console.log(error);
                }
                else{
                    console.log('CSV file data has been uploaded in mysql database');
                    await connection.query("call nomenclature_fournisseur_upload();", (error, response) => {
                        if (error) throw error;
                        else {
                            console.log('MAJ lien fournisseur-nomenclature');
                        }
                    })
                }
            });
        } else {
            console.log("Donnée dans le mauvais format");
        }
        // On delete apres avoir enregistrer le fichier
        fs.unlinkSync(filePath)
    }); 
    stream.pipe(csvStream);
}   
module.exports = router;