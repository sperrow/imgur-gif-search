var app = angular.module('remixApp', [])

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
  $scope.quantity = 10;
  $scope.moreResults = true;

  $scope.search = function() {
    Imgur.getSearch($scope.query)
    .success(function(results) {
      $scope.results = Array.prototype.slice.call(results.data);
    })
    .error(function(error) {
      // if error, redirect to imgur authorization page
      window.location.href = 'https://api.imgur.com/oauth2/authorize?client_id=9a064529bee0987&response_type=code';
    });
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
