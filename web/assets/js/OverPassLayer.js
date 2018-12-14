// query overpass server - based on https://github.com/kartenkarsten/leaflet-layer-overpass

function show_overpass_layer(query, cacheId) {
	if (!query || query === '();') return;
	if ($('#inputAttic').val()) query = '[date:"' + new Date($('#inputAttic').val()).toISOString() + '"];(' + query + ');';
	else query = ';' + query;
	var opl = new L.OverPassLayer({
		debug: $('#inputDebug').is(':checked'),
		query: query,
		endpoint: 'https://' + $('#inputOpServer').val() + '/api/interpreter',
		callback: callback,
		cacheId: cacheId ? 'OPL' + cacheId : ''
	});
	iconLayer.addLayer(opl);
}

var eleCache = [];
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
		var reference = {instance: self};
		// check if cached in variable
		if (eleCache[self.options.cacheId] && !$('#inputAttic').val() && $('#inputOpCache').val() > 0) {
			self.options.callback.call(reference, eleCache[self.options.cacheId]);
			if (self.options.debug) console.debug('Finished queries (var cache ' + self.options.cacheId + ').');
		}
		// check if cached in localStorage
		else if (noIframe && !$('#inputAttic').val() && window.localStorage && window.localStorage[self.options.cacheId] && $('#inputOpCache').val() > 0) {
			eleCache[self.options.cacheId] = JSON.parse(window.localStorage[self.options.cacheId]);
			if (new Date(eleCache[self.options.cacheId].osm3s.timestamp_osm_base).getTime() < new Date().getTime()+parseInt($('#inputOpCache').val())*60*60*1000) {
				self.options.callback.call(reference, eleCache[self.options.cacheId]);
				if (self.options.debug) console.debug('Finished queries (localStorage cache ' + self.options.cacheId + ').');
			}
		}
		else $.ajax({
			url: url,
			datatype: 'xml',
			success: function (xml) {
				self.options.callback.call(reference, xml);
				if (self.options.debug) console.debug('Finished queries (api).');
				if ($('#inputOpen').is(':checked')) self.options.statusMsg('<i class="fas fa-info-circle fa-fw"></i> No POIs found, try turning off "only show open" in options.');
				else if ($('.leaflet-marker-icon').length === 0 && !rQuery) self.options.statusMsg('<i class="fas fa-info-circle fa-fw"></i> No POIs found, try another area or query.');
				// if not in iframe cache to local storage
				if (self.options.cacheId && !$('#inputAttic').val()) {
					eleCache[self.options.cacheId] = xml;
					if (noIframe && window.localStorage) window.localStorage[self.options.cacheId] = JSON.stringify(xml);
				}
			},
			complete: function (e) {
				if (e.status === 0 || (e.status >= 400 && e.status <= 504)) {
					erMsg = 'Something unknown happened. Please try again later.';
					switch (e.status) {
						case 0: erMsg = 'Data server not responding. Please try again later.'; e.status = 1; break;
						case 400: erMsg = 'Bad Request. Check the URL or query is valid.'; break;
						case 429: erMsg = 'Too Many Requests. Please try a smaller area.'; break;
						case 504: erMsg = 'Gateway Timeout. Please try again.'; break;
					}
					self.options.statusMsg(erMsg, e.status);
					self.options.callback.call(reference, {elements: []});
					this.error();
				}
			},
			error: function () {
				if ($('#inputDebug').is(':checked')) console.debug('ERROR OVERPASS: ' + this.url);
				rQuery = false;
			}
		});
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
