// history tour pages and other non-osm items

const slideShow = { firstrun: true, auto: true };
let actImgLayer, wInterval = 0;
function tour(tName, tID, fromPermalink) {
	const dfltDir = 'tour/', autoZoom = !fromPermalink && !tID && $('#settings-autozoom').is(':checked');
	if (!fromPermalink) clear_map('markers');
	if (tID) markerId = tID;
	if ($(window).width() < 768 && !fromPermalink && tName !== 'thennow') $('.sidebar-close:visible').trigger('click');
	// general markers
	// coordinates | clickable | icon | has popup
	const setMarker = function(latlng, interactive, icon, popup) {
		let marker;
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
					tooltipAnchor: icon.tooltipAnchor || icon.popupAnchor || null
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
				weight: 2,
				color: '#000000',
				opacity: 1,
				fillColor: icon.fillColor,
				fillOpacity: 0.5
			});
		}
		else marker = L.circleMarker(latlng, {
			className: 'circleMarker',
			interactive: interactive,
			radius: 12,
			weight: 2,
			opacity: 1,
			fillOpacity: 0.5
		});
		if (popup) marker.on('click', function(e) {
			// enable autopan after initial permalink popup, check if sidebar is open
			e.sourceTarget._popup.options.autoPan = true;
			e.sourceTarget._popup.options.autoPanPaddingTopLeft = ($(window).width() < 1024) ? [20, 40] : [sidebar.width() + 50, 5];
		});
		return marker;
	};
	// tooltip and pop-up
	// data | layer | [main header, subheader, date subheader] | image attribution | marker popup class
	const setJsonPopup = function(feature, layer, header, dfltAttrib, pClass) {
		let toolTip = '', toolTipIcons = '', markerPopup = '';
		const customPOptions = {
			className: pClass,
			maxWidth: $(window).width() >= 512 ? imgSize + 30 : imgSize,
			minWidth: feature.properties.img ? imgSize : '',
			autoPan: !fromPermalink,
			autoPanPaddingTopLeft: ($(window).width() < 1024) ? [20, 40] : [sidebar.width() + 50, 5],
			autoPanPaddingBottomRight: [5, 50]
		};
		markerPopup += generic_header_parser(header[0], (header[1] ? header[1] : dateFormat(header[2], 'long'))) + '<div class="popup-body">';
		toolTip += '<b>' + header[0] + '</b><br><i>' + (header[1] ? header[1] : dateFormat(header[2], 'short')) + '</i>';
		if (layer._latlng) markerPopup += '<span class="comment">' + layer._latlng.lat.toFixed(5) + '°N ' + layer._latlng.lng.toFixed(5) + '°E | ' + wgs84ToGridRef(layer._latlng.lat, layer._latlng.lng, 6) + '</span>';
		if (feature.properties.custom) {
			markerPopup += feature.properties.custom;
			toolTipIcons += '<i class="tooltip-icons fa-solid fa-' + (feature.properties.custom.includes('popup-file') ? 'file" title="has attachment"' : 'bars" title="has notes"') + '></i>';
		}
		else if (feature.properties.description) markerPopup += '<span class="popup-tag-long theme-scroll">' + feature.properties.description + '</span>';
 		if (feature.properties.link) {
			markerPopup += '<span class="popup-tag-value"><a class="popup-tag-value-truncate" style="max-width:' + imgSize + 'px;" href="' +
				(feature.properties.link.startsWith('http') ? feature.properties.link : 'tel:' + feature.properties.link) +
				'" target="_blank" rel="noopener" title="' + feature.properties.link + '">' + feature.properties.link + '</a></span>';
		}
		if (feature.properties.img) {
			let imgIcon = 'image', imgAttrib = '', lID;
			markerPopup += '<div class="popup-img">';
			customPOptions.minWidth = imgSize;
			$.each(feature.properties.img, function(x) {
				if (feature.properties.imgattrib && feature.properties.imgattrib[x]) {
					imgAttrib = feature.properties.imgattrib[x];
					if (feature.properties.imgattriburl && feature.properties.imgattriburl[x]) imgAttrib = '<a href="' + feature.properties.imgattriburl[x] + '" target="blank">' + imgAttrib + '</a>';
				}
				else imgAttrib = dfltAttrib;
				markerPopup += generic_img_parser(feature.properties.img[x].startsWith('File:') ? feature.properties.img[x] : (dfltDir + feature.properties.img[x] + '.jpg'), x, imgAttrib);
				lID = x;
			});
			if (feature.properties.img[1]) {
				markerPopup += show_img_controls(parseInt(+lID+1));
				imgIcon += 's';
			}
			markerPopup += '</div>';
			if (feature.properties.img[0].indexOf('000-placehldr') === -1) toolTipIcons += '<i class="tooltip-icons fa-solid fa-' + imgIcon + '" title="has ' + imgIcon + '"></i>';
		}
		toolTip += '<span class="tooltip-icons">' + (toolTipIcons ? toolTipIcons : '') + '</span>';
		markerPopup += '</div>';
		layer
			.bindPopup(markerPopup, customPOptions)
			.bindTooltip(toolTip, {
				className: pClass,
				direction: 'top',
				offset: [0, (pClass === 'popup-xmas' ? -35 : -8)],
				opacity: noTouch ? 1 : 0,
				sticky: true
			});
	};
	// set active tour and notify sidebar if sidebar closed
	const setTour = function(tourVal) {
		actImgLayer = tName;
		if (actTab !== 'tour' && fromPermalink) {
			$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif').show();
			$('#tour-controls-list').val(tourVal).trigger('change');
		}
	};
	// timeout hack to stop iframe breaking on ff
	setTimeout(function() { switch (tName) {
		case 'tide':
			// visualise current position of the tide
			const tideData = $('.home-weather-tide').data('tide-info').split(',');
			const tidePercentFromLow = Math.abs((tideData[1] === 'Low-tide' ? 100 : 0) - tideData[0]);
			const tideLow = [[50.83540, 0.47558], [50.83486, 0.46967]];
			const tideHigh = [[50.83646, 0.46967], [50.83700, 0.47558]];
			const tideNow = [[tideLow[0][0] + (Math.round(tidePercentFromLow * 1.6) / 100000), tideLow[0][1]], [tideLow[1][0] + (Math.round(tidePercentFromLow * 1.6) / 100000), tideLow[1][1]]];
			L.polygon([[tideHigh[0], tideHigh[1], tideLow[0], tideLow[1]]], {
				color: 'white',
				stroke: false,
				className: 'weather-tide-polygon'
			}).bindTooltip(
				'<b>Range of medium tides at ' + pad(new Date(+tideData[3]).getHours()) + ':' + pad(new Date(+tideData[3]).getMinutes()) + '</b><br>' +
				tideData[0] + '% ' + (+tideData[0] > 50 ? 'towards ' + tideData[1].toLowerCase() : 'past ' + tideData[2].toLowerCase()), {
					sticky: true
			}).addTo(imageOverlay);
			L.polygon([tideNow[0], tideNow[1], tideLow[1], tideLow[0]], {
				color: 'blue',
				stroke: false,
				opacity: 0.5,
				interactive: false
			}).addTo(imageOverlay);
			L.polyline([tideNow[0], tideNow[1]], {
				dashArray: '10 5',
				color: 'blue',
				opacity: 0.5,
				weight: 3,
				lineCap: 'butt',
				interactive: false
			}).addTo(imageOverlay);
			if (autoZoom) zoom_area();
			else map.fireEvent('zoomend');
			break;
		case 'pano':
			// ARCHIVED - get mapillary sequences
			// https://www.mapillary.com/developer/api-documentation/#search-sequences
			$('.spinner').show();
			fcnStLvl.state('control-mapillary-on');
			$.ajax({
				url: 'assets/data/panoramas.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					imageOverlay.addLayer(L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
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
				error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR PANORAMAS:', encodeURI(this.url)); }
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
					setPageTitle('OSM Notes');
					if (json.features.length) {
						L.geoJSON(json, {
							onEachFeature: function(feature, layer) {
								const fp = feature.properties;
								fp.custom = '';
								$.each(fp.comments, function(c) {
									if (fp.comments[c].text) fp.custom += L.Util.template(tagTmpl, {
										key: (fp.comments[c].user ? '<a href="' + fp.comments[c].user_url + '" target="_blank" rel="noopener" title="User">' + fp.comments[c].user + '</a>' : 'Anonymous'),
										keyVal: '<span title="' + fp.comments[c].date + '">' + fp.comments[c].text + '</span>',
										iconName: 'fa-regular fa-comment'
									});
								});
								fp.custom += '</span><span class="popup-notes comment"><i class="fa-solid fa-' + (fp.closed_at ? 'check"></i> Resolved: ' + dateFormat(fp.closed_at.split(' ')[0], 'short') : 'times"></i> Currently unresolved') + '</span> | ' +
									'<a onclick="improveMap({\'latlng\': { \'lat\':\'' + feature.geometry.coordinates[1] + '\', \'lng\':\'' + feature.geometry.coordinates[0] + '\' }}, \'' + fp.id + '\');">' +
									'osm.org/note/' + fp.id + '</a><span class="popup-tag-long theme-scroll">';
								setJsonPopup(feature, layer, [titleCase(fp.status + ' note'), dateFormat(fp.date_created.split(' ')[0], 'long')]);
							},
							pointToLayer: function(feature, latlng) {
								const marker = setMarker(latlng, true, {
									iconUrl: '/../../assets/img/leaflet/' + feature.properties.status + '_note_marker',
									iconSize: [25, 41],
									iconAnchor: [12, 41],
									shadowUrl: '/../../assets/img/leaflet/marker-shadow',
									shadowAnchor: [12, 41],
									popupAnchor: [0, -26]
								}, true);
								marker.ohState = (feature.properties.status === 'open' ? 'false' : 'true');
								marker._leaflet_id = feature.properties.id;
								poiList.push(marker);
								imageOverlay.addLayer(marker);
								return marker;
							}
						});
						setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
						if (autoZoom) zoom_area();
						else map.fireEvent('zoomend');
						if (tID) imageOverlay.getLayer(tID).openPopup().stopBounce();
						$('.spinner').fadeOut('fast');
					}
					else {
						setMsgStatus('fa-solid fa-circle-info', 'No OSM notes found', 'All pending map notes in this area have been resolved.');
						$('.spinner').fadeOut('fast');
					}
					if ($('#settings-debug').is(':checked')) console.debug('OSM Notes:', json);
				},
				error: function() { if ($('#settings-debug').is(':checked')) console.debug('ERROR OSM-NOTES:', encodeURI(this.url)); }
			});
			actImgLayer = tName;
			break;
		case 'xmas2017': /* fall through */ case 'xmas2018': /* fall through */
		case 'xmas2019': /* fall through */ case 'xmas2020': /* fall through */
		case 'xmas2021': /* fall through */ case 'xmas2022': /* fall through */
		case 'xmas2023': /* fall through */ case 'xmas2024': /* fall through */
		case 'xmas2025': /* fall through */
		case 'xmas':
			const xmasYear = (tName.length > 4) ? tName.slice(-4) : '2025';
			$('.spinner').show();
			if (actOverlayLayer === undefined && $('#xmasTitle').length) map.addLayer(tileOverlayLayers[tileOverlayLayer.xmas.name]);
			$.ajax({
				url: dfltDir + 'itemXmas/' + xmasYear + '.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							const winner = feature.properties.winner, winnerTxt = ['Highly Commended', 'First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize', 'Sixth Prize'],
								winnerIco = ['award', 'trophy', 'medal', 'medal', 'medal', 'medal', 'medal'];
							let winnerEle = '';
							if (winner >= 0) winnerEle = '<i class="competition-award competition-commended' + winner + ' fa-solid fa-' + winnerIco[winner] + '" title="' + winnerTxt[winner] + '"></i> ' + winnerTxt[winner];
							if (!feature.properties.img) feature.properties.img = { '0': 'itemXmas/img/000-placehldr' };
							setJsonPopup(feature, layer, [feature.properties.name, winnerEle, ''], '', 'popup-xmas');
							feature.properties.sortby = winner > 0 ? winner : winner === 0 ? 9 : 99;
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, {
								iconUrl: 'itemXmas/img/window',
								iconSize: [32, 37],
								iconAnchor: [16, 37],
								iconNoBounce: true,
								shadowUrl: '/../../assets/img/icons/000-shadow',
								shadowAnchor: [16, 27],
								popupAnchor: [0, -24],
								tooltipAnchor: [0, 0]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.sortby'); }, 250);
					setPageTitle('Xmas Window Competition ' + xmasYear);
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = tName;
			break;
		case 'scarecrow':
			$('.spinner').show();
			// ward outlines
			$.ajax({
				url: dfltDir + 'itemScarecrow/boundary.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: true,
				success: function(json) { imageOverlay.addLayer(L.geoJSON(json, { style: { color: 'darkcyan', opacity: 0.5 }, interactive: false })); }
			});
			// markers
			$.ajax({
				url: dfltDir + 'itemScarecrow/2020.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							const winner = feature.properties.winner, winnerTxt = ['', 'First Prize', 'Second Prize'],
								winnerIco = ['', 'trophy', 'medal'];
							let subtitleEle = feature.properties.ward;
							if (winner > 0) subtitleEle = '<i class="competition-award competition-commended' + winner + ' fa-solid fa-' + winnerIco[winner] + '" title="' + winnerTxt[winner] + '"></i> ' + winnerTxt[winner] + ' - ' + subtitleEle;
							if (!feature.properties.img) feature.properties.img = { '0': 'itemScarecrow/img/000-placehldr' };
							setJsonPopup(feature, layer, [feature.properties.name, subtitleEle], '', 'popup-scarecrow');
							feature.properties.sortby = feature.properties.winner ? feature.properties.ward + feature.properties.winner : feature.properties.ward + '9';
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, {
								iconUrl: 'itemScarecrow/img/scarecrow' + (feature.properties.winner === 1 ? '-win' : ''),
								iconSize: [35, 37],
								iconAnchor: [17, 37],
								iconNoBounce: true,
								shadowUrl: '/../../assets/img/icons/000-shadow',
								shadowAnchor: [20, 33],
								popupAnchor: [0, -23]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.sortby'); }, 250);
					setPageTitle('Christmas Scarecrow Competition');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			actImgLayer = tName;
			break;
		case 'thennow':
			if (actTab === 'thennow') $('#thennow-loading').show();
			else $('.spinner').show();
			$.ajax({
				url: dfltDir + 'itemThenNow/thennow.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					$('#thennowNum').html(json.features.length);
					$('#thennow .sidebar-body div').empty();
					L.geoJSON(json, {
						pointToLayer: function(feature, latlng) {
							let tnBody = '<hr><h3>' + feature.properties.imgcaption['1'] + ' (' + feature.properties.date + ')</h3>' +
								'<figure><a href="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(1).jpg" data-fancybox="' + feature.properties.id + '" data-caption="' + feature.properties.imgcaption['1'] + '">' +
								'<img src="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(0).jpg"></a>';
							// find number of images based on caption count
							$.each(feature.properties.imgcaption, function(x) {
								if (+x > 1) tnBody += '<a style="display:none;" href="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(' + x + ').jpg" data-fancybox="' + feature.properties.id +
								'" data-caption="' + feature.properties.imgcaption[x] + '"></a>';
							});
							$('#thennow .sidebar-body div').append(tnBody + '<figcaption>' + feature.properties.desc + '</figcaption></figure>');
							$('a[data-fancybox="' + feature.properties.id + '"]').fancybox({
								baseClass: 'fancybox-thennow',
								protect: true,
								transitionEffect: 'fade',
								transitionDuration: 7500,
								slideShow: { speed: 2500 },
								beforeLoad: function() {
									$('.fancybox-thennow').attr('data-thennow', feature.properties.id);
									permalinkSet();
								},
								afterLoad: function() {
									// cancel slideshow user manually advances
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
								},
								afterClose: function() {
									$('.fancybox-thennow').removeAttr('data-thennow');
									permalinkSet();
								}
							});
							const marker = setMarker(latlng, true, false, false);
							marker.bindTooltip('<img src="' + dfltDir + 'itemThenNow/img/' + feature.properties.id + '(0).jpg"><br><span>' + feature.properties.imgcaption['1'] + '</span>', {
								className: 'tooltip-thennow',
								direction: 'top',
								offset: [0, -18],
								opacity: noTouch ? 1 : 0
							});
							marker.on('click', function() {
								$('a[data-fancybox=' + feature.properties.id + ']').parent()[0].scrollIntoView({ block: 'center' });
								$('a[data-fancybox=' + feature.properties.id + ']').eq(0).trigger('click');
							});
							marker._leaflet_id = feature.properties.id;
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					// this is unbound when clear_map function is run
					$('#thennow figure a')
						.on('mouseenter', function() { imageOverlay.getLayer($(this).data('fancybox')).openTooltip(); highlightOutline($(this).data('fancybox'), 1); })
						.on('mouseleave', function() { imageOverlay.getLayer($(this).data('fancybox')).closeTooltip(); highlightOutline($(this).data('fancybox'), 0); });
					setPageTitle('Then and Now');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					$('.spinner').fadeOut('fast');
					if (tID) {
						markerId = undefined;
						imageOverlay.getLayer(tID).fire('click');
					}
				}
			});
			actImgLayer = tName;
			break;
		case 'historical':
			show_overpass_layer(pois.historic.query, 'historic', {
				bound: true,
				forceBbox: true,
				zoomTo: autoZoom
			});
			setPageTitle(pois.historic.name);
			setTour('bexhill');
			break;
		case 'protected':
			show_overpass_layer(pois.listed_status.query, 'listed_status', {
				bound: true,
				forceBbox: true,
				zoomTo: autoZoom
			});
			setPageTitle(pois.listed_status.name);
			setTour('bexhill');
			break;
		case 'boreholes':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listPrehistory/boreholes.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					let fillColor, x = 0;
					L.geoJSON(json, {
						filter: function(feature) {
							if (feature.properties.length > 0 && feature.properties.length <= 10) fillColor = '#9792fc';
							else if (feature.properties.length > 10 && feature.properties.length <= 30) fillColor = '#5bff6e';
							else if (feature.properties.length > 30) fillColor = '#ff6464';
							else if (feature.properties.length <= 0) fillColor = '#a93909';
							else fillColor = '#000';
							return true;
						},
						onEachFeature: function(feature, layer) {
							feature.properties.custom =
								generic_tag_parser({ ref: feature.properties.reference.toString() }, 'ref', 'Reference', 'fa-solid fa-hashtag') +
								(feature.properties.year_known ? generic_tag_parser({ date: feature.properties.year_known.toString() }, 'date', 'Date', 'fa-solid fa-calendar-days') : '') +
								(feature.properties.length > 0 ? generic_tag_parser({ length: feature.properties.length + 'm' }, 'length', 'Length', 'fa-solid fa-bore-hole') : '') +
								'<a class="popup-file" onclick="popupWindow(\'iframe\', \'https://' + feature.properties.scan_url + '\')"><i class="fa-solid fa-file-pdf"></i>View borehole scan</a>';
							setJsonPopup(feature, layer, [titleCase(feature.properties.name, 1), '', 'Borehole record']);
						},
						pointToLayer: function(feature, latlng) {
							if (feature.properties.length === -1) return;
							const marker = setMarker(latlng, true, { fillColor: fillColor }, true);
							marker._leaflet_id = 'bore' + x++;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
					setPageTitle('Boreholes');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('prehistory');
			break;
		case 'fossils':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listPrehistory/dinofoot.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, '']);
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('Dinosaur Footprints');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('prehistory');
			break;
		case 'farms1839':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listFarming/farms.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							const eachFarm = feature.properties, farmStatus = [
								'No longer a farm, no original buildings remain.',
								'No longer a farm, some original buildings remain.',
								'Still a working farm, no original buildings remain.',
								'Still a working farm, some original buildings remain.'
							];
							feature.properties.custom = generic_tag_parser({ owner: eachFarm.owner }, 'owner', 'Owner 1839', 'fa-solid fa-user') +
								(eachFarm.tenant ? generic_tag_parser({ tenant: eachFarm.tenant }, 'tenant', 'Tenant 1839', 'fa-solid fa-person-shelter') : '') +
								generic_tag_parser({ status: farmStatus[eachFarm.status] }, 'status', 'Status 2026', 'fa-solid fa-wheat-awn') +
								(eachFarm.description ? generic_tag_parser({ description: eachFarm.description }, 'description', ' ', 'fa-solid fa-clipboard') : '') +
								(!eachFarm.nofile ? '<a class="popup-file" onclick="popupWindow(\'iframe\', \'' + dfltDir + 'listFarming/pdf/' + eachFarm.name + '.pdf\')"><i class="fa-solid fa-file-pdf"></i>View farm history</a>' : '');
							setJsonPopup(feature, layer, [eachFarm.title, eachFarm.section ? 'Section ' + eachFarm.section : '', ''], '&copy; Bexhill Museum');
							layer._leaflet_id = eachFarm.name + (eachFarm.section ? eachFarm.section.charAt(0) : '');
							imageOverlay.addLayer(layer);
							poiList.push(layer);
						},
						style: function(feature) {
							// set farm hue and lightness based on id
							const colourFarm = [Math.floor(+feature.properties.id * 7.2), +feature.properties.id % 3 * 5 + 25];
							return {
								color: 'hsl(' + colourFarm[0] + ', 50%, 35%)',
								fillColor: 'hsl(' + colourFarm[0] + ', 75%, ' + colourFarm[1] + '%)',
								opacity: 0.75,
								weight: 2,
								fillOpacity: 0.5
							};
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('Farms & Landowners (1839)');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('farming');
			break;
		case 'manorHouse':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listManor/manor.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, ''], '&copy; Bexhill Museum');
							layer._leaflet_id = feature.properties.id;
							imageOverlay.addLayer(layer);
							if (feature.properties.name) poiList.push(layer);
						},
						style: function(feature) {
							return {
								interactive: feature.properties.name ? true : false,
								color: '#000',
								fillColor: '#b22222',
								opacity: 0.75,
								weight: 2,
								fillOpacity: 0.5
							};
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('Former Manor House');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('manor');
			break;
		case 'shipwreck':
			rQuery = true;
			show_overpass_layer('way(1212359648);', tName);
			setTour('amsterdam');
			break;
		case 'smugglingPanels':
			show_overpass_layer('node["ref"~"^TST"];', tName, {
				bound: true,
				forceBbox: false,
				zoomTo: autoZoom
			});
			setPageTitle('Smuggling Trail');
			setTour('smuggling');
			break;
		case 'sidleyGreen':
			rQuery = true;
			show_overpass_layer('way(263267372);', tName);
			setTour('smuggling');
			break;
		case 'towers':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listMartello/martello.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, ''], '&copy; Bexhill Museum');
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, {
								iconUrl: 'listMartello/martello',
								iconSize: [35, 35],
								shadowUrl: 'listMartello/martellos',
								shadowAnchor: [18, 18],
								popupAnchor: [0, -8]
							}, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('Martello Towers');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup().stopBounce();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('martello');
			break;
		case 'motorTrack':
			if (actOverlayLayer !== 'mt1902') map.addLayer(tileOverlayLayers[tileOverlayLayer.mt1902.name]);
			if (!fromPermalink) zoom_area(false, tileOverlayLayer.mt1902.bounds);
			else map.fireEvent('zoomend');
			setPageTitle(tileOverlayLayer.mt1902.name);
			setTour('racing');
			break;
		case 'motorSerpollet':
			rQuery = true;
			show_overpass_layer('node(3592525934);', tName);
			setTour('racing');
			break;
		case 'motorTrail':
			show_overpass_layer('(node["ref"~"^MHT"];node(5059264455););', tName, {
				bound: true,
				forceBbox: false,
				zoomTo: autoZoom
			});
			setPageTitle('Motoring Heritage Trail');
			setTour('racing');
			break;
		case 'westBranch':
			show_overpass_layer('(node(6528018966);node(318219478););', tName);
			if (actOverlayLayer !== 'br1959') map.addLayer(tileOverlayLayers[tileOverlayLayer.br1959.name]);
			if (!fromPermalink) zoom_area(false, tileOverlayLayer.br1959.bounds);
			setPageTitle('Bexhill West Railway');
			setTour('railways');
			break;
		case 'bexhillStation':
			rQuery = true;
			show_overpass_layer('way(397839677);', tName);
			setTour('railways');
			break;
		case 'glynegapStation':
			rQuery = true;
			show_overpass_layer('node(4033104292);', tName);
			setTour('railways');
			break;
		case 'tramway':
			imageOverlay.addLayer(L.imageOverlay(dfltDir + 'listTrams/img/tramway.png', [[50.8523, 0.4268], [50.8324, 0.5343]], { opacity: 0.9 }));
			if (autoZoom) zoom_area();
			else map.fireEvent('zoomend');
			setPageTitle('Tramway Route');
			setTour('trams');
			break;
		case 'pavilion':
			rQuery = true;
			show_overpass_layer('way(247116304);', tName);
			setTour('dlwp');
			break;
		case 'ww2Bombmap':
			tName = 'bombmap';
			/* fall through */
		case 'bombmap':
			$('.spinner').show();
			// bomb radius outline
			for (let x = 1; x <= 5; x++) imageOverlay.addLayer(L.circle([50.84150, 0.47150], {
				className: 'layer-ww2-radius',
				color: '#888',
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
					let fillColor, interactive, x = 0, dateRange = [];
					L.geoJSON(json, {
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
							if (feature.properties.name) setJsonPopup(feature, layer, [feature.properties.name, '', feature.properties.date], '&copy; Bexhill Observer');
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, interactive, { fillColor: fillColor, className: 'ww2bb' + (feature.properties.date ? ' ww2-' + feature.properties.date.split(' ')[0] : '') }, true);
							if (interactive) {
								dateRange[x] = feature.properties.date.split(' ')[0];
								marker._leaflet_id = 'bb' + x++;
								marker.desc = feature.properties.type ? titleCase(feature.properties.type) : 'HE/Incendiary';
								poiList.push(marker);
							}
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					dateRange = [...new Set(dateRange.sort())];
					// incident timeline
					$('.leaflet-bottom.leaflet-right').prepend(
						'<div id="control-ww2" class="leaflet-control leaflet-bar">' +
							'<a title="Play timeline"><i class="fa-solid fa-circle-play fa-lg"></i></a>' +
							'<div><i>Incident timeline. Click a marker for details.</i></div>' +
							'<input value="' + dateRange.length + '" max="' + dateRange.length + '" data-oldvalue="' + dateRange.length + '"type="range">' +
						'</div>'
					);
					L.DomEvent.disableClickPropagation($('#control-ww2')[0]).disableScrollPropagation($('#control-ww2')[0]);
					$('#control-ww2 input').on('input', function() {
						if (this.value == dateRange.length) {
							$('#control-ww2 div').html('<i>All incidents ' + dateFormat(dateRange[0], 'short') + ' to ' + dateFormat(dateRange[dateRange.length-1], 'short') + '</i>');
							$('path.ww2bb').show();
						}
						else {
							$('#control-ww2 div').html('Incidents up to ' + dateFormat(dateRange[this.value], 'long'));
							if (this.value < +$(this).data('oldvalue') || this.value - +$(this).data('oldvalue') !== 1) {
								$('path.ww2bb').hide();
								for (let d = 0; d <= this.value; d++) $('path.ww2-' + dateRange[d]).show();
							}
							else $('path.ww2-' + dateRange[this.value]).fadeIn(wInterval ? 400 : 0);
						}
						$(this).data('oldvalue', this.value);
					});
					// play incident timeline
					$('#control-ww2 a').on('click', function() {
						const pauseInterval = function() {
							clearInterval(wInterval);
							wInterval = 0;
							$('#control-ww2 a i').removeClass('fa-circle-pause').addClass('fa-circle-play');
							$('#control-ww2 a').attr('title', 'Play timeline');
						};
						if ($(this).find('.fa-circle-play').length) {
							$(this).attr('title', 'Pause timeline');
							$('#control-ww2 a i').removeClass('fa-circle-play').addClass('fa-circle-pause');
							if (+$('#control-ww2 input').val() >= +$('#control-ww2 input').attr('max')-1) $('#control-ww2 input').val(0).trigger('input');
							wInterval = setInterval(() => {
								$('#control-ww2 input').val(+$('#control-ww2 input').val()+1).trigger('input');
								if (+$('#control-ww2 input').val() >= +$('#control-ww2 input').attr('max')-1) pauseInterval();
							}, 250);
						}
						else pauseInterval();
					});
					setTimeout(function() { pushPoiList('feature.properties.date'); }, 250);
					setPageTitle('WWII Incident Map');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
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
					let x = 0;
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, '', feature.properties.date], '&copy; Bexhill Museum');
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, { fillColor: '#008800' }, true);
							marker._leaflet_id = 'sr' + x++;
							marker.desc = 'Shelter';
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.date'); }, 250);
					setPageTitle('WWII Air-raid Shelters');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('ww2');
			break;
		case 'structures':
			show_overpass_layer('(node(3572364302);node["memorial:conflict"~"WW2"];way["memorial:conflict"~"WW2"];node["military"];way["military"];);', tName, {
				bound: true,
				forceBbox: true,
				zoomTo: autoZoom
			});
			setPageTitle('WWII Existing Structures');
			setTour('ww2');
			break;
		case 'prison':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listNortheye/prison.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							const pSubtitle = {
								preriot: 'Destroyed by \'86 riot',
								postriot: 'After \'86 riot'
							};
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.timeline ? pSubtitle[feature.properties.timeline] : '', ''], '&copy; Bexhill Observer');
							if (feature.properties.id) layer._leaflet_id = feature.properties.id;
							imageOverlay.addLayer(layer);
							if (feature.properties.name) poiList.push(layer);
						},
						style: function(feature) {
							const buildingCol = feature.properties.timeline === 'preriot' ? 'orange' : '#b22222';
							const pStyle = {
								boundary: [ '#000000', '#9dcdbb', 1, 2, 0.8 ],
								building: [ '#000000', buildingCol, 0.75, 2, 0.5 ],
								fence: [ '#000000', '#000000', 1, 2, 0, 4 ],
								pitch: [ '#000000', '#90ee90', 0.75, 2, 0.5 ],
								road: [ '#ffffff', '#ffffff', 1, 5, 0 ]
							};
							return {
								interactive: feature.properties.name ? true : false,
								color: pStyle[feature.properties.type][0],
								fillColor: pStyle[feature.properties.type][1],
								opacity: pStyle[feature.properties.type][2],
								weight: pStyle[feature.properties.type][3],
								fillOpacity: pStyle[feature.properties.type][4],
								dashArray: pStyle[feature.properties.type][5],
								dashOffset: pStyle[feature.properties.type][5]
							};
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('HMP Northeye');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('northeye');
			break;
		case 'campus':
			rQuery = true;
			show_overpass_layer('way(28940913);', tName);
			setTour('northeye');
			break;
		case 'lost':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listHeritage/lost.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, '']);
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.id'); }, 250);
					setPageTitle('Lost Heritage');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('heritage');
			break;
		case 'stones':
			show_overpass_layer(pois.boundary_stone.query, 'boundary_stone', {
				bound: true,
				forceBbox: true,
				zoomTo: autoZoom
			});
			setPageTitle(pois.boundary_stone.name);
			setTour('boundary');
			break;
		case 'narayan':
			rQuery = true;
			show_overpass_layer('way(247118625);', tName);
			setTour('people');
			break;
		case 'ixion':
			rQuery = true;
			show_overpass_layer('node(3989026714);', tName);
			setTour('people');
			break;
		case 'baird':
			rQuery = true;
			show_overpass_layer('node(3971492451);', tName);
			break;
		case 'llewelyn':
			rQuery = true;
			show_overpass_layer('way(393451834);', tName);
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
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.title, feature.properties.name, '']);
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(pushPoiList, 250);
					setPageTitle('Spike Milligan');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('people');
			break;
		case 'filmingLoc':
			$('.spinner').show();
			$.ajax({
				url: dfltDir + 'listFilm/film.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					L.geoJSON(json, {
						onEachFeature: function(feature, layer) {
							setJsonPopup(feature, layer, [feature.properties.name, feature.properties.date, '']);
						},
						pointToLayer: function(feature, latlng) {
							const marker = setMarker(latlng, true, false, true);
							marker._leaflet_id = feature.properties.id;
							poiList.push(marker);
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					setTimeout(function() { pushPoiList('feature.properties.date'); }, 250);
					setPageTitle('Filming Locations');
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
					if (tID) imageOverlay.getLayer(tID).openPopup();
					$('.spinner').fadeOut('fast');
				}
			});
			setTour('film');
			break;		
		case 'publicClocks':
			show_overpass_layer(pois.clock.query, 'clock', {
				bound: true,
				forceBbox: false,
				zoomTo: autoZoom
			});
			setPageTitle(pois.clock.name);
			setTour('clocks');
			break;
		case 'benchmarks':
			show_overpass_layer(pois.survey_point.query, 'survey_point', {
				bound: true,
				forceBbox: false,
				zoomTo: autoZoom
			});
			setPageTitle(pois.survey_point.name);
			setTour('surveying');
			break;
		case 'ch1983':
			$.ajax({
				url: dfltDir + 'listOverlays/ch1983.geojson',
				dataType: 'json',
				mimeType: 'application/json',
				cache: false,
				success: function(json) {
					let imgs = [];
					L.geoJSON(json, {
						pointToLayer: function (feature, latlng) {
							const marker = setMarker(latlng, true, false, false);
							marker.bindTooltip(feature.properties.name, {
								direction: 'top',
								offset: [0, -18],
								opacity: noTouch ? 1 : 0
							});
							imgs.push({
								src: dfltDir + 'listOverlays/img/ch1983/C69600(' + pad(feature.properties.id) + ').jpg',
								opts: { caption: feature.properties.name + ' | 1983 | Bexhill Museum' }
							});
							marker.on('click', function() {
								$.fancybox.open(imgs, { protect: true, loop: false, buttons: ['close'] }, feature.properties.id);
							});
							imageOverlay.addLayer(marker);
							return marker;
						}
					});
					if (autoZoom) zoom_area();
					else map.fireEvent('zoomend');
				}
			});
			actImgLayer = tName;
			setPageTitle('1983 Chorley Handford');
			setTour('overlays');
			break;
		case 'wl1950':   /* fall through */ case 'wl1940':   /* fall through */
		case 'wl1911':   /* fall through */ case 'raf1959':  /* fall through */
		case 'raf1946':  /* fall through */ case 'raf1941c': /* fall through */
		case 'arp1942':  /* fall through */ case 'mc1925':   /* fall through */
		case 'jd1887':   /* fall through */ case 'bt1839':   /* fall through */
		case 'yg1795':   /* fall through */ case 'yg1778':
			if (actOverlayLayer !== tName) {
				map.addLayer(tileOverlayLayers[tileOverlayLayer[tName].name]);
				if (autoZoom) zoom_area(false, tileOverlayLayer[tName].bounds);
			}
			setPageTitle(tileOverlayLayer[tName].name);
			break;
	} permalinkSet(); }, 50);
}

// focus on individual pois
function tourFocus(tName, tID) {
	if ($(window).width() < 768) $('.sidebar-close:visible').trigger('click');
	if (actImgLayer === tName) setTimeout(function() {
		if (imageOverlay.getLayers().length) imageOverlay.getLayer(tID).fire('click');
		else iconLayer.getLayer(tID).fire('click');
	}, 50);
	else tour(tName, tID, false);
}

// load references page, highlight and scroll to item
function tourRef(tourVal, item) {
	$('#tour-controls-list').val('zrefs').trigger('change');
	$('#tour-frame').one('load', function() {
		$(this).contents().find('#reference-' + tourVal + ' > li').eq(item - 1).css({
			'background-color': $('html').css('--main-color') + '22',
			'border-radius': '2px'
		});
		$(this).contents().find('#reference-' + tourVal).prev()[0].scrollIntoView({ behavior: 'smooth' });
	});
}
