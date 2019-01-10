class Layer {
  constructor(layerId, map) {
    this.layerId = layerId;
    this.map = map;

    this.OPACITY_PROPERTY = this._getOpacityPropertyName();
    this.hasOpacity = Boolean(this.OPACITY_PROPERTY);

    this.OPACITY_TRANSITION_PROPERTY = this.hasOpacity ? `${this.OPACITY_PROPERTY}-transition` : null;

    this.saveOriginalOpacityAndTransition();
  }

  _getOpacityPropertyName() {
    let layerType = this.map.getLayer(this.layerId).type;

    switch (layerType) {
      case 'symbol':
        return 'icon-opacity';
      case 'hillshade':
        return;  // no "opacity" property for hillshade
      default:
        return `${layerType}-opacity`;
    }
  }

  get visible() {
    return this.map.getLayoutProperty(this.layerId, 'visibility') == 'visible';
  }

  set visible(value) {
    this.map.setLayoutProperty(this.layerId, 'visibility', (value ? 'visible' : 'none'));
  }

  get opacity() {
    return this.map.getPaintProperty(this.layerId, this.OPACITY_PROPERTY);
  }

  set opacity(value) {
    if (this.hasOpacity) {
      this.map.setPaintProperty(this.layerId, this.OPACITY_PROPERTY, value);
    }
  }

  get transitionDuration() {
    let transition = this.map.getPaintProperty(this.layerId, this.OPACITY_TRANSITION_PROPERTY);
    return transition.duration;
  }

  set transitionDuration(value) {
    let transition = this.map.getPaintProperty(this.layerId, this.OPACITY_TRANSITION_PROPERTY);
    transition.duration = value;
    this.map.setPaintProperty(this.layerId, this.OPACITY_TRANSITION_PROPERTY, transition);
  }

  setTransition(duration, delay=0) {
    if (this.hasOpacity) {
      this.map.setPaintProperty(
        this.layerId,
        this.OPACITY_TRANSITION_PROPERTY,
        {
          "duration": duration,
          "delay": delay,
        }
      );
    }
  }

  saveOriginalOpacityAndTransition() {
    if (this.hasOpacity) {
      this._opacity = this.opacity;
      this._transition = this.map.getPaintProperty(this.layerId, this.OPACITY_TRANSITION_PROPERTY);
    }
  }

  restoreOriginalOpacityAndTransition() {
    if (this.hasOpacity) {
      this.opacity = this._opacity;
      this.setTransition(this._transition.duration, this._transition.delay);
    }
  }
}


class LayerSwitcher {

  constructor(layerId, map, transitionDuration) {
    this.layer = new Layer(layerId, map);

    if (transitionDuration === undefined) {
      this.transitionDuration = this.layer.transitionDuration;
    } else {
      this.transitionDuration = transitionDuration;
      this.layer.setTransition(this.transitionDuration);
      this.layer.saveOriginalOpacityAndTransition();
    }

    this._initializeLayerState();

    this.timeoutId = null;
  }

  _initializeLayerState() {
    if (!this.layer.visible) {
      this.layer.opacity = 0;
    }
  }

  show() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = null;

    if (this.layer.hasOpacity) {
      this.layer.visible = true;
      this.layer.restoreOriginalOpacityAndTransition();
    } else {
      this.layer.visible = true;
    }
  }

  hide() {
    if (this.layer.hasOpacity) {
      this.layer.opacity = 0;

      let myTimeoutId = setTimeout(
        () => {
          if (this.timeoutId == myTimeoutId) {
            this.layer.visible = false;
          }
        },
        this.transitionDuration,
      );

      this.timeoutId = myTimeoutId;
    } else {
      this.layer.visible = false;
    }
  }

}

export default LayerSwitcher;
