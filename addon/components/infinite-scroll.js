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
  scrollElement: null, // Defaults to '$window'
  debounce: null, // Defaults to false

  setup: function() {
    /** Setup some default selectors */
    this.safeSet( '$scrollElement', $window );
    this.safeSet( 'scrollEvent', 'scroll.' + this.elementId );
    /** Override these if we're not using default selectors */
    if( typeof this.get( 'scrollElement' ) == 'string' ){
      this.safeSet( '$scrollElement', Em.$(this.scrollElement + ':first') );
      this.safeSet( 'scrollEvent', 'scroll' );
    }
    /** Setup default debouncing if we need it */
    if( typeof this.get( 'debounce' ) != 'boolean' && typeof this.get( 'debounce' ) != 'number' ){
      this.safeSet( 'debounce', false );
    }
    /** Listen for the scroll event on our element */
    this.get( '$scrollElement' ).on(this.get( 'scrollEvent' ), bind(this, this.didScroll));
  }.on('didInsertElement'),

  teardown: function() {
    /** Monitoring scrolling */
    this.get( '$scrollElement' ).off(this.get( 'scrollEvent' ));
    /** If we have a timeout, clear it */
    if( typeof this.get( 'timeout' ) != 'undefined' ){
      clearTimeout( this.get( 'timeout' ) );
    }
  }.on('willDestroyElement'),

  didScroll: function() {
    if( !this.get( 'debounce' ) ){
      /** If we aren't debouncing, handle this directly */
      this.handleScroll.apply( this );
    }else{
      /** So we need to debounce, use set/clear timeout methods */
      if( typeof this.get( 'timeout' ) != 'undefined' ){
        clearTimeout( this.get( 'timeout' ) );
      }
      /** Ok, so now set the timeout for the 'handleScroll' event */
      var timer = typeof this.get( 'debounce' ) == 'number' ? this.get( 'debounce' ) : 250;
      /** Now actually do it, binding to 'this' object */
      this.safeSet( 'timeout', setTimeout( this.handleScroll.bind( this ), timer ) );
    }
  },

  handleScroll: function(){
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
    if( this.$scrollElement == $window ){
      /** Keep our legacy functionality if we're listening to the window scroll event */
      var viewPortTop = $document.scrollTop(),
          bottomTop = ($document.height() - $window.height());
      return viewPortTop && (bottomTop - viewPortTop) < this.get('epsilon');
    } else{
      /**
       * We're going to use the scroll element to calculate the height, if we're not using the default functionality
       * from: http://stackoverflow.com/questions/6271237/detecting-when-user-scrolls-to-bottom-of-div-with-jquery
       * retreived: 20150205
       */
      return this.get( '$scrollElement' ).scrollTop() + this.get( '$scrollElement' ).innerHeight() >= this.get( '$scrollElement' )[0].scrollHeight - this.get('epsilon');
    }
  },

  safeSet: function(key, value) {
    if (!this.isDestroyed && !this.isDestroying) { this.set(key, value); }
  }
});
