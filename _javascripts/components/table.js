var $ = require('jquery');

var switched = false;

function splitTable (original) {
  original.wrap("<div class='table-wrapper' />");

  var copy = original.clone();
  copy.find('td:not(:first-child), th:not(:first-child)').css('display', 'none');
  copy.removeClass('responsive');

  original.closest('.table-wrapper').append(copy);
  copy.wrap('<div class="pinned" />');
  original.wrap('<div class="scrollable" />');

  setCellHeights(original, copy);
}

function unsplitTable (original) {
  original.closest('.table-wrapper').find('.pinned').remove();
  original.find('tr:first td, tr:first th').css('display', 'none');
  original.unwrap();
}

function setCellHeights (original, copy) {
  var tr = original.find('tr');
  var tr_copy = copy.find('tr');
  var heights = [];

  tr.each(function (index) {
    var self = $(this);
    var tx = self.find('th, td');

    tx.each(function () {
      var height = $(this).outerHeight(true);
      heights[index] = heights[index] || 0;
      if (height > heights[index]) heights[index] = height;
    });
  });

  tr_copy.each(function (index) {
    $(this).height(heights[index]);
  });
}

function updateTables () {
  var w = $(window).width();
  var tables = $('table');
  if ((w < 750) && !switched) {
    switched = true;
    tables.each(function (i, element) {
      splitTable($(element));
    });
    return true;
  } else if (switched && (w >= 750)) {
    switched = false;
    tables.each(function (i, element) {
      unsplitTable($(element));
    });
  }
}

module.exports = {
  init: function () {
    $('table').tableHover({colClass: 'hover', ignoreCols: [1]});
    updateTables();

    $(window).on('redraw', function () {
      switched = false;
      updateTables();
    });

    $(window).on('resize', updateTables);

    $('table.pagination tbody').paginathing({
      perPage: 5,
      insertAfter: 'table.pagination'
    });
  }
};
