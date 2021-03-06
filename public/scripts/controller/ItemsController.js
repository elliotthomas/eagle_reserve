myApp.controller( 'ItemsController', [ '$scope', '$http', '$location', 'AuthFactory', '$uibModal',
function( $scope, $http, $location, AuthFactory, $uibModal ){
  if (verbose) console.log( 'in ItemsController' );

  //Declare authFactory
  var authFactory = AuthFactory;
  //On view load, check if the user is logged in
  $scope.loggedIn = authFactory.checkLoggedIn();
  if (verbose) console.log('IC. Logged in:', $scope.loggedIn);
  //check permissions
  $scope.isAdmin = authFactory.checkAdmin();
  if (verbose) console.log('IC. Admin:', $scope.isAdmin);
  //If user is not logged in
  if(!$scope.loggedIn) {
    //Reroute them to the login page
    $location.path("/#!/login");
  } // end if
  //If user is not an admin, reroute them to the home page
  if (!$scope.isAdmin) {
    //Reroute them to the home page
    $location.path("/home");
  } // end if

  //Initialize scope variables
  //as child scopes (because they are within ng-if)
  $scope.newItem = {
    name: '',
    category: ''
  }; // end $scope.newItem

  //set statusArray for status select
  $scope.categoryArray = [
    {value: 'Cart'},
    {value: 'Lab'},
    {value: 'Equipment'}
  ]; // end statusArray
  //Initiate status filter to 'off'
  $scope.categorySelected = { value: undefined };

  // GET all items to display on DOM
  $scope.displayItems = function(){
    if (verbose) console.log( 'in displayItem' );
    $http.get( '/private/items' )
    .then(function( response ){
      $scope.allItems = response.data.results;
    }); // end $http
  }; // end displayItems

  //open the add new item modal (returns a modal instance)
  $scope.openAddItemModal = function (size) {
    //open the modal
    if (verbose) console.log('Open User delete Confirm modal');
    //set the modalInstance
    var modalInstance = $uibModal.open({
      templateUrl: 'addNewItemModal.html',
      controller: 'AddNewItemModalController',
      size: size,
      //pass allItems array to modal for comparison
      resolve: {
        allItems: function () {
          return $scope.allItems;
        } // end userId
      } // end resolve
    }); // end modalInstance

    //Update the users when the modal has been closed
    modalInstance.closed.then(function () {
      $scope.displayItems();
      //reset scope variables
      $scope.newItem.name = '';
      $scope.newItem.category = '';
    }); // end modalInstance closed

  }; // end openAddItemModal

  // //open the delete item confirmation modal (returns a modal instance)
  $scope.openDeleteItemConfirmationModal = function (size, itemObject) {
    //open the modal
    if (verbose) console.log('in openDeleteItemConfirmationModal');
    //set the modalInstance
    var modalInstance = $uibModal.open({
      templateUrl: 'deleteItemConfirmModal.html',
      controller: 'DeleteItemConfirmationModalController',
      size: size,
      //pass the itemObject to DeleteItemConfirmationModalController
      resolve: {
        itemObject: function () {
          return itemObject;
        } // end userId
      } // end resolve
    }); // end modalInstance

    //Update the users when the modal has been closed
    modalInstance.closed.then(function () {
      $scope.displayItems();
    }); // end modalInstance closed

  }; // end openDeleteItemConfirmationModal

  $scope.displayItems();

}]); // end ItemsController

/* Modal Controllers are passed $modalInstance
 * which is the instance of modal returned by the open() function.
 * This instance needs to be passed because dismiss is the property of
 * this instance object which is used to close the modal. */

//AddNewItemModalController
myApp.controller('AddNewItemModalController', ['$scope', '$http', '$uibModalInstance', 'allItems',
function ($scope, $http, $uibModalInstance, allItems) {
    if (verbose) console.log('in AddNewItemModalController');

    $scope.duplicateItem = false;

    //close the  modal
    $scope.close = function () {
      $uibModalInstance.dismiss('cancel');
    }; // end close

    var checkForDuplicateItems = function(itemToAdd) {
      if (verbose) console.log('in checkForDuplicateItems', allItems, itemToAdd);
      for (var i = 0; i < allItems.length; i++) {
        if (allItems[i].category === itemToAdd.category && allItems[i].newItem === itemToAdd.newItem) {
          $scope.duplicateItem = true;
          return false;
        } // end if
      } // end for
      return true;
    }; // end checkForDuplicateItems

    $scope.addItem = function(){
      //construct item to send
      var itemToSend = {
        newItem: $scope.newItem.name,
        category: $scope.newItem.category
      }; // end itemToSend
      // If the form has been validated (all fields have been filled out),
      // and the item is not a duplicate
      // add the item
      if ($scope.addItemForm.$valid && checkForDuplicateItems(itemToSend)) {
        $http({
          method: 'POST',
          url: '/private/items',
          data: itemToSend
        }).then(function successCallback( response ){
          if (verbose) console.log( 'response in newItem', response );
          $scope.duplicateItem = false;
          //close the modal
          $scope.close();
        }, function errorCallback( error ){
          if (verbose) console.log( 'error occured' );
        }); // end errorCallback
			} //end if

    }; // end addItem

  } // end controller callback
]); // end AddNewItemModalController


//DeleteItemConfirmationModalController
myApp.controller('DeleteItemConfirmationModalController', ['$scope', '$http', '$uibModalInstance', 'itemObject',
function ($scope, $http, $uibModalInstance, itemObject) {
    if (verbose) console.log('in DeleteItemConfirmationModalController');

    //scope the item name for display within the modal
    $scope.itemName = itemObject.newItem;

    //close the  modal
    $scope.close = function () {
      $uibModalInstance.dismiss('cancel');
    }; // end close

    // delete item
    $scope.deleteItem = function(){
      $http.delete( '/private/items/' + itemObject._id )
      .then(function( response ){
        if (verbose) console.log( 'delete hit', response );
        //close the modal
        $scope.close();
      }); // end $http
    }; // end deleteItem

  } // end controller callback
]); // end DeleteItemConfirmationModalController
