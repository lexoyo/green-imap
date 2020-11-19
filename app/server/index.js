var express = require('express');
var http = require('http');
 
var app = express();
 
// gzip/deflate outgoing responses
var compression = require('compression');
app.use(compression());
 
// store session state in browser cookie
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['username', 'password']
}));
 
const es = require('./es') // to be set before bodyParser

// parse urlencoded request bodies into req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
 
// respond to api requests
const api = require('./api')
app.use('/api', express.json(), api);

// proxy es requests
app.use('/es', express.json(), es);

// static files
var serveStatic = require('serve-static')
app.use(serveStatic('pub/', { 'index': ['index.html', 'index.htm'] }))

//create node.js http server and listen on port
http.createServer(app).listen(3000);

