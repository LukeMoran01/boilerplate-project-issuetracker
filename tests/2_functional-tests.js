const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('POST Tests', function() {
    test('Test POST /api/issues/project with all fields', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/project')
        .send({
          issue_title: 'Good Title',
          issue_text: 'Descriptive text',
          created_by: 'Great creator',
          assigned_to: 'Perfect assignee',
          status_text: 'Optimal status'
        })
        .end(function(err, res) {
          assert.deepEqual(res.body.issue_title, 'Good Title');
          assert.equal(res.type, 'application/json');
          done();
        });
    });
    test('Test POST /api/issues/project with required fields', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/project')
        .send({
          issue_title: 'Good Title',
          issue_text: 'Descriptive text',
          created_by: 'Great creator',
        })
        .end(function(err, res) {
          assert.strictEqual(res.body.issue_title, 'Good Title');
          assert.strictEqual(res.body.assigned_to, '');
          assert.equal(res.type, 'application/json');
          done();
        });
    });
    test('Test POST /api/issues/project missing required fields', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/project')
        .send({
          issue_title: 'Good Title',
        })
        .end(function(err, res) {
          assert.strictEqual(res.body.error, 'required field(s) missing');
          assert.equal(res.type, 'application/json');
          done();
        });
    });
  });
  suite('GET Tests', function() {
    test('Test GET /api/issues/project', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          assert.equal(res.type, 'application/json');
          assert.strictEqual(res.status, 200);
          done();
        });
    });
    test('Test GET /api/issues/project with one filter', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project?open=true')
        .end(function(err, res) {
          assert.equal(res.type, 'application/json');
          assert.strictEqual(res.status, 200);
          done();
        });
    });
    test('Test GET /api/issues/projec with multiple filters', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project?open=true&issue_title=Test')
        .end(function(err, res) {
          assert.equal(res.type, 'application/json');
          assert.strictEqual(res.status, 200);
          done();
        });
    });
  });
  suite('PUT Tests', function() {
    test('Test PUT /api/issues/project update one field', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          chai
            .request(server)
            .put('/api/issues/project')
            .send({
              _id: res.body[0]._id,
              issue_title: 'Updated Title'
            })
            .end(function(err, res) {
              assert.strictEqual(res.body.result, 'successfully updated');
            })
          done();
        })
    });
    test('Test PUT /api/issues/project update multiple fields', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          chai
            .request(server)
            .put('/api/issues/project')
            .send({
              _id: res.body[0]._id,
              issue_title: 'Updated Title',
              issue_text: 'Updated text'
            })
            .end(function(err, res) {
              assert.strictEqual(res.body.result, 'successfully updated');
            })
          done();
        })
    });
    test('Test PUT /api/issues/project missing id', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          chai
            .request(server)
            .put('/api/issues/project')
            .send({
              issue_title: 'Updated Title',
              issue_text: 'Updated text'
            })
            .end(function(err, res) {
              assert.strictEqual(res.body.error, 'missing _id');
            })
          done();
        })
    });
    test('Test PUT /api/issues/project no update fields', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          chai
            .request(server)
            .put('/api/issues/project')
            .send({
              _id: res.body[0]._id
            })
            .end(function(err, res) {
              assert.strictEqual(res.body.error, 'no update field(s) sent');
            })
          done();
        })
    });
    test('Test PUT /api/issues/project invalid id', function(done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/project')
        .send({
          _id: 69,
          issue_title: 'Updated Title'
          })
        .end(function(err, res) {
          assert.strictEqual(res.body.error, 'could not update');
          done();
        })
    });
  });
  suite('DELETE Tests', function() {
    test('Test DELETE /api/issues/project', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/project')
        .end(function(err, res) {
          chai
            .request(server)
            .delete('/api/issues/project')
            .send({
              _id: res.body[0]._id
            })
            .end(function(err, res) {
              assert.strictEqual(res.body.result, 'successfully deleted');
            })
          done();
        })
    });
    test('Test DELETE /api/issues/project invalid id', function(done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/project')
        .send({
          _id: 69,
          })
        .end(function(err, res) {
          assert.strictEqual(res.body.error, 'could not delete');
          done();
        })
    });
    test('Test DELETE /api/issues/project missing id', function(done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/project')
        .send({
          })
        .end(function(err, res) {
          assert.strictEqual(res.body.error, 'missing _id');
          done();
        })
    });
  });
});
