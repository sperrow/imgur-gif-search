var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var Promise = require('bluebird');
Promise.promisifyAll(request);

// for local development
if (!process.env.CLIENT_ID) {
  var config = require('./config.js');
}

var port = process.env.PORT || 3999;

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/client'));

// imgur credentials
var clientId = process.env.CLIENT_ID || config.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET || config.CLIENT_SECRET;
var accessToken;
var refreshToken;

// handle callback from imgur to convert code into token
app.get('/api/code', function(req, res) {
  var tokenForm = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code: req.query.code
  };
  request.postAsync('https://api.imgur.com/oauth2/token', {form: tokenForm})
    .then(function(response) {
      body = JSON.parse(response.body);
      accessToken = body.access_token;
      refreshToken = body.refresh_token;
      res.redirect('/');
    })
    .catch(function(err) {
      console.log('err:', err);
      res.send(err, 500);
    });
});

var searchUrl = 'https://api.imgur.com/3/gallery/search/?q_type=anigif&q=';

// request to search imgur
app.get('/api/search', function(req, res) {
  // return error if no token
  if (!accessToken) {
    res.sendStatus(403);
  } else {
    // options for imgur search api
    var searchOptions = {
      method: 'GET',
      url: searchUrl + req.query.queryStr,
      headers: {
        'Client-ID': clientId,
        'Authorization': 'Bearer ' + accessToken
      }
    };

    request.getAsync(searchOptions)
      .then(function(response) {
        body = JSON.parse(response.body);

        // refresh token if expired
        if (body.data.error) {
          var refreshForm = {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token'
          };
          request.postAsync('https://api.imgur.com/oauth2/token', {form: refreshForm})
            .then(function(response) {
              body = JSON.parse(response.body);
              accessToken = body.access_token;
              refreshToken = body.refresh_token;
              searchOptions.headers.Authorization = 'Bearer ' + accessToken;
              // resend search request
              request.getAsync(searchOptions)
                .then(function(response) {
                  body = JSON.parse(response.body);
                  res.send(body);
                });
            });
        } else {
          res.send(body);
        }
      })
      .catch(function(err) {
        console.log('err:', err);
        res.send(err, 500);
      });

  }
});

console.log('Now listening on ' + port);
app.listen(port);
