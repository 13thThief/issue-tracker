'use strict';

require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

// const CONNECTION_STRING = 'mongodb://localhost:27017/issue-tracker';
const CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/issues/:project')
    //  for an array of all issues on that specific project 
    // with all the information for each issue as was returned when posted.
    .get(function (req, res){
      var project = req.params.project;

      if(req.query.open === undefined)
          req.query.open = true;

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db
          .collection(project)
          .find(req.query)
          .toArray((err, cursor) => {
            if (err)
              throw Error(err)
            return res.send(cursor)
        });
      });
    })
    //  with form data containing
    // required issue_title, issue_text, created_by, and optional assigned_to and status_text.
    .post(function (req, res){
      var project = req.params.project;
      if (req.body.issue_title === undefined ||
          req.body.issue_text === undefined ||
          req.body.created_by === undefined ){
        res.sendStatus(400).json('Required data not received');
        return;
      }

      let created_on = new Date();
      let updated_on = created_on;
      let open = true;
      let newIssue = {
        issue_title: req.body.issue_title,
        issue_text:  req.body.issue_text,
        created_by:  req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on,
        updated_on,
        open
      };

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db
        .collection(project)
        .insertOne(newIssue, (err, doc) => {
            if (err)
              throw Error(err)
            return res.json(newIssue);
          }
        )
      });
      
    })
    //  with a _id and any fields in the object with a value to object said object. 
    // Returned will be 'successfully updated' or 'could not update '+_id. This should always update updated_on. 
    // If no fields are sent return 'no updated field sent'.
    .put(function (req, res){
      var project = req.params.project;

      // No fields sent or only one field sent
      if(!req.body || Object.keys(req.body).length < 2)
        return res.send('no updated field sent')

      const updatedFields = {};

      Object.keys(req.body).forEach(key => {
        if(key === 'open')
          updatedFields[key] = req.body[key];
        if (!req.body[key])
            updatedFields[key] = req.body[key];
      });

        updatedFields['updated_on'] = new Date();
        delete updatedFields['_id']

        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          db
          .collection(project)
          .findOneAndUpdate(
            { _id: ObjectId(req.body._id) },
            { $set: updatedFields },
            (err, doc) => {
              if (err){
                console.err(err)
                return res.send('could not update '+req.body._id);
              } else {
                return res.send('successfully updated');
              }
            }
          )
        });
      })
    //  with a _id to completely delete an issue.
    // If no _id is sent return '_id error', success: 'deleted '+_id, failed: 'could not delete '+_id.
    .delete(function (req, res){
      var project = req.params.project; 
      if (req.body._id === undefined)
        return res.send('_id error')

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db
        .collection(project)
        .deleteOne(
          {
            _id: ObjectId(req.body._id)
          },
          (err, doc) => {
            if (err){
              console.err(err)
             return res.send('could not delete '+req.body._id)
            }
            res.send('deleted '+req.body._id)
        });
      });

    });
    
};
