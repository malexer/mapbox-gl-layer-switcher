# mapbox-gl-layer-switcher

mapbox-gl-layer-switcher is a plugin for MapBox GL JS which allows to
turn layers on/off with a smooth transition effect.

## Usage

```js
var switcher = new LayerSwitcher(layerId, map, 400);

switcher.show();  // to show layer
switcher.hide();  // to hide layer
```

where:
* `layerId` - id of the layer which was already added
* `map` - instance of mapboxgl.Map
* `400` - is a transition duration in ms
