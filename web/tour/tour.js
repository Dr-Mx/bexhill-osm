// links for tour pages

function tour(tourName) {
	// timeout hack to stop iframe breaking on ff
	setTimeout(function () {
		switch (tourName) {
			case 'fossils':
				map.removeLayer(imageOverlay);
				var dinoIcon = L.icon({
					iconUrl: 'tour/tour01/dinopark.png',
					iconSize: [32, 37],
					iconAnchor: [16, 35],
					shadowUrl: 'assets/img/icons/000shadow.png',
					shadowAnchor: [16, 27],
					popupAnchor: [0, -27]
				});
				imageOverlay = L.marker([50.837617, 0.482517], { icon: dinoIcon }).addTo(map).bindPopup('<div class="popup-header"><h3>Iguanadon Tracks</h3></div><span class="comment">50°50&#39;15.4"N 0°28&#39;57.1"E</span><br>View at low tide. Walk directly out onto the beach infront of Sackville Apartments. The tracks are just to the south-east of the two large rocks a few hundred yards out from the East Parade.<br>One footprint is about 18-inches long.', { maxWidth: 250 }).openPopup();
				break;
			case 'shipwreck':
				rQuery = true;
				show_overpass_layer('node(3192282124)(' + mapBbox + ');');
				break;
			case 'smugglingPanels':
				map.setZoom(15);
				show_overpass_layer('node["ref"~"^TST"](' + mapBbox + ');');
				break;
			case 'smugglingGreen':
				rQuery = true;
				show_overpass_layer('way(263267372)(' + mapBbox + ');');
				break;
			case 'railwayBexhillstation':
				rQuery = true;
				show_overpass_layer('way(397839677)(' + mapBbox + ');');
				break;
			case 'railwayWestbranch':
				map.removeLayer(imageOverlay);
				map.setZoom(15);
				imageOverlay = L.imageOverlay('tour/tour04/westbranchline.png', [[50.8860, 0.4625], [50.8400, 0.5100]], { opacity: 0.9 }).addTo(map);
				break;
			case 'railwayWeststation':
				rQuery = true;
				show_overpass_layer('node(318219478)(' + mapBbox + ');');
				break;
			case 'railwaySidleystation':
				rQuery = true;
				show_overpass_layer('node(3615179880)(' + mapBbox + ');');
				break;
			case 'railwayGlynegap':
				rQuery = true;
				show_overpass_layer('node(4033104292)(' + mapBbox + ');');
				break;
			case 'tramway':
				map.removeLayer(imageOverlay);
				map.setZoom(15);
				imageOverlay = L.imageOverlay('tour/tour05/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }).addTo(map);
				break;
			case 'motorTrack':
				map.removeLayer(imageOverlay);
				map.flyTo([50.83958, 0.48503], 17);
				imageOverlay = L.imageOverlay('tour/tour06/racetrack.png', [[50.84135, 0.47991], [50.83772, 0.49508]], { opacity: 0.9 }).addTo(map);
				break;
				case 'motorSerpollet':
				rQuery = true;
				show_overpass_layer('node(3592525934)(' + mapBbox + ');');
				break;
			case 'motorTrail':
				suggWalk('tmt');
				break;
			case 'delawarr':
				rQuery = true;
				show_overpass_layer('way(247116304)(' + mapBbox + ');');
				break;
			case 'manor':
				rQuery = true;
				show_overpass_layer('way(364593716)(' + mapBbox + ');');
				break;
			case 'ww2Buildings':
				map.removeLayer(imageOverlay);
				show_overpass_layer('(node["military"~"."](' + mapBbox + ');way["military"~"."](' + mapBbox + '););');
				break;
			case 'ww2Bombs':
				map.removeLayer(imageOverlay);
				$.ajax({
					url: 'tour/tour09/ww2bombs.geojson',
					dataType: 'json',
					mimeType: "application/json",
					success: function (json) {
						var highlight = 'darkred';
						var interact = siteDebug ? true : false;
						imageOverlay = L.geoJSON(json, {
							filter: function (feature) {
								if (feature.properties) {
									highlight = 'darkorange';
									interact = true;
								}
								return true;
							},
							onEachFeature: function (feature, layer) {
								// push any additional information into a popup
								if (feature.properties) {
									var customOptions = {};
									customOptions.maxWidth = ($(window).width() < 768) ? imgSize : 350;
									layer.bindTooltip(feature.properties.name);
									var markerPopup = L.Util.template('<div class="popup-header"><h3>{title}</h3></div>', { title: feature.properties.name });
									markerPopup += L.Util.template(tagTmpl, { tag: 'Date', value: feature.properties.date, iconName: 'calendar' });
									markerPopup += '<span class="popup-longDesc">' + L.Util.template(tagTmpl, { tag: 'Description', value: feature.properties.description, iconName: 'pencil-square-o' }) + '</span>';
									if (feature.properties.image) {
										customOptions.minWidth = imgSize;
										markerPopup += '<p><div class="popup-imgContainer">' +
											'<img src="tour/tour09/' + feature.properties.image + '"><br>' +
											'<span class="popup-imgAttrib">&copy; Bexhill Museum</span></div>';
									}
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
						}).addTo(map);
					}
				});
				break;
			case 'northeye':
				rQuery = true;
				show_overpass_layer('way(28940913)(' + mapBbox + ');');
				break;
			case 'source':
				$('#tourList').val(99);
				$('#tourList').trigger('change');
				break;
		}
	}, 50);
}
