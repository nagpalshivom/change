RootAccess.controller('RootAccessController', [ '$scope', '$http',  function($scope, $http){
    $scope.accessPortColor = "accessPortManipulator_red";
    $scope.isAccessPortOpen = false;
    $scope.GrantRootAccess = function() {
        $http({
            method : 'POST',
            url : 'http://localhost:9123/hfusppu',
            withCredential : true,
            data : {
                'user' : $scope.rootAccess_adminCredName,
                'key' : $scope.rootAccess_adminCredKey
            }
        }).
        success(function(data) {
            console.log("successfully sent POST request with data : " + data + " to get root access");
        }).
        error(function(err) {
            console.log("error :" + err + " in sending POST request to get root access");
        });
    };
    $scope.ManipulateAccessPort = function() {
        if($scope.accessPortColor == "accessPortManipulator_red") {
            $scope.accessPortColor = "accessPortManipulator_green";
            $scope.isAccessPortOpen = true;
            console.log("accessPortManipulator : red => green");
        } else {
            $scope.accessPortColor = "accessPortManipulator_red";
            $scope.isAccessPortOpen = false;
            console.log("accessPortManipulator : green => red");
        }
    };
}]);