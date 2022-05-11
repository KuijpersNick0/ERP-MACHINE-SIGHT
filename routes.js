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
router.use('./controllers/uploads', express.static('uploads'));

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

//gere le stockage local pour upload nomenclature
router.use(express.json({limit :'1mb'}));

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './controllers/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({storage: storage });

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

router.post('/upload', upload.single("fileUpload"), nomenclatureController.upload);
router.post('/upload/special', upload.single("fileUpload"), nomenclatureController.uploadSpecial);

module.exports = router;