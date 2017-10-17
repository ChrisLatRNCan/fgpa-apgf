const templateUrl = require('./ui.html');

/**
 * @module avUi
 * @memberof app.ui
 * @restrict E
 * @description
 *
 * The `avUi`
 *
 */
angular
    .module('app.ui')
    .directive('avUi', avUi);

/**
 * `avUi` directive body.
 *
 * @function avUi
 * @return {object} directive body
 */
function avUi() {
    const directive = {
        restrict: 'E',
        templateUrl,
        scope: { },
        controller: Controller,
        controllerAs: 'self',
        bindToController: true
    };

    return directive;
}

function Controller($scope, $translate, modelManager, debounceService, constants, events, $timeout) {
    'ngInject';
    const self = this;

    self.modelName = 'ui';
    self.buttonClick = validate;

    // when schema is loaded, initialize the form
    events.$on(events.avSchemaUpdate, (evt, schema) => { if (schema === self.modelName) init(); });

    // when user create a new config, reset the form
    events.$on(events.avNewModel, () => resetModel());

    // when user load a config file, set model
    events.$on(events.avLoadModel, () => updateModel());

    // when user change language
    events.$on(events.avSwitchLanguage, () => {
        $scope.schema = modelManager.getSchema(self.modelName);
        $scope.form = setForm();

        $scope.$broadcast('schemaFormRedraw');
    });

    function init() {
        $scope.model = modelManager.getModel(self.modelName);
        $scope.schema = modelManager.getSchema(self.modelName);

        $scope.form = setForm();
    }

    function setForm() {
        return [
            {
                "key": "fullscreen",
                "onChange": debounceService.registerDebounce(validate, constants.debSummary, false)
            }, {
                "key": "theme",
                "onChange": debounceService.registerDebounce(validate, constants.debSummary, false)
            }, {
                "key": "logoUrl",
                "onChange": debounceService.registerDebounce(validate, constants.debSummary, false)
            }, {
                "type": "actions",
                "items": [
                    { "type": 'button', "style": 'btn-info', "title": $translate.instant('button.validate'), "onClick": validateForm }
                ]
            }
        ];
    }

    function validateForm(form, model) {
        // First we broadcast an event so all fields validate themselves
        $scope.$broadcast('schemaFormValidate');
        modelManager.validateModel(self.modelName, $scope.activeForm);

        // Then we check if the form is valid
        if ($scope.activeForm.$valid) {
            console.log("form is ", $scope.form);
            console.log("model is ", $scope.model);
        }
    }

    function validate(form, model) {
        const key = model.key[0];
        modelManager.setValidity(self.modelName, key, $scope.activeForm[`activeForm-${key}`].$valid);
    }

    function resetModel() {
        $scope.$broadcast('schemaFormRedraw');
        $scope.model = modelManager.resetModel(self.modelName);
        modelManager.resetValidity(self.modelName);
    }

    function updateModel() {
        $scope.model = modelManager.getModel(self.modelName, false);
        $scope.$broadcast('schemaFormValidate');
        $timeout(() => { modelManager.validateModel(self.modelName, $scope.activeForm); }, 2000);
    }
}
