basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
    '../app/components/angular/angular.js',
    '../app/components/angular-mocks/angular-mocks.js',
    '../app/components/ngInfiniteScroll/ng-infinite-scroll.js',
    '../app/components/d3/d3.min.js',
    '../app/components/nvd3/nv.d3.min.js',
    '../app/components/angularjs-nvd3-directives/dist/*.js',

    '../app/**/modules/**/init.js',
    '../app/**/constants.js',
    '../app/**/modules/**/*.js',
    '../app/**/modules/**/constants.js',
    '../app/trends/**/*.js',

    'unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

reporters = ['dots', 'junit'];

junitReporter = {
  outputFile: 'output/unit.xml',
  suite: 'unit'
};
