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
    $window.on('scroll.' + this.elementId, bind(this, this.didScroll));
  }.on('didInsertElement'),

  teardown: function() {
    $window.off('scroll.' + this.elementId);
  }.on('willDestroyElement'),

  didScroll: function() {
    if (!this.get('isFetching') && this.get('hasMore') && this.isNearBottom()) {
      this.safeSet('isFetching', true);
      this.sendAction('action', bind(this, this.handleFetch));
    }
  },

  handleFetch: function(promise) {
    var success = bind(this, this.fetchDidSucceed),
        failure = bind(this, this.fetchDidFail);

    promise.then(success, failure);
  },

  fetchDidSucceed: function(response) {
    var content = this.get('content'),
        newContent = Em.getWithDefault(response, 'content', response);

    this.safeSet('isFetching', false);
    if (content) { content.pushObjects(newContent); }
  },

  fetchDidFail: function() {
    this.safeSet('isFetching', false);
  },

  isNearBottom: function() {
    var viewPortTop = $document.scrollTop(),
        bottomTop = ($document.height() - $window.height());

    return viewPortTop && (bottomTop - viewPortTop) < this.get('epsilon');
  },

  safeSet: function(key, value) {
    if (!this.isDestroyed && !this.isDestroying) { this.set(key, value); }
  }
});
