﻿/** Leaflet control for years interval selection
 * Requires jQuery and Handlebars
*/
L.GFWSlider = L.Control.extend({
    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
    _setYears: function(yearBegin, yearEnd) {
        this.options.yearBegin = yearBegin;
        this.options.yearEnd = yearEnd;
        this.fire('yearschange', {yearBegin: yearBegin, yearEnd: yearEnd});
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
		var dragging = map.dragging;
		L.DomEvent
			.on(ui[0], 'mouseover', dragging.disable, dragging)
			.on(ui[0], 'mouseout', dragging.enable, dragging);
        
        return ui[0];
    },

    onRemove: function() {
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
