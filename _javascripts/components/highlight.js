var utils = require('./utils');
var $ = require('jquery');
var _ = require('underscore');

var query = function () {
  var location = window.location;
  if (!location.search) {
    return '';
  } else {
    var params = location.search.substring(1).split('&');
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split('=');
      if (param[0] === 's' && (param.length === 2)) {
        return decodeURIComponent(param[1]);
      }
    }
  }
};

module.exports = function () {
  var location = window.location;

  if (location.search) {
    var searchword = query();
    if (searchword) {
      var re = utils.createSearchTermRegExp(searchword);
      $('.container *').contents().each(function () {
        if (this.nodeType !== 3) {
          return;
        }

        var text = this.nodeValue ? this.nodeValue : this.textContent;
        if (!text) {
          return;
        }

        var matches = text.match(re);
        if (!matches) {
          return;
        }

        if ($(this).parent().is('span.highlight')) {
          return;
        }

        matches = _.uniq(matches);
        for (var i = matches.length - 1; i >= 0; --i) {
          var match = matches[i];
          var pieces = text.split(match);

          for (var t = pieces.length - 1; t >= 0; --t) {
            var piece = pieces[t];
            if (t < pieces.length - 1) {
              var newNode = document.createElement('SPAN');
              newNode.innerHTML = match;
              newNode.className = 'highlight';
              this.parentNode.insertBefore(newNode, this.nextSibling);
            }
            this.parentNode.insertBefore(document.createTextNode(piece), this.nextSibling);
          }

          this.parentNode.removeChild(this);
          return;
        }
      });
    }
  }
};
