(function (angular) {
	var app = angular.module('app', ['ngLocale', 'ngRoute']);

	app.value('breeze', window.breeze)
	.value('Q', window.Q);

	breeze.config.initializeAdapterInstance("dataService", "mongo", true);

	app.config([
  	'$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/',
      {
        templateUrl: 'people.html',
        controller: 'PeopleCtrl'
      });
	}]);

	app.controller('PeopleCtrl', function($scope) {

		var dataService = new breeze.DataService({serviceName: 'breeze'}),
			manager = new breeze.EntityManager({dataService: dataService, metadataStore: createMetadataStore(dataService)});

		breeze.EntityQuery
			.from('Persons')
			//.where('name', 'startsWith', 'D')
			.using(manager)
			.execute()
			.then(function(data) {
				$scope.people = data.results;
				$scope.$digest();
			})
			.fail(function(error) {
			});

		$scope.people = [];

		$scope.save = function () {
		  manager
			  .saveChanges()
			  .then(function () {
			  	console.log("saved changes")
			  })
			  .fail(function(error) {
			  	console.log(error);
			  });
		};

		$scope.add = function() {
			var newPerson = manager.createEntity("Person");
			$scope.people.push(newPerson);
		};

	});

	function createMetadataStore(dataService) {
		var store = new breeze.MetadataStore(),
			keyGen = breeze.AutoGeneratedKeyType.Identity,
			namespace = '',
			helper = new breeze.config.MetadataHelper(namespace, keyGen),
			addType = function(type) {
				helper.addTypeToStore(store, type);
			};

		addType({
			name: 'Person',
			dataProperties: {
				_id: {type: breeze.DataType.MongoObjectId, isPartOfKey: true},
				name: {max: 50},
				age: {type: breeze.DataType.Int32},
				status: {max: 50}
			}
		});
		store.addDataService(dataService);
		return store;
	}
})(angular);