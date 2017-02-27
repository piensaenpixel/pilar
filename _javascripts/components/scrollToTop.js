var $ = require('jquery');
var $w = $(window);
var up = $('.js-up');
var existeScrollTop = up.length > 0;

function scrollHandler () {
  var offset = 300;
  var scrollTop = $w.scrollTop();
  up.toggleClass('is-show', scrollTop > offset);
}

function clickHandler (e) {
  var duration = 800;

  e.preventDefault();
  $('body,html').animate({
    scrollTop: 0
  }, duration);
}

module.exports = {
  init: function () {
    if (existeScrollTop) {
      $w.on('scroll', scrollHandler);
      up.on('click', clickHandler);
    }
  }
};
