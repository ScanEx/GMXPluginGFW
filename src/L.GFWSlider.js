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
		L.DomEvent
			.on(ui[0], 'mouseover', map.dragging.disable, this)
			.on(ui[0], 'mouseout', map.dragging.enable, this);
        
        // ui.on('mousedown', function(event) {
            // event.stopPropagation();
        // });
        
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