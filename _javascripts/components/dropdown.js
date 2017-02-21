var $ = require('jquery');
var _t = require('./template');

var state = {
  open: false
};

var TEMPLATE = '<li class="content-dropdownitem"><a href="#{{id}}">{{title}}</a></li>';

var openHandler = function (e) {
  if (state.open === false) {
    e.preventDefault();

    state.open = true;
    $('.content-dropdown').toggleClass('is-open');
  }
};

var closeHandler = function (e) {
  e.stopPropagation();
  state.open = !state.open;
  $('.content-dropdown').toggleClass('is-open', state.open);
};

var generatePermalinks = function () {
  $('h2').each(function (i, el) {
    var $el;
    var id;
    var title;

    $el = $(el);
    id = $el.attr('id');
    title = $el.text();
    generateDropdownOption(id, title);
  });
};

var generateDropdownOption = function (id, title) {
  var $el = $('.js-dropdown-content');
  var node = _t(TEMPLATE, {
    id: id,
    title: title
  });

  $el.append($(node));
};

var goTo = function (e) {
  var offset = $('.fix-header').outerHeight();
  var el = $(this);
  var id = el.attr('href');
  var target = $(id);
  var pos = target.get(0).getBoundingClientRect();

  $(window).scrollTo({top: pos.top - offset, left: 0}, 800);
};

module.exports = {
  init: function () {
    generatePermalinks();
    $('.js-dropdown').on('click', openHandler);
    $('.js-dropdown-chevron').on('click', closeHandler);
    $('.js-dropdown-content').on('click', 'a', goTo);
  }
};
