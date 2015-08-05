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
  scrollable: null,
  $scrollable: null,

  setup: function() {
    var scrollable = this.get('scrollable'),
        $scrollable = scrollable ? Em.$(scrollable) : $window;

    this.set('$scrollable', $scrollable);
    $scrollable.on('scroll.' + this.elementId, bind(this, this.didScroll));

    if (this.isInView()) {
      this.startFetching();
    }
  }.on('didInsertElement'),

  teardown: function() {
    this.get('$scrollable').off('scroll.' + this.elementId);
  }.on('willDestroyElement'),

  didScroll: function() {
    if (this.isInView() || this.isNearBottom()) {
      this.startFetching();
    }
  },

  startFetching: function() {
    if (!this.get('isFetching') && this.get('hasMore')) {
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

  contentPushed: Em.observer('content.length', function() {
    Em.run.scheduleOnce('afterRender', this, function() {
      if (this.isInView()) {
        this.startFetching();
      }
    });
  }),

  isInView: function() {
    var selfOffset = this.$().offset().top;
    var $scrollable = this.get("$scrollable");
    var scrollableBottom = $scrollable.height() + $scrollable.scrollTop();

    var inView = selfOffset < scrollableBottom;

    return inView;
  },

  isNearBottom: function() {
    var $scrollable = this.get('$scrollable'),
        viewPortTop, bottomTop;

    if ($scrollable === $window) {
      viewPortTop = $document.scrollTop(),
      bottomTop = $document.height() - $window.height();
    } else {
      viewPortTop = $scrollable.scrollTop(),
      bottomTop = $scrollable[0].scrollHeight - $scrollable.innerHeight();
    }

    return viewPortTop && (bottomTop - viewPortTop) < this.get('epsilon');
  },

  safeSet: function(key, value) {
    if (!this.isDestroyed && !this.isDestroying) { this.set(key, value); }
  }
});
