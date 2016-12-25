'use strict';

var Materialize = module.exports = {
  inject: function() {
    window.jQuery = require('./node_modules/jquery/dist/jquery.min.js');
    window.$ = window.jQuery;
    require('hammerjs');
    require('./bin/materialize.js');
  }
}
