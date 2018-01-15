/** Leaflet layers
*/
(function (){

var GFW_ATTRIBUTION = '<a href="http://glad.umd.edu/"> Hansen|UMD|Google|USGS|NASA </a>';

if (!window.L.TileLayer.Canvas) {window.L.TileLayer.Canvas = window.L.TileLayer}

L.GFWLayer = L.TileLayer.Canvas.extend({
    options: {
        async: true,
        attribution: GFW_ATTRIBUTION
    },
    _yearBegin: 2001,
    _yearEnd: 2015,

    initialize: function() {
        var setYearInterval = this.setYearInterval.bind(this);

        this._slider = new L.GFWSlider({position: 'bottomright'});

        this._slider.on('yearschange', function(data) {
            setYearInterval(data.yearBegin, data.yearEnd);
        })

        var url = 'http://storage.googleapis.com/earthenginepartners-hansen/tiles/gfw2015/loss_tree_year_25/{z}/{x}/{y}.png';

        L.TileLayer.Canvas.prototype.initialize.call(this, url);
    },

    onAdd: function(map) {
        map.addControl(this._slider);
        L.TileLayer.Canvas.prototype.onAdd.call(this, map);
    },

    onRemove: function(map) {
        L.TileLayer.Canvas.prototype.onRemove.call(this, map);
        map.removeControl(this._slider);
    },

    // redraw: function () {
    //     if(!L.TileLayer.Canvas.prototype._redrawTile) {
    //         for (var i in this._tiles) {
    //             this._redrawTile(this._tiles[i]);
    //         }
    //     }
    //     L.TileLayer.Canvas.prototype.redraw.call(this);
    // },

    _drawLayer: function(img, ctx, z) {
        var imgData = ctx.getImageData(0, 0, 256, 256),
            data = imgData.data,
            exp = z < 11 ? 0.3 + ((z - 3) / 20) : 1;

        for (var i = 0; i < 256; ++i) {
            for (var j = 0; j < 256; ++j) {
                var pixelPos = (j * 256 + i) * 4,
                    yearLoss = 2000 + data[pixelPos + 2],
                    intensity = data[pixelPos],
                    scale = Math.pow(intensity/256, exp) * 256;

                if (yearLoss >= this._yearBegin && yearLoss < this._yearEnd) {
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
    },
    drawTile: function(canvas, tilePoint, zoom) {
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 256, 256);
            this._drawLayer(img, ctx, zoom);
            this.tileDrawn && this.tileDrawn(canvas);
        }.bind(this);

       img.src = 'http://storage.googleapis.com/earthenginepartners-hansen/tiles/gfw2015/loss_tree_year_25/' + zoom + '/' + tilePoint.x + '/' + tilePoint.y + '.png';
    },

    createTile: function(coords){
        var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        var size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        var ctx = tile.getContext('2d');

        this.drawTile(tile, coords, this._map._zoom)

        return tile;
    },

    setYearInterval: function(yearBegin, yearEnd) {
        this._yearBegin = yearBegin;
        this._yearEnd = yearEnd;
        this.redraw();
    }
});

//Helper layer with integrated slider control
L.GFWLayerWithSlider = L.Class.extend({
    initialize: function() {
        var layer = this._layer = new L.GFWLayer();
        this._slider = new L.GFWSlider({position: 'bottomright'});

        this._slider.on('yearschange', function(data) {
            layer.setYearInterval(data.yearBegin, data.yearEnd);
        })
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
        attribution: GFW_ATTRIBUTION
    }
})

})();
