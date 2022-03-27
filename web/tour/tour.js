// history tour pages

var actImgLayer, slideShow = { firstrun: true, auto: true };
function tour(ti, fromPermalink) {
	var lID, dfltDir = 'tour/';
	if (!fromPermalink) clear_map('markers');
	if ($(window).width() < 768 && !fromPermalink && ti !== 'thennow') $('.sidebar-close:visible').click();
	// general markers
	// coordinates | clickable | icon | has popup
	var setMarker = function(latlng, interactive, icon, popup) {
		var marker;
		if (icon) {
			if (icon.iconUrl) marker = L.marker(latlng, {
				icon: L.icon({
					className: icon.className,
					iconUrl: dfltDir + icon.iconUrl + '.png',
					iconSize: icon.iconSize,
					iconAnchor: icon.iconAnchor || null,
					shadowUrl: (icon.shadowUrl ? dfltDir + icon.shadowUrl + '.png' : null),
					shadowAnchor: icon.shadowAnchor || null,
					popupAnchor: icon.popupAnchor || null,
					tooltipAnchor: [Math.round(icon.iconSize[0]/2)-8, 0]
				}),
				interactive: interactive,
				bounceOnAdd: (icon.iconNoBounce ? false : true),
				keyboard: false,
				riseOnHover: true
			});
			else marker = L.circle(latlng, {
				className: icon.className,
				interactive: interactive,
				radius: 20,
				weight: 1,
				color: '#000',
				opacity: 1,
				fillColor: icon.fillColor,
				fillOpacity: 0.75
			});
		}
		else marker = L.circleMarker(latlng, {
			interactive: interactive,
			radius: 14,
			weight: 4,
			color: $('html').css('--main-color'),
			opacity: 1,
			fillColor: '#fff',
			fillOpacity: 0.5
		});
		if (popup) marker.on('click', function(e) {
			// enable autopan after initial permalink popup, check if sidebar is open
			e.sourceTarget._popup.options.autoPan = true;
			e.sourceTarget._popup.options.autoPanPaddingTopLeft = ($(window).width() < 1300) ? [20, 40] : [sidebar.width() + 50, 5];
		});
		return marker;
	};
	// tooltip and pop-up
	// data | layer | [main header, subheader, date subheader] | image attribution | marker popup class
	var setJsonPopup = function(feature, layer, header, dfltAttrib, pClass) {
		var toolTip = '', markerPopup = '', customPOptions = {
			className: pClass,
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: feature.properties.img ? imgSize : '',
			autoPanPaddingBottomRight: [5, 50],
			autoPan: noPermalink ? true : false
		};
		markerPopup += generic_header_parser(header[0], (header[1] ? header[1] : date_parser(header[2], 'long')));
		toolTip += '<b>' + header[0] + '</b><br/><i>' + (header[1] ? header[1] : date_parser(header[2], 'short')) + '</i>';
		markerPopup += '<div class="popup-body"><span class="comment">' + L.Util.formatNum(layer._latlng.lat, 5) + '°N ' + L.Util.formatNum(layer._latlng.lng, 5) + '°E | ' + wgs84ToGridRef(layer._latlng.lat, layer._latlng.lng, 6) + '</span>';
		if (feature.properties.description) {
			markerPopup += '<span class="popup-longDesc custscroll">' + feature.properties.description + '</span>';
			toolTip += ' <i style="color:#777;min-width:17px;" class="fas fa-bars fa-fw" title="Notes"></i>';
		}
		if (feature.properties.link) {
			markerPopup += '<span class="popup-tagValue"><a class="popup-truncate" style="max-width:' + imgSize + 'px;" href="' +
				(feature.properties.link.indexOf('http') === 0 ? feature.properties.link : 'tel:' + feature.properties.link) +
				'" target="_blank" rel="noopener" title="' + feature.properties.link + '">' + feature.properties.link + '</a></span>';
		}
		if (feature.properties.img) {
			var imgIcon = 'image';
			customPOptions.minWidth = imgSize;
			$.each(feature.properties.img, function(x) {
				if (feature.properties.imgattrib && feature.properties.imgattrib[x]) {
					dfltAttrib = feature.properties.imgattrib[x];
					if (feature.properties.imgattriburl && feature.properties.imgattriburl[x]) dfltAttrib = '<a href="' + feature.properties.imgattriburl[x] + '" target="blank">' + dfltAttrib + '</a>';
				}
				markerPopup += generic_img_parser((feature.properties.img[x].indexOf('File:') === 0) ? feature.properties.img[x] : (dfltDir + feature.properties.img[x] + '.jpg'), x, dfltAttrib);
				lID = x;
			});
			if (feature.properties.img[1]) {
				markerPopup += show_img_controls(parseInt(+lID+1));
				imgIcon += 's';
			}
			if (feature.properties.img[0].indexOf('000placehldr') === -1) toolTip += ' <i style="color:#777;min-width:17px;" class="fas fa-' + imgIcon + ' fa-fw" title="' + titleCase(imgIcon) + '"></i>';
		}
		markerPopup += '</div>';
		layer
			.bindPopup(markerPopup, customPOptions)
			.bindTooltip(toolTip, {
				direction: 'right',
				offset: [8, 0],
				className: pClass,
				opacity: noTouch ? 1 : 0
			});
	};
	// set active tour and notify sidebar if sidebar closed
	var setTour = function(tourVal) {
		actImgLayer = ti;
		if (actTab === 'none' && fromPermalink) {
			$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif').show();
			$('#tourList').val(tourVal).trigger('change');
		}
	};
	// timeout hack to stop iframe breaking on ff
	setTimeout(function() { switch (ti) {
		case 'pano':
			// https://www.mapillary.com/developer/api-documentation/#search-sequences
			// get mapillary sequences
			$('.spinner').show();
			fcnStLvl.state('onStLvl');
			$.ajax({
				// downloaded daily via cron job
				// url: 'https://a.mapillary.com/v3/sequences?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',') + '&usernames=bexhill_osm&client_id=' + window.BOSM.mpllryKey,
				url: 'assets/data/panoramas.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.clearLayers().addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							layer.on('click', function(e) { panoView(e, true); });
						},
						style: {
							color: '#2074B6',
							opacity: 0.7,
							weight: noTouch ? 6 : 8
						}
					})).addLayer(L.geoJSON(json, {
						interactive: false,
						style: {
							color: 'cyan',
							opacity: 0.6,
							weight: noTouch ? 1 : 3
						}
					}));
					$('.spinner').fadeOut(200);
				},
				error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR PANORAMAS:', encodeURI(this.url)); }
			});
			actImgLayer = 'pano';
			break;
		case 'notes':
			// https://wiki.openstreetmap.org/wiki/API_v0.6#Map_Notes_API
			// get osm notes
			$('.spinner').show();
			$.ajax({
				url: 'https://api.openstreetmap.org/api/0.6/notes.json?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
				dataType: 'json',
				mimeType: 'application/json',
				cache: true,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							var fp = feature.properties;
							fp.description = '<a onclick="improveMap({\'latlng\': { \'lat\':\'' + feature.geometry.coordinates[1] + '\', \'lng\':\'' + feature.geometry.coordinates[0] + '\' }}, \'' + fp.id + '\');">' +
								'osm.org/note/' + fp.id + '</a><hr/>';
							$.each(fp.comments, function(c) {
								if (fp.comments[c].text) fp.description += L.Util.template(tagTmpl, {
									tag: (fp.comments[c].user ? '<a href="' + fp.comments[c].user_url + '" target="_blank" rel="noopener">' + fp.comments[c].user + '</a>' : 'Anonymous'),
									value: '<span title="' + fp.comments[c].date + '">' + fp.comments[c].text + '</span>',
									iconName: 'far fa-comment'
								});
							});
							fp.description += '<hr/><span class="comment"><i class="fas fa-' + (fp.closed_at ? 'check"></i> Resolved: ' + date_parser(fp.closed_at.split(' ')[0], 'long') : 'times"></i> Currently unresolved') + '</span>';
							setJsonPopup(feature, layer, [titleCase(fp.status + ' note'), date_parser(fp.date_created.split(' ')[0], 'long')]);
						},
						pointToLayer: function (feature, latlng) {
							var marker = setMarker(latlng, true, {
								iconUrl: '/../../assets/img/leaflet/' + feature.properties.status + '_note_marker',
								iconSize: [25, 41],
								iconAnchor: [12, 41],
								shadowUrl: '/../../assets/img/leaflet/marker-shadow',
								shadowAnchor: [12, 41],
								popupAnchor: [0, -30]
							}, true);
							marker.ohState = (feature.properties.status === 'open' ? 'false' : 'true');
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					if ($('#inputDebug').is(':checked')) console.debug('OSM Notes:', json);
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
					setPageTitle('OSM Notes');
					if (markerId) map._layers[markerId].openPopup().stopBounce();
					$('.spinner').fadeOut('fast');
				},
				error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-NOTES:', encodeURI(this.url)); }
			});
			actImgLayer = ti;
			break;
		case 'xmas2017': /* fall through */
		case 'xmas2018': /* fall through */
		case 'xmas2019': /* fall through */
		case 'xmas2020': /* fall through */
		case 'xmas':
			var xmasYear = (ti.length > 4) ? ti.split('xmas')[1] : '2021';
			$('.spinner').show();
			if (actOverlayLayer === undefined) map.addLayer(tileOverlayLayers[tileOverlayLayer.xmas.name]);
			$.ajax({
				url: dfltDir + 'itemXmas/' + xmasYear + '.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function (json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							var winner = feature.properties.winner, winnerTxt = ['Highly Commended', 'First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'],
								winnerIco = ['award', 'trophy', 'medal', 'medal', 'medal', 'medal'], winnerEle = '';
							if (winner >= 0) winnerEle = '<i class="award commended' + winner + ' fas fa-' + winnerIco[winner] + '" title="' + winnerTxt[winner] + '"></i> ' + winnerTxt[winner];
							if (!feature.properties.img) feature.properties.img = { '0': 'itemXmas/000placehldr' };
							setJsonPopup(feature, layer, [feature.properties.name, winnerEle, ''], '', 'popup-xmas');
						},
						pointToLayer: function (feature, latlng) {
							var marker = setMarker(latlng, true, {
								iconUrl: 'itemXmas/window',
								iconSize: [32, 37],
								iconAnchor: [16, 37],
								iconNoBounce: true,
								shadowUrl: '/../../assets/img/icons/000shadow',
								shadowAnchor: [16, 35],
								popupAnchor: [0, -24]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Xmas Window Competition ' + xmasYear);
					if (markerId) map._layers[markerId].openPopup().stopBounce();
					else map.flyToBounds(imageOverlay.getBounds().pad(0.2));
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = ti;
			break;
		case 'scarecrow':
			$('.spinner').show();
			// ward outlines
			$.ajax({
				url: dfltDir + 'itemScarecrow/boundary.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: true,
				success: function (json) { imageOverlay.addLayer(L.geoJSON(json, { style: { color: 'darkcyan', opacity: 0.5 }, interactive: false })); }
			});
			// markers
			$.ajax({
				url: dfltDir + 'itemScarecrow/2020.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function (json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							var winner = feature.properties.winner, winnerTxt = ['', 'First Prize', 'Second Prize'],
								winnerIco = ['', 'trophy', 'medal'], subtitleEle = feature.properties.ward;
							if (winner > 0) subtitleEle = '<i class="award commended' + winner + ' fas fa-' + winnerIco[winner] + '" title="' + winnerTxt[winner] + '"></i> ' + winnerTxt[winner] + ' - ' + subtitleEle;
							if (!feature.properties.img) feature.properties.img = { '0': 'itemScarecrow/000placehldr' };
							setJsonPopup(feature, layer, [feature.properties.name, subtitleEle], '', 'popup-scarecrow');
							feature.properties.sortby = feature.properties.winner ? feature.properties.ward + feature.properties.winner : feature.properties.ward + '9';
							if ($('#inputDebug').is(':checked')) console.debug(feature.properties.name + '|' + feature.properties.ward + '|' + (feature.properties.img ? 'yes' : 'no'));
						},
						pointToLayer: function (feature, latlng) {
							var marker = setMarker(latlng, true, {
								iconUrl: 'itemScarecrow/scarecrow' + (feature.properties.winner === 1 ? 'Win' : ''),
								iconSize: [35, 37],
								iconAnchor: [17, 37],
								iconNoBounce: true,
								shadowUrl: '/../../assets/img/icons/000shadow',
								shadowAnchor: [20, 33],
								popupAnchor: [0, -27]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.sortby'); }, 250);
					setPageTitle('Christmas Scarecrow Competition');
					if (markerId) map._layers[markerId].openPopup().stopBounce();
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = ti;
			break;
		case 'thennow':
			if (actTab === 'thennow') $('#thennowLoading').show();
			else $('.spinner').show();
			$.ajax({
				url: dfltDir + 'itemThenNow/thennow.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					$('#thennowNum').html(json.features.length);
					$('#thennow .sidebar-body div').empty();
					imageOverlay.addLayer(L.geoJSON(json, {
						pointToLayer: function(feature, latlng) {
							var tnBody = '<hr/><h3>' + feature.properties.imgcaption['1'] + ' (' + feature.properties.date + ')</h3>' +
								'<p><a href="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(1).jpg" data-fancybox="' + feature.properties.id + '" data-caption="' + feature.properties.imgcaption['1'] + '">' +
								'<img id="' + feature.properties.id + '" src="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(0).jpg"/></a>';
							// find number of images based on caption count
							$.each(feature.properties.imgcaption, function(x) {
								if (+x > 1) tnBody += '<a style="display:none;" href="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(' + (x) + ').jpg" data-fancybox="' + feature.properties.id +
								'" data-caption="' + feature.properties.imgcaption[x] + '"/></a>';
							});
							$('#thennow .sidebar-body div').append(tnBody + '<span class="comment">' + feature.properties.desc + '</span></p>');
							$('[data-fancybox="' + feature.properties.id + '"]').fancybox({
								protect: true,
								transitionEffect: 'fade',
								transitionDuration: 7500,
								slideShow: { speed: 2500 },
								afterLoad: function() {
									// cancel slideshow if left/right arrows clicked
									$('.fancybox-button--arrow_left, .fancybox-button--arrow_right').on('click touchstart', function() {
										$.fancybox.getInstance().SlideShow.stop();
										slideShow.firstrun = false;
									});
									// add delay before starting slideshow
									setTimeout(function() { if (slideShow.auto && slideShow.firstrun && $.fancybox.getInstance()) {
										$.fancybox.getInstance().SlideShow.start();
										slideShow.firstrun = false;
									} }, 5000);
								},
								beforeClose: function() {
									// remember slideshow state
									slideShow.auto = ($('.fancybox-button--play').length) ? false : true;
									slideShow.firstrun = true;
								}
							});
							var marker = setMarker(latlng, true, false, false);
							marker.bindTooltip(feature.properties.imgcaption['1'] + '<img src="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(0).jpg"/>', { className: 'thennowTip', opacity: noTouch ? 1 : 0 });
							marker.on('click', function() {
								$('#' + feature.properties.id)[0].scrollIntoView({ block: 'center' });
								$('#' + feature.properties.id).click();
							});
							marker._leaflet_id = feature.properties.id;
							return marker;
						}
					}));
					setPageTitle('Then and Now');
					if (!fromPermalink) zoom_area();
					else map.fireEvent('zoomend');
					if (noTouch) $('#thennow img').hover(
						function() { map._layers[this.id].openTooltip(); },
						function() { map._layers[this.id].closeTooltip(); }
					);
					actImgLayer = ti;
					$('.spinner').fadeOut('fast');
				}
			});
			break;
		case 'historical':
			show_overpass_layer(pois.historic.query, ti, true, true);
			setPageTitle(pois.historic.name);
			setTour('bexhill');
			break;
		case 'fossils':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listPrehistory/dinofoot.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, '']);
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Dinosaur Footprints');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('prehistory');
			break;
		case 'shipwreck':
			rQuery = true;
			show_overpass_layer('node(3192282124);', ti);
			setTour('amsterdam');
			break;
		case 'smugglingPanels':
			show_overpass_layer('node["ref"~"^TST"];', ti, true);
			setPageTitle('Smuggling Trail');
			setTour('smuggling');
			break;
		case 'sidleyGreen':
			rQuery = true;
			show_overpass_layer('way(263267372);', ti);
			setTour('smuggling');
			break;
		case 'bexhillStation':
			rQuery = true;
			show_overpass_layer('way(397839677);', ti);
			setTour('railways');
			break;
		case 'westBranch':
			show_overpass_layer('(node(6528018966);node(318219478););', ti);
			if (actOverlayLayer !== 'br1959') map.addLayer(tileOverlayLayers[tileOverlayLayer.br1959.name]);
			setTour('railways');
			break;
		case 'glynegapStation':
			rQuery = true;
			show_overpass_layer('node(4033104292);', ti);
			setTour('railways');
			break;
		case 'tramway':
			imageOverlay.addLayer(L.imageOverlay(dfltDir + 'listTrams/img/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
			if (!fromPermalink) map.flyToBounds(imageOverlay.getBounds().pad(0.2));
			setPageTitle('Tramway Route');
			setTour('trams');
			break;
		case 'motorTrack':
			if (actOverlayLayer !== 'mt1902') map.addLayer(tileOverlayLayers[tileOverlayLayer.mt1902.name]);
			if (!fromPermalink) map.flyToBounds(tileOverlayLayer.mt1902.bounds);
			setPageTitle('1902 Motor Racing Track');
			setTour('racing');
			break;
		case 'motorSerpollet':
			rQuery = true;
			show_overpass_layer('node(3592525934);', ti);
			setTour('racing');
			break;
		case 'motorTrail':
			show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););', ti, true);
			setPageTitle('The Motor Trail');
			setTour('racing');
			break;
		case 'pavilion':
			rQuery = true;
			show_overpass_layer('way(247116304);', ti);
			setTour('dlwp');
			break;
		case 'manor':
			rQuery = true;
			show_overpass_layer('way(364593716);', ti);
			setTour('manor');
			break;
		case 'ww2Bombmap':
			ti = 'bombmap';
			/* fall through */
		case 'bombmap':
			$('.spinner').show();
			// bomb radius outline
			for (var x = 1; x <= 5; x++) imageOverlay.addLayer(L.circle([50.84150, 0.47150], {
				className: 'ww2radius',
				color: '#a9a9a9',
				weight: 2,
				fill: false,
				radius: x * 804.672,
				clickable: false
			}).bindTooltip(x / 2 + ' miles', {
				sticky: true
			}));
			// bomb markers
			$.ajax({
				url: dfltDir + 'listWw2/incidents.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					var fillColor, interactive, x = 0, dateRange = [];
					imageOverlay.addLayer(L.geoJSON(json, {
						filter: function(feature) {
							interactive = true;
							if (feature.properties.type === 'V-1') fillColor = '#0060ff';
							else if (feature.properties.type === 'landmine') fillColor = '#ff8c00';
							else if (feature.properties.type === 'aircraft') fillColor = '#7f00ff';
							else if (feature.properties.name) fillColor = '#ff0000';
							else {
								fillColor = '#777';
								interactive = false;
							}
							return true;
						},
						onEachFeature: function(feature, layer) {
							// push any additional information into a popup
							if (feature.properties.name) setJsonPopup(feature, layer, [feature.properties.name, '', feature.properties.date], 'Bexhill Observer');
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, interactive, { fillColor: fillColor, className: 'ww2bb' + (feature.properties.date ? ' ww2' + feature.properties.date.split(' ')[0] : '') }, true);
							if (interactive) {
								dateRange[x] = feature.properties.date.split(' ')[0];
								marker._leaflet_id = 'bb' + x++;
								marker.desc = feature.properties.type ? titleCase(feature.properties.type) : 'HE/Incendiary';
								poiList.push(marker);
							}
							return marker;
						}
					}));
					dateRange = [...new Set(dateRange.sort())];
					$('.leaflet-bottom.leaflet-right').prepend(
						'<div id="inputWw2" class="leaflet-control leaflet-bar">' +
							'<div><i>Incident timeline. Click markers for details.</i></div>' +
							'<input value="' + dateRange.length + '" max="' + dateRange.length + '"type="range">' +
						'</div>'
					);
					L.DomEvent.disableClickPropagation($('#inputWw2')[0]).disableScrollPropagation($('#inputWw2')[0]);
					$('#inputWw2 input').on('input change', function() {
						$('path.ww2bb').hide();
						if (this.value == dateRange.length) {
							$('#inputWw2 div').html('<i>All incidents ' + date_parser(dateRange[0], 'short') + ' to ' + date_parser(dateRange[dateRange.length-1], 'short') + '</i>');
							$('path.ww2bb').show();
						}
						else {
							$('#inputWw2 div').html('Incidents up to ' + date_parser(dateRange[this.value], 'long'));
							for (var d = 0; d <= this.value; d++) $('path.ww2' + dateRange[d]).show();
						}
					});
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.date'); }, 250);
					setPageTitle('WWII Incident Map');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('ww2');
			break;
		case 'arshelters':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listWw2/shelters.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					var x = 0;
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, '', feature.properties.date], 'Bexhill Museum');
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true, { fillColor: '#008800' }, true);
							marker._leaflet_id = 'sr' + x++;
							marker.desc = 'Shelter';
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.date'); }, 250);
					setPageTitle('WWII Air-raid Shelters');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('ww2');
			break;
		case 'structures':
			show_overpass_layer('(node(3572364302);node(3944803214);node(2542995381);node(4056582954);node["military"];way["military"];);', ti, true, true);
			setPageTitle('WWII Existing Structures');
			setTour('ww2');
			break;
		case 'prison':
			rQuery = true;
			show_overpass_layer('way(28940913);', ti);
			setTour('northeye');
			break;
		case 'narayan':
			rQuery = true;
			show_overpass_layer('way(247118625);', ti);
			setTour('people');
			break;
		case 'ixion':
			rQuery = true;
			show_overpass_layer('node(3989026714);', ti);
			setTour('people');
			break;
		case 'baird':
			rQuery = true;
			show_overpass_layer('node(3971492451);', ti);
			break;
		case 'llewelyn':
			rQuery = true;
			show_overpass_layer('way(393451834);', ti);
			setTour('people');
			break;
		case 'milligan':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listPeople/milligan.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, '']);
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Spike Milligan');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('milligan');
			break;
		case 'publicClocks':
			show_overpass_layer(pois.clock.query, ti, true);
			setPageTitle(pois.clock.name);
			setTour('clocks');
			break;
		case 'lost':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listHeritage/lost.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, '']);
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
					setPageTitle('Lost Heritage');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('heritage');
			break;
		case 'stones':
			show_overpass_layer(pois.boundary_stone.query, ti, true, true);
			setPageTitle(pois.boundary_stone.name);
			setTour('boundary');
			break;
		case 'benchmarks':
			show_overpass_layer(pois.survey_point.query, ti, true);
			setPageTitle(pois.survey_point.name);
			setTour('surveying');
			break;
		case 'towers':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listMartello/martello.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, ''], 'Bexhill Museum');
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true, {
								iconUrl: 'listMartello/martello',
								iconSize: [35, 35],
								shadowUrl: 'listMartello/martellos',
								shadowAnchor: [18, 18],
								popupAnchor: [0, -12]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Martello Towers');
					if (markerId) map._layers[markerId].openPopup().stopBounce();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('martello');
			break;
		case 'boreholes':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listBores/boreholes.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					var fillColor, x = 0;
					imageOverlay.addLayer(L.geoJSON(json, {
						filter: function(feature) {
							if (feature.properties.length > 0 && feature.properties.length <= 10) fillColor = '#9792fc';
							else if (feature.properties.length > 10 && feature.properties.length <= 30) fillColor = '#5bff6e';
							else if (feature.properties.length > 30) fillColor = '#ff6464';
							else if (feature.properties.length === -2) fillColor = '#a93909';
							else fillColor = '#000000';
							return true;
						},
						onEachFeature: function(feature, layer) {
							// push any additional information into a popup
							feature.properties.description =
								generic_tag_parser({ ref: feature.properties.reference.toString() }, 'ref', 'Reference', 'fas fa-hashtag') +
								(feature.properties.year_known ? generic_tag_parser({ date: feature.properties.year_known.toString() }, 'date', 'Date', 'fas fa-calendar-alt') : '') +
								'<a style="margin:5px;display:block;text-align:center;" onclick="tourIframe(\'' + feature.properties.scan_url + '\', \'\', \'circular\')">View borehole scan</a>';
							setJsonPopup(feature, layer, [titleCase(feature.properties.name, 1), '', feature.properties.length + 'm length borehole']);
						},
						pointToLayer: function(feature, latlng) {
							if (feature.properties.length === -1) return;
							var marker = setMarker(latlng, true, { fillColor: fillColor }, true);
							marker._leaflet_id = 'bore' + x++;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
					setPageTitle('Bores and Wells');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('bores');
			break;
		case 'map_wl1950':  /* fall through */
		case 'map_wl1940':  /* fall through */
		case 'map_bm1946':  /* fall through */
		case 'map_arp1942': /* fall through */
		case 'map_mc1925':  /* fall through */
		case 'map':
			var ml = ti.split('_')[1];
			if (ml && actOverlayLayer !== ml) {
				map.addLayer(tileOverlayLayers[tileOverlayLayer[ml].name]);
				map.flyToBounds(tileOverlayLayer[ml].bounds);
			}
			break;
	} permalinkSet(); }, 50);
}

// focus on individual pois
function tourFocus(ti, id) {
	if ($(window).width() < 768) $('.sidebar-close:visible').click();
	if (actImgLayer === ti) setTimeout(function() {
		if (imageOverlay.getLayers().length) imageOverlay._layers[Object.keys(imageOverlay._layers)[0]]._layers[id].openPopup();
		else iconLayer._layers[Object.keys(iconLayer._layers)[0]]._layers[id].openPopup();
	}, 50);
	else {
		clear_map('markers');
		markerId = id;
		tour(ti, true);
	}
}

// load references page, highlight and scroll to item
function tourRef(tourVal, item) {
	$('#tourList').val('zrefs').trigger('change');
	$('#tourFrame').one('load', function() {
		$(this).contents().find('#' + tourVal + ' > li').eq(item - 1).css('background-color', $('html').css('--main-color') + '55');
		$(this).contents().find('#' + tourVal).prev()[0].scrollIntoView({ behavior: "smooth" });
	});
}

// play video
function tourVideo(id) {
	$.fancybox.open({
		src: 'https://www.youtube.com/embed/' + id,
		youtube: {
			modestbranding: 1,
			iv_load_policy: 3,
			rel: 0
		}
	});
}

// view The Story of Bexhill Street Names book
function tourIframe(src, cap, ani) {
	if (src === 'book') {
		src = ((window.location.protocol !== 'file:') ? '../../' : '') + 'assets/data/streetnames.xml';
		cap = '<a href="' + src + '" target="_blank">https://bexhill-osm.org.uk/streetnames</a>';
	}
	if ($(window).width() >= 1150 && noTouch) $.fancybox.open([{
		src: src,
		type: 'iframe',
		opts: {
			animationEffect: ani,
			caption: cap,
			iframe: {
				preload: false,
				css: {
					'width': '1024px',
					'height': '768px',
					'max-width': '95%',
					'max-height': '95%'
				}
			}
		}
	}]);
	else popupWindow(src, 'tourWindow', 1024, 768);
}
