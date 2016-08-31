/** GeoMixer virtual layer
*/
(function (){

var defineClass = function() {
    var GeoMixerGFWLayer = L.GFWLayerWithSlider.extend({
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
            if (!L.GFWLayerWithSlider) {
                gmxCore.loadCSS(path + 'L.GFWSlider.css');
                return $.when(
                    gmxCore.loadScript(path + 'L.GFWLayer.js'),
                    gmxCore.loadScript(path + 'L.GFWSlider.js')
                );
            }
        }
        
    });
} else {
    defineClass();
}
 
})();
/** GeoMixer plugin
*/
(function (){
 
var publicInterface = {
    pluginName: 'GFW Plugin'
}

gmxCore.addModule('GFWPlugin', publicInterface, {
    init: function(module, path) {
        return gmxCore.loadModule('GFWVirtualLayer', path + 'GmxGFWLayer.js');
    }
});

})();
/** Leaflet layers
*/
(function (){
    
var GFW_ATTRIBUTION = '<a href="http://glad.umd.edu/"> Hansen|UMD|Google|USGS|NASA </a>';

L.GFWLayer = L.TileLayer.Canvas.extend({
    options: {
        async: true,
        attribution: GFW_ATTRIBUTION
    },
    _yearBegin: 2001,
    _yearEnd: 2015,
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
            this.tileDrawn(canvas);
        }.bind(this);
        
        img.src = 'http://storage.googleapis.com/earthenginepartners-hansen/tiles/gfw2015/loss_tree_year_25/' + zoom + '/' + tilePoint.x + '/' + tilePoint.y + '.png';
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
/** Leaflet control for years interval selection
 * Requires jQuery and Handlebars
*/
L.GFWSlider = L.Control.extend({
    includes: L.Mixin.Events,
    _yearBegin: 2001,
    _yearEnd: 2015,
    _setYears: function(yearBegin, yearEnd) {
        this._yearBegin = yearBegin;
        this._yearEnd = yearEnd;
        this.fire('yearschange', {yearBegin: this._yearBegin, yearEnd: this._yearEnd});
    },
    onAdd: function(map) {
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
        for (var year = 2001; year <= 2014; year++) {
            labels.push(year);
        }
        
        var ui = this._ui = $(template({
            labels: labels
        }));
        
        ui.find('.gfw-slider-container').slider({
            min: 2001,
            max: 2015,
            values: [this._yearBegin, this._yearEnd],
            range: true,
            change: function(event, ui) {
                this._setYears(ui.values[0], ui.values[1]);
            }.bind(this)
        });
        
        ui.on('mousedown', function(event) {
            event.stopPropagation();
        });
        
        return ui[0];
    },
    
    onRemove: function() {
    },
    
    saveState: function() {
        return {
            version: '1.0.0',
            yearBegin: this._yearBegin,
            yearEnd: this._yearEnd
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