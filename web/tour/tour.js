// history tour pages

var actImgLayer, slideShow = { firstrun: true, auto: true };
function tour(ti, fromPermalink) {
	var lID, dfltDir = 'tour/tour', xmasYear = '2019';
	if (!fromPermalink) clear_map('markers');
	if ($(window).width() < 768 && !fromPermalink) $('.sidebar-close:visible').click();
	// general markers
	// coordinates | clickable | icon
	var setMarker = function(latlng, interactive, icon) {
		if (icon) {
			if (icon.iconUrl) return L.marker(latlng, {
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
			else return L.circle(latlng, {
				className: icon.className,
				interactive: interactive,
				radius: 20,
				weight: 2,
				color: '#000',
				opacity: 0.8,
				fillColor: icon.fillColor,
				fillOpacity: 0.5
			});	
		}
		else return L.circleMarker(latlng, {
			interactive: interactive,
			radius: 14,
			weight: 4,
			color: $('html').css('--main-color'),
			opacity: 1,
			fillColor: '#fff',
			fillOpacity: 0.5
		});
	};
	// tooltip and pop-up
	// data | layer | headings | image attribution | marker popup class
	var setJsonPopup = function(feature, layer, header, dfltAttrib, pClass) {
		var toolTip = '', markerPopup = '', customPOptions = {
			className: 'popup-t' + (pClass ? ' ' + pClass : ''),
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: feature.properties.img ? imgSize : '',
			autoPanPaddingBottomRight: [5, 50]
		};
		markerPopup += generic_header_parser(header[0], (header[1] ? header[1] : date_parser(header[2], 'long')));
		toolTip += '<b>' + header[0] + '</b><br><i>' + (header[1] ? header[1] : date_parser(header[2], 'short')) + '</i>';
		markerPopup += '<span class="comment">' + layer._latlng.lat + '°N ' + layer._latlng.lng + '°E | ' + wgs84ToGridRef(layer._latlng.lat, layer._latlng.lng, 3) + '</span>';
		if (feature.properties.description) {
			markerPopup += '<span class="popup-longDesc">' + feature.properties.description + '</span>';
			toolTip += ' <i style="color:#777; min-width:17px;" class="fas fa-sticky-note fa-fw" title="Notes"></i>';
		}
		if (feature.properties.link) {
			markerPopup += '<span class="popup-tagValue"><a class="popup-truncate" style="max-width:' + imgSize + 'px" href="' +
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
				markerPopup += generic_img_parser((feature.properties.img[x].indexOf('File') === 0) ? feature.properties.img[x] : (dfltDir + feature.properties.img[x] + '.jpg'), x, dfltAttrib);
				lID = x;
			});
			if (feature.properties.img[1]) {
				markerPopup += show_img_controls(parseInt(+lID+1));
				imgIcon += 's';
			}
			if (feature.properties.img[0] !== 'Xmas/soon') toolTip += ' <i style="color:#777; min-width:17px;" class="fas fa-' + imgIcon + ' fa-fw" title="' + titleCase(imgIcon) + '"></i>';
		}
		layer
			.bindPopup(markerPopup, customPOptions)
			.bindTooltip(toolTip, {
				direction: 'right',
				offset: [8, 0],
				className: pClass,
				opacity: noTouch ? 1 : 0
			});
	};
	// timeout hack to stop iframe breaking on ff
	setTimeout(function() { switch (ti) {
		case 'xmas2017': /* fall through */
		case 'xmas2018': /* fall through */
		case 'xmas':
			$('.spinner').show();
			if (ti.length > 4) xmasYear = ti.split('xmas')[1];
			if (actOverlayLayer !== 'xmas') map.addLayer(tileOverlayLayers[tileOverlayLayer.xmas.name]);
			$.ajax({
				url: 'tour/tourXmas/' + xmasYear + '/' + xmasYear + '.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function (json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function (feature, layer) {
							var winner = feature.properties.winner, winnerTxt = ['Highly Commended', 'First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'],
								winnerIco = ['award', 'trophy', 'medal', 'medal', 'medal', 'medal'], winnerEle = '';
							if (winner >= 0) winnerEle = '<i class="xmasAward commended' + winner + ' fas fa-' + winnerIco[winner] + '" title="' + winnerTxt[winner] + '"></i> ' + winnerTxt[winner];
							setJsonPopup(feature, layer, [feature.properties.name, winnerEle, ''], '', 'popup-xmas');
						},
						pointToLayer: function (feature, latlng) {
							var marker = setMarker(latlng, true, {
								iconUrl: 'Xmas/window',
								iconSize: [32, 37],
								iconAnchor: [16, 37],
								iconNoBounce: true,
								shadowUrl: 'Xmas/../../assets/img/icons/000shadow',
								shadowAnchor: [16, 35],
								popupAnchor: [0, -27]
							});
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Xmas Window Competition ' + xmasYear);
					if (markerId) map._layers[markerId].openPopup().stopBounce();
					else map.flyToBounds(imageOverlay.getBounds());
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = ti;
			break;
		case 'thennow':
			if (actTab === 'thennow') $('#thennowLoading').show();
			else $('.spinner').show();
			$.ajax({
				url: 'assets/data/thennow.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					$('#thennow .sidebar-body div').empty();
					imageOverlay.addLayer(L.geoJSON(json, {
						pointToLayer: function(feature, latlng) {
							$('#thennow .sidebar-body div').append(
								'<hr><h3>' + feature.properties.name + ' (' + feature.properties.date.then + ')</h3>' +
								'<p><a href="assets/img/thennow/' + feature.properties.id + '(1).jpg" data-fancybox="' + feature.properties.id + '" data-caption="' + feature.properties.name + '">' +
									'<img id="' + feature.properties.id + '" src="assets/img/thennow/' + feature.properties.id + '(0).jpg"></a>' +
								'<a style="display:none;" href="assets/img/thennow/' + feature.properties.id + '(2).jpg" data-fancybox="' + feature.properties.id + '" data-caption="Then in ' +
									feature.properties.date.then + (feature.properties.copyright ? ' | &copy; ' + feature.properties.copyright : '') + '"></a>' +
								'<a style="display:none;" href="assets/img/thennow/' + feature.properties.id + '(3).jpg" data-fancybox="' + feature.properties.id + '" data-caption="Now in ' +
									feature.properties.date.now + '"></a>' +
								'<span class="comment">' + feature.properties.desc + '</span></p>'
							);
							$('[data-fancybox="' + feature.properties.id + '"]').fancybox({
								protect: true,
								transitionEffect: 'fade',
								transitionDuration: 5000,
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
									} }, 4000);
								},
								beforeClose: function() {
									// remember slideshow state
									slideShow.auto = ($('.fancybox-button--play').length) ? false : true;
									slideShow.firstrun = true;
								}
							});
							var marker = setMarker(latlng, true);
							marker.bindTooltip(feature.properties.name + '<img src="assets/img/thennow/' + feature.properties.id + '(0).jpg">', { className: 'thennowTip', opacity: noTouch ? 1 : 0 });
							marker.on('click', function() {
								$('#thennow .sidebar-body').scrollTop(0);
								$('#thennow .sidebar-body').scrollTop($('#' + feature.properties.id).offset().top - 120);
								$('#thennow #' + feature.properties.id).click();
							});
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
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
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = ti;
			break;
		case 'fossils':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + '01/dinofoot.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, '']);
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true);
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
			actImgLayer = ti;
			break;
		case 'shipwreck':
			rQuery = true;
			show_overpass_layer('node(3192282124);', ti);
			break;
		case 'smugglingPanels':
			show_overpass_layer('node["ref"~"^TST"];', ti, true);
			setPageTitle('Smuggling Trail');
			actImgLayer = ti;
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
			show_overpass_layer('(node(6528018966);node(318219478););', ti);
			if (actOverlayLayer !== 'br1959') map.addLayer(tileOverlayLayers[tileOverlayLayer.br1959.name]);
			actImgLayer = ti;
			break;
		case 'railwayGlynegap':
			rQuery = true;
			show_overpass_layer('node(4033104292);', ti);
			break;
		case 'tramway':
			imageOverlay.addLayer(L.imageOverlay(dfltDir + '05/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
			if (!fromPermalink) map.flyToBounds(imageOverlay.getBounds().pad(0.2));
			setPageTitle('Tramway Route');
			actImgLayer = ti;
			break;
		case 'motorTrack':
			if (actOverlayLayer !== 'mt1902') map.addLayer(tileOverlayLayers[tileOverlayLayer.mt1902.name]);
			if (!fromPermalink) map.flyToBounds(tileOverlayLayer.mt1902.bounds);
			setPageTitle('Motor Racing Track');
			break;
		case 'motorSerpollet':
			rQuery = true;
			show_overpass_layer('node(3592525934);', ti);
			break;
		case 'motorTrail':
			show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););', ti, true);
			setPageTitle('The Motor Trail');
			actImgLayer = ti;
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
			$('.spinner').show();
			// bomb radius outline
			for (var x = 1; x <= 5; x++) imageOverlay.addLayer(L.circle([50.84150, 0.47150], {
				className: 'ww2radius',
				color: 'darkred',
				weight: 2,
				opacity: 0.2,
				fill: false,
				radius: x * 804.672,
				clickable: false
			}).bindTooltip(x / 2 + ' miles', {
				sticky: true
			}));
			// bomb markers
			$.ajax({
				url: dfltDir + '09/ww2incidents.geojson',
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
							var marker = setMarker(latlng, interactive, { fillColor: fillColor, className: 'ww2bb' + (feature.properties.date ? ' ww2' + feature.properties.date.split(' ')[0] : '') });
							if (interactive) {
								dateRange[x] = feature.properties.date.split(' ')[0];
								marker._leaflet_id = 'bb' + x++;
								marker.desc = feature.properties.type || '';
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
			actImgLayer = ti;
			break;
		case 'ww2Shelters':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + '09/ww2shelters.geojson',
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
							var marker = setMarker(latlng, true, { fillColor: '#008800' });
							marker._leaflet_id = 'sr' + x++;
							marker.desc = 'shelter';
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
			actImgLayer = ti;
			break;
		case 'ww2Arp':
			if (actOverlayLayer !== 'arp1942') map.addLayer(tileOverlayLayers[tileOverlayLayer.arp1942.name]);
			break;
		case 'ww2Structures':
			show_overpass_layer('(node(3572364302);node(3944803214);node(2542995381);node(4056582954);node["military"];way["military"];);', ti, true);
			setPageTitle('WWII Existing Structures');
			actImgLayer = ti;
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
			show_overpass_layer(pois.clock.query, ti, true);
			setPageTitle('Public Clocks');
			actImgLayer = ti;
			break;
		case 'lost':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + '13/lost.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, '']);
						},
						pointToLayer: function(feature, latlng) {
							var marker = setMarker(latlng, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							return marker;
						}
					}));
					map.fireEvent('zoomend');
					setTimeout(pushPoiList, 250);
					setPageTitle('Lost Heritage');
					if (markerId) map._layers[markerId].openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = ti;
			break;
		case 'boundary':
			show_overpass_layer(pois.boundary_stone.query, ti, true);
			setPageTitle('Boundary Stones');
			actImgLayer = ti;
			break;
		case 'surveyPoint':
			show_overpass_layer(pois.survey_point.query, ti, true);
			setPageTitle('OS Surveying Points');
			actImgLayer = ti;
			break;
		case 'martello':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + '16/martello.geojson',
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
								iconUrl: '16/martello',
								iconSize: [35, 35],
								shadowUrl: '16/martellos',
								shadowAnchor: [18, 18],
								popupAnchor: [0, -18]
							});
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
			actImgLayer = ti;
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
function tourRef(tourNum, item) {
	$('#tourList').val('99').trigger('change');
	$('#tourFrame').one('load', function() {
		$(this).contents().find('ol:nth(' + (+tourNum + 1) + ') > li').eq(item - 1).css('background-color', 'khaki');
		$(this).contents().find('body').animate({ scrollTop: $(this).contents().find('ol:nth(' + (+tourNum + 1) + ') > li').eq(item - 1).offset().top - 20 }, 1000);
	});
}

// play video
function tourVideo(url) {
	$.fancybox.open({
		src: 'https://www.youtube.com/watch?v=' + url,
		youtube: { modestbranding: 1 }
	});
}

// view The Story of Bexhill Street Names book
function streetNameBook() {
	if ($(window).width() >= 512) $.fancybox.open([{
		src: 'https://bexhill-osm.org.uk/streetnames',
		type: 'iframe',
		opts: { caption: '<a href="https://bexhill-osm.org.uk/streetnames" target="_blank">https://bexhill-osm.org.uk/streetnames</a>' }
	}]);
	else popupWindow('https://bexhill-osm.org.uk/streetnames', 'streetWindow', 1024, 768);
}
