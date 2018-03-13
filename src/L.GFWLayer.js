/** Leaflet layers
*/
(function (){

L.GFWLayer = (L.TileLayer.Canvas || L.TileLayer).extend(L.extend({
	options: {
		crossOrigin: true
	},
	_drawLayerTile: function(img, coords, zoom) {
		var tile = this._tiles[L.TileLayer.Canvas ? coords.x + ':' + coords.y : this._tileCoordsToKey(coords)];
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
, L.TileLayer.Canvas ?
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
