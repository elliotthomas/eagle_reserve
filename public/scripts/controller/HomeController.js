myApp.controller( 'HomeController', [ '$scope', '$http', '$location', 'AuthFactory',
function( $scope, $http, $location, AuthFactory){
  console.log( 'in HomeController' );

  //Declare authFactory
  var authFactory = AuthFactory;
  //On view load, check if the user is logged in
  $scope.loggedIn = authFactory.checkLoggedIn();
  console.log('HC. Logged in:', $scope.loggedIn);
  //check permissions
  $scope.isAdmin = authFactory.checkAdmin();
  console.log('HC. Admin:', $scope.isAdmin);

  $scope.clear = function() {
    //Clear the datepicker
    $scope.date = null;
  };

  $scope.openDatepick = function() {
    //Open the datepicker popup
    $scope.popup.opened = true;
  };

  var init = function() {
    console.log('in init');
    //TODO: get all items from the database to replace this
    $scope.allItems = [
      {name: 'Chrome1'},
      {name: 'Chrome2'},
      {name: 'Chrome3'},
      {name: 'Chrome4'},
      {name: 'Chrome5'},
      {name: 'MMS Mac Cart'},
      {name: 'Lab1'},
      {name: 'Lab2'},
      {name: 'Lab116'},
      {name: 'Media Center'},
      {name: 'Mezzanine'},
      {name: 'MMS'},
      {name: 'Greek Theater'},
      {name: 'Pit'}
    ]; // end allItems

    //Initialize datepicker default to today
    $scope.today();
    $scope.popup = {
      opened: false
    };
  }; // end init

  $scope.today = function() {
    $scope.date = new Date();
  };

  //If user is not logged in
  if(!$scope.loggedIn) {
    //Reroute them to the login page
    $location.path("/#!/login");
  } else {
    //If they are logged in, initialize the view
    init();
  } // end else

}]); // end HomeController
