# ember-infinite-scroll

Infinite scroll for your Ember app.

## Installation

* `npm install --save ember-infinite-scroll`

## Usage

In your template:

```hbs
{{#infinite-scroll content=model hasMore=hasMore}}
  <span>Loading...</span>
{{/infinite-scroll}}
```

Whatever is provided in the component block will only show up when more content is being fetched.

In the actions hash of your route/controller/component:

```javascript
fetchMore: function(callback) {
  var promise = this.fetchMoreItems();
  callback(promise);
}
```

In order for everything to work correctly, it is critical that the callback function is passed the newly created promise that will resolve with the additional items.
