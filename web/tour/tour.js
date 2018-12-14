// tour pages

var imgLayer;
function tour(ti, fromPermalink) {
	clear_map('overlay');
	if ($(window).width() < 768 && !fromPermalink) $('.sidebar-close').click();
	// general markers for tour
	// name | coordinates | popup-header | popup-subheader | image | image-attribution | marker body
	var tourPopup = function (name, pos, header, headerSub, img, imgAttrib, markerPopup) {
		var marker = L.circleMarker(pos, { interactive: true, radius: 15, weight: 5, color: '#fff', opacity: 1, fillColor: '#b05000', fillOpacity: 0.25, className: 'mkrShadow' })
			.bindPopup(
				generic_header_parser(header, headerSub) + markerPopup + (img ? generic_img_parser('tour/tour' + img + '.jpg', 0, 'inherit', '&copy; ' + imgAttrib) : ''),
				{ minWidth: imgSize, maxWidth: imgSize }
			)
			.bindTooltip('<b>' + header + '</b><br><i>' + headerSub + '</i>' + (img ? ' <i style="color:#808080;" class="fas fa-image fa-fw"></i>' : ''), { direction: 'right' });
		marker._leaflet_id = name;
		imageOverlay.addLayer(marker);
	};
	// markers for geojson
	var setMarker = function (feature, layer, dfltAttrib) {
		var customPOptions = {}, toolTip = '', markerPopup = '';
		customPOptions.maxWidth = imgSize;
		markerPopup += generic_header_parser(feature.properties.name) +
			L.Util.template(tagTmpl, { tag: 'Date', value: date_parser(feature.properties.date, 'long'), iconName: 'fas fa-calendar-alt' });
		toolTip += '<b>' + feature.properties.name + '</b><br><i>' + date_parser(feature.properties.date, 'short') + '</i>';
		if (feature.properties.description) {
			markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Description', value: feature.properties.description, iconName: 'fas fa-clipboard' }) + '</span>';
			toolTip += ' <i style="color:#808080;" class="fas fa-clipboard fa-fw"></i>';
		}
		if (feature.properties.img) {
			customPOptions.minWidth = imgSize;
			var imgAttrib = feature.properties.imgattrib ? feature.properties.imgattrib : dfltAttrib;
			markerPopup += generic_img_parser('tour/tour09/' + feature.properties.img + '.jpg', 0, 'inherit', '&copy; ' + imgAttrib);
			if (feature.properties.img_1) {
				for (x = 1; x <= 5; x++) {
					if (feature.properties['img_' + x]) {
						lID = x;
						imgAttrib = feature.properties['imgattrib_' + x] ? feature.properties['imgattrib_' + x] : dfltAttrib;
						markerPopup += generic_img_parser('tour/tour09/' + feature.properties['img_' + x] + '.jpg', x, 'none', '&copy; ' + imgAttrib);
					}
				}
				markerPopup += show_img_controls(parseInt(lID+1));
				toolTip += ' <i style="color:#808080;" class="fas fa-images fa-fw"></i>';
			}
			else toolTip += ' <i style="color:#808080;" class="fas fa-image fa-fw"></i>';
		}
		layer
			.bindPopup(markerPopup, customPOptions)
			.bindTooltip(toolTip, { direction: 'right', offset: [8, 0] });
	};
	// timeout hack to stop iframe breaking on ff
	setTimeout(function () { switch (ti) {
		case 'xmas':
			xmasShops(2018);
			break;
		case 'fossils':
			tourPopup('sackvillefos', [50.837617, 0.482517], 'Iguanadon Footprints', 'Sackville', '01/dinofoot-sackville', '',
				'<span class="comment">50.837617°N 0.482517°E</span><br>' +
				'View at low tide. Walk directly out onto the beach infront of Sackville Apartments. ' +
				'The tracks are just to the south-east of the two large rocks a few hundred yards out from the East Parade.<br>' +
				'One footprint is about 18-inches long.'
			);
			tourPopup('centralfos', [50.836284, 0.473995], 'Iguanadon Footprints', 'Central Parade', '', '',
				'<span class="comment">50.836284°N 0.4743995°E</span><br>' +
				'Found in 1978. View at low tide. Walk directly out onto the beach behind Marina Court Avenue. ' +
				'Impressions in light grey soft sand stone, about 4.5 inches thick lying on harder yellowish stone.<br>' +
				'11 footprints in total.'
			);
			tourPopup('harfieldfos', [50.832998, 0.441865], 'Iguanadon Footprints', 'Hartfield Road', '01/dinofoot-hartfield', '',
				'<span class="comment">50.832998°N 0.441865°E</span><br>' +
				'Found in 1980. View at low tide. South of 27 Hartfield Road. ' +
				'7 footprints in total.'
			);
			imgLayer = ti;
			break;
		case 'shipwreck':
			rQuery = true;
			show_overpass_layer('node(3192282124);', ti);
			break;
		case 'smugglingPanels':
			show_overpass_layer('node["ref"~"^TST"];', ti);
			imgLayer = ti;
			break;
		case 'smugglingGreen':
			rQuery = true;
			show_overpass_layer('way(263267372);', ti);
			break;
		case 'railwayBexhillstation':
			rQuery = true;
			show_overpass_layer('way(397839677);', ti);
			break;
		case 'railwayWestbranch':
			show_overpass_layer('(node(3615179880);node(318219478););', ti);
			if (actOverlayLayer !== 'br1959') map.addLayer(tileOverlayLayers[tileOverlayLayer.br1959.name]);
			imgLayer = ti;
			break;
		case 'railwayGlynegap':
			rQuery = true;
			show_overpass_layer('node(4033104292);', ti);
			break;
		case 'tramway':
			imageOverlay.addLayer(L.imageOverlay('tour/tour05/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
			map.flyToBounds(imageOverlay.getBounds().pad(0.2));
			imgLayer = ti;
			break;
		case 'motorTrack':
			imageOverlay.addLayer(L.imageOverlay('tour/tour06/racetrack.png', [[50.84135, 0.47991], [50.83772, 0.49508]], { opacity: 0.9 }));
			map.flyToBounds(imageOverlay.getBounds().pad(0.2));
			imgLayer = ti;
			break;
		case 'motorSerpollet':
			rQuery = true;
			show_overpass_layer('node(3592525934);', ti);
			break;
		case 'motorTrail':
			show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););', ti);
			imgLayer = ti;
			break;
		case 'delawarr':
			iconLayer.clearLayers();
			rQuery = true;
			show_overpass_layer('way(247116304);', ti);
			break;
		case 'manor':
			rQuery = true;
			show_overpass_layer('way(364593716);', ti);
			break;
		case 'ww2Bombmap':
			$('#spinner').show();
			// bomb radius outline
			for (var x = 1; x <= 5; x++) {
				imageOverlay.addLayer(L.circle([50.84150, 0.47150], {
					color: 'darkred',
					weight: 2,
					opacity: 0.2,
					fill: false,
					radius: x * 804.672,
					clickable: false
				}).bindTooltip(x / 2 + ' miles', {
					sticky: true
				}));
			}
			$.ajax({
				url: 'tour/tour09/ww2bombs.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function (json) {
					var iconName, interact;
					imageOverlay.addLayer(L.geoJSON(json, {
						filter: function (feature) {
							interact = true;
							if (feature.properties.type === 'v1') iconName = 'v1';
							else if (feature.properties.type === 'lndmn') iconName = 'lndmn';
							else if (feature.properties.type === 'acrft') iconName = 'acrft';
							else if (feature.properties.name) iconName = 'knwn';
							else {
								iconName = 'nknwn';
								interact = $('#settings #inputDebug').is(':checked') ? true : false;
							}
							return true;
						},
						onEachFeature: function (feature, layer) {
							// push any additional information into a popup
							if (feature.properties.name) setMarker(feature, layer, 'Bexhill Observer'); 
							else if (interact) layer.bindTooltip(feature.geometry.coordinates.toString());
						},
						pointToLayer: function (feature, latlng) {
							return L.marker(latlng, {
								icon: L.icon({
									className: 'ww2Icon',
									iconUrl: 'tour/tour09/mrkr_' + iconName + '.png',
									iconSize: [28, 28]
								}),
								bounceOnAdd: false,
								interactive: interact,
								keyboard: false,
								riseOnHover: true
							});
						}
					}));
					map.fireEvent('zoomend');
					$('#spinner').fadeOut('fast');
				}
			});
			imgLayer = ti;
			break;
		case 'ww2Shelters':
			$('#spinner').show();
			$.ajax({
				url: 'tour/tour09/ww2shelters.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function (json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							setMarker(feature, layer, 'Bexhill Museum');
						},
						pointToLayer: function (feature, latlng) {
							return L.marker(latlng, {
								icon: L.icon({
									className: 'ww2Icon',
									iconUrl: 'tour/tour09/mrkr_shltr.png',
									iconSize: [28, 28]
								}),
								bounceOnAdd: false,
								keyboard: false,
								riseOnHover: true
							});
						}
					}));
					map.fireEvent('zoomend');
					$('#spinner').fadeOut('fast');
				}
			});
			imgLayer = ti;
			break;
		case 'ww2Structures':
			show_overpass_layer('(node(3572364302);node(3944803214);node(2542995381);node(4056582954);node["military"];way["military"];);', ti);
			imgLayer = ti;
			break;
		case 'northeye':
			rQuery = true;
			show_overpass_layer('way(28940913);', ti);
			break;
		case 'peopleNarayan':
			rQuery = true;
			show_overpass_layer('way(247118625);', ti);
			break;
		case 'peopleIxion':
			rQuery = true;
			show_overpass_layer('node(3989026714);', ti);
			break;
		case 'peopleBaird':
			rQuery = true;
			show_overpass_layer('node(3971492451);', ti);
			break;
		case 'peopleLlewelyn':
			rQuery = true;
			show_overpass_layer('way(393451834);', ti);
			break;
		case 'peopleMilligan':
			rQuery = true;
			show_overpass_layer('way(419719683);', ti);
			break;
		case 'clocks':
			show_overpass_layer(pois.clock.query, ti);
			imgLayer = ti;
			break;
		case 'lost':
			tourPopup('Wshelt', [50.83651, 0.46601], 'West Parade Shelters', '1904-1977', '13/westparadeshelter-air-1931', '<a href="https://britainfromabove.org.uk/en/image/EPW035331" target="_blank">Historic England</a> | 1931', '');
			tourPopup('Metrop', [50.83754, 0.47045], 'Metropole Hotel', '1897-1955', '13/metropolehotel-air-1929', 'Bexhill Museum | 1929', '');
			tourPopup('Fount1', [50.83734, 0.47175], 'Memorial Fountain', '1913-1934', '13/memorialfountain-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026222" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Fount2', [50.83756, 0.46703], 'Memorial Fountain', '1934-1963', '13/memorialfountain-1956', '<a href="https://thebexhillhistorytrail.wordpress.com" target="_blank">Dr Paul Wright</a> | Postcard, 1956', '');
			tourPopup('Marina', [50.83763, 0.47357], 'Marina Court', '1901-1970', '13/marinacourt-air-1920', '<a href="https://britainfromabove.org.uk/en/image/EPW000708" target="_blank">Historic England</a> | 1920', '');
			tourPopup('Marine', [50.83798, 0.47435], 'Marine Hotel', '1895-1954', '13/robertsmarine-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026226" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Kursaa', [50.83759, 0.47714], 'Kursaal', '1896-1936', '13/kursaal-air-1926', '<a href="https://britainfromabove.org.uk/en/image/EPW016888" target="_blank">Historic England</a> | 1926', '');
			tourPopup('Granvi', [50.84027, 0.47750], 'Granville Hotel', '1902-2003', '13/granville-air-1980', 'Bexhill Museum | c1980', '');
			tourPopup('Riposo', [50.83968, 0.48395], 'Hotel Riposo', '1901-1961', '13/riposo-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026230" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Ritzci', [50.84156, 0.47294], 'Ritz Cinema', '1937-1961', '13/ritz-air-1949', '<a href="https://britainfromabove.org.uk/en/image/EAW022974" target="_blank">Historic England</a> | 1949', '');
			tourPopup('Conval', [50.84404, 0.47902], 'Metropolitan Convalescent Home', '1881-1988', '13/metropolitanconvalescent-air-1980', 'Bexhill Museum | c1980', '');
			tourPopup('Mhouse', [50.84523, 0.47927], 'Manor House', '1250-1967', '13/manorhouse-air-1955', 'Bexhill Museum | 1955', '');
			tourPopup('Sidley', [50.85407, 0.47485], 'Sidley Station', '1902-1971', '13/sidleystation-air-1959', '<a href="http://car57.zenfolio.com/" target="_blank">Michael Pannell</a> | 1959', '');
			imgLayer = ti;
			break;
		case 'boundary':
			show_overpass_layer(pois.boundary_stone.query, ti);
			imgLayer = ti;
			break;
		case 'surveyPoint':
			show_overpass_layer(pois.survey_point.query, ti);
			imgLayer = ti;
			break;
	}
	permalinkSet();
	}, 50);
}

// focus on individual pois
function tourFocus(ti, id) {
	if ($(window).width() < 768) $('.sidebar-close').click();
	if (imgLayer === ti) setTimeout(function () {
		if (ti === 'lost') imageOverlay._layers[id].openPopup();
		else iconLayer._layers[Object.keys(iconLayer._layers)[0]]._layers[id].openPopup();
	}, 50);
	else {
		if (ti === 'lost') {
			clear_map('overlay');
			tour(ti);
			setTimeout(function () { imageOverlay._layers[id].openPopup(); }, 50);
		}
		else {
			clear_map('overlay');
			rQuery = true;
			show_overpass_layer(elementType(id) + '(' + id.slice(1) + ');', id);
		}
	}
}

// load sources page, highlight and scroll to item
function tourSource(item) {
	$('#tourList').val(99).trigger('change');
	$('#tourFrame').one('load', function () {
		$(this).contents().find('ol:nth(1) > li').eq(item - 1).css('background-color', 'khaki');
		$(this).contents().find('body').scrollTop($(this).contents().find('ol:nth(1) > li').eq(item - 1).offset().top - 20);
	});
}
