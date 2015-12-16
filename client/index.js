// '7c6e059ab0d1c94' for production, 'bf2367d089429e4' for local development
var clientId = '7c6e059ab0d1c94';
var errorUrl = 'https://api.imgur.com/oauth2/authorize?client_id=' + clientId + '&response_type=code';

var app = angular.module('imgurApp', [])

.factory('Imgur', function($http) {
  var getSearch = function(query) {
    return $http({
      method: 'GET',
      url: '/api/search',
      params: {queryStr: query}
    })
    .success(function(resp) {
      return resp;
    })
    .error(function(error) {
      return error;
    });
  };

  return {
    getSearch: getSearch
  };
})

.controller('ImgurController', function($scope, $http, Imgur) {
  $scope.query;
  $scope.results;
  $scope.custom = false;
  $scope.loading = false;
  $scope.quantity = 10;
  $scope.moreResults = true;

  $scope.searchButton = function(query) {
    $scope.custom = false;
    $scope.loading = true;
    $scope.results = [];
    Imgur.getSearch(query)
    .success(function(results) {
      $scope.loading = false;
      $scope.results = Array.prototype.slice.call(results.data);
    })
    .error(function(error) {
      // if error, redirect to imgur authorization page
      window.location.href = errorUrl;
    });
  };

  $scope.searchCustom = function() {
    $scope.results = [];
    $scope.loading = true;
    Imgur.getSearch($scope.query)
    .success(function(results) {
      $scope.loading = false;
      $scope.results = Array.prototype.slice.call(results.data);
    })
    .error(function(error) {
      // if error, redirect to imgur authorization page
      window.location.href = errorUrl;
    });
  };

  $scope.toggleCustom = function() {
    $scope.custom = !$scope.custom;
  };

  $scope.showMore = function() {
    if ($scope.quantity <= $scope.results.length) {
      $scope.quantity += 10;
    }
    // hide button if limit is higher than total number of results
    if ($scope.quantity >= $scope.results.length) {
      $scope.moreResults = false;
    }
  };
});
