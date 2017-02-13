myApp.controller( 'HomeController', [ '$scope', '$http', '$location', 'AuthFactory', '$uibModal',
function( $scope, $http, $location, AuthFactory, $uibModal){
  console.log( 'in HomeController' );

  //Declare authFactory
  var authFactory = AuthFactory;
  //On view load, check if the user is logged in
  $scope.loggedIn = authFactory.checkLoggedIn();
  console.log('HC. Logged in:', $scope.loggedIn);
  //check permissions
  $scope.isAdmin = authFactory.checkAdmin();
  console.log('HC. Admin:', $scope.isAdmin);

  var username = authFactory.username;
  console.log('Username-->', username);

  //display the day view table as default
  $scope.dayViewDisplay = true;

  $scope.allItems = [];

  $scope.freePeriods = [
    { name: 'BS', reserved: false, class: 'enabled' },
    { name: 'One', reserved: false, class: 'enabled' },
    { name: 'Two', reserved: false, class: 'enabled' },
    { name: 'Three', reserved: false, class: 'enabled' },
    { name: 'Four', reserved: false, class: 'enabled' },
    { name: 'Five', reserved: false, class: 'enabled' },
    { name: 'Six', reserved: false, class: 'enabled' },
    { name: 'Seven', reserved: false, class: 'enabled' },
    { name: 'AS', reserved: false, class: 'enabled' },
  ]; // end periodsArray

  var addReservationsToAllItems = function(reservationArray) {
    console.log('in addReservationsToAllItems');
    //For each reservation in reservationArray...
    reservationArray.map(function(reservationObject) {
      // loop through each item in allItems array
      for (var i = 0; i < $scope.allItems.length; i++) {
        // if reservationObject.item matches the current reservationArray.newItem property
        if (reservationObject.item === $scope.allItems[i].newItem) {
          //save the username for reservation in teacher variable
          var teacher = reservationObject.user;
          //save reservation data in data variable
          var data;
          if (reservationObject.roomNumber) {
            data = { value: reservationObject.roomNumber, display: 'Room #'};
          } else {
            data = { value: reservationObject.numberOfStudents, display: '# of Students: '};
          } // end else
          //split the periods property into an array
          var newPeriodsReserved = reservationObject.period.split(',');
          //save existing periods reserved as a variable to pass to formatPeriodsReservedArray
          var existingPeriodsReserved = $scope.allItems[i].period;
          //Format the periodsReserved array to be an array of objects...
          var periodsReserved = formatPeriodsReservedArray(newPeriodsReserved, existingPeriodsReserved, teacher, data);
          //add period array value as a property of allItems[i] object
          $scope.allItems[i].period = periodsReserved;
        } // end if
      } // end for
    }); // end .map
  }; // end addReservationsToAllItems

  var calculateThisWeeksDates = function() {
    //Calculate the start and end dates of this week
    console.log('in getThisWeeksDates');
    //Monday of this week
    var weekStart = moment().startOf('week').add(1, 'days').format('YYYY-MM-DD');
    console.log('Start of this week-->', weekStart);
    //Friday of this week
    var weekEnd = moment().endOf('week').subtract(1, 'days').format('YYYY-MM-DD');
    console.log('End of this week -->', weekEnd);
    //construct object to return
    var startEndDates = {
      weekStart: weekStart,
      weekEnd: weekEnd
    }; // end startEndDates
    return startEndDates;
  }; // end getThisWeeksDates

  var disabled = function(data) {
    // Disable weekend selection on daypicker
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }; // end disabled

  $scope.displayDayView = function() {
    console.log('in displayDayView');
    $scope.dayViewDisplay = true;
  }; // end displayDayView

  $scope.displayWeekView = function() {
    console.log('in displayWeekView');
    $scope.dayViewDisplay = false;
    //calculate the start and end dates of this week
    var startEndDates = calculateThisWeeksDates();
    //get all reservations for the current week
    getAllWeeksReservations(startEndDates);
    //get all days of this week, scope them for thead repeat
    $scope.thisWeeksDates = enumerateDaysBetweenDates(startEndDates.weekStart);
    //display week view table
    //populate week view table
  }; // end displayWeekView

  var enumerateDaysBetweenDates = function(startDate) {
    //make an array of the dates this week, startDate is Monday
    var dates = [];
    //push Monday in
    dates.push(moment(startDate).format('dddd MM/DD'));
    var rangeArray = [1, 2, 3, 4];
    //push Tuesday-Friday in
    for (var i = 0; i < rangeArray.length; i++) {
      dates.push(moment(startDate).add(rangeArray[i], 'days').format('dddd MM/DD'));
    } // end for
    return dates;
  }; // end enumerateDaysBetweenDates

  var getAllWeeksReservations = function(startEndDates) {
    console.log('in getAllWeeksReservations', startEndDates);
    //construct url
    var urlParamString = startEndDates.weekStart + '/' + startEndDates.weekEnd;
    $http({
      method: 'GET',
      url: '/private/reservations/range/' + urlParamString
    }).then(function(response) {
      console.log('getAllWeeksReservations response-->', response);
    }).catch(function(err) {
      //TODO: add better error handling here
      console.log(err);
    }); // end $http
  }; // end getAllWeeksReservations



  var formatPeriodsReservedArray = function(periodsArray, existingPeriodsReservedArray, teacherName, data) {
    //combine with existing periods reserved
    var newPeriodsArray = existingPeriodsReservedArray;
    //Map all values in periodsArray
    periodsArray.map(function(value) {
      //If the value matches the name of a period in newPeriods array,
      for (var i = 0; i < newPeriodsArray.length; i++) {
        if (value === newPeriodsArray[i].name) {
          //change the reserved value to true
          newPeriodsArray[i].reserved = true;
          //change the class value to disabled
          newPeriodsArray[i].class = 'disabled';
          //set the user name for the reservation
          newPeriodsArray[i].teacher = teacherName;
          //set data value for reservation
          newPeriodsArray[i].data = data;
        } // end if
      } // end for
    }); // end map
    //Return the newPeriodsArray
    return newPeriodsArray;
  }; // end formatPeriodsReservedArray

  var getAllItems = function() {
    $http({
      method: 'GET',
      url: '/private/items'
    }).then(function(response) {
      //scope all items as allItems for table repeat
      $scope.allItems = response.data.results;
      //Get all reservations for today
      //$scope.getReservationsByDate(new Date());
      $scope.getReservationsByDate($scope.today());
    }).catch(function(err) {
      //TODO: add better error handling here
      console.log(err);
    }); // end $http
  }; // end getAllItems

  $scope.getReservationsByDate = function(date) {
    console.log('in getReservationsByDate');
    //reset period property of all items to default
    resetPeriodsProperties($scope.allItems);
    //convert date string to correct timezone using moment.js
    date = moment(date).format('YYYY-MM-DD');
    //Get all reservations for selected date
    $http({
      method: 'GET',
      url: 'private/reservations/date/' + date,
    }).then(function(response) {
      console.log('getReservationsByDate response-->',response.data);
      var reservationArray = response.data.results;
      //consolidate allItems with this
      addReservationsToAllItems(reservationArray);
    }).catch(function(err) {
      //TODO: add better error handling here
      console.log(err);
    }); // end $http
  }; // end getAll

  var init = function() {
    console.log('in init');

    getAllItems();

    //Initialize datepicker default to today
    $scope.today();
    //Initialize datepicker popup to closed
    $scope.popup = {
      opened: false
    }; // end popup

    //Set datepicker options
    $scope.dateOptions = {
      dateDisabled: disabled,
      formatYear: 'yy',
      minDate: new Date(),
      startingDay: 1,
      showWeeks: false
    }; // end dateOptions

    //Require user to add their name within the modal
    //Run only after the entire view has been loaded
    angular.element(document).ready(function() {
      //If the username is blank, open modal
      if (username.length < 1) {
        openUsernameModal('md');
      } // end if
    }); // end doc ready function

  }; // end init

  $scope.openDatepick = function() {
    //Open the datepicker popup
    $scope.popup.opened = true;
  }; // end openDatepick

  //open username modal (returns a modal instance)
  openUsernameModal = function (size) {
    //open the modal
    console.log('Open Username Modal');
    //set the modalInstance
    var modalInstance = $uibModal.open({
      templateUrl: 'updateUsernameModal.html',
      controller: 'UpdateUsernameModalController',
      size: size
    }); // end modalInstance
  }; // end openUsernameModal

  var resetPeriodsProperties = function(array) {
    //TODO: fix this undefined value
    console.log('in clearPeriodsProperty');
    for (var i = 0; i < array.length; i++) {
      array[i].period = [
        { name: 'BS', reserved: false, class: 'enabled' },
        { name: 'One', reserved: false, class: 'enabled' },
        { name: 'Two', reserved: false, class: 'enabled' },
        { name: 'Three', reserved: false, class: 'enabled' },
        { name: 'Four', reserved: false, class: 'enabled' },
        { name: 'Five', reserved: false, class: 'enabled' },
        { name: 'Six', reserved: false, class: 'enabled' },
        { name: 'Seven', reserved: false, class: 'enabled' },
        { name: 'AS', reserved: false, class: 'enabled' },
      ]; // end periodsArray
    } // end for
  }; //end resetPeriodsProperties

  // $scope.today = function() {
  //   //Set datepicker default day to today
  //   $scope.date = new Date();
  // }; // end today();

  $scope.today = function() {
    //Sets the default date picker date.
    //Sets it to monday if the current day is a weekend
    console.log('in TODAY-->', moment().isoWeekday());
    var dayOfWeekToday = moment().isoWeekday();
    var datePickDefault;
    if (dayOfWeekToday > 5) {
      console.log('WEEKEND');
      //set the default to the next monday
      var num = 8 - dayOfWeekToday;
      datePickDefault = moment().add(num, 'days');
    } else {
      //set the default to the current day
      datePickDefault = moment();
    } // end else
    console.log('DEFAULT-->',datePickDefault._d);
    $scope.date = datePickDefault._d;
    return datePickDefault._d;
  }; // end today

  //If user is not logged in
  if(!$scope.loggedIn) {
    //Reroute them to the login page
    $location.path("/#!/login");
  } else {
    //If they are logged in, initialize the view
    init();
  } // end else

}]); // end HomeController

//UpdateUsernameModalController
myApp.controller('UpdateUsernameModalController', ['$scope', '$http', '$uibModalInstance', 'AuthFactory',
function ($scope, $http, $uibModalInstance, AuthFactory) {
    console.log('in UpdateUsernameModalController');

    //Declare auth factory
    var authFactory = AuthFactory;
    //Get current user's ID
    var currentUserId = authFactory.currentUserId;

    //close the modal
    var close = function() {
      //Close the modal
      $uibModalInstance.dismiss('cancel');
    }; // end close

    //close the  modal
    $scope.saveUsername = function (firstName, lastName) {
      //If the names they entered are not blank...
      if (firstName && lastName) {
        //Format name variables
        firstName = firstName.trim();
        lastName = lastName.trim();
        var fullName = firstName + ' ' + lastName;
        console.log('full name-->', fullName);
        //assemble object to send
        var userInfoToSend = {
          name: fullName,
          id: currentUserId
        }; // end userInfoToSend
        //Update the users's name with name entered
        $http({
          method: 'PUT',
          url: '/private/users/name',
          data: userInfoToSend
        }).then(function(response) {
          console.log(response);
          //Close the modal
          close();
        }).catch(function(err) {
          //TODO: add better error handling here
          console.log(err);
        }); // end $http
      //If they entered blank names
      } else {
        //TODO: add better error handling here
        console.warn('name is required');
      } // end else

    }; // end saveUsername

  } // end controller callback
]); // end ModalInstanceController
