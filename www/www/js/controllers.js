angular.module('app.controllers', [])

  .service('userEmailStuff', function () {
    var email = '';

    var setEmail = function (newObj) {
      email = newObj;
    };

    var getEmail = function () {
      return email;
    };

    return {
      setEmail: setEmail,
      getEmail: getEmail

    };

  })

.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate, userEmailStuff) {
    $rootScope.extras = false;  // For hiding the side bar and nav icon
    $rootScope.userName = "";
    // When the user logs out and reaches login page,
    // we clear all the history and cache to prevent back link
    $scope.$on('$ionicView.enter', function (ev) {
      if (ev.targetScope !== $scope) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });




    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('menu2', {}, {location: "replace"});

      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Email
        firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).then(function (result) {
            console.log(cred.email);
            $scope.email = userEmailStuff.setEmail(cred.email);

            console.log("Email: " + $scope.email);
            // You dont need to save the users session as firebase handles it
            // You only need to :
            // 1. clear the login page history from the history stack so that you cant come back
            // 2. Set rootScope.extra;
            // 3. Turn off the loading
            // 4. Got to menu page

            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});

          },
          function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Please note", "Authentication Error");
          }
        );

      } else {
        sharedUtils.showAlert("Please note", "Entered data is not valid");
      }



    };


    $scope.loginFb = function () {
      //Facebook Login
    };

    $scope.loginGmail = function () {
      //Gmail Login
    };


  })

  .controller('signupCtrl', function ($scope, $rootScope, sharedUtils, $ionicSideMenuDelegate,
                                      $state, fireBaseData, $ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Main Firebase Authentication part
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

          //Add name and default dp to the Autherisation table
          result.updateProfile({
            displayName: cred.name,
            photoURL: "default_dp"
          }).then(function () {
          }, function (error) {
          });

          //Add phone number to the user table
          fireBaseData.refUser().child(result.uid).set({
            telephone: cred.phone
          });

          //Registered OK
          $ionicHistory.nextViewOptions({
            historyRoot: true
          });
          $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
          $rootScope.extras = true;
          sharedUtils.hideLoading();
          $state.go('menu2', {}, {location: "replace"});

        }, function (error) {
          sharedUtils.hideLoading();
          sharedUtils.showAlert("Please note", "Sign up Error");
        });

      } else {
        sharedUtils.showAlert("Please note", "Entered data is not valid");
      }

    }

  })

  .controller('upcomingEventsCtrl', function ($scope, $rootScope, $ionicSideMenuDelegate, fireBaseData, $state,
                                              $ionicHistory, $firebaseArray, userEmailStuff, sharedCartService, sharedUtils) {

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        //console.log("user: " + user);
        $scope.user_info = user; //Saves data to user_info
        //$scope.email = userEmailStuff.getEmail();
        //console.log("menu2Ctrl: " + $scope.email);
      } else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    // On Loggin in to menu page, the sideMenu drag state is set to true
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.extras = true;

    // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
    $scope.$on('$ionicView.enter', function (ev) {
      if (ev.targetScope !== $scope) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });


    $scope.loadEvent = function () {
      sharedUtils.showLoading();
      $scope.events = $firebaseArray(fireBaseData.refEvent());
      sharedUtils.hideLoading();
    }

    $scope.showProductInfo = function (id) {

    };
    $scope.addToCart = function (item) {
      sharedCartService.add(item);
    };

  })

  // .controller('offersCtrl', function ($scope, $rootScope) {
  //
  //   //We initialise it on all the Main Controllers because, $rootScope.extra has default value false
  //   // So if you happen to refresh the Offer page, you will get $rootScope.extra = false
  //   //We need $ionicSideMenuDelegate.canDragContent(true) only on the menu, ie after login page
  //   $rootScope.extras = true;
  // })

.controller('libraryCtrl', function() {

})

// .controller('statsCtrl', function() {
//
// })

// to access $root.extras and get_total()
.controller('indexCtrl', function($scope,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService) {

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user; //Saves data to user_info

        //Only when the user is logged in, the cart qty is shown
        //Else it will show unwanted console error till we get the user object
        $scope.get_total = function () {
          var total_qty = 0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            total_qty += sharedCartService.cart_items[i].item_qty;
          }
          return total_qty;
        };

      } else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    $scope.logout = function () {

      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function () {


        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });


        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }, function (error) {
        sharedUtils.showAlert("Error", "Logout Failed")
      });

    }

  })

  .controller('attendingCtrl', function ($scope, $rootScope, $state, sharedCartService) {

    $rootScope.extras = true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {

        $scope.cart = sharedCartService.cart_items;  // Loads users cart

        // $scope.get_qty = function () {
        //   $scope.total_qty = 0;
        //   $scope.total_amount = 0;
        //
        //   for (var i = 0; i < sharedCartService.cart_items.length; i++) {
        //     $scope.total_qty += sharedCartService.cart_items[i].item_qty;
        //     $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
        //   }
        //   return $scope.total_qty;
        // };
      }
      //We dont need the else part because indexCtrl takes care of it
    });

    $scope.removeFromCart = function (c_id) {
      sharedCartService.drop(c_id);
    };

    // $scope.inc = function (c_id) {
    //   sharedCartService.increment(c_id);
    // };
    //
    // $scope.dec = function (c_id) {
    //   sharedCartService.decrement(c_id);
    // };
    //
    // $scope.checkout = function () {
    //   $state.go('checkout', {}, {location: "replace"});
    // };

  })

  .controller('createEventCtrl', function ($scope, userEmailStuff, $ionicPopup) {
    $scope.createEvent = function (event) {
      var ref = new Firebase("https://test-773a4.firebaseio.com/");
      var refEvents = ref.child("events")
      $scope.email = userEmailStuff.getEmail();
      // console.log("createEventCtrl : " + $scope.email);
      var json = {
        branch: event.branch,
        date: event.date,
        description: event.description,
        host: $scope.email,
        image: "default",
        name: event.name,
        noAttendance: event.attendance,
        time: event.time,
        venue: event.venue
      };
      refEvents.push(json, function (error) {
        if (error) {
          console.log("Error:", error);
        }
        else {
          console.log("It worked");
        }
      });

      // alert box
      var alertPopup = $ionicPopup.alert({
        title: 'Alert',
        template: 'Event Successfully Created'
      });
      alertPopup.then(function (res) {
        console.log('Event created! Empty all fields...');
      });

      console.log(event);
      event.branch = "";
      event.venue = "";
      event.name = "";
      event.description = "";
      event.time = "";
      event.date = "";
      event.attendance = "";
      console.log(event);
    }

  })

  .controller('hostingCtrl', function ($scope, $rootScope, $state) {

    $rootScope.extras = true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {

        var refEvent = new Firebase("https://test-773a4.firebaseio.com/events")

        refEvent.on("value", function(snapshot) {
          // console.log(snapshot.val());
          $scope.cart = snapshot.val();
        }, function (error) {
          console.log("Error: " + error.code);
        });

      }
    });
  })

  .controller('lastOrdersCtrl', function ($scope, $rootScope, fireBaseData, sharedUtils) {

    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;

        fireBaseData.refOrder()
          .orderByChild('user_id')
          .startAt($scope.user_info.uid).endAt($scope.user_info.uid)
          .once('value', function (snapshot) {
            $scope.orders = snapshot.val();
            $scope.$apply();
          });
        sharedUtils.hideLoading();
      }
    });
  })

  .controller('favouriteCtrl', function ($scope, $rootScope) {

    $rootScope.extras = true;
  })

  .controller('settingsCtrl', function ($scope, $rootScope, fireBaseData, $firebaseObject,
                                        $ionicPopup, $state, $window, $firebaseArray,
                                        sharedUtils) {
    //Bugs are most prevailing here
    $rootScope.extras = true;

    //Shows loading bar
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {

        //Accessing an array of objects using firebaseObject, does not give you the $id , so use firebase array to get $id
        $scope.addresses = $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));

        // firebaseObject is good for accessing single objects for eg:- telephone. Don't use it for array of objects
        $scope.user_extras = $firebaseObject(fireBaseData.refUser().child(user.uid));

        $scope.user_info = user; //Saves data to user_info
        //NOTE: $scope.user_info is not writable ie you can't use it inside ng-model of <input>

        //You have to create a local variable for storing emails
        $scope.data_editable = {};
        $scope.data_editable.email = $scope.user_info.email;  // For editing store it in local variable
        $scope.data_editable.password = "";

        $scope.$apply();

        sharedUtils.hideLoading();

      }

    });

    $scope.addManipulation = function (edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if (edit_val != null) {
        $scope.data = edit_val; // For editing address
        var title = "Edit Address";
        var sub_title = "Edit your address";
      }
      else {
        $scope.data = {};    // For adding new address
        var title = "Add Address";
        var sub_title = "Add your new address";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.nickname"> <br/> ' +
        '<input type="text"   placeholder="Address" ng-model="data.address"> <br/> ' +
        '<input type="number" placeholder="Pincode" ng-model="data.pin"> <br/> ' +
        '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          {text: 'Close'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function (res) {

        if (edit_val != null) {
          //Update  address
          if (res != null) { // res ==null  => close
            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
              nickname: res.nickname,
              address: res.address,
              pin: res.pin,
              phone: res.phone
            });
          }
        } else {
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function (del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Address',
        template: 'Are you sure you want to delete this address',
        buttons: [
          {text: 'No', type: 'button-stable'},
          {
            text: 'Yes', type: 'button-assertive', onTap: function () {
            return del_id;
          }
          }
        ]
      });

      confirmPopup.then(function (res) {
        if (res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save = function (extras, editable) {
      //1. Edit Telephone doesnt show popup 2. Using extras and editable  // Bugs
      if (extras.telephone != "" && extras.telephone != null) {
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({    // set
          telephone: extras.telephone
        });
      }

      //Edit Password
      if (editable.password != "" && editable.password != null) {
        //Update Password in UserAuthentication Table
        firebase.auth().currentUser.updatePassword(editable.password).then(function (ok) {
        }, function (error) {
        });
        sharedUtils.showAlert("Account", "Password Updated");
      }

      //Edit Email
      if (editable.email != "" && editable.email != null && editable.email != $scope.user_info.email) {

        //Update Email/Username in UserAuthentication Table
        firebase.auth().currentUser.updateEmail(editable.email).then(function (ok) {
          $window.location.reload(true);
          //sharedUtils.showAlert("Account","Email Updated");
        }, function (error) {
          sharedUtils.showAlert("ERROR", error);
        });
      }

    };

    $scope.cancel = function () {
      // Simple Reload
      $window.location.reload(true);
      console.log("CANCEL");
    }

  })

  .controller('supportCtrl', function ($scope, $rootScope) {

    $rootScope.extras = true;

  })

  .controller('forgotPasswordCtrl', function ($scope, $rootScope) {
    $rootScope.extras = false;
  })

  .controller('checkoutCtrl', function ($scope, $rootScope, sharedUtils, $state, $firebaseArray,
                                        $ionicHistory, fireBaseData, $ionicPopup, sharedCartService) {

    $rootScope.extras = true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.addresses = $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));
        $scope.user_info = user;
      }
    });

    $scope.payments = [
      {id: 'CREDIT', name: 'Credit Card'},
      {id: 'NETBANK', name: 'Net Banking'},
      {id: 'COD', name: 'COD'}
    ];

    $scope.pay = function (address, payment) {

      if (address == null || payment == null) {
        //Check if the checkboxes are selected ?
        sharedUtils.showAlert("Error", "Please choose from the Address and Payment Modes.")
      }
      else {
        // Loop throw all the cart item
        for (var i = 0; i < sharedCartService.cart_items.length; i++) {
          //Add cart item to order table
          fireBaseData.refOrder().push({

            //Product data is hardcoded for simplicity
            product_name: sharedCartService.cart_items[i].item_name,
            product_price: sharedCartService.cart_items[i].item_price,
            product_image: sharedCartService.cart_items[i].item_image,
            product_id: sharedCartService.cart_items[i].$id,

            //item data
            item_qty: sharedCartService.cart_items[i].item_qty,

            //Order data
            user_id: $scope.user_info.uid,
            user_name: $scope.user_info.displayName,
            address_id: address,
            payment_id: payment,
            status: "Queued"
          });

        }

        //Remove users cart
        fireBaseData.refCart().child($scope.user_info.uid).remove();

        sharedUtils.showAlert("Info", "Order Successfull");

        // Go to past order page
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('lastOrders', {}, {location: "replace", reload: true});
      }
    }


    $scope.addManipulation = function (edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if (edit_val != null) {
        $scope.data = edit_val; // For editing address
        var title = "Edit Address";
        var sub_title = "Edit your address";
      }
      else {
        $scope.data = {};    // For adding new address
        var title = "Add Address";
        var sub_title = "Add your new address";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.nickname"> <br/> ' +
        '<input type="text"   placeholder="Address" ng-model="data.address"> <br/> ' +
        '<input type="number" placeholder="Pincode" ng-model="data.pin"> <br/> ' +
        '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          {text: 'Close'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function (res) {

        if (edit_val != null) {
          //Update  address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        } else {
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };


  })

  .controller('statsCtrl', function($scope,$rootScope){

    var pieData = [
      {
        value: 20,
        color:"#FF0000  ",
      },
      {
        value : 40,
        color : "#4ACAB4  ",
      }
    ];


// Get the context of the canvas element we want to select
    var myChart= document.getElementById("pie").getContext("2d");
    new Chart(myChart).Pie(pieData);

    var lineData = {
      labels: [ "October", "Novemeber", "December","January", "February", "March", "April"],
      datasets: [
        {
          label: "Attendance Per Month",
          fill: true,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [65, 59, 80, 81, 56, 55, 40],
          spanGaps: false,
        }
      ]
    };


// Get the context of the canvas element we want to select
    var lineChart= document.getElementById("line").getContext("2d");
    new Chart(lineChart).Line(lineData);

    var barData = {
      labels: ["Literacy", "Art", "Stage", "Computer", "Count", "EventT", "EventP"],
      datasets: [
        {
          label: "My First dataset",
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1,
          data: [65, 59, 80, 81, 56, 55, 40],
        }
      ]
    };

// Get the context of the canvas element we want to select
    var barChart= document.getElementById("bar").getContext("2d");
    new Chart(barChart).Bar(barData);


  })
