'use strict';

require('dotenv').config();
var express     = require('express');
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

const mongooseOptions = {
    useNewUrlParser: true,
    family: 4,
    reconnectTries: 2,
    reconnectInterval: 10000,
    autoReconnect: true
}

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

 app.listen(process.env.PORT || 3000, function () {
          console.log("Listening on port " + process.env.PORT);
          if(process.env.NODE_ENV==='test') {
            console.log('Running Tests...');
            setTimeout(function () {
              try {
                runner.run();
              } catch(e) {
                var error = e;
                  console.log('Tests ERROR:');
                  console.log(error);
              }
            }, 3000);
          }
        });

module.exports = app; //for testing
