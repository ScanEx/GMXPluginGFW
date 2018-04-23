/** Leaflet layers
*/
(function (){

L.GFWLayer = (L.TileLayer.Canvas || L.TileLayer).extend(L.extend({
	options: {
		crossOrigin: true,
		maxNativeZoom: 12
	},
	_drawLayerTile: function(img, coords, zoom) {
		var tile = this._tiles[L.gmxUtil.isOldVersion ? coords.x + ':' + coords.y : this._tileCoordsToKey(coords)];
		if (tile) {
			var ctx = (tile.el || tile).getContext('2d');

			ctx.drawImage(img, 0, 0, 256, 256);
			var imgData = ctx.getImageData(0, 0, 256, 256),
				data = imgData.data,
				z = coords.z || zoom,
				exp = z < 11 ? 0.3 + ((z - 3) / 20) : 1,
				options = this.options;

			for (var i = 0; i < 256; ++i) {
				for (var j = 0; j < 256; ++j) {
					var pixelPos = (j * 256 + i) * 4,
						yearLoss = 2000 + data[pixelPos + 2],
						intensity = data[pixelPos],
						scale = Math.pow(intensity/256, exp) * 256;

					if (yearLoss >= options.yearBegin && yearLoss < options.yearEnd) {
						data[pixelPos] = 220;
						data[pixelPos + 1] = (72 - z) + 102 - (3 * scale / z);
						data[pixelPos + 2] = (33 - z) + 153 - ((intensity) / z);
						data[pixelPos + 3] = z < 13 ? scale : intensity;
					} else {
						data[pixelPos + 3] = 0;
					}
				}
			}
			ctx.putImageData(imgData, 0, 0);
		}
	},
	setYearInterval: function(yearBegin, yearEnd) {
		this.options.yearBegin = yearBegin;
		this.options.yearEnd = yearEnd;
		this.redraw();
	}
}
, L.gmxUtil.isOldVersion ?
	{
		initialize: function (url, options) {
			this._url = url;
			L.setOptions(this, options);
		},
		drawTile: function(canvas, tilePoint, zoom) {
			var img = new Image();
			img.crossOrigin = '';
			img.onload = function() {
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 256, 256);
				this._drawLayerTile(img, tilePoint, zoom);
				this.tileDrawn(canvas);
			}.bind(this);
			tilePoint.z = zoom;
			img.src = this.getTileUrl(tilePoint);
		}
	}
	:
	{
		createTile: function (coords, done) {
			var tile = this._imgContainer = L.DomUtil.create('canvas', 'leaflet-tile');
				size = this.getTileSize();
				// zoom = coords.z || this._map._zoom;
			tile.width = size.x; tile.height = size.y;
			(L.TileLayer.prototype.createTile || L.TileLayer.prototype._createTile).call(this, coords, done);
			return tile;
		},

		_tileReady: function (coords, err, img) {
			if (!err) { this._drawLayerTile(img, coords); }
			L.TileLayer.prototype._tileReady.call(this, coords, err, img);
		}
	}
));


//Helper layer with integrated slider control
L.GFWLayerWithSlider = (L.Layer || L.Class).extend({
    initialize: function() {
        var layer = this._layer = new L.GFWLayer('//storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png', this.options);
        this._slider = new L.GFWSlider(L.extend({position: 'bottomright'}, this.options));
        
        this._slider.on('yearschange', function(data) {
            layer.setYearInterval(data.yearBegin, data.yearEnd);
        });
    },
    
    onAdd: function(map) {
        map.addLayer(this._layer);
        map.addControl(this._slider);
    },
    
    onRemove: function(map) {
        map.removeLayer(this._layer);
        map.removeControl(this._slider);
    },
    
    setZIndex: function() {
        return this._layer.setZIndex.apply(this._layer, arguments);
    },
    
    getSlider: function() {
        return this._slider;
    },
    
    options: {
        attribution: '<a href="http://glad.umd.edu/"> Hansen|UMD|Google|USGS|NASA </a>'
   }
})

})();

/** Leaflet control for years interval selection
 * Requires jQuery and Handlebars
*/
L.GFWSlider = L.Control.extend({
    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
    _setYears: function(yearBegin, yearEnd) {
        this.options.yearBegin = yearBegin;
        this.options.yearEnd = yearEnd;
        this.fire('yearschange', {yearBegin: yearBegin, yearEnd: yearEnd});
    },
    _gmxTimelineShift: function(ev) {
		if (ev.id === 'gmxTimeline' && ev.control) {
			var control = ev.control;
			if (ev.type === 'gmxcontroladd') {
				control.on('statechanged', this._setShift, this);
				L.DomUtil.addClass(this._container, 'marginBottom145');
			} else {
				control.off('statechanged', this._setShift, this);
				L.DomUtil.removeClass(this._container, 'marginBottom20');
				L.DomUtil.removeClass(this._container, 'marginBottom145');
			}
		}
    },
    _setShift: function(state) {
		var isVisible = state.isVisible || state.isVisible === undefined;
		L.DomUtil.removeClass(this._container, 'marginBottom' + (isVisible ? '20' : '145'));
		L.DomUtil.addClass(this._container, 'marginBottom' + (isVisible ? '145' : '20'));
    },
    onAdd: function(map) {
		var container = this._container || this._createCont();

		var dragging = map.dragging;
		L.DomEvent
			.on(container, 'mouseover', dragging.disable, dragging)
			.on(container, 'mouseout', dragging.enable, dragging);

		map
			.on('gmxcontrolremove', this._gmxTimelineShift, this)
			.on('gmxcontroladd', this._gmxTimelineShift, this);

		if (map.gmxControlsManager) {
			var gmxTimeline = map.gmxControlsManager.get('gmxTimeline');
			if (gmxTimeline) {
				setTimeout(function() {
					this._setShift(gmxTimeline.saveState());
				}.bind(this), 0);
			}
		}

        return container;
    },

    onRemove: function(map) {
		var dragging = map.dragging;
		L.DomEvent
			.off(this._container, 'mouseover', dragging.disable, dragging)
			.off(this._container, 'mouseout', dragging.enable, dragging);

		map
			.off('gmxcontrolremove', this._gmxTimelineShift, this)
			.off('gmxcontroladd', this._gmxTimelineShift, this);
    },
    _createCont: function() {
        var template = Handlebars.compile(
            '<div class = "gfw-slider">' + 
                '<div class = "gfw-slider-container"></div>' +
                '<div class = "gfw-slider-labels">' +
                    '{{#labels}}' +
                        '<div class = "gfw-label-item">{{.}}</div>' +
                    '{{/labels}}' +
                '</div>' +
            '</div>'
        );

        var labels = [];
        for (var year = this.options.yearBegin; year <= this.options.yearEnd; year++) {
            labels.push(year);
        }

        var ui = this._ui = $(template({
            labels: labels
        }));

        ui.find('.gfw-slider-container').slider({
            min: this.options.yearBegin,
            max: this.options.yearEnd,
            values: [this.options.yearBegin, this.options.yearEnd],
            range: true,
            change: function(event, ui) {
                this._setYears(ui.values[0], ui.values[1]);
            }.bind(this)
        });
        return ui[0];
    },

    saveState: function() {
        return {
            version: '1.0.0',
            yearBegin: this.options.yearBegin,
            yearEnd: this.options.yearEnd
        }
    },

    loadState: function(data) {
        if (this._ui) {
            this._ui.find('.gfw-slider-container').slider('option', 'values', [data.yearBegin, data.yearEnd]);
        } else {
            this._setYears(data.yearBegin, data.yearEnd);
        }
    }
});

/** GeoMixer virtual layer
*/
(function (){

var defineClass = function() {
    var GeoMixerGFWLayer = L.GFWLayerWithSlider.extend({
		options: {
			// pane: 'tilePane',
			yearBegin: 2001,
			yearEnd: 2016
		},
        initFromDescription: function(layerDescription) {
            this._gmxProperties = layerDescription.properties;
            return this;
        },
        getGmxProperties: function() {
            return this._gmxProperties;
        }
    });
    L.gmx.addLayerClass('GFW', GeoMixerGFWLayer);
    return GeoMixerGFWLayer;
}

if (window.gmxCore) {
    gmxCore.addModule('GFWVirtualLayer', function() {
        return {
            layerClass: defineClass()
        }
    }, {
        init: function(module, path) {
			gmxCore.loadCSS(path + 'gmxPluginGfw.css');
        }
    });
} else {
    defineClass();
}
 
})();

/** GeoMixer plugin
*/
(function (){
if (!window.gmxCore) {
    return
}

var publicInterface = {
    pluginName: 'GFW Plugin'
};

gmxCore.addModule('GFWPlugin', publicInterface, {
    init: function(module, path) {
        return gmxCore.loadModule('GFWVirtualLayer', path + 'GmxGFWLayer.js');
    }
});

})();
