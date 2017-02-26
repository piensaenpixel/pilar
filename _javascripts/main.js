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
  // This causes scroll memory WTF, need to investigate
  // require('./components/scroll-observer').init();

  require('./components/scrollToTop').init();

  var highlight = require('./components/highlight');
  highlight();
});
