// query overpass server - based on https://github.com/kartenkarsten/leaflet-layer-overpass

function show_overpass_layer(query) {
	if (!query || query === '();') {
		console.log('There is nothing selected to filter by.');
		return;
	}
	if ($('#inputAttic').val()) query = '[date:"' + new Date($('#inputAttic').val()).toISOString() + '"];(' + query + ');';
	else query = ';' + query;
	var opl = new L.OverPassLayer({
		debug: $('#inputDebug').is(':checked'),
		query: query,
		endpoint: $('#inputOpServer').val() + 'interpreter',
		callback: callback
	});
	iconLayer.addLayer(opl);
}

L.OverPassLayer = L.FeatureGroup.extend({
	options: {
		statusMsg: function(indicatorMsg, errCode) {
			if (errCode) {
				$('#spinner').fadeOut(200);
				indicatorMsg = '<i class="fas fa-exclamation-triangle fa-fw"></i> ERROR ' + errCode + ': ' + indicatorMsg;
			}
			$('.leaflet-control-statusmsg').html(indicatorMsg).show();
		}
	},
	initialize: function (options) {
		L.Util.setOptions(this, options);
		this._layers = {};
		// save position of the layer or any options from the constructor
		this._ids = {};
		this._requested = {};
	},
	onMoveEnd: function () {
		if (this.options.debug) console.debug('load Pois');
		var queryBbox = '[bbox:' + [mapBounds.south, mapBounds.west, mapBounds.north, mapBounds.east].join(',') + ']' + this.options.query;
		var url = this.options.endpoint + '?data=[out:json]' + queryBbox + 'out tags center qt ' + maxOpResults + ';&contact=' + email;
		if (this.options.debug) console.debug(url);
		// show spinner, disable poi checkboxes
		$('.poi-checkbox').addClass('poi-loading');
		$('#spinner').show();
		if (this.options.debug) console.debug('About to query the OverPassAPI.');
		var self = this;
		var request = new XMLHttpRequest();
		var reference = {};
		request.open('GET', url, true);
		request.onerror = function() {
			self.options.statusMsg('Data server not responding. Please try again later.', '0');
		};
		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				reference = {instance: self};
				self.options.callback.call(reference, JSON.parse(this.response));
				if (self.options.debug) console.debug('Finished queries.');
				if ($('.leaflet-marker-icon').length === 0 && !rQuery) self.options.statusMsg('No POIs found, try another area or query.');
			}
			else if (this.status >= 400 && this.status <= 504) {
				var erMsg = 'Something unknown happened. Please try again later.';
				switch (this.status) {
					case 400: erMsg = 'Bad Request. Check the URL or query is valid.'; break;
					case 429: erMsg = 'Too Many Requests. Please try a smaller area.'; break;
					case 504: erMsg = 'Gateway Timeout. Please try again.'; break;
				}
				self.options.statusMsg(erMsg, this.status);
				self.options.callback.call(reference, {elements: []});
			}
		};
		request.send();
	},
	onAdd: function (map) {
		this._map = map;
		this.onMoveEnd();
		if (this.options.debug) console.debug('Add layer.');
	},
	onRemove: function (map) {
		if (this.options.debug) console.debug('Remove layer.');
		L.LayerGroup.prototype.onRemove.call(this, map);
		this._ids = {};
		this._requested = {};
		$('.leaflet-control-statusmsg').hide();
		map.off({ 'moveend': this.onMoveEnd }, this);
		this._map = null;
	},
	getData: function () {
		if (this.options.debug) console.debug(this._data);
		return this._data;
	}
});
