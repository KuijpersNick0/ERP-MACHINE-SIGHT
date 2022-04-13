let express = require('express');
let app = express();
app.use(express.urlencoded({extended:true}));

//mes routes
let routes = require('./routes');
app.use('/', routes);

//pour css-images
app.use(express.static('public'));

app.listen(3000, function(){
    console.log("running on port 3000");
});