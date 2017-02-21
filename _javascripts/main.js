var $ = require('jquery');
window.jQuery = $;
require('jquery.scrollto');
require('./vendor/paginathing');

$(function () {
  require('./vendor/jquery.tablehover')($);
  require('./components/dropdown').init();
  require('./components/table').init();
  require('./components/search').init();
  require('./components/header').init();
  require('./components/scroll-observer').init();

  var highlight = require('./components/highlight');
  highlight();
});
