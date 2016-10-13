angular.module('starter.services', [])

        .factory('OpenDataService', function ($http, $log, base64) {

            var BASE_URL = "http://178.239.178.40/sonoAutonomoServer/";

            return {
                login: function (username, password) {

                    var authToken = base64.encode(username + ":" + password);

                    return $http.post(BASE_URL + "RestUsers/login.json", null, {
                        headers: {
                            'Authorization': "Basic " + authToken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).then(function (response) {
                        $log.log("Login -> ", response);
                        window.localStorage.setItem("AUTH_TOKEN", authToken);
                        return response;
                    }, function (response) {
                        console.log("Connection error", response);
                        return response;
                    });
                },
                signup: function (data) {

                    return $http.post(BASE_URL + "RestUsers/signup.json", data).then(function (response) {
                        $log.log("SignUp -> ", response);
                        return response;
                    }, function (response) {
                        console.log("Connection error", response);
                        return response;
                    });
                },
                getStructures: function (categories_ids, searchText) {

                    if (categories_ids && categories_ids.length === 0)
                        categories_ids = null;

                    if (searchText === "")
                        searchText = null;

                    var data = {
                        'categories_ids': categories_ids,
                        'search': searchText
                    };

                    return $http.post(BASE_URL + "RestStructures/getAll.json", data).then(function (response) {
                        return response.data.result;
                    });
                },
                getStructuresList: function (index, categories_ids, searchText, current_position, order_by) {

                    if (categories_ids && categories_ids.length === 0)
                        categories_ids = null;

                    if (searchText === "")
                        searchText = null;

                    var data = {
                        'index': index,
                        'categories_ids': categories_ids,
                        'search': searchText,
                        'current_position': current_position,
                        'order_by': order_by
                    };
                    
                    console.log("sto effettuando la chiamata con i seguenti parametri ", data);

                    return $http.post(BASE_URL + "RestStructures/getList.json", data).then(function (response) {
                        return response.data.result;
                    });
                },
                getStructuresByIds: function (ids) {
                    
                    console.log("sto effettuando la chiamata con i seguenti parametri ", ids);
                    
                    var data = {
                        'structures_ids': ids
                    }

                    return $http.post(BASE_URL + "RestStructures/getListByIds.json", data).then(function (response) {
                        return response.data.result;
                    });
                },
                getCategories: function () {

                    return $http.post(BASE_URL + "RestCategories/getAll.json").then(function (response) {

                        $log.log("Categorie -> ", response.data);

                        return response.data.result;
                    });
                },
                getReviewsByUser: function (user_id) {

                    return $http.post(BASE_URL + "RestReviews/getByUser.json", {'user_id': user_id}, {
                        headers: {
                            'Authorization': "Basic " + window.localStorage.getItem("AUTH_TOKEN")
                        }
                    }).then(function (response) {

                        $log.log("getReviewsByUser -> ", response.data);

                        return response.data.result;
                    });
                },
                getReviewsByStructure: function (structure_id) {

                    return $http.post(BASE_URL + "RestCategories/getByStructure.json", {'structure_id': structure_id}, {
                        headers: {
                            'Authorization': "Basic " + window.localStorage.getItem("AUTH_TOKEN")
                        }
                    }).then(function (response) {

                        $log.log("getReviewsByStructure -> ", response.data);

                        return response.data.result;
                    });
                },
                setReview: function (review) {

                    return $http.post(BASE_URL + "RestReviews/save.json", review, {
                        headers: {
                            'Authorization': "Basic " + window.localStorage.getItem("AUTH_TOKEN")
                        }
                    }).then(function (response) {

                        $log.log("SAVE RESPONSE -> ", response.data);

                        return response.data.result;
                    });
                }
            };
        });
