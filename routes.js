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
let articleController = require('./controllers/articleController');
let bonCommandeController = require('./controllers/bonCommandeController');
let nomenclatureController = require('./controllers/nomenclatureController');

//utilisation session log-in
let session = require('express-session');
router.use(session({
    secret: 'my secret',    //clé unique de la session
    resave: false,  
    saveUninitialized: true
}));

//Liste des routes vers controlleurs
router.get('/', (req, res) => res.redirect('/fournisseurs'));

router.get('/projet', projetController.projetList);
router.get('/projet/fournisseur', projetController.goToFournisseur);
router.get('/projet/article', projetController.goToArticle);
router.get('/projet/bonCommande', projetController.goToBonCommande);
router.get('/projet/nomenclature', projetController.goToNomenclature);
router.get('/projet/ajoutProjet', projetController.ajoutProjetForm);
router.post('/projet/ajoutProjet', projetController.ajoutProjet);
router.post('/projet/inter/modification', projetController.projetModification);
router.get('/projet/:index', projetController.deleteProjet);

router.get('/fournisseurs', fournisseurController.fournisseurList);
router.get('/fournisseurs/projet', fournisseurController.goToProjet);
router.get('/fournisseurs/article', fournisseurController.goToArticle);
router.get('/fournisseurs/bonCommande', fournisseurController.goToBonCommande);
router.get('/fournisseurs/nomenclature', fournisseurController.goToNomenclature);
router.get('/fournisseurs/ajoutFournisseur', fournisseurController.ajoutFournisseurForm);
router.post('/fournisseurs/connection', fournisseurController.connection);
router.post('/fournisseurs/ajoutFournisseur', fournisseurController.ajoutFournisseur);
router.post('/fournisseurs/inter/modification', fournisseurController.fournisseurModification);
router.get('/fournisseurs/:index', fournisseurController.deleteFournisseur);

router.get('/article', articleController.articleList);
router.get('/article/projet', articleController.goToProjet);
router.get('/article/fournisseur', articleController.goToFournisseur);
router.get('/article/bonCommande', articleController.goToBonCommande);
router.get('/article/nomenclature', articleController.goToNomenclature);

router.get('/bonCommande', bonCommandeController.bonCommandeList);
router.get('/bonCommande/projet', bonCommandeController.goToProjet);
router.get('/bonCommande/fournisseur', bonCommandeController.goToFournisseur);
router.get('/bonCommande/article', bonCommandeController.goToArticle);
router.get('/bonCommande/nomenclature', bonCommandeController.goToNomenclature);
router.post('/bonCommande/enregistrement', bonCommandeController.enregistrementBonCommande);
router.post('/bonCommande/inter/modification', bonCommandeController.bonCommandeModification);

router.get('/nomenclature', nomenclatureController.nomenclatureList);
router.get('/nomenclature/fournisseur', nomenclatureController.goToFournisseur);
router.get('/nomenclature/article', nomenclatureController.goToArticle);
router.get('/nomenclature/bonCommande', nomenclatureController.goToBonCommande);
router.get('/nomenclature/projet', nomenclatureController.goToProjet);
router.get('/nomenclature/resetPanier', nomenclatureController.resetPanier);
router.get('/nomenclature/:index', nomenclatureController.nomenclatureAjoutListePDF);
router.get('/nomenclature/inter/commandePDF', nomenclatureController.nomenclatureToPDF)
router.post('/nomenclature/inter/modification', nomenclatureController.nomenclatureModification);
router.post('/nomenclature/inter/ajoutPDF', nomenclatureController.nomenclatureAjoutPDF);

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
router.use(express.json());
// upload csv to database
router.post('/upload-avatar', upload.single("fileUpload"), (req, res) =>{
    UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename);
    console.log('CSV file data has been uploaded in mysql database ');
    res.redirect('/nomenclature');
    });
function UploadCsvDataToMySQL(filePath){
    let stream = fs.createReadStream(filePath);
    let csvData = [];
    let csvStream = csv
        .parse()
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", function () {
            // Remove Header ROW
            csvData.shift();

            let query = 'INSERT INTO nomenclature2 (idPiece, denomination, n_piece_plan, rev, qte, unite, matiere, brut, realisation, finition, traitementDeSurface, planEdite, fournisseur, refDescriptionFournisseur, prixnetUnitaireMS, remise, prixNetTotal, marge, prixunitclient, prixtotalclient, datedelivraisonprevue, statut,bonDeCommande, commentaire, numProjet, nomProjet, client) VALUES ? ON DUPLICATE KEY UPDATE idpiece = idpiece';
            connection.query(query, [csvData], (error, response) => {
                console.log(error || response);
            });
            // On delete apres avoir enregistrer le fichier
            fs.unlinkSync(filePath)
        }); 
    stream.pipe(csvStream);
}   

module.exports = router;