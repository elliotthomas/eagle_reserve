var express = require('express');
var router = express.Router();
var Reservation = require('../../models/reservation');

//POST new reservation
router.post('/', function(req, res){
  console.log('in reservation route');
  console.log('req.body ->', req.body);
  //Split the date string so it is store without time
  var dateIn = req.body.dateIn.split('T')[0];
  console.log(dateIn);
  var newReservation = new Reservation ({
    dateScheduled: dateIn,
    category: req.body.categoryIn,
    item: req.body.itemIn,
    period: req.body.periodIn
  });
  newReservation.save(function(err){
    if(err){
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }//end else
  });//end save
});//end post

//GET all reservations
router.get( '/', function( req, res ){
  console.log( 'in router.get' );
  Reservation.find({}, function( err, results){
    if( err ){
      console.log( err );
      res.sendStatus(500);
    } else {
      res.send({ results });
    } // end else
  }); // end find
}); // end get

//GET reservations by date
router.get( '/date/:date', function( req, res ){
  console.log( 'in router.get by date:', req.params.date );
  //Split the date string so it is store without time
  var date = req.params.date.split('T')[0];
  Reservation.find({ 'dateScheduled': date  }, function( err, results){
    if( err ){
      console.log( err );
      res.sendStatus(500);
    } else {
      res.send({ results });
    } // end else
  }); // end find
}); // end get


module.exports = router;
