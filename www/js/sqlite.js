/**
 
 @author : InnovaPuglia SpA
 
 **/
angular.module('starter.sqlite', [])

        .factory('DBA', function ($cordovaSQLite, $q, $ionicPlatform) {

            var self = this;
            var tables = ['categories', 'favorites'];

            self.query = function (query, parameters) {
                parameters = parameters || [];
                var q = $q.defer();

                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, parameters)
                            .then(function (result) {
                                q.resolve(result);
                            }, function (error) {
                                console.warn('I found an error');
                                console.warn(error);
                                q.reject(error);
                            });
                });
                return q.promise;
            };

            self.getAll = function (result) {

                var output = [];

                for (var i = 0; i < result.rows.length; i++) {
                    output.push(result.rows.item(i));
                }
                return output;
            };

            self.getById = function (result) {
                var output = null;
                output = angular.copy(result.rows.item(0));
                return output;
            };

            self.destroy = function () {

                angular.forEach(tables, function (table) {
                    var query = 'DELETE FROM ' + table;
                    self.query(query);
                    //console.log('Table ' + table.name + ' deleted');
                });

            };

            return self;
        })

        .factory('CategoriesDB', function (DBA) {
            var self = this;

            self.getAll = function (id_area) {
                return DBA.query("SELECT * FROM categories")
                        .then(function (result) {
                            return DBA.getAll(result);
                        });
            };

            self.getById = function (id) {
                var parameters = [id];
                return DBA.query("SELECT * FROM categories WHERE id_category = (?)", parameters)
                        .then(function (result) {
                            return result.rows;
                        });
            };

            self.add = function (item) {
                var parameters = [item.id, item.name];
                return DBA.query("INSERT INTO categories (id_category, name) VALUES (?,?)", parameters);
            };

            self.remove = function (id) {
                var parameters = [id];
                return DBA.query("DELETE FROM categories WHERE id_category = (?)", parameters);
            };

            self.removeAll = function () {
                return DBA.query("DELETE FROM categories");
            };

            return self;
        })

        .factory('FavoritesDB', function (DBA) {
            var self = this;

            self.getAll = function () {
                return DBA.query("SELECT * FROM favorites")
                        .then(function (result) {
                            return DBA.getAll(result);
                        });
            };

            self.getById = function (id) {
                var parameters = [id];
                return DBA.query("SELECT * FROM favorites WHERE id_structure = (?)", parameters)
                        .then(function (result) {
                            return result.rows.length > 0;
                        });
            };

            self.add = function (item) {
                var parameters = [item.id, item.name, item.address, item.date];
                return DBA.query("INSERT INTO favorites (id_structure, name, address, date) VALUES (?,?,?,?)", parameters);
            };

            self.remove = function (id) {
                var parameters = [id];
                return DBA.query("DELETE FROM favorites WHERE id_structure = (?)", parameters);
            };

            self.removeAll = function () {
                return DBA.query("DELETE FROM categories");
            };

            return self;
        })

        ;