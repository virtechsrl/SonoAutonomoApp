"use strict";

angular.module('starter.controllers', [])

        .controller('AppCtrl', function ($rootScope, $scope, $ionicSideMenuDelegate, $ionicHistory, $state, $ionicPopup, $cordovaGeolocation,
                OpenDataService, CategoriesDB, $ionicModal, $ionicPlatform, $filter, $ionicLoading, ionicMaterialInk, $timeout, utils) {
            // Form data for the login modal
            $scope.loginData = {};
            $scope.current_location = "Cerco la posizione..."

            $rootScope.loggedIn = false;
            if (window.localStorage.getItem("AUTH_TOKEN") != null)
                $rootScope.loggedIn = true;

            $scope.isExpanded = false;
            $scope.hasHeaderFabLeft = false;
            $scope.hasHeaderFabRight = false;

            ////////////////////////////////////////
            // Layout Methods
            ////////////////////////////////////////

            $scope.hideNavBar = function () {
                document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
            };

            $scope.showNavBar = function () {
                document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
            };

            $scope.noHeader = function () {
                var content = document.getElementsByTagName('ion-content');
                for (var i = 0; i < content.length; i++) {
                    if (content[i].classList.contains('has-header')) {
                        content[i].classList.toggle('has-header');
                    }
                }
            };

            $scope.setExpanded = function (bool) {
                $scope.isExpanded = bool;
            };

            $scope.setHeaderFab = function (location) {
                var hasHeaderFabLeft = false;
                var hasHeaderFabRight = false;

                switch (location) {
                    case 'left':
                        hasHeaderFabLeft = true;
                        break;
                    case 'right':
                        hasHeaderFabRight = true;
                        break;
                }

                $scope.hasHeaderFabLeft = hasHeaderFabLeft;
                $scope.hasHeaderFabRight = hasHeaderFabRight;
            };

            $scope.hasHeader = function () {
                var content = document.getElementsByTagName('ion-content');
                for (var i = 0; i < content.length; i++) {
                    if (!content[i].classList.contains('has-header')) {
                        content[i].classList.toggle('has-header');
                    }
                }
            };

            $scope.hideHeader = function () {
                $scope.hideNavBar();
                $scope.noHeader();
            };

            $scope.showHeader = function () {
                $scope.showNavBar();
                $scope.hasHeader();
            };

            $scope.clearFabs = function () {
                var fabs = document.getElementsByClassName('button-fab');
                if (fabs.length && fabs.length > 1) {
                    fabs[0].remove();
                }
            };

            $scope.goToView = function (view, params, from_menu) {
                if (from_menu) {
                    $ionicSideMenuDelegate.toggleLeft();
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                }
                $state.go("app." + view, params);
            };

            /* EFFETTUA IL LOGOUT DALL'APP */
            $scope.logout = function () {

                $ionicPopup.confirm({
                    title: 'Conferma',
                    template: 'Stai per effettuare il logout. Continuare?',
                    buttons:
                            [
                                {
                                    text: 'No',
                                    type: 'button-dark'
                                },
                                {
                                    text: 'Si',
                                    type: 'button-dark',
                                    onTap: function (res) {
                                        if (res) {
                                            $ionicHistory.clearHistory();
                                            $ionicHistory.clearCache();

                                            $ionicHistory.nextViewOptions({
                                                disableBack: true
                                            });

                                            $ionicSideMenuDelegate.toggleLeft();

                                            $scope.loginData = {};

                                            window.localStorage.removeItem("USER_INFO");
                                            window.localStorage.removeItem("AUTH_TOKEN");

                                            $rootScope.loggedIn = false;

                                            $state.go('app.home');
                                        }
                                    }
                                }
                            ]
                });
            };

            $scope.getPercentage = function (num) {
                if (num == null)
                    num = 0;
                return (100 - ((parseFloat(num)) / 5) * 100) + "%";
            };

            if (window.localStorage.getItem("USER_INFO") != null) {

                var userInfo = JSON.parse(window.localStorage.getItem("USER_INFO"));

                $scope.loginData.firstName = userInfo.first_name;
                $scope.loginData.lastName = userInfo.last_name;
                $scope.loginData.email = userInfo.email;
                $scope.loginData.id = userInfo.id;

                console.log("UserInfo -> ", $scope.loginData);
            }

            $scope.currentState = $state.current.name;

            $rootScope.$on('$stateChangeSuccess',
                    function (event, toState, toParams, fromState, fromParams) {
                        $scope.currentState = toState.name;
                        console.log("CurrentState -> ", $scope.currentState);
                    }
            );


            /* APRE POPUP DI LOGIN */
            $scope.openModalLogin = function () {

                if ($scope.modalLogin == null) {
                    $ionicModal.fromTemplateUrl('templates/login.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.modalLogin = modal;
                        $scope.modalLogin.show();

                        $scope.data = {
                            username: "",
                            password: ""
                        };

                        $scope.login = function (data) {

                            if (!data.username && !data.password) {
                                $ionicPopup.alert({
                                    title: 'Informazione',
                                    template: "Inserisci USERNAME e PASSWORD",
                                    buttons:
                                            [
                                                {
                                                    text: 'Ok',
                                                    type: 'button-dark'
                                                }
                                            ]
                                });
                            }
                            else {

                                var username = data.username;
                                var password = data.password;

                                $ionicLoading.show({
                                    template: '<ion-spinner class="ajax-loader"></ion-spinner>'
                                });

                                /* EFFETTUO LA CHIAMATA AL METODO DI LOGIN */
                                OpenDataService.login(username, password).then(function (response) {

                                    $ionicLoading.hide();

                                    var msg = "Non è stato possibile effettuare il login";
                                    if (response.status === 401)
                                        msg = "Username o password non validi";

                                    /* SE LE CREDENZIALI SONO ERRATE VISUALIZZO UN POPUP D'ERRORE */
                                    if (response.status === 401 || response.data === null || (response && response.data.message.type == 'error')) {

                                        $ionicPopup.alert({
                                            title: 'Informazione',
                                            template: msg,
                                            buttons:
                                                    [
                                                        {
                                                            text: 'Ok',
                                                            type: 'button-dark'
                                                        }
                                                    ]
                                        });
                                    }
                                    else {
                                        if (response.data.message.type == 'success') {

                                            window.localStorage.setItem("USER_INFO", JSON.stringify(response.data.user));
                                            $rootScope.loggedIn = true;

                                            $scope.loginData.firstName = response.data.user.first_name;
                                            $scope.loginData.lastName = response.data.user.last_name;
                                            $scope.loginData.email = response.data.user.email;
                                            $scope.loginData.id = response.data.user.id;

                                            $scope.closeModalLogin();

                                            $scope.goToView("home", null, true);
                                        }

                                    }
                                });
                            }
                        };

                        $scope.signupFromLogin = function () {
                            $scope.closeModalLogin();
                            $scope.openModalSignup();
                        };

                        $scope.closeModalLogin = function () {
                            $scope.modalLogin.hide();
                            $scope.modalLogin.remove().then(function () {
                                $scope.modalLogin = null;
                                $ionicPlatform.offHardwareBackButton($scope.closeModalLogin);
                            });
                        };

                        $ionicPlatform.onHardwareBackButton($scope.closeModalLogin);
                    });
                }
            };

            /* APRE POPUP DI REGISTRAZIONE */
            $scope.openModalSignup = function () {

                if ($scope.modalSignup == null) {
                    $ionicModal.fromTemplateUrl('templates/signup.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.modalSignup = modal;
                        $scope.modalSignup.show();

                        $scope.data = {
                            first_name: "",
                            last_name: "",
                            email: "",
                            password: "",
                            confirm_password: ""
                        };

                        $scope.error_messages = false;

                        $scope.signup = function (data, form) {

                            if (!form.$valid) {
                                $scope.error_messages = true;
                            }
                            else {
                                $scope.error_messages = false;

                                $ionicLoading.show({
                                    template: '<ion-spinner class="ajax-loader"></ion-spinner>'
                                });

                                /* EFFETTUO LA CHIAMATA AL METODO DI LOGIN */
                                OpenDataService.signup($scope.data).then(function (response) {

                                    $ionicLoading.hide();

                                    /* SE LE CREDENZIALI SONO ERRATE VISUALIZZO UN POPUP D'ERRORE */
                                    if (response.data === null || (response && response.data.message.type == 'error')) {

                                        $ionicPopup.alert({
                                            title: 'Informazione',
                                            template: response.data.message.text,
                                            buttons:
                                                    [
                                                        {
                                                            text: 'Ok',
                                                            type: 'button-dark'
                                                        }
                                                    ]
                                        });

                                    }
                                    else {
                                        if (response.data.message.type == 'success' && response.data.result) {
                                            $scope.closeModalSignup();

                                            /* EFFETTUO LA CHIAMATA AL METODO DI LOGIN */
                                            OpenDataService.login(response.data.result.User.email, $scope.data.password).then(function (response) {

                                                $ionicLoading.hide();

                                                var msg = "Non è stato possibile effettuare il login";
                                                if (response.status === 401)
                                                    msg = "Username o password non validi";

                                                /* SE LE CREDENZIALI SONO ERRATE VISUALIZZO UN POPUP D'ERRORE */
                                                if (response.status === 401 || response.data === null || (response && response.data.message.type == 'error')) {

                                                    $ionicPopup.alert({
                                                        title: 'Informazione',
                                                        template: "Non è stato possibile effettuare il login",
                                                        buttons:
                                                                [
                                                                    {
                                                                        text: 'Ok',
                                                                        type: 'button-dark'
                                                                    }
                                                                ]
                                                    });
                                                }
                                                else {
                                                    if (response.data.message.type == 'success') {

                                                        window.localStorage.setItem("USER_INFO", JSON.stringify(response.data.user));
                                                        $rootScope.loggedIn = true;

                                                        $scope.loginData.firstName = response.data.user.first_name;
                                                        $scope.loginData.lastName = response.data.user.last_name;
                                                        $scope.loginData.email = response.data.user.email;
                                                        $scope.loginData.id = response.data.user.id;

                                                        $scope.closeModalLogin();

                                                        $scope.goToView("home", null, true);
                                                    }

                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        };

                        $scope.closeModalSignup = function () {
                            $scope.modalSignup.hide();
                            $scope.modalSignup.remove().then(function () {
                                $scope.modalSignup = null;
                                $ionicPlatform.offHardwareBackButton($scope.closeModalSignup);
                            });
                        };

                        $ionicPlatform.onHardwareBackButton($scope.closeModalSignup);

                    });

                }

            };


            /* APRE LA VIEW PER INVIARE LA RECENSIONE */
            $scope.openModalReview = function (structure, review) {

                if (window.localStorage.getItem("USER_INFO") == null) {
                    $scope.openModalLogin();
                }
                else {

                    if ($scope.modalReview == null) {
                        $ionicModal.fromTemplateUrl('templates/review.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.modalReview = modal;
                            $scope.modalReview.show();
                            $scope.structure = {};
                            $scope.structure = structure;

                            if (!$scope.structure.Structure.name)
                                $scope.title = $filter('capitalize')($scope.structure.Structure.opendata_type);
                            else
                                $scope.title = $scope.structure.Structure.name;

                            console.log($scope.structure);

                            $scope.textarea = {
                                comment: ""
                            };

                            $scope.accessibility = null;
                            $scope.setAccessibility = function (num) {
                                $scope.accessibility = num;
                            };

                            $scope.entryStairs = null;
                            $scope.setEntryStairs = function (num) {
                                $scope.entryStairs = num;
                            };

                            $scope.bathroom = null;
                            $scope.setBathroomRate = function (num) {
                                $scope.bathroom = num;
                            };

                            $scope.options = {
                                spacious: false,
                                quiet: false,
                                second_entry: false,
                                parking: false,
                                well_lit: false,
                                guide_dog: false
                            };

                            $scope.sendReview = function () {

                                if ($scope.accessibility && $scope.entryStairs !== null && $scope.bathroom) {

                                    var data = {
                                        structure_id: $scope.structure.Structure.id,
                                        user_id: $scope.loginData.id,
                                        accessibility: $scope.accessibility,
                                        entry_stairs: $scope.entryStairs,
                                        bathroom: $scope.bathroom,
                                        comment: $scope.textarea.comment,
                                        spacious: $scope.options.spacious,
                                        quiet: $scope.options.quiet,
                                        second_entry: $scope.options.second_entry,
                                        parking: $scope.options.parking,
                                        well_lit: $scope.options.well_lit,
                                        guide_dog: $scope.options.guide_dog
                                    };

                                    if (review) {
                                        data.id = review.id;
                                    }

                                    console.log("save -> ", data);

                                    $scope.loading = true;

                                    OpenDataService.setReview(data).then(function (response) {

                                        $scope.loading = false;

                                        console.log(response);
                                        if (response != "OK") {
                                            $ionicPopup.alert({
                                                title: 'Info',
                                                template: "Non è stato possibile inviare la recensione. Riprovare più tardi.",
                                                buttons:
                                                        [
                                                            {
                                                                text: 'Ok',
                                                                type: 'button-dark'
                                                            }
                                                        ]
                                            });
                                        }
                                        else {

                                            $ionicHistory.clearHistory();
                                            $ionicHistory.clearCache();

                                            $ionicHistory.nextViewOptions({
                                                disableBack: true
                                            });
                                            $state.go('app.home');
                                            $scope.closeModalReview();
                                        }
                                    });


                                } else {
                                    $ionicPopup.alert({
                                        title: 'Info',
                                        template: 'Le voci "Accessibilità", "Num. di gradini" e "Bagno" sono obbligatorie',
                                        buttons:
                                                [
                                                    {
                                                        text: 'Ok',
                                                        type: 'button-dark'
                                                    }
                                                ]
                                    });
                                }

                            };

                            $scope.closeModalReview = function () {

                                $scope.modalReview.hide();
                                $scope.modalReview.remove().then(function () {
                                    $scope.modalReview = null;
                                    $ionicPlatform.offHardwareBackButton($scope.closeModalReview);
                                });
                            };

                            $ionicPlatform.onHardwareBackButton($scope.closeModalReview);

                            $scope.update = false;
                            if (review) {
                                $scope.update = true;

                                $scope.textarea = {
                                    comment: review.comment
                                };

                                $scope.accessibility = review.accessibility;

                                $scope.entryStairs = review.entry_stairs;

                                $scope.bathroom = review.bathroom;

                                $scope.options = {
                                    spacious: Boolean(parseInt(review.spacious)),
                                    quiet: Boolean(parseInt(review.quiet)),
                                    second_entry: Boolean(parseInt(review.second_entry)),
                                    parking: Boolean(parseInt(review.parking)),
                                    well_lit: Boolean(parseInt(review.well_lit)),
                                    guide_dog: Boolean(parseInt(review.guide_dog))
                                };

                                console.log("options -> ", $scope.options, review);
                            }
                        });
                    }
                }

            };

            $scope.printDate = function (str) {
                return utils.printDate(str);
            };

            $scope.getCurrentPosition = function () {

                if (window.cordova) {
                    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
                        if (!enabled) {
                            $scope.current_location = "Attiva il GPS";
                            $ionicPopup.confirm({
                                title: 'Conferma',
                                template: 'Attiva il GPS!',
                                buttons:
                                        [
                                            {
                                                text: 'No',
                                                type: 'button-dark'
                                            },
                                            {
                                                text: 'Si',
                                                type: 'button-dark',
                                                onTap: function (res) {
                                                    if (res) {
                                                        cordova.plugins.diagnostic.switchToLocationSettings();
                                                    }
                                                }
                                            }
                                        ]
                            });
                        }
                        else {
                            $scope.searchPosition();
                        }
                    }, function (error) {
                        console.log("The following error occurred: " + error);
                    });
                }
                else {
                    $scope.searchPosition();
                }

            };

            $scope.searchPosition = function () {
                $scope.current_location = "Cerco la posizione...";

                //var options = {timeout: 3600000, enableHighAccuracy: true};
                var options = {enableHighAccuracy: true};

                $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

                    console.log("Current position -> ", position);
                    window.localStorage.setItem("CURRENT_POSITION", position.coords.latitude + "," + position.coords.longitude);

                    var geocoder = new google.maps.Geocoder;
                    var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
                    geocoder.geocode({'location': latlng}, function (results, status) {
                        console.log("geocoding -> ", results, status);
                        if (results) {
                            $scope.current_location = $scope.getAddressDetails(results[0].address_components, "locality");
                            $scope.$apply();
                            console.log("Current location -> " + $scope.current_location);
                        }
                    });

                }, function (error) {
                    $scope.$apply();
                    $scope.current_location = "Nessuna posizione";
                    console.log("Nessuna posizione");
                });
            };

            $scope.getAddressDetails = function (address_components, detail_type, text) {
                var str = "";
                if (typeof (text) === 'undefined')
                    text = 'long';
                else
                    text = 'short';
                angular.forEach(address_components, function (address_component) {
                    if (address_component.types[0] === detail_type) {
                        console.log("text type -> " + text);
                        if (text === 'short')
                            str = address_component.short_name;
                        else
                            str = address_component.long_name;
                        return false;
                    }

                });
                return str;
            };
        })

        .controller('HomeCtrl', function ($scope, $timeout, ionicMaterialInk, CategoriesDB, OpenDataService) {

            $scope.filter = {
                search_text: ""
            };

            CategoriesDB.getAll().then(function (result) {
                if (result == null || result.length == 0) {

                    OpenDataService.getCategories().then(function (response) {
                        angular.forEach(response, function (item) {
                            CategoriesDB.add(item);
                        });

                        $timeout(function () {
                            CategoriesDB.getAll().then(function (result) {
                                $scope.categories = result;
                            });
                        }, 500);
                    });
                }
                else {
                    $scope.categories = result;
                }
            });

            if ($scope.categories == null) {
                CategoriesDB.getAll().then(function (result) {
                    $scope.categories = result;
                });
            }

            $scope.search = function (category_id, category_name) {
                $scope.selectedCategories = [];

                console.log("searchText -> ", $scope.filter.searchText);

                if (category_id)
                    $scope.selectedCategories.push(category_id);

                var title = "Sono Autonomo";
                if (category_name)
                    title = category_name;
                else {
                    if ($scope.filter.searchText !== "")
                        title = $scope.filter.searchText;
                }

                var data = {
                    title: title,
                    selected_categories: $scope.selectedCategories,
                    search_text: $scope.filter.searchText,
                    order_by: "ranking"
                };

                if (window.localStorage.getItem("CURRENT_POSITION")) {
                    data.order_by = "distance";
                }

                $scope.goToView("structures-list", data, false);
            };

            $scope.getCurrentPosition();

            $timeout(function () {
                ionicMaterialInk.displayEffect();
            }, 500);
        })

        .controller('StructuresListCtrl', function ($scope, $state, $timeout, ionicMaterialInk, $stateParams,
                OpenDataService, CategoriesDB, $ionicModal, $ionicPlatform, $ionicScrollDelegate) {

            console.log("params", $stateParams);

            if ($stateParams.title === null && $stateParams.selected_categories === null && $stateParams.search_text === null)
                $scope.goToView("home", null, true);
            else {

                $scope.title = $stateParams.title;

                $scope.structures = [];
                $scope.selectedCategories = $stateParams.selected_categories;
                $scope.order_by = $stateParams.order_by;
                $scope.filter = {
                    'searchText': $stateParams.search_text
                };

                $scope.refresh = function () {

                    $scope.loading = true;

                    OpenDataService.getStructuresList(0, $scope.selectedCategories, $scope.filter.searchText, window.localStorage.getItem("CURRENT_POSITION"), $scope.order_by).then(function (response) {
                        $scope.structures = response;

                        $scope.loading = false;

                        $scope.$broadcast("scroll.refreshComplete");

                        $timeout(function () {
                            ionicMaterialInk.displayEffect();
                            if ($scope.structures && $scope.structures.length >= 20)
                                $scope.moredata = false;
                        }, 500);
                    });
                };

                $scope.refresh();

                $scope.openStructure = function (item) {
                    $state.go("app.structure", {structure: item});
                };

                $scope.addReview = function (item) {
                    $state.go("app.review", {structure: item});
                };

                $scope.showMap = function (item) {

                    var filters = {
                        'selectedCategories': $scope.selectedCategories,
                        'searchText': $scope.filter.searchText
                    };

                    $state.go("app.map", {filters: filters});
                };

                $scope.moredata = true;

                $scope.loadMoreData = function () {

                    console.log("call getList from index -> " + ($scope.structures.length));

                    OpenDataService.getStructuresList($scope.structures.length, $scope.selectedCategories,
                            $scope.filter.searchText, window.localStorage.getItem("CURRENT_POSITION"), $scope.order_by).then(function (response) {

                        Array.prototype.push.apply($scope.structures, response);

                        ionicMaterialInk.displayEffect();

                        if (response.length < 20) {
                            $scope.moredata = true;
                        }

                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };

                $scope.setOrderBy = function (value) {

                    $scope.order_by = value;

                };

                /* POPUP DI VISUALIZZAZIONE DEI FILTRI */

                $scope.openModalFilter = function () {

                    if ($scope.modal == null) {
                        $ionicModal.fromTemplateUrl('templates/filters.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.modal = modal;

                            if ($scope.categories == null) {
                                CategoriesDB.getAll().then(function (result) {
                                    $scope.categories = result;
                                });
                            }

                            $scope.modal.show();

                            $scope.closeModalFilters = function (close_only, reset) {

                                if (!close_only) {
                                    $scope.selectedCategories = [];
                                    angular.forEach($scope.categories, function (item) {
                                        if (item.checked) {
                                            $scope.selectedCategories.push(item.id_category);
                                        }
                                    });
                                    console.log("$scope.selectedCategories", $scope.selectedCategories);
                                    console.log("$scope.searchText", $scope.searchtext);

                                    $scope.structures = [];

                                    $ionicScrollDelegate.scrollTop();
                                    $scope.refresh();
                                }

                                if (reset) {
                                    $scope.selectedCategories = [];
                                    $scope.filter.searchText = "";
                                    angular.forEach($scope.categories, function (item) {
                                        item.checked = false;
                                    });
                                    $ionicScrollDelegate.scrollTop();
                                    $scope.refresh();
                                }

                                $scope.modal.hide();
                                $scope.modal.remove().then(function () {
                                    $scope.modal = null;
                                    $ionicPlatform.offHardwareBackButton($scope.closeModalFilters);
                                });
                            };

                            $ionicPlatform.onHardwareBackButton($scope.closeModalFilters);
                        });
                    }
                };

                $timeout(function () {
                    ionicMaterialInk.displayEffect();
                }, 500);

            }

        })

        .controller('StructureCtrl', function ($scope, $stateParams, $filter, ionicMaterialInk, CategoriesDB, $state, FavoritesDB, $timeout) {

            if ($stateParams.structure === null)
                $scope.goToView("home", null, true);
            else {
                $scope.structure = $stateParams.structure;
                $scope.isFavorite = false;

                FavoritesDB.getById($scope.structure.Structure.id).then(function (result) {

                    console.log("isFavorite", result);

                    if (result)
                        $scope.isFavorite = true;
                });

                console.log($scope.structure);

                CategoriesDB.getAll().then(function (result) {

                    angular.forEach($scope.structure.StructureCategory, function (item) {
                        if (item && item.category_id) {
                            item.name = ($filter('getByKey')(result, "id_category", item.category_id)).name;

                            console.log("categories -> ", result);
                            console.log(item.category_id + " -> " + item.name);
                        }
                    });
                });

                if (!$scope.structure.Structure.name)
                    $scope.title = $filter('capitalize')($scope.structure.Structure.opendata_type);
                else
                    $scope.title = $filter('capitalize')($scope.structure.Structure.name);

                console.log($scope.structure);

                $scope.accessibility = 0;
                $scope.setAccessibility = function (num) {
                    console.log("NUM-> " + num);
                    $scope.accessibility = num;
                    console.log("$scope.accessibility-> " + $scope.accessibility);
                };

                $scope.showMap = function (item) {
                    $state.go("app.map", {filters: null, place: item});
                };

                $scope.setFavorite = function (item) {
                    if ($scope.isFavorite) {
                        FavoritesDB.remove(item.Structure.id).then(function (result) {
                            $scope.isFavorite = false;
                        });
                    }
                    else {
                        var data = {
                            'id': item.Structure.id,
                            'name': item.Structure.name,
                            'address': item.Structure.address,
                            'date': new Date()
                        };

                        FavoritesDB.add(data).then(function (result) {
                            console.log(result);
                            $scope.isFavorite = true;
                        });
                    }
                };

                $scope.showReviews = function (reviews, structure) {
                    $state.go("app.reviews-by-location", {reviews: reviews, structure: structure});
                };

                $timeout(function () {
                    ionicMaterialInk.displayEffect();
                }, 500);
            }
        })

        .controller('MapCtrl', function ($scope, $stateParams, OpenDataService, $filter) {

            var mapOptions = {
                center: new google.maps.LatLng(40.3536, 18.1851),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

            var infoWindow = new google.maps.InfoWindow({
                maxWidth: 250
            });

            google.maps.event.addListenerOnce($scope.map, 'idle', function () {

                $scope.selectedCategories = null;
                $scope.searchText = null;

                if ($stateParams.filters !== null) {
                    $scope.selectedCategories = $stateParams.filters.selectedCategories;
                    $scope.searchText = $stateParams.filters.searchText;
                }

                if ($stateParams.place === null) {
                    OpenDataService.getStructures($scope.selectedCategories, $scope.searchText).then(function (response) {

                        $scope.setMarkers(response);

                    });
                }
                else {
                    $scope.setMarkers([$stateParams.place]);
                }
            });

            $scope.setMarkers = function (structures) {

                var bound = new google.maps.LatLngBounds();

                angular.forEach(structures, function (item) {

                    if (item.Structure.geometry_type == "Point") {

                        var coordinates = JSON.parse(item.Structure.geometry_coordinates);
                        //var html_str = "<span style='font-size: 16px; font-weight:bold'>" + item.Structure.name + " <br>" + item.Structure.opendata_type + "</span>";

                        var title = "";
                        if (item.Structure.name && item.Structure.name !== "")
                            title = $filter('capitalize')(item.Structure.name);
                        else
                            title = $filter('capitalize')(item.Structure.opendata_type);

                        var address = "Lecce, Italia"
                        if (item.Structure.address)
                            address = item.Structure.address;

                        var properties = JSON.parse(item.Structure.properties);

                        var other_info = "";
                        if (properties.phone)
                            other_info += "<br><b>Tel.</b> " + properties.phone;
                        if (properties.website)
                            other_info += "<br><b>Sito web</b> " + properties.website;

                        var reviews = "";
                        if (item.Structure.accessibility_avg)
                            reviews += "<br><b>Accessibilità</b>: " + parseFloat(item.Structure.accessibility_avg).toFixed(2);
                        else
                            reviews += "<br><b>Accessibilità</b>: Nessuna recensione";

                        if (item.Structure.entry_stairs_avg)
                            reviews += "<br><b>Gradini di ingresso</b>: " + parseFloat(item.Structure.entry_stairs_avg).toFixed(2);

                        else
                            reviews += "<br><b>Gradini di ingresso</b>: Nessuna recensione";
                        if (item.Structure.bathroom_avg)
                            reviews += "<br><b>Bagno</b>: " + parseFloat(item.Structure.bathroom_avg).toFixed(2);
                        else
                            reviews += "<br><b>Bagno</b>: Nessuna recensione";


                        var content = '<div class="iw-subtitle">' + title + '</div>' +
                                '<p>' + address + other_info + reviews + '</p>';

                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(coordinates[1], coordinates[0]),
                            title: item.Structure.name,
                            html: content
                        });

                        bound.extend(new google.maps.LatLng(coordinates[1], coordinates[0]));

                        google.maps.event.addListener(marker, 'click', function () {
                            infoWindow.setContent(this.html);
                            infoWindow.open($scope.map, this);
                        });

                        if (structures.length === 1) {
                            infoWindow.setContent(marker.html);
                            infoWindow.open($scope.map, marker);
                        }

                    }

                    if (item.Structure.geometry_type == "Polygon") {

                        var title = "";
                        if (item.Structure.name && item.Structure.name !== "")
                            title = $filter('capitalize')(item.Structure.name);
                        else
                            title = $filter('capitalize')(item.Structure.opendata_type);

                        var address = "Lecce, Italia"
                        if (item.Structure.address)
                            address = item.Structure.address;

                        var properties = JSON.parse(item.Structure.properties);

                        var other_info = "";
                        if (properties.phone)
                            other_info += "<br><b>Tel.</b> " + properties.phone;
                        if (properties.website)
                            other_info += "<br><b>Sito web</b> " + properties.website;

                        var reviews = "";
                        if (item.Structure.accessibility_avg)
                            reviews += "<br><b>Accessibilità</b>: " + parseFloat(item.Structure.accessibility_avg).toFixed(2);
                        else
                            reviews += "<br><b>Accessibilità</b>: Nessuna recensione";

                        if (item.Structure.entry_stairs_avg)
                            reviews += "<br><b>Gradini di ingresso</b>: " + parseFloat(item.Structure.entry_stairs_avg).toFixed(2);

                        else
                            reviews += "<br><b>Gradini di ingresso</b>: Nessuna recensione";
                        if (item.Structure.bathroom_avg)
                            reviews += "<br><b>Bagno</b>: " + parseFloat(item.Structure.bathroom_avg).toFixed(2);
                        else
                            reviews += "<br><b>Bagno</b>: Nessuna recensione";


                        var content = '<div class="iw-subtitle">' + title + '</div>' +
                                '<p>' + address + other_info + reviews + '</p>';

                        var coordinates = JSON.parse(item.Structure.geometry_coordinates);
                        var coords = [];

                        angular.forEach(coordinates, function (element) {
                            bound.extend(new google.maps.LatLng(element[1], element[0]));
                            coords.push({lat: element[1], lng: element[0]});
                        });

                        // Construct the polygon.
                        var polygon = new google.maps.Polygon({
                            paths: coords,
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                            fillColor: '#FF0000',
                            fillOpacity: 0.35,
                            title: item.Structure.name,
                            html: content
                        });
                        polygon.setMap($scope.map);

                        google.maps.event.addListener(polygon, 'click', function (event) {
                            infoWindow.setContent(this.html);
                            infoWindow.setPosition(event.latLng);
                            infoWindow.open($scope.map, this);
                        });

                        if (structures.length === 1) {
                            infoWindow.setContent(polygon.html);
                            infoWindow.setPosition(bound.getCenter());
                            infoWindow.open($scope.map, polygon);
                        }

                    }
                });

                $scope.map.fitBounds(bound);
                console.log(bound);

            };
        })

        .controller('MyReviewsCtrl', function ($scope, ionicMaterialInk, OpenDataService, $timeout) {

            if (window.localStorage.getItem("USER_INFO") !== null) {

                $scope.reviews = [];
                $scope.loading = true;

                OpenDataService.getReviewsByUser($scope.loginData.id).then(function (response) {
                    $scope.reviews = response;
                    $scope.loading = false;
                });

            }

            $timeout(function () {
                ionicMaterialInk.displayEffect();
            }, 500);
        })

        .controller('ReviewsByLocationCtrl', function ($scope, ionicMaterialInk, $stateParams, $timeout, $filter) {

            if ($stateParams.reviews === null)
                $scope.goToView("home", null, true);
            else {
                $scope.reviews = $stateParams.reviews;
                $scope.structure = $stateParams.structure;
                $scope.title = "";

                if ($scope.reviews.length > 1)
                    $scope.title += $scope.reviews.length + " recensioni - ";
                else
                    $scope.title += $scope.reviews.length + " recensione - ";

                if (!$scope.structure.name)
                    $scope.title += $filter('capitalize')($scope.structure.opendata_type);
                else
                    $scope.title += $filter('capitalize')($scope.structure.name);

                $timeout(function () {
                    ionicMaterialInk.displayEffect();
                }, 500);
            }
        })

        .controller('FavoritesCtrl', function ($scope, ionicMaterialInk, OpenDataService, $timeout, FavoritesDB, $state) {

            if (window.localStorage.getItem("USER_INFO") !== null) {

                $scope.structures = [];
                $scope.loading = true;

                var ids = [];
                FavoritesDB.getAll().then(function (result) {
                    console.log(result);

                    if (result.length > 0) {

                        angular.forEach(result, function (item) {
                            ids.push(item.id_structure);
                        });

                        OpenDataService.getStructuresByIds(ids).then(function (response) {
                            $scope.structures = response;
                            $scope.loading = false;
                        });

                    }
                    else {
                        $scope.loading = false;
                    }

                    $timeout(function () {
                        ionicMaterialInk.displayEffect();
                    }, 500);

                });
            }

            $scope.openStructure = function (item) {
                $state.go("app.favorite", {structure: item});
            };
        })

        .controller('MyAccountCtrl', function ($scope, ionicMaterialInk, ionicMaterialMotion, $timeout) {

            if (window.localStorage.getItem("USER_INFO") == null) {
                //$scope.openModalLogin();
            }

            $timeout(function () {
                ionicMaterialInk.displayEffect();
            }, 500);

        })

        ;
