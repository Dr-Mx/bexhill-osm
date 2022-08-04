// query overpass server - based on https://github.com/kartenkarsten/leaflet-layer-overpass

var eleCache = [], queryBbox = '';
function show_overpass_layer(query, cacheId, bound, forceBbox) {
	if (!query || query === '();') return;
	else {
		// show spinner, disable poi checkboxes
		$('.spinner').show();
		$('.poi-checkbox').addClass('poi-loading');
		queryBbox = '[out:json]';
		if ($('#inputAttic').val()) queryBbox += '[date:"' + new Date($('#inputAttic').val()).toISOString() + '"]';
		// select within area
		if (bound)
			if (osmRelation && !$('#inputBbox').is(':checked') && !forceBbox) {
				queryBbox += ';rel(' + osmRelation + ');map_to_area->.a';
				query = query.replace(/\[/g, '(area.a)[');
			}
			else {
				queryBbox += '[bbox:' + [mapBounds.south, mapBounds.west, mapBounds.north, mapBounds.east].join(',') + ']';
				cacheId += cacheId ? 'BB' : '';
			}
		queryBbox += ';(' + query + ');';
		$('#exportQuery').prop('disabled', false);
	}
	var opl = new L.OverPassLayer({
		debug: $('#inputDebug').is(':checked'),
		query: queryBbox + 'out geom qt ' + maxOpResults + ';',
		endpoint: 'https://' + $('#inputOpServer').val() + '/api/interpreter',
		callback: callback,
		cacheId: cacheId ? 'OPL' + cacheId : ''
	});
	iconLayer.addLayer(opl);
}

L.OverPassLayer = L.FeatureGroup.extend({
	options: {
		statusMsg: function(icon, errMsg, indicatorMsg) {
			$('.spinner').fadeOut(200);
			clear_map('markers');
			setMsgStatus('fa-solid fa-' + icon, errMsg, indicatorMsg, 3);
		}
	},
	initialize: function(options) {
		L.Util.setOptions(this, options);
		// save position of the layer or any options from the constructor
		this._ids = {};
	},
	onMoveEnd: function() {
		var url = this.options.endpoint + '?data=' + this.options.query + '&contact=' + email;
		var self = this;
		var reference = { instance: self };
		if (self.options.debug) console.debug('Overpass query:', encodeURI(url));
		// check if cached in variable
		if (eleCache[self.options.cacheId] && !$('#inputAttic').val() && $('#inputOpCache').val() > 0) {
			self.options.callback.call(reference, eleCache[self.options.cacheId]);
			if (self.options.debug) console.debug('Query received from eleCache.', self.options.cacheId);
		}
		// check if cached in localStorage and not expired
		else if (noIframe && !$('#inputAttic').val() && window.localStorage && window.localStorage[self.options.cacheId] && $('#inputOpCache').val() > 0 &&
			(new Date(JSON.parse(window.localStorage[self.options.cacheId]).osm3s.timestamp_osm_base).getTime()+(parseInt($('#inputOpCache').val())*60*60*1000) > new Date().getTime())) {
				eleCache[self.options.cacheId] = JSON.parse(window.localStorage[self.options.cacheId]);
				self.options.callback.call(reference, eleCache[self.options.cacheId]);
				if (self.options.debug) console.debug('Query received from localStorage.', self.options.cacheId);
		}
		// get from overpass
		else $.ajax({
			url: url,
			datatype: 'xml',
			retryLimit: 3,
			success: function(xml) {
				self.options.callback.call(reference, xml);
				if (poiList.length === 0 && !rQuery) self.options.statusMsg('circle-info', 'No places found', 'Please try another area or query.');
				// if not in iframe, cache to local storage
				if (self.options.cacheId && poiList.length && !$('#inputAttic').val()) {
					eleCache[self.options.cacheId] = xml;
					if (noIframe && window.localStorage) window.localStorage[self.options.cacheId] = JSON.stringify(xml);
				}
				if (self.options.debug) console.debug('Query received from ' + $('#inputOpServer').val());
			},
			complete: function(e) {
				if (e.status === 0 || (e.status >= 400 && e.status <= 504)) {
					var erMsg = 'Something went wrong. Please try again later.';
					switch (e.status) {
						case 0:
							// fallback to main overpass server if failed on alternative
							if ($('#inputOpServer').val() !== $('#inputOpServer option').eq(0).val() && this.retryLimit) {
								var that = this;
								that.url = this.url.replace($('#inputOpServer').val(), $('#inputOpServer option').eq(0).val());
								this.retryLimit = 0;
								$.ajax(that);
								$('#inputOpServer').prop('selectedIndex', 0);
								return;
							}
							else {
								erMsg = 'Data server not responding. Please try again later.';
								e.status = 1;
							}
							break;
						case 400: erMsg = 'Bad Request. Check the URL or query is valid.'; break;
						case 429: erMsg = 'Too Many Requests. Please wait a few moments before trying again.'; break;
						case 504:
							// retry on timeout
							if (this.retryLimit) {
								this.retryLimit--;
								$.ajax(this);
								return;
							}
							else erMsg = 'Gateway Timeout. Please try again later.';
							break;
					}
					self.options.statusMsg('triangle-exclamation', 'ERROR #' + e.status, erMsg);
					self.options.callback.call(reference, { elements: [] });
					rQuery = false;
					this.error();
				}
			},
			error: function() {
				if ($('#inputDebug').is(':checked')) console.debug('ERROR OVERPASS:', encodeURI(this.url));
			}
		});
	},
	onAdd: function(map) {
		this._map = map;
		this.onMoveEnd();
	},
	onRemove: function(map) {
		L.LayerGroup.prototype.onRemove.call(this, map);
		this._ids = {};
		$('#msgStatus').hide();
		map.off({ 'moveend': this.onMoveEnd }, this);
		this._map = null;
	}
});
