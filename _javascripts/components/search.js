var $ = require('jquery');
var _ = require('underscore');

var Query = require('./query');
var utils = require('./utils');

var query = new Query();
var baseurl = window.baseurl;
var lang = window.lang;

var filteredData;

function getJsonURL () {
  if (lang === 'es') {
    return baseurl + '/pages.json';
  } else {
    return baseurl + '/' + lang + '/pages.json';
  }
}

function filterData (data) {
  return _.filter(data, function (dato) {
    return dato.url.substr(-1, 1) === '/';
  });
}

function extracto (query, result) {
  var regexp = utils.createSearchTermRegExp(query);
  var pos = regexp.exec(result.content);
  pos = pos ? pos.index : 0;
  var pre = (pos > 20) ? '&#8230 ' : '';
  pos = Math.max(0, pos - 20);
  var extract = result.content.substring(pos, pos + 50);
  extract = extract.replace(regexp, function (match) { return '<strong>' + match + '</strong>'; });
  return '<div>' + pre + extract + pre + '</div>';
}

function clearSearchResults () {
  var $results = $('.js-search-results');
  $results.empty();
}

function showResults (data, query) {
  var regexp = utils.createSearchTermRegExp(query);
  var $results = $('.js-search-results');
  var node;

  var hits = data.map(function (item) {
    var headingHits = (item.title.match(regexp) || []).length;
    item.score = (item.content.match(regexp) || []).length; // content match
    item.score += 5 * headingHits;  // h2 match
    return item;
  }).sort(function (a, b) {
    if (a.score > b.score) {
      return -1;
    } else if (a.score < b.score) {
      return 1;
    }
    return 0;
  }).filter(function (result) {
    return result.score !== 0;
  });

  if (hits.length > 0) {
    _.each(hits, function (result) {
      var hint = extracto(query, result);

      if (lang === 'es') {
        node = '<li><a href="' + result.url + '?s=' + query + '">' + result.title + '</a>' + hint + '</li>';
      } else {
        node = '<li><a href="' + lang + result.url + '?s=' + query + '">' + result.title + '</a>' + hint + '</li>';
      }
      $results.append(node);
    });
  } else {
    if (lang === 'es') {
      node = '<div class"no-results">No se han encontrado resultados</div>';
    } else {
      node = '<div class"no-results">Sorry, no results found</div>';
    }
    $results.append(node);
  }
}

function search (e) {
  var searchQuery = $('.search-box').val().trim();
  query.set(searchQuery);
  clearSearchResults();

  if (searchQuery.length >= 3) {
    if (filteredData == null) {
      query
        .getJSON(getJsonURL())
        .done(function (data) {
          filteredData = filterData(data);
          showResults(filteredData, query.get());
        });
    } else {
      showResults(filteredData, query.get());
    }
  }
}

module.exports = {
  init: function () {
    $('.js-search').on('keyup', search);
  }
};
