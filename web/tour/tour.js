// links for tour pages
var imgLayer;
function tour(ti) {
	clear_map();
	if ($(window).width() < 768) sidebar.close();
	var tourPopup = function (name, pos, header, headerSub, img, imgCredit, markerPopup) {
		var marker = L.circleMarker(pos, { interactive: true, radius: 15, weight: 2, color: '#b05000', opacity: 0.8, fillColor: '#fff', fillOpacity: 0.5 })
			.bindPopup(
				'<div class="popup-header"><h3>' + header + '</h3><span class="popup-header-sub">' + headerSub + '</span></div>' + markerPopup +
				'<div id="img0" class="popup-imgContainer"><img alt="Loading image..." style="max-width:' + imgSize + 'px; max-height:' + imgSize + 'px;" src="tour/tour' + img + '.jpg"><br>' +
				'<div class="popup-imgAttrib">&copy; ' + imgCredit + '</div></div>',
				{ minWidth: imgSize, maxWidth: imgSize }
			)
			.bindTooltip('<b>' + header + '</b><br><i>' + headerSub + '</i>', { direction: 'right' });
		marker._leaflet_id = name;
		imageOverlay.addLayer(marker);
	};
	// timeout hack to stop iframe breaking on ff
	setTimeout(function () { switch (ti) {
		case 'xmas':
			xmasShops();
			break;
		case 'fossils':
			tourPopup(ti, [50.837617, 0.482517], 'Fossils', 'Iguanadon Tracks', '01/dinoprint', 'Vicky Ballinger',
				'<span class="comment">50°50&#39;15.4"N 0°28&#39;57.1"E</span><br>' +
				'View at low tide. Walk directly out onto the beach infront of Sackville Apartments. ' +
				'The tracks are just to the south-east of the two large rocks a few hundred yards out from the East Parade.<br>' +
				'One footprint is about 18-inches long.<p>'
			);
			imageOverlay.addTo(map)._layers[ti].openPopup();
			imgLayer = ti;
			break;
		case 'shipwreck':
			rQuery = true;
			show_overpass_layer('node(3192282124);');
			break;
		case 'smugglingPanels':
			show_overpass_layer('node["ref"~"^TST"];');
			imgLayer = ti;
			break;
		case 'smugglingGreen':
			rQuery = true;
			show_overpass_layer('way(263267372);');
			break;
		case 'railwayBexhillstation':
			rQuery = true;
			show_overpass_layer('way(397839677);');
			break;
		case 'railwayWestbranch':
			show_overpass_layer('(node(3615179880);node(318219478););');
			if (actOverlayLayer !== 'br1959') map.addLayer(tileOverlayLayers[tileOverlayLayer.br1959.name]);
			imgLayer = ti;
			break;
		case 'railwayGlynegap':
			rQuery = true;
			show_overpass_layer('node(4033104292);');
			break;
		case 'tramway':
			imageOverlay.addLayer(L.imageOverlay('tour/tour05/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
			map.flyToBounds(imageOverlay.getBounds());
			imgLayer = ti;
			break;
		case 'motorTrack':
			imageOverlay.addLayer(L.imageOverlay('tour/tour06/racetrack.png', [[50.84135, 0.47991], [50.83772, 0.49508]], { opacity: 0.9 }));
			map.flyTo([50.84027, 0.48898], 17);
			imgLayer = ti;
			break;
		case 'motorSerpollet':
			rQuery = true;
			show_overpass_layer('node(3592525934);');
			break;
		case 'motorTrail':
			show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););');
			imgLayer = ti;
			break;
		case 'delawarr':
			iconLayer.clearLayers();
			rQuery = true;
			show_overpass_layer('way(247116304);');
			break;
		case 'manor':
			rQuery = true;
			show_overpass_layer('way(364593716);');
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
					var highlight, interact;
					imageOverlay.addLayer(L.geoJSON(json, {
						filter: function (feature) {
							if (feature.properties.name) {
								highlight = 'darkorange';
								interact = true;
							}
							else {
								highlight = 'darkgray';
								interact = $('#settings #inputDebug').is(':checked') ? true : false;
							}
							return true;
						},
						onEachFeature: function (feature, layer) {
							// push any additional information into a popup
							if (feature.properties.name) {
								var customOptions = {}, toolTip = '', markerPopup = '';
								customOptions.maxWidth = imgSize;
								markerPopup += '<div class="popup-header"><h3>' + feature.properties.name + '</h3></div>' +
									L.Util.template(tagTmpl, { tag: 'Date', value: date_parser(feature.properties.date, 'long'), iconName: 'fas fa-calendar-alt' });
								toolTip += '<b>' + feature.properties.name + '</b><br><i>' + date_parser(feature.properties.date, 'short') + '</i>';
								if (feature.properties.description) {
									markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Description', value: feature.properties.description, iconName: 'fas fa-pen-square' }) + '</span>';
									toolTip += ' <i style="color:#808080;" class="fas fa-pen-square fa-fw"></i>';
								}
								if (feature.properties.img) {
									customOptions.minWidth = imgSize;
									var imgAttrib = feature.properties.imgattrib ? feature.properties.imgattrib : "Bexhill Observer";
									var displayImage = function (img, id, display) {
										return markerPopup += '<div id="img' + id + '" class="popup-imgContainer" style="display:' + display + ';">' +
											'<img alt="Loading image..." style="max-width:' + imgSize + 'px; max-height:' + (imgSize - 50) + 'px;" src="tour/tour09/bomb/' + img + '.jpg"><br>' +
											'<div class="popup-imgAttrib">&copy; ' + imgAttrib + '</div></div>';
									};
									displayImage(feature.properties.img, 0, 'inherit');
									if (feature.properties.img_1) {
										for (x = 1; x <= 5; x++) {
											if (feature.properties['img_' + x]) {
												lID = x;
												displayImage(feature.properties['img_' + x], x, 'none');
											}
										}
										// show navigation controls
										markerPopup += '<div class="navigateItem">' +
											'<span class="theme navigateItemPrev"><a title="Previous image" onclick="navImg(0);"><i class="fas fa-caret-square-left fa-fw"></i></a></span>' +
											'<i class="fas fa-image fa-fw" title="1 of ' + parseInt(lID+1) + '"></i>' +
											'<span class="theme navigateItemNext"><a title="Next image" onclick="navImg(1);"><i class="fas fa-caret-square-right fa-fw"></i></a></span>' +
											'</div>';
										toolTip += ' <i style="color:#808080;" class="fas fa-images fa-fw"></i>';
									}
									else toolTip += ' <i style="color:#808080;" class="fas fa-image fa-fw"></i>';
								}
								layer
									.bindPopup(markerPopup, customOptions)
									.bindTooltip(toolTip, { direction: 'right', offset: [8, 0] });
							}
							else if (interact) layer.bindTooltip(feature.geometry.coordinates.toString());
						},
						pointToLayer: function (feature, latlng) {
							return L.circle(latlng, {
								color: 'firebrick',
								fillColor: highlight,
								fillOpacity: 0.5,
								weight: 2,
								radius: 15,
								interactive: interact
							});
						}
					}));
					$('#spinner').fadeOut('fast');
				}
			});
			imgLayer = ti;
			break;
		case 'ww2Structures':
			show_overpass_layer('(node(3572364302);node(3944803214);node(2542995381);node(4056582954);node["military"];way["military"];);');
			imgLayer = ti;
			break;
		case 'northeye':
			rQuery = true;
			show_overpass_layer('way(28940913);');
			break;
		case 'peopleNarayan':
			rQuery = true;
			show_overpass_layer('way(247118625);');
			break;
		case 'peopleIxion':
			rQuery = true;
			show_overpass_layer('node(3989026714);');
			break;
		case 'peopleBaird':
			rQuery = true;
			show_overpass_layer('node(3971492451);');
			break;
		case 'peopleLlewelyn':
			rQuery = true;
			show_overpass_layer('way(393451834);');
			break;
		case 'peopleMilligan':
			rQuery = true;
			show_overpass_layer('way(419719683);');
			break;
		case 'clocks':
			show_overpass_layer(pois.clock.query + ';');
			imgLayer = ti;
			break;
		case 'lost':
			tourPopup('Wshelt', [50.83651, 0.46601], 'West Parade Shelters', '1904-1977', '13/westparadeshelter-air-1931', '<a href="https://britainfromabove.org.uk/en/image/EPW035331" target="_blank">Historic England</a> | 1931', '');
			tourPopup('Metrop', [50.83754, 0.47045], 'Metropole Hotel', '1897-1955', '13/metropolehotel-air-1929', 'Bexhill Museum | 1929', '');
			tourPopup('Fount1', [50.83734, 0.47175], 'Memorial Fountain', '1913-1934', '13/memorialfountain-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026233" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Fount2', [50.83756, 0.46703], 'Memorial Fountain', '1934-1963', '13/memorialfountain-1956', '<a href="https://thebexhillhistorytrail.wordpress.com" target="_blank">Dr Paul Wright</a> | Postcard, 1956', '');
			tourPopup('Marina', [50.83763, 0.47357], 'Marina Court', '1901-1970', '13/marinacourt-air-1920', '<a href="https://britainfromabove.org.uk/en/image/EPW000708" target="_blank">Historic England</a> | 1920', '');
			tourPopup('Marine', [50.83798, 0.47435], 'Marine Hotel', '1895-1954', '13/robertsmarine-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026226" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Kursaa', [50.83759, 0.47714], 'Kursaal', '1896-1936', '13/kursaal-air-1926', '<a href="https://britainfromabove.org.uk/en/image/EPW016888" target="_blank">Historic England</a> | 1926', '');
			tourPopup('Granvi', [50.84027, 0.47750], 'Granville Hotel', '1902-2003', '13/granville-1997', 'Frank Burtenshaw‎ | Brochure, 1997', '');
			tourPopup('Riposo', [50.83968, 0.48395], 'Hotel Riposo', '1901-1961', '13/riposo-air-1929', '<a href="https://britainfromabove.org.uk/en/image/EPW026230" target="_blank">Historic England</a> | 1929', '');
			tourPopup('Ritzci', [50.84156, 0.47294], 'Ritz Cinema', '1937-1961', '13/ritz-air-1949', '<a href="https://britainfromabove.org.uk/en/image/EAW022974" target="_blank">Historic England</a> | 1949', '');
			tourPopup('Conval', [50.84404, 0.47902], 'Metropolitan Convalescent Home', '1881-1988', '13/metropolitanconvalescent-air-1980', 'Bexhill Museum | c1980', '');
			tourPopup('Mhouse', [50.84523, 0.47927], 'Manor House', '1250-1967', '13/manorhouse-air-1955', 'Bexhill Museum | 1955', '');
			tourPopup('Sidley', [50.85407, 0.47485], 'Sidley Station', '1902-1971', '13/sidleystation-air-1959', '<a href="http://car57.zenfolio.com/" target="_blank">Michael Pannell</a> | 1959', '');
			imageOverlay.addTo(map);
			imgLayer = ti;
			break;
	}}, 50);
}

function tourFocus(ti, id) {
	if ($(window).width() < 768) sidebar.close();
	if (imgLayer === ti) setTimeout(function () {
		if (ti === 'lost') imageOverlay._layers[id].openPopup();
		else iconLayer._layers[Object.keys(iconLayer._layers)[0]]._layers[id].openPopup();
	}, 50);
	else {
		if (ti === 'lost') {
			clear_map();
			tour(ti);
			setTimeout(function () { imageOverlay._layers[id].openPopup(); }, 50);
		}
		else {
			var type;
			switch (id.slice(0, 1)) {
				case 'n': type = 'node'; break;
				case 'w': type = 'way'; break;
				case 'r': type = 'relation'; break;
			}
			clear_map();
			rQuery = true;
			show_overpass_layer(type + '(' + id.slice(1) + ');');
		}
	}
}

// load source frame, highlight and scroll to item
function tourSource(item) {
	$('#tourList').val(99).trigger('change');
	$('#tourFrame').one('load', function () {
		$(this).contents().find('ol:nth(1) > li').eq(item - 1).css('background-color', 'khaki');
		$(this).contents().scrollTop($(this).contents().find('ol:nth(1) > li').eq(item - 1).offset().top - 20);
	});
}
