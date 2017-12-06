const templateUrl = require('../form.html');

/**
 * @module avUi
 * @memberof app.ui
 * @restrict E
 * @description
 *
 * The `avUi` directive for the ui form
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
        bindToController: true,
        link: (scope, element, attrs) => {
            scope.$on('sf-render-finished', (scope, element) => {
            });
        }
    };

    return directive;
}

function Controller($scope, $translate, events, modelManager, formService) {
    'ngInject';
    const self = this;
    self.modelName = 'ui';
    self.sectionName = $translate.instant('app.section.ui');
    self.formService = formService;

    // when schema is loaded or create new config is hit, initialize the schema, form and model
    events.$on(events.avSchemaUpdate, () => {
        $scope.model = modelManager.getModel(self.modelName);
        init();
    });

    // when user load a config file, set form and model
    events.$on(events.avLoadModel, () => {
        modelManager.updateModel($scope, self.modelName);
        init();
    });

    // when user change language, reset schema and form
    events.$on(events.avSwitchLanguage, () => {
        self.sectionName = $translate.instant('app.section.ui');
        init();
    });

    function init() {
        $scope.schema = modelManager.getSchema(self.modelName);

        $scope.form = angular.copy($scope.form);
        $scope.form = setForm();
    }

    events.$on(events.avValidateForm, () => {
        $scope.$broadcast('schemaFormValidate');
        modelManager.validateModel(self.modelName, $scope.activeForm, $scope);
    });

    // FIXME: when we use condition, the item is remove from the model. When the item come back it looses all the
    // previously set info. We need a way to persist this info.
    function checkMenu(model, form) {
        self.showHelp = false;
        self.showAbout = false;
        model.forEach(item => {
            if (item.includes('help')) {
                self.showHelp = true;

                // reset value to default beacuse when we remove about from the array aboutChoice is emptied
                $scope.model.help = { 'folderName': 'default' };
            }
            if (item.includes('about')) {
                self.showAbout = true;

                // reset value to default beacuse when we remove about from the array aboutChoice is emptied
                $scope.model.aboutChoice = 'string';
            }
        })
    }

    function isHelp() {
        return self.showHelp;
    }

    function isAbout() {
        return self.showAbout;
    }

    function isAboutString() {
        return self.showAbout && $scope.model.aboutChoice === 'string';
    }

    function isAboutFolder() {
        return self.showAbout && $scope.model.aboutChoice === 'folder';
    }

    function setForm() {
        return [
            { 'type': 'tabs', 'tabs': [
                { 'title': $translate.instant('form.ui.general'), 'items': [
                    { 'key': 'fullscreen' },
                    { 'key': 'theme' },
                    { 'key': 'failureFeedback', 'htmlClass': 'av-form-advance hidden' },
                    {
                        'type': 'fieldset', 'title': 'Legend', 'items': [
                            { 'key': 'legend.reorderable' },
                            { 'key': 'legend.allowImport' }
                        ]
                    },
                    {
                        'type': 'fieldset', 'title': 'What is Open by Default', 'items': [
                            { 'key': 'legend.isOpen' },
                            { 'key': 'tableIsOpen' }
                        ]
                    }
                ] },
                { 'title': $translate.instant('form.ui.appbar'), 'items': [
                    { 'key': 'appBar', 'notitle': true }
                ] },
                { 'title': $translate.instant('form.ui.navbar'), 'items': [
                    { 'key': 'navBar', 'notitle': true },
                    { 'key': 'restrictNavigation' }
                ] },
                { 'title': $translate.instant('form.ui.sidemenu'), 'items': [
                    { 'key': 'sideMenu.logo' },
                    { 'key': 'logoUrl', 'condition': 'model.sideMenu.logo' },
                    { 'key': 'title' },
                    { 'key': 'sideMenu.items', 'add': $translate.instant('button.add'), 'onChange': checkMenu },
                    { 'key': 'help', 'condition': isHelp },
                    { 'type': 'fieldset', 'title': $translate.instant('form.ui.about'), 'condition': isAbout,'items': [
                        {   'key': 'aboutChoice',
                            'type': 'select',
                            'titleMap': [
                                { 'value': "string", 'name': $translate.instant('form.ui.aboutstring') },
                                { 'value': "folder", 'name': $translate.instant('form.ui.aboutfile') }
                            ]
                        },
                        { 'key': 'about.content', 'condition': isAboutString },
                        { 'key': 'about.folderName', 'condition': isAboutFolder }
                    ]}
                ] }
            ] }
        ];
    }
}
