'use strict';
const { ObjectId } = require('mongodb');

module.exports = function (app, myDataBase) {

  app.route('/api/issues/:project')
    // Need to add query filtering
    .get(async function (req, res){
      let project = req.params.project;
      let filter = {project: project}
      if (req.query._id) filter._id = new ObjectId(req.query._id);
      if (req.query.issue_title) filter.issue_title = req.query.issue_title;
      if (req.query.issue_text) filter.issue_text = req.query.issue_text;
      if (req.query.created_by) filter.created_by = req.query.created_by;
      if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
      if (req.query.status_text) filter.status_text = req.query.status_text;
      if (req.query.created_on) filter.created_on = new Date(req.query.created_on);
      if (req.query.updated_on) filter.updated_on = new Date(req.query.updated_on);
      if (req.query.open) filter.open = req.query.open === 'true';
      let issues = await myDataBase.find(filter)
        .project({project: false}).toArray();
      return res.json(issues);
    })

    .post(async function (req, res){
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      let insert = await myDataBase.insertOne({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }).then(doc => {
        return myDataBase.findOne({_id: doc.insertedId, project: project}, {projection: {project: false}});
      });
      if (insert.assigned_to === null) insert.assigned_to = '';
      if (insert.status_text === null) insert.status_text = '';
      return res.json(insert);
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if (!id) return res.json({ error: 'missing _id' });
      const update = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: !req.body.open
      };
      if (Object.keys(update).every(k => k === 'open' ? update[k] : !update[k])) {
        return res.json({ error: 'no update field(s) sent', '_id': id });
      } else {
        let result;
        try {
          result = await myDataBase.updateOne({_id: new ObjectId(id), project: project}, 
                                           [{$set: update}, {$set: {'updated_on': new Date()}}]);
        } catch(e) {
          return res.json({ error: 'could not update', '_id': id })
        }
        if (result.matchedCount === 1) {
          return res.json({ result: 'successfully updated', '_id': id })
        } else {
          return res.json({ error: 'could not update', '_id': id })
        }
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const id = req.body._id;
      if (!id) return res.json({error: 'missing _id'});
      let deleted;
      try {
        deleted = await myDataBase.deleteOne({_id: new ObjectId(req.body._id),
                                             project: project})
      } catch (e) {
        return res.json({error: 'could not delete', '_id': id})
      }

      if (deleted.deletedCount === 1) {
        return res.json({result: 'successfully deleted', '_id': id})
      } else {
        return res.json({error: 'could not delete', '_id': id})
      }
    });
    
};
