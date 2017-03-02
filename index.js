var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');

var detector = require('./detector');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb', parameterLimit: '10000'}));
app.use(multer());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index', {result:false});
});

app.post('/analyze', detector, function(req, res, next){
	res.render('pages/index', {result: req.output});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



