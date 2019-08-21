var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydb'
});

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                if(username=="admin")
                    response.redirect('/ec');
                else
                    response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/ec', function(request,response) {
    response.redirect('http://localhost:3000/AdminLTE-master/index.html');
});

app.get('/home', function (request, response) {
    response.sendFile(path.join(__dirname + '/home.html'));
});

app.post('/store', function (request, response) {
      var candidate = {
        "name": request.body.name,
        "education": request.body.education,
        "age": request.body.age,
        "past": request.body.past,
        "promises": request.body.promises,
        "criminal": request.body.criminal
       
    }
    connection.query('INSERT INTO candidates SET ?', candidate, function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            request.session.loggedin = false;
            response.redirect('/');
            console.log(__dirname);
        }
    });
});

app.listen(3000);