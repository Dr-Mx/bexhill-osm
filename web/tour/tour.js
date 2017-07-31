// links for tour pages
var imgLayer;
function tour(ti) {
	clear_map();
	if ($(window).width() < 768) sidebar.close();
	// timeout hack to stop iframe breaking on ff
	setTimeout(function () {
		switch (ti) {
			case 'fossils':
				var dinoIcon = L.icon({
					iconUrl: 'tour/tour01/dinopark.png',
					iconSize: [32, 37],
					iconAnchor: [16, 35],
					shadowUrl: 'assets/img/icons/000shadow.png',
					shadowAnchor: [16, 27],
					popupAnchor: [0, -27]
				});
				imageOverlay.addLayer(L.marker([50.837617, 0.482517], { icon: dinoIcon }).addTo(map).bindPopup(
					'<div class="popup-header"><h3>Iguanadon Tracks</h3></div>' +
					'<span class="comment">50°50&#39;15.4"N 0°28&#39;57.1"E</span><br>' +
					'View at low tide. Walk directly out onto the beach infront of Sackville Apartments. ' +
					'The tracks are just to the south-east of the two large rocks a few hundred yards out from the East Parade.<br>' +
					'One footprint is about 18-inches long.' +
					'<p><div class="popup-imgContainer"><img alt="Loading image..." style="max-width:' + imgSize + 'px; max-height:' + imgSize + 'px;" src="tour/tour01/dinoprint.jpg"><br>' +
					'<span class="popup-imgAttrib">&copy; Vicky Ballinger</span></div>',
				{ maxWidth: imgSize }).openPopup());
				imgLayer = ti;
				break;
			case 'shipwreck':
				rQuery = true;
				show_overpass_layer('node(3192282124)(mapBbox);');
				break;
			case 'smugglingPanels':
				show_overpass_layer('node["ref"~"^TST"](mapBbox);');
				imgLayer = ti;
				break;
			case 'smugglingGreen':
				rQuery = true;
				show_overpass_layer('way(263267372)(mapBbox);');
				break;
			case 'railwayBexhillstation':
				rQuery = true;
				show_overpass_layer('way(397839677)(mapBbox);');
				break;
			case 'railwayWestbranch':
				imageOverlay.addLayer(L.imageOverlay('tour/tour04/westbranchline.png', [[50.8860, 0.4625], [50.8400, 0.5100]], { opacity: 0.9 }));
				imgLayer = ti;
				break;
			case 'railwayWeststation':
				rQuery = true;
				show_overpass_layer('node(318219478)(mapBbox);');
				break;
			case 'railwaySidleystation':
				rQuery = true;
				show_overpass_layer('node(3615179880)(mapBbox);');
				break;
			case 'railwayGlynegap':
				rQuery = true;
				show_overpass_layer('node(4033104292)(mapBbox);');
				break;
			case 'tramway':
				imageOverlay.addLayer(L.imageOverlay('tour/tour05/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
				imgLayer = ti;
				break;
			case 'motorTrack':
				map.flyTo([50.83958, 0.48503], 17);
				imageOverlay.addLayer(L.imageOverlay('tour/tour06/racetrack.png', [[50.84135, 0.47991], [50.83772, 0.49508]], { opacity: 0.9 }));
				imgLayer = ti;
				break;
			case 'motorSerpollet':
				rQuery = true;
				show_overpass_layer('node(3592525934)(mapBbox);');
				break;
			case 'motorTrail':
				show_overpass_layer('node["ref"~"^TMT"](mapBbox);');
				imgLayer = ti;
				break;
			case 'delawarr':
				iconLayer.clearLayers();
				rQuery = true;
				show_overpass_layer('way(247116304)(mapBbox);');
				break;
			case 'manor':
				rQuery = true;
				show_overpass_layer('way(364593716)(mapBbox);');
				break;
			case 'ww2Buildings':
				show_overpass_layer('(node["military"~"."](mapBbox);way["military"~"."](mapBbox););');
				imgLayer = ti;
				break;
			case 'ww2Bombmap':
				// bomb radius outline
				var x = 1;
				while (x <= 5) {
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
					x++;
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
									highlight = 'darkred';
									interact = $('#settings #inputDebug').is(':checked') ? true : false;
								}
								return true;
							},
							onEachFeature: function (feature, layer) {
								// push any additional information into a popup
								if (feature.properties.name) {
									var customOptions = {}, toolTip = '';
									toolTip += '<b>' + feature.properties.name + '</b><br><i>' + date_parser(feature.properties.date, 'short') + '</i>';
									customOptions.maxWidth = imgSize;
									var markerPopup = L.Util.template('<div class="popup-header"><h3>{title}</h3></div>', { title: feature.properties.name });
									markerPopup += L.Util.template(tagTmpl, { tag: 'Date', value: date_parser(feature.properties.date, 'long'), iconName: 'calendar' });
									if (feature.properties.description) {
										toolTip += ' <i style="color:#808080;" class="fa fa-pencil-square-o fa-fw"></i>';
										markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Description', value: feature.properties.description, iconName: 'pencil-square-o' }) + '</span>';
									}
									if (feature.properties.img) {
										//console.log(layer.getTooltip());
										toolTip += ' <i style="color:#808080;" class="fa fa-picture-o fa-fw"></i>';
										customOptions.minWidth = imgSize;
										markerPopup += '<p><div class="popup-imgContainer">' +
											'<img alt="Loading image..." style="max-width:' + imgSize + 'px; max-height:' + imgSize + 'px;" src="tour/tour09/bomb/' + feature.properties.img + '.jpg"><br>' +
											'<span class="popup-imgAttrib">&copy; Bexhill Observer</span></div>';
									}
									layer.bindTooltip(toolTip, { direction: 'left', offset: [-5, 0] });
									layer.bindPopup(markerPopup, customOptions);
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
					}
				});
				imgLayer = ti;
				break;
			case 'northeye':
				rQuery = true;
				show_overpass_layer('way(28940913)(mapBbox);');
				break;
			case 'peopleNarayan':
				rQuery = true;
				show_overpass_layer('way(247118625)(mapBbox);');
				break;
			case 'peopleIxion':
				rQuery = true;
				show_overpass_layer('node(3989026714)(mapBbox);');
				break;
			case 'peopleBaird':
				rQuery = true;
				show_overpass_layer('node(3971492451)(mapBbox);');
				break;
			case 'peopleLlewelyn':
				rQuery = true;
				show_overpass_layer('way(393451834)(mapBbox);');
				break;
			case 'peopleMilligan':
				rQuery = true;
				show_overpass_layer('way(395641316)(mapBbox);');
				break;
		}
	}, 50);
}

// load source frame, highlight and scroll to item
function source(item) {
	$('#tourList').val(99);
	$('#tourList').trigger('change');
	$('#tourFrame').one('load', function () {
		$(this).contents().find('ol li').eq(item + 2).css('background-color', 'khaki');
		$(this).contents().scrollTop($(this).contents().find('ol li').eq(item + 2).offset().top - 20);
	});
}
