var db = null;
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.sqlite', 'starter.utils', 'ngCordova', 'ionic-material', 'ionMdInput', 'ngMdIcons', 'ab-base64'])

        .run(function ($ionicPlatform, $cordovaSQLite, $ionicPopup) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }

                if (db == null) {
                    if ($ionicPlatform.is("ios")) {
                        db = window.sqlitePlugin.openDatabase({name: "sono_autonomo.db", createFromLocation: 1});
                    } else /*if ($ionicPlatform.is("android"))*/ {
                        db = window.openDatabase("sono_autonomo.db", "", "SonoAutonomo", -1);
                    }
                }
                console.log("DB version -> " + db.version);

                // INIT SQLITE
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS categories (id_category text, name text)");
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS favorites (id_structure text, name text, address text, date text)");

            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

            // Turn off caching for demo simplicity's sake
            //$ionicConfigProvider.views.maxCache(0);

            $ionicConfigProvider.navBar.alignTitle('center');
            $ionicConfigProvider.tabs.position('bottom');

            $httpProvider.interceptors.push(function ($q) {

                return {
                    'responseError': function (rejection) {

                        var defer = $q.defer();

                        if (rejection.status == 401) {
                            console.dir("UNAUTHORIZED",rejection);
                        }

                        defer.reject(rejection);

                        return defer.promise;

                    }
                };
            });

            /*
             // Turn off back button text
             $ionicConfigProvider.backButton.previousTitleText(false);
             */

            $stateProvider.state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'AppCtrl'
            })

                    .state('app.home', {
                        url: '/home',
                        views: {
                            'tab-home': {
                                templateUrl: 'templates/home.html',
                                controller: 'HomeCtrl'
                            }
                        }
                    })

                    .state('app.structures-list', {
                        url: '/structures-list',
                        params: {title: null, selected_categories: null, search_text: null, order_by: null},
                        views: {
                            'tab-home': {
                                templateUrl: 'templates/structures-list.html',
                                controller: 'StructuresListCtrl'
                            }
                        }
                    })

                    .state('app.structure', {
                        url: '/structure',
                        //cache: false,
                        params: {structure: null},
                        views: {
                            'tab-home': {
                                templateUrl: 'templates/structure.html',
                                controller: 'StructureCtrl'
                            }
                        }
                    })

                    .state('app.reviews-by-location', {
                        url: '/reviews-by-location',
                        //cache: false,
                        params: {reviews: null, structure: null},
                        views: {
                            'tab-home': {
                                templateUrl: 'templates/reviews-by-location.html',
                                controller: 'ReviewsByLocationCtrl'
                            }
                        }
                    })

                    .state('app.map', {
                        url: '/map',
                        //cache: false,
                        params: {filters: null, place: null},
                        views: {
                            'tab-home': {
                                templateUrl: 'templates/map.html',
                                controller: 'MapCtrl'
                            }
                        }
                    })

                    .state('app.my-reviews', {
                        url: '/my-reviews',
                        cache: false,
                        views: {
                            'tab-my-reviews': {
                                templateUrl: 'templates/my-reviews.html',
                                controller: 'MyReviewsCtrl'
                            }
                        }
                    })

                    .state('app.favorites', {
                        url: '/favorites',
                        cache: false,
                        views: {
                            'tab-favorites': {
                                templateUrl: 'templates/favorites-list.html',
                                controller: 'FavoritesCtrl'
                            }
                        }
                    })

                    .state('app.favorite', {
                        url: '/favorite',
                        //cache: false,
                        params: {structure: null},
                        views: {
                            'tab-favorites': {
                                templateUrl: 'templates/structure.html',
                                controller: 'StructureCtrl'
                            }
                        }
                    })

                    .state('app.my-account', {
                        url: '/my-account',
                        cache: false,
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account.html',
                                controller: 'MyAccountCtrl'
                            }
                        }
                    })


                    ;

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/home');
        })

        .filter('capitalize', function () {
            return function (input) {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            };
        })

        .filter('getByKey', function () {
            return function (input, key, value) {
                if (input !== null || input !== undefined) {
                    var i = 0, len = input.length;
                    for (; i < len; i++) {
                        if (input[i][key] === value) {
                            return input[i];
                        }
                    }
                }
                return null;
            };
        })

        .directive("comparePassword", function () {
            return {
                require: 'ngModel',
                scope: {
                    reference: '=comparePassword'

                },
                link: function (scope, elm, attrs, ctrl) {
                    ctrl.$parsers.unshift(function (viewValue, $scope) {

                        var noMatch = viewValue != scope.reference
                        ctrl.$setValidity('noMatch', !noMatch);
                        return (noMatch) ? noMatch : !noMatch;
                    });

                    scope.$watch("reference", function (value) {
                        ;
                        ctrl.$setValidity('noMatch', value === ctrl.$viewValue);

                    });
                }
            };
        })

        ;
