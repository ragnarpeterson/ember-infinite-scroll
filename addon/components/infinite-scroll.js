import Em from 'ember';

var $window = Em.$(window),
    $document = Em.$(document),
    bind = Em.run.bind;

var EPSILON = 150;

export default Em.Component.extend({
  action: 'fetchMore',
  epsilon: EPSILON,
  isFetching: false,
  hasMore: null,
  content: null,

  setup: function() {
    $window.on('scroll', bind(this, this.didScroll));
  }.on('didInsertElement'),

  teardown: function() {
    $window.off('scroll', bind(this, this.didScroll));
  }.on('willDestroyElement'),

  didScroll: function() {
    if (this.isNearBottom() && this.get('hasMore') && !this.get('isFetching')) {
      this.set('isFetching', true);
      this.sendAction('action', bind(this, this.handleFetch));
    }
  },

  handleFetch: function(promise) {
    var success = bind(this, this.fetchDidSucceed),
        failure = bind(this, this.fetchDidFail);

    promise.then(success, failure);
  },

  fetchDidSucceed: function(response) {
    var content = Em.get(response, 'content') || response;
    this.set('isFetching', false);
    this.get('content').pushObjects(content);
  },

  fetchDidFail: function() {
    this.set('isFetching', false);
  },

  isNearBottom: function() {
    var viewPortTop = $document.scrollTop(),
        bottomTop = ($document.height() - $window.height());

    return viewPortTop && (bottomTop - viewPortTop) < this.get('epsilon');
  }
});
