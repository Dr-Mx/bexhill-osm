// query overpass server - based on https://github.com/kartenkarsten/leaflet-layer-overpass

var eleCache = [], queryBbox = '';
function show_overpass_layer(query, cacheId, bound) {
	if (!query || query === '();') return;
	else {
		$('.poi-checkbox').addClass('poi-loading');
		$('.spinner').show();
		queryBbox = '[out:json]';
		if ($('#inputAttic').val()) queryBbox += '[date:"' + new Date($('#inputAttic').val()).toISOString() + '"]';
		if (bound)
			if (osmRelation) {
				queryBbox += ';rel(' + osmRelation + ');map_to_area';
				query = query.replace(/];/g, '](area);');
			}
			else queryBbox += '[bbox:' + [mapBounds.south, mapBounds.west, mapBounds.north, mapBounds.east].join(',') + ']';
		queryBbox += ';' + query + 'out tags center qt ' + maxOpResults + ';';
	}
	// show spinner, disable poi checkboxes
	var opl = new L.OverPassLayer({
		debug: $('#inputDebug').is(':checked'),
		query: queryBbox,
		endpoint: 'https://' + $('#inputOpServer').val() + '/api/interpreter',
		callback: callback,
		cacheId: cacheId ? 'OPL' + cacheId : ''
	});
	iconLayer.addLayer(opl);
}

L.OverPassLayer = L.FeatureGroup.extend({
	options: {
		statusMsg: function(indicatorMsg, errCode) {
			$('.spinner').fadeOut(200);
			setMsgStatus('fas fa-exclamation-triangle', 'ERROR #' + errCode, indicatorMsg, 1);
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
		var url = this.options.endpoint + '?data=' + this.options.query + '&contact=' + email;
		var self = this;
		var reference = { instance: self };
		if (self.options.debug) console.debug('Overpass query:', url);
		// check if cached in variable
		if (eleCache[self.options.cacheId] && !$('#inputAttic').val() && $('#inputOpCache').val() > 0) {
			self.options.callback.call(reference, eleCache[self.options.cacheId]);
			if (self.options.debug) console.debug('Query received from eleCache.', self.options.cacheId);
		}
		// check if cached in localStorage
		else if (noIframe && !$('#inputAttic').val() && window.localStorage && window.localStorage[self.options.cacheId] && $('#inputOpCache').val() > 0) {
			eleCache[self.options.cacheId] = JSON.parse(window.localStorage[self.options.cacheId]);
			if (new Date(eleCache[self.options.cacheId].osm3s.timestamp_osm_base).getTime() < new Date().getTime()+parseInt($('#inputOpCache').val())*60*60*1000) {
				self.options.callback.call(reference, eleCache[self.options.cacheId]);
				if (self.options.debug) console.debug('Query received from localStorage.', self.options.cacheId);
			}
		}
		else $.ajax({
			url: url,
			datatype: 'xml',
			success: function (xml) {
				self.options.callback.call(reference, xml);
				if (poiList.length === 0 && $('#inputOpen').is(':checked')) setMsgStatus('fas fa-info-circle', 'No places found', 'Please try turning off "only show open" in options.', 1);
				else if (poiList.length === 0 && !rQuery) setMsgStatus('fas fa-info-circle', 'No places found', 'Please try another area or query.', 1);
				// if not in iframe cache to local storage
				if (self.options.cacheId && !$('#inputAttic').val()) {
					eleCache[self.options.cacheId] = xml;
					if (noIframe && window.localStorage) window.localStorage[self.options.cacheId] = JSON.stringify(xml);
				}
				if (self.options.debug) console.debug('Query received from ' + $('#inputOpServer').val());
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
				rQuery = false;
				if ($('#inputDebug').is(':checked')) console.debug('ERROR OVERPASS:', this.url);
			}
		});
	},
	onAdd: function (map) {
		this._map = map;
		this.onMoveEnd();
	},
	onRemove: function (map) {
		L.LayerGroup.prototype.onRemove.call(this, map);
		this._ids = {};
		this._requested = {};
		$('#msgStatus').hide();
		map.off({ 'moveend': this.onMoveEnd }, this);
		this._map = null;
	}
});
