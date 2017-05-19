// Here we call resl and tell it to start preloading resources
require('resl')({
  // A call to resl takes a JSON object as configuration.

  // The configuration object must contain a manifest field which specifies
  // a list of all resources to load and their types.
  manifest: {
    // Each entry in the manifest represents an asset to be loaded
    'scores': {
      type: 'text',           // the type declares the type of the asset
      src: 'data/scores.csv'  // and src declares the URL of the asset
    },

    // You can also specify HTML elements as assets
    'an_image': {
      type: 'image',
      src: 'images/some-image.png'
    },

    // Assets can also be streamed as well
    'some_video': {
      type: 'video',
      stream: true,   // setting the streaming flag specifies that
                      // the done() callback will fire as soon as the
                      // asset has started loading
      src: 'videos/some-video.mp4'
    },

    // You can also specify custom parsers for your assets
    'json_data': {
      type: 'text',
      src: 'mydata.json',
      parser: JSON.parse  // Here we call JSON.parse as soon as the asset has
                          // finished loading
    }
  },

  // Once the assets are done loading, then we can use them within our
  // application
  onDone: (assets) => {
    console.log(assets.scores)

    document.body.appendChild(assets.some_video)
    document.body.appendChild(assets.an_image)

    console.log(assets.json_data)
  },

  // As assets are preloaded the progress callback gets fired
  onProgress: (progress, message) => {
    document.body.innerHTML =
      '<b>' + (progress * 100) + '% loaded</b>: ' + message
  },

  onError: (err) => {
    console.error(err)
  }
})