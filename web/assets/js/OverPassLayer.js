// query overpass server - based on https://github.com/kartenkarsten/leaflet-layer-overpass

let eleCache = [], queryBbox = '', queryCustom = false;
function show_overpass_layer(query, cacheId, options) {
	if (!query || query === '();') { setMsgStatus('fa-solid fa-circle-info', 'No Query', 'The OverpassAPI query string was empty.', 4); return; }
	else if ($('#settings-bbox').val() === 'screen' && !options.forceBbox && map.getZoom() < 15) { setMsgStatus('fa-solid fa-circle-info', 'Query Area Too Large', 'Please try zooming in to at least level 15.', 4); return; }
	else {
		// show spinner, disable poi checkboxes
		$('.spinner').show();
		$('.pois-checkbox').addClass('pois-loading');
		queryBbox = '[out:json]';
		if ($('#settings-overpass-attic').val()) queryBbox += '[date:"' + new Date($('#settings-overpass-attic').val()).toISOString() + '"]';
		// select within an area, bypassed for single poi
		if (options && options.bound) {
			if ($('#settings-bbox').val() === 'area_id' && !options.forceBbox) {
				queryBbox += ';rel(' + osmRelation + ');map_to_area->.a';
				query = query.replaceAll('[', '(area.a)[');
			}
			else if ($('#settings-bbox').val() === 'bbox' || options.forceBbox) {
				queryBbox += '[bbox:' + [mapBounds.south, mapBounds.west, mapBounds.north, mapBounds.east].join(',') + ']';
				cacheId += cacheId ? 'BB' : '';
			}
			else if ($('#settings-bbox').val() === 'screen' && !options.forceBbox) {
				queryBbox += '[bbox:' + [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng, map.getBounds()._northEast.lat, map.getBounds()._northEast.lng].join(',') + ']';
				cacheId = '';
			}
		}
		queryBbox += ';(' + query + ');';
		queryCustom = options && options.custom ? true : false;
		$('#settings-overpass-export').prop('disabled', false);
	}
	const opl = new L.OverPassLayer({
		debug: $('#settings-debug').is(':checked'),
		query: queryBbox + 'out geom qt ' + maxOpResults + ';',
		endpoint: 'https://' + $('#settings-overpass-server').val() + '/api/interpreter',
		callback: callback,
		cacheId: cacheId ? 'OPL' + cacheId : '',
		zoomTo: (options && options.zoomTo) || false
	});
	iconLayer.addLayer(opl);
}

L.OverPassLayer = L.FeatureGroup.extend({
	options: {
		statusMsg: function(icon, errMsg, indicatorMsg) {
			$('.spinner').fadeOut(200);
			clear_map('markers');
			setMsgStatus('fa-solid fa-' + icon, errMsg, indicatorMsg, 4);
		}
	},
	initialize: function(options) {
		L.Util.setOptions(this, options);
		// save position of the layer or any options from the constructor
		this._ids = {};
	},
	onMoveEnd: function() {
		const url = this.options.endpoint + '?data=' + this.options.query + '&contact=' + email;
		const self = this;
		const reference = { instance: self };
		if (self.options.debug) console.debug('Overpass query:', encodeURI(url));
		// check if cached in variable
		if (eleCache[self.options.cacheId] && !$('#settings-overpass-attic').val() && $('#settings-overpass-cache').val() > 0) {
			self.options.callback.call(reference, eleCache[self.options.cacheId]);
			if (self.options.zoomTo) zoom_area();
			if (self.options.debug) console.debug('Query received from eleCache.' + self.options.cacheId);
		}
		// check if cached in localStorage and not expired
		else if (noIframe && localStorageAvail() && !$('#settings-overpass-attic').val() && window.localStorage[self.options.cacheId] && $('#settings-overpass-cache').val() > 0 &&
			(new Date(JSON.parse(window.localStorage[self.options.cacheId]).osm3s.timestamp_osm_base).getTime()+(parseInt($('#settings-overpass-cache').val())*60*60*1000) > new Date().getTime())) {
				eleCache[self.options.cacheId] = JSON.parse(window.localStorage[self.options.cacheId]);
				self.options.callback.call(reference, eleCache[self.options.cacheId]);
				if (self.options.zoomTo) zoom_area();
				if (self.options.debug) console.debug('Query received from localStorage.' + self.options.cacheId);
		}
		// get from overpass
		else $.ajax({
			url: url,
			datatype: 'xml',
			retryTimeout: 2,
			success: function(xml) {
				if (xml.elements) {
					self.options.callback.call(reference, xml);
					if (self.options.zoomTo) zoom_area();
					if (poiList.length === 0 && !rQuery) self.options.statusMsg(
						'circle-info',
						'No places found',
						'Please try another area or query.' +
						($('#settings-overpass-attic').val() && ($('#settings-bbox').val() === 'area_id') ? '<br>When using attic data, try changing the bounding box to something other than ' + $('#settings-bbox option:selected').text() + '.' : '')
					);
					// if not in iframe, cache to local storage
					if (self.options.cacheId && poiList.length && !$('#settings-overpass-attic').val()) {
						eleCache[self.options.cacheId] = xml;
						if (noIframe && localStorageAvail()) window.localStorage[self.options.cacheId] = JSON.stringify(xml);
					}
					if (self.options.debug) console.debug('Query received from server ' + $('#settings-overpass-server option:selected').text());
				}
				else self.options.statusMsg('face-frown', 'Error', 'Bad response from data server. Please try again later.');
			},
			complete: function(e) {
				if (e.status === 0 || (e.status >= 400 && e.status <= 504)) {
					let erMsg = 'Something went wrong. Please try again later.';
					switch (e.status) {
						case 0: /* fall through */
						case 504:
							// retry on timeout
							if (e.status === 504 && this.retryTimeout) {
								this.retryTimeout--;
								$.ajax(this);
								return;
							}
							// fallback to main overpass server if failed on alternative
							if ($('#settings-overpass-server').val() !== $('#settings-overpass-server option').eq(0).val()) {
								const that = this;
								that.url = this.url.replace($('#settings-overpass-server').val(), $('#settings-overpass-server option').eq(0).val());
								$.ajax(that);
								$('#settings-overpass-server').prop('selectedIndex', 0);
								return;
							}
							else {
								if (e.status === 0) {
									erMsg = 'Data server not responding. Please try again later.';
									e.status = 1;
								}
								else erMsg = 'Data server timed-out. Please try again later.';
							}
							break;
						case 400: erMsg = 'Bad request. Check the URL or query is valid.'; break;
						case 429: erMsg = 'Too many requests. Please wait a few moments before trying again.'; break;
					}
					self.options.statusMsg('face-frown', 'Error ' + e.status, erMsg);
					self.options.callback.call(reference, { elements: [] });
					rQuery = false;
					this.error();
				}
			},
			error: function() {
				if ($('#settings-debug').is(':checked')) console.debug('ERROR OVERPASS:', encodeURI(this.url));
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
		$('#modal').hide();
		map.off({ 'moveend': this.onMoveEnd }, this);
		this._map = null;
	}
});
