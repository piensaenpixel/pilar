var scrollMonitor = require('scrollMonitor');
var $ = require('jquery');

var Observer = function () {
  this.nodes = $('[data-monitor]');
  this.init();
};

Observer.prototype = {
  init: function () {
    var self = this;
    this.nodes.each(function () {
      self.createWatcher(this);
    });
  },

  scrollHandler: function () {
    var el = $(this.watchItem);
    var inClass = el.data('monitor');
    if (this.isInViewport) {
      el.addClass(inClass);
    }
  },

  createWatcher: function (element) {
    var watcher = scrollMonitor.create(element);
    var scrollHandler = this.scrollHandler;
    watcher.stateChange(scrollHandler);
    scrollHandler.call(watcher);
  }
};

module.exports = {
  init: function () {
    return new Observer();
  }
};
