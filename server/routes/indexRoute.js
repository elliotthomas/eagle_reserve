/**
 * Serves the index.html file
 * @module routes/indexRoute
 */
var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function(req, res) {
  var homePath = path.join(__dirname, '../../public/views/index.html');
  res.sendFile(homePath);
});

module.exports = router;
