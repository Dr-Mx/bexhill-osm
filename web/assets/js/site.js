// all main functions for site

// overpass layer options
var maxOpResults = 250;
var email = 'info@bexhill-osm.org.uk';
// map area
var mapBounds = { south: 50.8025, west: 0.3724, north: 50.8785, east: 0.5290 };
var LBounds = L.latLngBounds([mapBounds.south, mapBounds.west], [mapBounds.north, mapBounds.east]);
// map open location
var mapCentre = [50.8424, 0.4676];
var mapZoom = ($(window).width() < 768) ? 14 : 15;
// map layers
var defBaseTileLayer = 'osmstd', actBaseTileLayer = defBaseTileLayer, actOverlayLayer;
// tab to open
var defTab = 'home', actTab = defTab;
// image width for popups
var imgSize = ($(window).width() < 1024) ? 256 : 310;

// set swipe triggers for touch devices
// close sidebar
$('.sidebar-header').on('swipeleft', function () { sidebar.close(); });
// prev/next tour iframe
$('#tour')
	.on('swiperight', function () { $('#tourPrev').trigger('click'); })
	.on('swipeleft', function () { $('#tourNext').trigger('click'); })
	.on('wheel', function (e) {
		if (e.originalEvent.deltaY < 0) $('#tourNext').trigger('click');
		else if (e.originalEvent.deltaY > 0) $('#tourPrev').trigger('click');
		e.preventDefault();
	});
// smooth scrolling to anchor
$(document).on('click', 'a[href*="#goto"]', function (e) {
	var target = $('[id=' + this.hash.slice(1) + ']');
	if (actTab === 'pois' && $('.poi-results').is(':visible')) $('.poi-icons').animate({ scrollTop: target.offset().top - 55 - $('.poi-results').height() }, 1000);
	else $('.poi-icons, .sidebar-body').animate({ scrollTop: target.offset().top - 55 }, 1000);
	e.preventDefault();
});

$('.sidebar-tabs').click(function () {
	// get current sidebar-tab
	actTab = ($('.sidebar.collapsed').length) ? 'none' : $('.sidebar-pane.active').attr('id');
	// resize links on minimap
	if (actTab === 'home') setTimeout(function () { $('#minimap > map').imageMapResize(); }, 500);
	permalinkSet();
});
// no sidebar-tab
$('.sidebar-close').click(function () { actTab = 'none'; permalinkSet(); });
// hide sidebar on smaller devices when minimap clicked
$('#minimap > map').click(function () { if ($(window).width() < 768) sidebar.close(); });

// ignore map single click (reverse lookup) in some cases
L.Map.addInitHook(function () {
	var that = this, h;
	if (that.on) {
		that.on('click', check_later);
		that.on('dblclick', function () { setTimeout(clear_h, 0); } );
	}
	function check_later(e) {
		clear_h();
		if (!$('.queryOff-active, .leaflet-popup, .leaflet-control-layers-expanded').length && !spinner) h = setTimeout(check, 500);
		function check() { that.fire('singleclick', L.Util.extend(e, { type : 'singleclick' } )); }
	}
    function clear_h() {
		if (h !== null) {
			clearTimeout(h);
			h = null;
		}
	}
});

// initialise map
var map = new L.map('map', {
	maxBounds: LBounds.pad(0.5),
	maxBoundsViscosity: 1.0,
	minZoom: 10,
	bounceAtZoomLimits: false,
	contextmenu: true,
	contextmenuItems: [{
		text: '<i class="fas fa-hand-pointer fa-fw"></i> Query feature',
		index: 0,
		callback: reverseQuery
	}, {
		text: '<i class="fas fa-walking fa-fw"></i> Walk to here',
		index: 1,
		callback: walkHere
	}, {
		text: '<i class="fas fa-map-marker-alt fa-fw"></i> Add a walk point',
		index: 2,
		callback: walkPoint
	}, {
		text: '<i class="fas fa-crosshairs fa-fw"></i> Centre map here',
		index: 3,
		callback: centreMap
	}, {
		text: '<i class="fas fa-street-view fa-fw"></i> Google Street View',
		index: 4,
		callback: gStreetview
	}, '-', {
		text: '<i class="far fa-sticky-note fa-fw"></i> Leave a note here',
		index: 5,
		callback: improveMap
	}]
}).whenReady(function () {
	// clear loading elements
	if (spinner === 0) $('#spinner').fadeOut(200);
	$('#map').css('background', '#e6e6e6');
	// sidebar information
	$('#sidebar').fadeIn();
	if (window.ontouchstart === undefined) $('.sidebar-tabs').tooltip({ hide: false, show: false, track: true, position: { my: 'left+15 top+10' } });
	getTips('rand');
	if (actTab === defTab) {
		showWeather();
		showMapEditsRss();
	}
	$('#home .sidebar-body').append('<p><img style="vertical-align:text-top;" src="favicon-16x16.png"> <span class="comment">&copy; Bexhill-OSM 2016-' + new Date().getFullYear() + '</span></p>');
	$('#walkList, #tourList').trigger('change');
	// add overlay opacity slider to layer control
	$('.leaflet-top.leaflet-right').append(
		'<div id="inputOpacity" class="leaflet-control leaflet-bar">' +
			'<input type="range" min="0" max="1" step="0.05">' +
			'<div class="leaflet-popup-close-button" title="Remove layer" onclick="map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);">×</div>' +
		'</div>'
	).append(
		'<div class="theme leaflet-control leaflet-control-statusmsg"></div>'
	);
	setTimeout(function () {
		$('.leaflet-control-layers-separator').text('Overlays');
		$('.leaflet-control-layers-overlays label').eq(4).after('<div class="leaflet-control-layers-separator">Old maps</div>');
	}, 10);
	// tutorial modal
	function showModalTutor(target, id, css, text, arrowcss) {
		target.before(
			'<div id="' + id + '" class="modalTutor leaflet-control" style="' + css + '">' + text +
			'<button type="button" class="modalButton theme">Got it</button>' +
			'<div class="modalTutorArrow" style="' + arrowcss + '"></div></div>'
		);
		L.DomEvent.disableClickPropagation($('#' + id)[0]).disableScrollPropagation($('#' + id)[0]);
		$('#' + id).on('click', function () {
			$(this).fadeOut(100);
			window.localStorage.tutorial = 0;
		});
	}
	if (top === self && window.localStorage && !window.localStorage.tutorial && window.location.href.indexOf('?') === -1) {
		showModalTutor($('.leaflet-control-layers'), 'modalT1', 'left:-190px;', 'Use the Layers Control to view various modern and historical maps.', 'right:-5px;');
		showModalTutor($('#btnClearmap'), 'modalT2', 'left:40px;', 'You can right-click query the map to find out more about a place, then use this Clear Map button to bin the markers.', 'left:-5px;');
		showModalTutor($('.sidebar-tabs ul li').eq(3), 'modalT3', 'left:40px;', 'Explore the Historic Tour tab to view various articles relating to the history of Bexhill.', 'left:-5px;');
		showModalTutor($('#inputOpacity input'), 'modalT4', 'left:-190px;', 'This slider changes the opacity of the overlay.  You can also press CTRL to quickly switch opacity.', 'right:-5px;');
	}
	// holiday decorations
	if (new Date().getMonth() === 3 && new Date().getDate() >= 20) $('#sidebar').append('<img id="holidayImg" src="assets/img/holidays/easterSb.png">');
	else if (new Date().getMonth() === 9 && new Date().getDate() >= 20) $('#sidebar').append('<img id="holidayImg" src="assets/img/holidays/halloweenSb.png">');
	else if (new Date().getMonth() === 11) xmasDecor();
	// prevent click-through on map controls
	L.DomEvent.disableClickPropagation($('#inputOpacity')[0]).disableScrollPropagation($('#inputOpacity')[0]);
	$('.leaflet-control').bind('contextmenu', function (e) { e.stopPropagation(); });
	$('.leaflet-control-geocoder-form').click(function (e) { e.stopPropagation(); });
	// add delay after load for sidebar to animate open to create minimap
	setTimeout(function () { $('#minimap > map').imageMapResize(); }, 500);
}).on('singleclick', function (e) {
	// reverse lookup
	if (map.getZoom() >= 15) reverseQuery(e, 'sclick');
}).on('contextmenu.show', function () {
	// https://github.com/aratcliffe/Leaflet.contextmenu
	// show walkHere if user located within map
	if (lc._active && map.options.maxBounds.contains(lc._event.latlng) && map.getZoom() >= 14) $('.leaflet-contextmenu-item').eq(1).show();
	else $('.leaflet-contextmenu-item').eq(1).hide();
}).on('popupopen', function (e) {
	// show directions button if user located within map
	if (lc._active && LBounds.contains(lc._event.latlng)) $('.popup-direct').show();
	$('.popup-direct').click(function () {
		walkHere({ latlng: e.popup._latlng });
		map.closePopup();
	});
	// edit on osm.org
	$('.popup-edit').click(function () {
		popupWindow('https://www.openstreetmap.org/edit?editor=id&' + $('.popup-edit').attr('id').replace('_', '=') + '#map=19/' + e.popup._latlng.lat + '/' + e.popup._latlng.lng, 'editWindow', 1024, 768);
	});
	// delay required when switching directly to another popup
	setTimeout(function () {
		var corsUrl = 'https://cors-anywhere.herokuapp.com/';
		// opening-hours accordion
		$('.popup-ohContainer').accordion({
			heightStyle: 'content',
			collapsible: true,
			active: false,
			animate: 100
		});
		// fhrs api for showing food hygiene ratings
		if ($('.popup-fhrs').length) {
			// cors proxy for https users
			$.ajax({
				url: ((window.location.protocol === 'https:') ? corsUrl : '') + 'http://api.ratings.food.gov.uk/establishments/' + $('.popup-fhrs').attr('fhrs-key'),
				headers: { 'x-api-version': 2 },
				dataType: 'json',
				success: function (result) {
					if ($('#inputDebug').is(':checked')) console.debug(result);
					var RatingDate = (result.RatingValue !== 'AwaitingInspection') ? new Date(result.RatingDate).toLocaleDateString('en-GB') : 'TBC';
					$('.popup-fhrs').html(
						'<a href="http://ratings.food.gov.uk/business/en-GB/' + result.FHRSID + '" title="Food Hygiene Rating (' + RatingDate + ')" target="_blank">' +
						'<img alt="Hygiene: ' + result.RatingValue + '" src="assets/img/fhrs/' + result.RatingKey + '.png"></a>'
					);
				},
				error: function (xml, status, error) {
					$('.popup-fhrs').empty();
					if ($('#inputDebug').is(':checked')) console.debug('Error fetching fhrs data: ' + status + ' | ' + error); 
				}
			});
		}
		// nextbus api for showing bus times
		if ($('.popup-bsTable').length) $.ajax({
			type: 'POST',
			url: corsUrl + 'http://nextbus.mxdata.co.uk/nextbuses/1.0/1',
			headers: { 'Authorization': 'Basic ' + btoa(BOSM.trvllneApi.u + ':' + BOSM.trvllneApi.p) },
			contentType: 'text/xml',
			dataType: 'xml',
			data:
				'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
				'<Siri version="1.0" xmlns="http://www.siri.org.uk/">' +
				'<ServiceRequest>' +
					'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
					'<RequestorRef>' + BOSM.trvllneApi.u + '</RequestorRef>' +
					'<StopMonitoringRequest version="1.0">' +
						'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
						'<MessageIdentifier>12345</MessageIdentifier>' +
						'<MonitoringRef>' + $('.popup-bsTable').attr('naptan-key') + '</MonitoringRef>' +
					'</StopMonitoringRequest>' +
				'</ServiceRequest>' +
				'</Siri>',
			success: function (xml) {
				var numResults = $(xml).find('MonitoredVehicleJourney').length;
				if ($('#inputDebug').is(':checked')) console.debug(xml);
				if (numResults) {
					var maxResults = (numResults < 4) ? numResults : 4;
					$('.popup-bsTable').empty();
					for (var c = 0; c < maxResults; c++) {
						var departTime = $(xml).find('ExpectedDepartureTime').eq(c).text() ? $(xml).find('ExpectedDepartureTime').eq(c).text() : $(xml).find('AimedDepartureTime').eq(c).text();
						var departTimer = time_parser((new Date(departTime) - new Date()) / 60000);
						$('.popup-bsTable').append(
							'<tr><td>' + $(xml).find('PublishedLineName').eq(c).text() + '</td>' +
							'<td>' + $(xml).find('DirectionName').eq(c).text() + '</td>' +
							'<td title="' + new Date(departTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '">' + ((departTimer === -1) ? 'Due' : departTimer) + '</td></tr>'
						);
					}
					$('.popup-bsTable').after('<div class="popup-imgAttrib">Data: <a href="http://www.travelinedata.org.uk/" target="_blank">Traveline NextBuses</div>');
				}
				else $('.popup-bsTable').html('<span class="comment">No buses due at this time.</span>');
			},
			error: function (xml, status, error) {
				$('.popup-bsTable').empty();
				if ($('#inputDebug').is(':checked')) console.debug('Error fetching bus data: ' + status + ' | ' + error); 
			}
		});

	}, 200);
	if ($('.popup-imgContainer').length) {
		$('.popup-imgContainer')
			// navigate images
			.on('swiperight', function () { navImg(0); })
			.on('swipeleft', function () { navImg(1); })
			.on('wheel', function (e) {
				if (e.originalEvent.deltaY < 0) navImg(0);
				else if (e.originalEvent.deltaY > 0) navImg(1);
				e.preventDefault();
			})
			// grow popup images
			.on('click', function () { $('.popup-imgContainer img').css({ 'max-width': '100%', 'max-height': imgSize }); })
			// large image in window
			.on('dblclick', function () { popupWindow($(this).find('img').attr('src').replace('w=' + imgSize, 'w=1024'), 'imgWindow', 1034, 778); });
		$('.popup-imgContainer, .navigateItem')
			.on('dragstart', false)
			.on('selectstart', false);
		$('#img0 img')
			// timeouts needed if directly switching to another popup
			.on('load', function () { setTimeout(function () {
				$('.popup-imgContainer img').attr('alt', 'Image of ' + $('.popup-header h3').text());
				getWikiAttrib(0);
				// add padding on attribution for navigation buttons
				if ($('.leaflet-popup .navigateItem').length) {
					var rpad = 70;
					if ($('.leaflet-popup .navigateItem a').length === 1) rpad = 20;
					else if ($('.leaflet-popup .navigateItem a').length === 2) rpad = 45;
					$('.popup-imgAttrib').css({ 'text-align': 'left', 'padding-right': rpad + 'px' });
				}
				e.popup._adjustPan(); 
			}, 200); });
		// error if image not found
		$('.popup-imgContainer img').on('error', function () { setTimeout(function () { $('.popup-imgContainer img').attr('alt', 'Error: Image not found');	}, 200); });
	}
}).on('baselayerchange', function (e) {
	// get layer name on change
	for (var c in baseTileList.name) {
		if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	}
	permalinkSet();
}).on('overlayadd', function (e) {
	loadingControl._showIndicator();
	// remove previous overlay
	setTimeout(function () {
		if ($('.leaflet-control-layers-overlays input:checked').length > 1) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		// get layer name on change
		for (var c in overlayTileList.name) {
			if (e.name === overlayTileList.name[c]) actOverlayLayer = overlayTileList.keyname[c];
		}
		// set overlay opacity controls
		$('#inputOpacity').show();
		$('#inputOpacity input')
			.val(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity)
			.on('input change', function () { tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(this.value); })
			.on('change', function () { permalinkSet(); })
			.on('mouseover', function () { this.focus(); })
			.attr('title', tileOverlayLayer[actOverlayLayer].name + ' opacity');
		permalinkSet();
	}, 10);
}).on('overlayremove', function () {
	if (!$('.leaflet-control-layers-overlays input:checked').length) {
		actOverlayLayer = undefined;
		$('#inputOpacity').hide();
	}
	if ($('.leaflet-control-layers-separator').length === 1) $('.leaflet-control-layers-overlays label').eq(4).after('<div class="leaflet-control-layers-separator">Old maps</div>');
	permalinkSet();
}).on('zoomend', function () {
	// resize ww2 markers depending on zoom
	if (imgLayer === 'ww2Bombmap' || imgLayer === 'ww2Shelters') {
		if (map.getZoom() >= 16) $('.ww2Icon').css({ 'margin-left': '-14px', 'margin-top': '-14px', 'height': '28px', 'width': '28px' });
		else if (map.getZoom() === 15) $('.ww2Icon').css({ 'margin-left': '-10px', 'margin-top': '-10px', 'height': '20px', 'width': '20px' });
		else if (map.getZoom() === 14) $('.ww2Icon').css({ 'margin-left': '-7px', 'margin-top': '-7px', 'height': '14px', 'width': '14px' });
		else if (map.getZoom() <= 13) $('.ww2Icon').css({ 'margin-left': '-5px', 'margin-top': '-5px', 'height': '10px', 'width': '10px' });
	}
});

// https://github.com/davidjbradshaw/image-map-resizer
// bounding coordinates for minimap
$('#minimap > map > area').click(function () {
	var mLoc = $(this).attr('title'), mBounds = [];
	switch (mLoc) {
		case 'Bexhill': mBounds = LBounds; break;
		case 'Barnhorn': mBounds = [[50.8507, 0.4301], [50.8415, 0.4066]]; break;
		case 'Central': mBounds = [[50.8425, 0.4801], [50.8351, 0.4649]]; break;
		case 'Collington': mBounds = [[50.8472, 0.4604], [50.8352, 0.4406]]; break;
		case 'Cooden': mBounds = [[50.8417, 0.4416], [50.8305, 0.4195]]; break;
		case 'Glenleigh Park': mBounds = [[50.8573, 0.4641], [50.8476, 0.4454]]; break;
		case 'Glyne Gap': mBounds = [[50.8485, 0.5102], [50.8423, 0.4954]]; break;
		case 'The Highlands': mBounds = [[50.8637, 0.4615], [50.8566, 0.4462]]; break;
		case 'Little Common': mBounds = [[50.8501, 0.4424], [50.8399, 0.4244]]; break;
		case 'Old Town': mBounds = [[50.8484, 0.4841], [50.8419, 0.4706]]; break;
		case 'Pebsham': mBounds = [[50.8589, 0.5140], [50.8472, 0.4882]]; break;
		case 'Sidley': mBounds = [[50.8607, 0.4833], [50.8509, 0.4610]]; break;
	}
	if (mBounds) map.flyToBounds(L.latLngBounds(mBounds));
});

var rQuery = false;
function reverseQuery (e, source) {
	// get location, look up id on photon and pass it to overpass
	$('.leaflet-control-statusmsg').hide();
	$('#spinner').show();
	var geocoder = L.Control.Geocoder.photon({ reverseQueryParams: { distance_sort: true, radius: 0.05 } });
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
		var geoMarker = results[0] ? results[0].properties : '';
		if ($('#inputDebug').is(':checked') && results[0]) console.debug(results[0]);
		if (geoMarker.osm_id) {
			clear_map();
			rQuery = source ? source : true;
			show_overpass_layer(elementType(geoMarker.osm_type) + '(' + geoMarker.osm_id + ');');
		}
		else {
			$('#spinner').fadeOut(200);
			$('.leaflet-control-statusmsg').html('<i class="fas fa-info-circle fa-fw"></i> Nothing found here, try another area.').show();
		}
	});
}
function walkPoint (e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	// drop a walk marker if one doesn't exist
	var wp = routingControl.getWaypoints();
	for (var c in wp) {
		if (!wp[c].name) {
			routingControl.spliceWaypoints(c, 1, e.latlng);
			return;
		}
	}
	routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function walkHere (e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	routingControl.setWaypoints([
		[lc._event.latlng.lat, lc._event.latlng.lng],
		[e.latlng.lat, e.latlng.lng]
	]);
}
function centreMap (e) {
	map.panTo(e.latlng);
}
function gStreetview (e) {
	popupWindow('http://maps.google.com/?cbll=' + e.latlng.lat + ',' + e.latlng.lng + '&layer=c', 'noteWindow', 1024, 768);
}
function improveMap (e) {
	// create a note on osm.org
	popupWindow('https://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, 'noteWindow', 1024, 768);
}

$('#walkList')
	.change(function () {
		suggestWalk ($(this).val(), 1);
		$('#walkDesc').append('<img alt="Walk preview" src="assets/img/walks/' + $(this).val() + '.jpg">');
	});
$('#walkSelect').click(function () {
	suggestWalk ($('#walkList').val(), 0);
	if ($(window).width() < 768) sidebar.close();
});
function suggestWalk (walkId, isDesc) {
	clear_map();
	switch(walkId) {
		case 'ww2h':
			if (isDesc) $('#walkDesc').html(
				'The route of this walk is marked out by a series of 10 plaques along the promenade. ' +
				'Launched in 2011, it hopes to encourage people to regularly walk a specific distance along the promenade. ' +
				'Small plinths are placed at ground level opposite every third beach groyne between numbers 48 and 72.'
			);
			else {
				routingControl.setWaypoints([
					[50.83567, 0.45892],
					[50.83701, 0.47363]
				]);
				map.flyTo([50.8364, 0.4664], 16);
			}
			break;
		case 'tmrt':
			if (isDesc) $('#walkDesc').html(
				'In May 1902 Bexhill-on-Sea became "The Birthplace of British Motor Racing". ' +
				'Follow five seafront Motoring Heritage panels and two galleries dedicated to the story of those intrepid ' +
				'early motoring pioneers (the 5th panel is situated outside ' +
				'<a class="theme" onclick="map.flyTo([50.833, 0.427], 18);">Cooden Beach Hotel <i class="theme fas fa-search fa-sm"></i></a>).'
			);
			else {
				routingControl.setWaypoints([
					[50.84059, 0.49121],
					[50.83729, 0.47612],
					[50.83647, 0.46637],
					[50.83732, 0.46639]
				]);
				// show related information boards
				show_overpass_layer('(node["ref"~"^TMT"];node(5059264455);node(5059264456););');
				map.flyTo([50.8385, 0.4787], 16);
			}
			break;
		case 'neye':
			if (isDesc) $('#walkDesc').html(
				'Pevensey Levels was a tidal inlet until the eastward drift of coastal shingle isolated it and a salt marsh developed. ' +
				'The walk starts and ends at The Star Inn pub, heading north-west towards the archaeological site of Northeye, a village abandoned to flooding in the Middle Ages. ' +
				'Before making your way back round, you will see evidence of a wooden sea defense from the 14th century called Crooked Ditch.<br>' +
				'Although sometimes rough and wet in places, there are great open views of countryside and plenty of grazing sheep to keep you company.'
			);
			else {
				routingControl.setWaypoints([
					[50.83026, 0.39324],
					[50.83832, 0.38729],
					[50.83618, 0.40594],
					[50.83007, 0.39370]
				]);
				map.flyTo([50.8346, 0.39480], 15);
			}
			break;
		case 'hwds':
			if (isDesc) $('#walkDesc').html(
				'Starting at the Wheatsheaf Inn, this walk takes you on a public right-of-way through wood, farmland and down country lanes. ' +
				'Pass through Whydown and see the extraordinary early 20th century Gotham Wood House, before arriving at the west corner of ancient Highwoods.'
			);
			else {
				routingControl.setWaypoints([
					[50.84536, 0.43353],
					[50.84958, 0.42689],
					[50.86120, 0.42984]
				]);
				map.flyTo([50.8533, 0.4289], 15);
			}
			break;
		case 'gnwy':
			if (isDesc) $('#walkDesc').html(
				'The Greenway runs alongside the Combe Valley Way, providing access for walkers, cyclists and horse riders between Bexhill and Hastings. ' +
				'It links up with public bridleways and footpaths in the area, including the 1066 Country Walk Bexhill Link, with two sections where horse ' +
				'riders take an alternative route to walkers and cyclists.'
			);
			else {
				routingControl.setWaypoints([
					[50.85676, 0.47898],
					[50.87008, 0.52089]
				]);
				map.flyTo([50.8632, 0.4938], 15);
			}
			break;
		case '1066':
			if (isDesc) $('#walkDesc').html(
				'The route commemorates the 1066 Battle of Hastings, linking the places and the people of that important time. ' +
				'This is a section of the Bexhill - Battle link, the full route can be found on ' +
				'<a href="https://hiking.waymarkedtrails.org/#route?id=3161493&map=13!50.8789!0.4901" target="_blank">waymarkedtrails.org <i class="theme fas fa-external-link-alt fa-sm"></i></a>.'
			);
			else {
				routingControl.setWaypoints([
					[50.84522, 0.48044],
					[50.84972, 0.48419],
					[50.87800, 0.50009]
				]);
				map.flyTo([50.8504, 0.4840], 15);
			}
			break;
		case 'bcr1':
			if (isDesc) $('#walkDesc').html(
				'This is an edge of town walk of about 6 miles. It includes riverside fields and farmland, hedgerow remains of ancient woodland, ' +
				'reedbeds, vegetated shingle and a wonderful mile of rock pools at low tide. There are no hills or particularly muddy areas. Refreshments and toilets are ' +
				'available at the start point - Bexhill railway station - and towards the end of the walk.'
			);
			else {
				routingControl.setWaypoints([
					[50.84125, 0.47717],
					[50.84515, 0.47961],
					[50.86230, 0.51823],
					[50.84808, 0.52014],
					[50.84056, 0.49142],
					[50.83792, 0.47660],
					[50.84093, 0.47718]
				]);
				map.flyTo([50.8474, 0.4874], 14);
			}
			break;
	}
}

// navigation controls for historic tour
$('#tourNext').click(function () {
	if ($('#tourList option:selected').next().is(':enabled')) $('#tourList option:selected').next().prop('selected', true).trigger('change');
});
$('#tourPrev').click(function () {
	if ($('#tourList option:selected').prev().is(':enabled')) $('#tourList option:selected').prev().prop('selected', true).trigger('change');
});
$('#tourList').change(function () {
	var tourNum = $(this).val();
	$('#tourFrame').hide();
	$('#tourLoading').show();
	if (tourNum.length === 1) tourNum = '0' + tourNum;
	$('#tourFrame')
		.attr('src', 'tour/tour' + tourNum + '/index.html')
		.one('load', function () {
			$('#tourLoading').hide();
			$(this).fadeIn();
			$(this).contents().find('sup').click(function () { tourSource(this.innerText); });
		});
	permalinkSet();
});

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.featureGroup(), imageOverlay = new L.featureGroup(), areaOutline = new L.featureGroup();
map.addLayer(iconLayer).addLayer(imageOverlay).addLayer(areaOutline);
// leaflet icon image path
L.Icon.Default.imagePath = 'assets/img/leaflet/';
// quadkey layers
L.TileLayer.QuadKeyTileLayer = L.TileLayer.extend({
	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, {
			s: this._getSubdomain(tilePoint),
			q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
		});
	},
	_quadKey: function (x, y, z) {
		var quadKey = [];
		for (var i = z; i > 0; i--) {
			var digit = '0';
			var mask = 1 << (i - 1);
			if ((x & mask) !== 0) {
				digit++;
			}
			if ((y & mask) !== 0) {
				digit++;
				digit++;
			}
			quadKey.push(digit);
		}
		return quadKey.join('');
	}
});
// baselayers
var attribution = '&copy; <a href="https://openstreetmap.org/copyright" title="Copyright and License" target="_blank">OpenStreetMap contributors</a>';
var tileBaseLayer = {
	bosm: {
		name: 'Bexhill-OSM',
		url: 'https://api.mapbox.com/styles/v1/drmx/cj1dq9pr900go2so8wn4ia0k0/tiles/256/{z}/{x}/{y}@2x?access_token=' + BOSM.mapboxKey,
		attribution: attribution + ', <a href="https://mapbox.com/" target="_blank">MapBox</a>',
		maxNativeZoom: 20
	},
	osmstd: {
		name: 'OpenStreetMap',
		url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		maxNativeZoom: 19
	},
	forte: {
		name: 'General Purpose',
		url: 'https://{s}.tiles.quaidorsay.fr/tile/forteen/{z}/{x}/{y}.png',
		attribution: attribution + ', <a href="https://github.com/tilery/pianoforte" target="_blank">Yohan Boniface</a>',
		maxNativeZoom: 20
	},
	osmuk: {
		name: 'OpenStreetMap UK',
		url: 'https://map.atownsend.org.uk/hot/{z}/{x}/{y}.png',
		attribution: attribution + ', <a href="https://map.atownsend.org.uk/maps/map/map.html" target="_blank">Andy Townsend</a>',
		maxNativeZoom: 24
	},
	cycle: {
		name: 'OpenCycleMap',
		url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + BOSM.thuforKey,
		attribution: attribution + ', <a href="https://thunderforest.com/maps/opencyclemap/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	trnsprt: {
		name: 'Public Transport',
		url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + BOSM.thuforKey,
		attribution: attribution + ', <a href="https://thunderforest.com/maps/transport/" target="_blank">ThunderForest</a>',
		maxNativeZoom: 20
	},
	bing: {
		name: 'Bing Satellite',
		url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
		attribution: '<a href="https://maps.bing.com/" target="_blank">Microsoft Bing</a>',
		subdomains: '0123',
		maxNativeZoom: 19,
		quadkey: true,
		errorTileUrl: 'https://ecn.t0.tiles.virtualearth.net/tiles/a1202020223330?g=737&n=z'
	}
};
var tileBaseLayers = {}, baseTileList = {name: [], keyname: []};
for (var tile in tileBaseLayer) {
	var subdomains = tileBaseLayer[tile].subdomains ? tileBaseLayer[tile].subdomains : 'abc';
	var tileAttribution = (tileBaseLayer[tile].attribution) ? tileBaseLayer[tile].attribution : attribution;
	var options = {
		attribution: tileAttribution,
		subdomains: subdomains,
		maxZoom: 20,
		maxNativeZoom: tileBaseLayer[tile].maxNativeZoom,
		errorTileUrl: tileBaseLayer[tile].errorTileUrl
	};
	if (tileBaseLayer[tile].quadkey) tileBaseLayers[tileBaseLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileBaseLayer[tile].url, options);
	else tileBaseLayers[tileBaseLayer[tile].name] = L.tileLayer(tileBaseLayer[tile].url, options);
	// create object array for all basemap layers
	baseTileList.name.push(tileBaseLayer[tile].name);
	baseTileList.keyname.push(tile);
}
// overlays
var tileOverlayLayer = {
	hshade: {
		name: 'Hillshading',
		url: 'https://korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}',
		attribution: '<a href="https://giscience.uni-hd.de/" target="_blank">GIScience Heidelberg</a>',
		opacity: 1,
		maxNativeZoom: 18
	},
	lidar: {
		name: 'Lidar DTM 2m',
		url: 'https://www.geostore.com/OGC/OGCInterface;jsessionid=n2RNMRjfFYYfK0rb70ny36PN?SESSIONID=1356990971&INTERFACE=ENVIRONMENT',
		wms: {
			layers: 'LIDAR-DTM-TSR-2M-ENGLAND-EA-WMS',
			format: 'image/png',
			transparent: true,
			uppercase: true
		},
		attribution: '<a href="https://www.gov.uk/government/organisations/environment-agency/" target="_blank">Environment Agency</a>',
		opacity: 0.8
		
	},
	prow: {
		name: 'Rights of Way',
		url: 'http://inspire.misoportal.com:80/geoserver/east_sussex_county_council_east_sussex_rights_of_way/ows?resid=8886ba7d-a785-470d-be18-3e425',
		wms: {
			layers: 'east_sussex_county_council_east_sussex_rights_of_way',
			format: 'image/png',
			transparent: true
		},
		attribution: '<a href="https://www.eastsussex.gov.uk/leisureandtourism/countryside/rightsofway/" target="_blank">East Sussex County Council</a>',
		opacity: 1,
		maxNativeZoom: 18
	},
	landreg: {
		name: 'Land Registry',
		url: 'http://inspire.landregistry.gov.uk/inspire/ows',
		wmsOverlay: {
			layers: 'inspire:CP.CadastralParcel',
			format: 'image/png',
			transparent: true
		},
		attribution: '<a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty/view/LrInspireIdInit.do" target="_blank">HM Land Registry</a>',
		opacity: 0.7
	},
	bing: {
		name: 'Bing Satellite',
		url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
		attribution: '<a href="https://maps.bing.com/" target="_blank">Microsoft Bing</a>',
		subdomains: '0123',
		opacity: 0.5,
		maxNativeZoom: 19,
		quadkey: true
	},
	br1959: {
		name: '1959 British Rail',
		url: 'assets/maptiles/br1959/{z}/{x}/{y}.png',
		attribution: '<a href="http://car57.zenfolio.com/" target="_blank">Michael Pannell</a>',
		bounds: L.latLngBounds([50.83722, 0.45732], [50.8907, 0.5134]),
		opacity: 1,
		maxNativeZoom: 19
	},
	os1955: {
		name: '1955 Ordnance Survey',
		url: 'https://geo.nls.uk/mapdata3/os/ldn_tile/{z}/{x}/{y}.png',
		attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: LBounds,
		opacity: 1,
		maxNativeZoom: 19
	},
	arp1942: {
		name: '1942 Air Raid Precautions',
		url: 'assets/maptiles/arp1942/{z}/{x}/{y}.png',
		attribution: '<a href="http://www.bexhillmuseum.co.uk" target="_blank">Bexhill Museum</a>',
		bounds: L.latLngBounds([50.8292, 0.4157], [50.8713, 0.5098]),
		opacity: 1,
		maxNativeZoom: 18
	},
/*
	ob1944: {
		name: '1944 Observer Bomb Map',
		url: 'assets/maptiles/ob1944/{z}/{x}/{y}.png',
		bounds: L.latLngBounds([50.826, 0.411], [50.878, 0.508]),
		opacity: 1,
		maxNativeZoom: 16
	},
*/
	os1930: {
		name: '1930 Ordnance Survey',
		url: 'assets/maptiles/os1930/{z}/{x}/{y}.png',
		attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank">Crown Copyright Ordnance Survey</a>',
		bounds: LBounds,
		opacity: 1,
		maxNativeZoom: 17
	},
	os1909: {
		name: '1909 Ordnance Survey',
		url: 'assets/maptiles/os1909/{z}/{x}/{y}.png',
		attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: L.latLngBounds([50.819, 0.379], [50.848, 0.517]),
		opacity: 1,
		minZoom: 13,
		minNativeZoom: 14,
		maxNativeZoom: 18
	},
	os1899: {
		name: '1899 Ordnance Survey',
		url: 'assets/maptiles/os1899/{z}/{x}/{y}.jpg',
		attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank">NLS Maps API</a>',
		bounds: LBounds,
		opacity: 1,
		maxNativeZoom: 17
	},
	os1878: {
		name: '1878 Ordnance Survey',
		url: 'assets/maptiles/os1878/{z}/{x}/{y}.png',
		attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank">Crown Copyright Ordnance Survey</a>',
		bounds: LBounds,
		opacity: 1,
		maxNativeZoom: 16
	},
	os1873: {
		name: '1873 Ordnance Survey',
		url: 'assets/maptiles/os1873/{z}/{x}/{y}.png',
		attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank">Crown Copyright Ordnance Survey</a>',
		bounds: LBounds,
		opacity: 1,
		maxNativeZoom: 17
	},
	bt1839: {
		name: '1839 Bexhill Tithe',
		url: 'assets/maptiles/bt1839/{z}/{x}/{y}.png',
		attribution: '<a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/MapDetail.aspx?ID=112769" target="_blank">ESRO TDE 141</a>',
		bounds: L.latLngBounds([50.815, 0.351], [50.890, 0.536]),
		opacity: 1,
		maxNativeZoom: 17
	},
	
	mb1805: {
		name: '1805 Manor of Bexhill',
		url: 'assets/maptiles/mb1805/{z}/{x}/{y}.png',
		attribution: '<a href="http://www.thekeep.info/collections/getrecord/GB179_AMS5819" target="_blank">ESRO AMS 5819</a>',
		bounds: L.latLngBounds([50.805, 0.376], [50.883, 0.511]),
		opacity: 1,
		maxNativeZoom: 17,
	},

	yg1778: {
		name: '1778 Yeakell & Gardner',
		url: 'assets/maptiles/yg1778/{z}/{x}/{y}.png',
		attribution: '<a href="http://www.envf.port.ac.uk/geo/research/historical/webmap/sussexmap/" target="_blank">University of Portsmouth</a>',
		bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.631]),
		opacity: 1,
		maxNativeZoom: 15
	}
};
var tileOverlayLayers = {}, overlayTileList = {name: [], keyname: []};
for (var tile in tileOverlayLayer) {
	var subdomains = tileOverlayLayer[tile].subdomains ? tileOverlayLayer[tile].subdomains : 'abc';
	var tms = tileOverlayLayer[tile].tms ? tileOverlayLayer[tile].tms : false;
	var minZoom = tileOverlayLayer[tile].minZoom ? tileOverlayLayer[tile].minZoom : 0;
	var maxZoom = tileOverlayLayer[tile].maxZoom ? tileOverlayLayer[tile].maxZoom : 20;
	var options = {
		attribution: tileOverlayLayer[tile].attribution,
		tms: tms,
		subdomains: subdomains,
		bounds: tileOverlayLayer[tile].bounds,
		opacity: tileOverlayLayer[tile].opacity,
		maxZoom: maxZoom,
		minZoom: minZoom,
		maxNativeZoom: tileOverlayLayer[tile].maxNativeZoom,
		minNativeZoom: tileOverlayLayer[tile].minNativeZoom
	};
	if (tileOverlayLayer[tile].quadkey) tileOverlayLayers[tileOverlayLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileOverlayLayer[tile].url, options);
	else if (tileOverlayLayer[tile].wms) tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer.wms(tileOverlayLayer[tile].url, $.extend(tileOverlayLayer[tile].wms, options));
	else if (tileOverlayLayer[tile].wmsOverlay) tileOverlayLayers[tileOverlayLayer[tile].name] = L.WMS.overlay(tileOverlayLayer[tile].url, $.extend(tileOverlayLayer[tile].wmsOverlay, options));
	else tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer(tileOverlayLayer[tile].url, options);
	// create object array for all overlay layers
	overlayTileList.name.push(tileOverlayLayer[tile].name);
	overlayTileList.keyname.push(tile);
}
L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);

// full screen button
L.easyButton({
	id: 'btnFullscr',
	states: [{
		stateName: 'normalScreen',
		icon: 'fas fa-expand',
		title: 'Full screen (ALT-ENTER)',
		onClick: function (control) {
			var viewer = L.Browser.ie ? $('body')[0] : $('html')[0];
			var rFS = viewer.requestFullScreen || viewer.webkitRequestFullscreen  || viewer.mozRequestFullScreen || viewer.msRequestFullscreen;
			rFS.call(viewer);
			control.state('fullScreen');
		}
	}, {
		stateName: 'fullScreen',
		icon: 'fas fa-compress',
		title: 'Exit full screen (ALT-ENTER)',
		onClick: function (control) {
			var cFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
			cFS.call(document);
			control.state('normalScreen');
		}
	}]
}).addTo(map);

// https://github.com/domoritz/leaflet-locatecontrol
var lc = L.control.locate({
	icon: 'fas fa-location-arrow',
	iconLoading: 'fas fa-spinner fa-pulse',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: true,
	circleStyle: { interactive: false },
	markerStyle: { radius: 8 },
	strings: {
		title: 'Show your location',
		popup: '<br><p style="margin:0; text-align:center;"><a onclick="userLoc();">What is around me?</a></p>'
	},
	locateOptions: {
		enableHighAccuracy: false
	},
	onLocationError: function () {
		alert('Sorry, there was an error while trying to locate you.');
	},
	onLocationOutsideMapBounds: function () {
		alert('You appear to be located outside the Bexhill area.\nCome visit! :)');
		lc.stop();
	}
}).addTo(map);
// show pois within a radius
function userLoc() {
	map.closePopup();
	clear_map();
	show_overpass_layer('(nwr(around:100,' + lc._event.latlng.lat + ',' + lc._event.latlng.lng + '););');
}

// https://github.com/perliedman/leaflet-control-geocoder
var geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north],
			email: email
		}
	}),
	expand: 'click',
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
}).on('markgeocode', function (e) {
	// pass nominatim address query to overpass
	if ($('#inputDebug').is(':checked')) console.debug(e.geocode);
	var geoMarker = e.geocode.properties;
	if (geoMarker.osm_id) {
		clear_map();
		rQuery = true;
		show_overpass_layer(geoMarker.osm_type + '(' + geoMarker.osm_id + ');');
		// hide geocoder controls
		setTimeout(function () { 
			$('.leaflet-control-geocoder-alternatives').addClass('leaflet-control-geocoder-alternatives-minimized');
			$('.leaflet-control-geocoder-form input').blur();
			$('.leaflet-control-geocoder').removeClass('leaflet-control-geocoder-expanded');
		}, 50);
	}
}).addTo(map);
$('.leaflet-control-geocoder-icon').html('<i class="fas fa-search"></i>').attr('title','Address search (CTRL-F)');


// switches to a tab and an optional link to tour or anchor
function switchTab(tab, anchor) {
	if (tab !== actTab) $('a[href="#' + tab + '"]').click();
	$('#' + tab + ' .sidebar-body').scrollTop(0);
	if (anchor) {
		if (tab === 'tour') $('#tourList').val(anchor).trigger('change');
		else $('a[href="#goto' + anchor + '"]').click();
	}
}

// query map button
L.easyButton({
	id: 'btnQuery',
	states: [{
		stateName: 'queryOff',
		icon: 'fas fa-hand-pointer',
		title: 'Query features',
		onClick: function (control) {
			control.state('queryOn');
			$('.leaflet-grab').css('cursor', 'help');
		}
	}, {
		stateName: 'queryOn',
		icon: 'fas fa-hand-pointer',
		title: 'Query features',
		onClick: function (control) {
			control.state('queryOff');
			$('.leaflet-grab').css('cursor', '');
		}
	}]
}).addTo(map);

// clear map button
L.easyButton({
	id: 'btnClearmap',
	states: [{
		icon: 'fas fa-trash',
		title: 'Clear map (CTRL-DEL)',
		onClick: function () {
			// clear walk points, collapse suggested walks, clear poi marker layers
			routingControl.setWaypoints([]);
			clear_map();
		}
	}]
}).addTo(map);
// full reload on right click
$('#btnClearmap').bind('contextmenu', function () {
	window.localStorage.clear();
	$(location).attr('href', window.location.pathname);
	return false;
});

// fly the map to the bounds of markers
function getMarkerBounds(fg) {
	if ($(window).width() < 768) sidebar.close();
	map.flyToBounds(fg.getBounds().pad(0.2));
}

// https://github.com/Turbo87/sidebar-v2/
var sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
new L.Hash(map);

// https://github.com/ebrelsford/Leaflet.loading
var loadingControl = L.Control.loading({ separate: true });
map.addControl(loadingControl);

// https://github.com/perliedman/leaflet-routing-machine
var routingControl;
function setRoutingControl(units) {
	routingControl = L.Routing.control({
		units: units,
		collapsible: false,
		fitSelectedRoutes: false,
		reverseWaypoints: true,
		routeWhileDragging: false,
		showAlternatives: false,
		router: L.Routing.mapbox(BOSM.mapboxKey, {
			profile: 'mapbox/walking'
		}),
		lineOptions: {
			styles: [{
				color: 'darkgreen',
				opacity: 0.6,
				weight: 5
			}]
		},
		pointMarkerStyle: {
			radius: 8,
			color: 'darkgreen',
			opacity: 0.6,
			fillColor:'white',
			fillOpacity:0.4
		},
		geocoder: L.Control.Geocoder.nominatim({
			geocodingQueryParams: {
				bounded: 1,
				viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north]
			}
		})
	}).on('waypointschanged', function () {
		permalinkSet();
	});
	$('#routingControl').html(routingControl.onAdd(map));
}

function populatePoiTab() {
	var poiTags = {}, category = [], categoryList = [], c;
	for (var poi in pois) {
		if (pois[poi].catName && pois[poi].tagKeyword) {
			// get all keywords and put into categories
			poiTags[poi] = pois[poi].tagKeyword;
			category.push({ listLocation: poi, header: '<img src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name });
			// get unique category label for poi checkbox tab
			if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
		}
	}
	// https://github.com/pawelczak/EasyAutocomplete
	var options = {
		data: poiTags,
		minCharNumber: 3,
		list: {
			showAnimation: { type: 'fade', time: 100 },
			hideAnimation: { type: 'slide', time: 100 },
			maxNumberOfElements: 10,
			match: { enabled: true },
			onChooseEvent: function () {
				// find selected items category and split it to get checkbox, then display
				var catSplit = $('.eac-category')[$('#autocomplete').getSelectedItemIndex()].textContent.split(' - ')[1];
				clear_map();
				$('a[href="#pois"]').click();
				$('.poi-icons .poi-checkbox label[title="' + catSplit + '"] input').prop('checked', true);
				// scroll to checkbox
				if ($(window).width() >= 768) {
					$('.poi-icons')
						.scrollTop(0)
						.scrollTop($('.poi-icons .poi-checkbox label[title="' + catSplit + '"]').position().top - 50);
				}
				poi_changed();
				$('#autocomplete').val('');
			}
		},
		categories: category
	};
	$('#autocomplete').easyAutocomplete(options);
	$('div.easy-autocomplete').removeAttr('style');
	// create checkbox tables using poi categories
	var checkboxContent = '<p>', poiClass;
	for (c in categoryList) { checkboxContent += '<a href="#goto' + categoryList[c] + '">' + categoryList[c] + '</a><br>'; }
	checkboxContent += '<p>';
	for (c in categoryList) {
		checkboxContent += '<div id="goto' + categoryList[c] + '"><hr><h3>' + categoryList[c] + '</h3>';
		for (poi in pois) {
			if (pois[poi].catName === categoryList[c]) {
				poiClass = pois[poi].hide ? ' poiHide' : '';
				checkboxContent += L.Util.template(
					'<div class="poi-checkbox{hideable}">' +
						'<label title="{name}">' +
							'<img src="assets/img/icons/{icon}.png"></img>' +
							'<input type="checkbox" id="{key}"><span>{name}</span>' +
						'</label>' +
					'</div>',
					{ key: poi, name: pois[poi].name, icon: pois[poi].iconName, hideable: poiClass }
				);
			}
		}
		checkboxContent += '<div class="anchor"><a href="#gototoppois" title="Back to top">|<i class="fas fa-arrow-up fa-fw"></i>|</a></div></div>';
	}
	$('.poi-icons').append(checkboxContent);
}
populatePoiTab();

$(':text').on('focus', function () { $(this).select(); });

// https://github.com/jfirebaugh/leaflet-osm
function getOsmOutline(type, id) {
	if (type !== 'node') $.ajax({
		url: 'https://www.openstreetmap.org/api/0.6/' + type + '/' + id + '/full',
		dataType: 'xml',
		success: function (xml) { areaOutline.addLayer(new L.OSM.DataLayer(xml)).addTo(map); }
	});
}

// popup window
function popupWindow(url, title, w, h) {
	window.open(url, title, 'width=' + w + ', height=' + h + ', menubar=0, toolbar=0, resizable=1').focus();
}

// keyboard shortcuts
var keyDown = false;
$('html').keydown(function (e) {
	// ALT-ENTER: full screen
	if (e.keyCode === $.ui.keyCode.ENTER && e.altKey) {
		$('#btnFullscr').click();
		e.preventDefault();
	}
	// CTRL-F: address search
	else if (e.keyCode === 70 && e.ctrlKey) {
		$('.leaflet-control-geocoder-icon').click();
		e.preventDefault();
	}
	// CTRL-DEL: clear all layers
	else if (e.keyCode === $.ui.keyCode.DELETE && e.ctrlKey) {
		$('#btnClearmap').click();
		e.preventDefault();
	}
	// CTRL down: switch overlay transparency on
	else if (e.keyCode === 17 && actOverlayLayer && !keyDown) {
		keyDown = true;
		$('#inputOpacity input').val(0.1).trigger('change');
		e.preventDefault();
	}
}).keyup(function (e) {
	// CTRL up: switch overlay transparency off
	if (e.keyCode === 17 && actOverlayLayer) {
		keyDown = false;
		$('#inputOpacity input').val(0.9).trigger('change');
		e.preventDefault();
	}
});

// if user presses ENTER instead of selecting a category, do an address search with the value
$('#autocomplete').keydown(function (e) {
	if (e.keyCode === $.ui.keyCode.ENTER && $(this).val() && !$('#eac-container-autocomplete ul').is(':visible')) {
		if ($(window).width() < 768) sidebar.close();
		$('.leaflet-control-geocoder-icon').click();
		$('.leaflet-control-geocoder-form input').val($(this).val());
		geocode._geocode();
	}
});

$('#inputHide').change(function () {
	$('.poi-checkbox.poiHide').slideToggle(600);
});

$('.poi-checkbox input').click(function () {
	poi_changed($(this).attr('id'));
});

var scaleControl;
$('#settings input').not('#inputDebug').change(function () {
	// change unit of measurement
	if ($(this).attr('id') === 'inputUnit') {
		if (routingControl) $('#btnClearmap').click();
		if ($(this).is(':checked')) {
			if (scaleControl) scaleControl.remove();
			scaleControl = L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
			setRoutingControl('metric');
		}
		else {
			if (scaleControl) scaleControl.remove();
			scaleControl = L.control.scale({ metric: false, position: 'bottomright' }).addTo(map);
			setRoutingControl('imperial');
		}
	}
	permalinkSet();
});

// developer tools
$('#devTools').accordion({
	heightStyle: 'content',
	collapsible: true,
	active: false
});
$('#devTools h3').click(function () {
	$('#inputAttic, #inputOverpass').val('');
	if ($(this).attr('aria-expanded') === 'false') $('#inputDebug').prop('checked', false);
});
$('#inputDebug').change(function () {
	if ($(this).is(':checked')) map.setMaxBounds();
	else map.setMaxBounds(LBounds.pad(0.5));
});
$('#inputDebug').trigger('change');
$('#inputOverpass').keydown(function (e) {
	if (e.keyCode == $.ui.keyCode.ENTER && $(this).val()) {
		clear_map();
		$('#inputDebug').prop('checked', true);
		if ($(this).val().indexOf('[') !== 0) $(this).val('[' + $(this).val() + ']');
		show_overpass_layer('(nwr' + $(this).val() + ';);');
	}
});
function downloadBB() {
    window.location = $('#inputOpServer').val() + '/map?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',');
}

// clear poi marker and overlay layers
function clear_map() {
	imageOverlay.clearLayers();
	imgLayer = undefined;
	$('.poi-icons .poi-checkbox input:checked').prop('checked', false);
	poi_changed();
	spinner = 0;
	$('#spinner').hide();
	$('.poi-checkbox').removeClass('poi-loading');
	permalinkSet();
}

function poi_changed(newcheckbox) {
	// limit number of active checkboxes
	if ($('.poi-icons .poi-checkbox input:checked').length <= 3) {
		// remove old poi markers and results
		iconLayer.clearLayers();
		areaOutline.clearLayers();
		poiList = [];
		markerId = undefined;
		if ($('.poi-icons .poi-checkbox input:checked').length) {
			$('.poi-results h3').html('Results loading...');
			//build overpass query
			var query = '(';
			$('.poi-icons .poi-checkbox input:checked').each(function (i, element) { query += pois[element.id].query; });
			query += ');';
			show_overpass_layer(query);
		}
		else {
			$('.poi-results h3').html('Results cleared.');
			$('.poi-results').css('height', '').slideUp(400);
		}
		$('.poi-results-list').empty();
	}
	else {
		$('.poi-checkbox-selected').fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
		$('[id=' + newcheckbox + ']').prop('checked', false);
	}
	$('.poi-icons .poi-checkbox input').trigger('change');
}
// checkbox highlight
$('.poi-icons .poi-checkbox input').change(function () {
	if ($(this).prop('checked') === true) $(this).parent().addClass('poi-checkbox-selected');
	else $(this).parent().removeClass('poi-checkbox-selected');
});

// show tips
function getTips(tip) {
	var nextTip, tips = [
		'Click an area of the minimap to quickly zoom to that location.',
		'You can zoom-in and right-click query almost any building to see its details.',
		'Find any address by entering part of it into search <i class="fas fa-search fa-sm"></i> and pressing enter.',
		'Almost street in Bexhill has a history behind its name, search <i class="fas fa-search fa-sm"></i> for a road to learn more.',
		'Zoom-in and right-click query a bus-stop to see real-time information on arrivals.',
		'Zoom-in and right-click query a letter-box to see todays last post collection.',
		'Use the mouse wheel or swipe to see the next image in a pop-up. Double-click the image to see it in a larger size.',
		'Click <i class="fas fa-location-arrow fa-sm"></i> button to turn on your location and see POIs ordered by distance.',
		'Choose between miles or kilometres in the <a onclick="switchTab(\'settings\');">Settings tab</a>.',
		'Click <i class="fas fa-trash fa-sm"></i> button to clear all layers from the map, right-clicking the button resets the map to defaults.',
		'You can share/bookmark anything you find by clicking <i class="fas fa-share-square fa-sm"></i> button and copying the text.',
		'Touch screen users can quickly close the sidebar by swiping the sidebar title.',
		'See your what POIs are around you by turning on location and clicking on your blue marker.',
		'Quickly create walking directions by turning on your location and right-clicking the map.',
		'We have a number of historical map overlays, select them using the top-right layer control.',
		'Colours in POI results indicate if that place is currently open (green) or closed (red).',
		'You can find booking, location and ratings on all accommodation under  <a onclick="switchTab(\'pois\', \'Leisure-Tourism\');">Leisure-Tourism</a>.',
		'Get the latest food hygiene ratings on every food business in the area under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Find your closest recycling container and the materials it recycles under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Have a look at the WW2 bomb-map over in the <a onclick="switchTab(\'tour\', 9);">Historic Tour</a> section.',
		'Notice something wrong or missing on the map? Right-click the area and leave a note.',
		'1,000 photos, 20,000 buildings and 250 miles of roads/paths within 15 miles&sup2; have been mapped thus far!',
		'The data behind Bexhill-OSM is completely open and free to use for anyone however they wish!',
		'For a mobile, offline version of this map - give Maps.Me a try.',
		'Anyone can help with building the map, visit OpenStreetMap.org on how to get started.'
	];
	if (tip === 'rand') nextTip = Math.floor(Math.random() * tips.length);
	else if (parseInt($('#tipsText').attr('data-tip')) === tips.length - 1) nextTip = 0;
	else nextTip = parseInt($('#tipsText').attr('data-tip')) + 1;
	$('#tipsText').html('Tip: ' + tips[nextTip]).attr('data-tip', nextTip);
	$('#tipsButton').attr('title', 'Next tip (' + (nextTip + 1) + ' of ' + tips.length + ')');
}

// https://openweathermap.org
function showWeather() {
	$.ajax({
		url:  'https://api.openweathermap.org/data/2.5/weather?id=2655777&units=metric&appid=' + window.BOSM.opnweatherKey,
		dataType: 'json',
		success: function (data) {
			if (data.weather[0]) {
				var windDir = [
					'North', 'N-Northeast', 'Northeast', 'E-Northeast',
					"East", 'E-Southeast', 'Southeast', 'S-Southeast',
					'South', 'S-Southwest', 'Southwest', 'W-Southwest',
					'West', 'W-Northwest', 'Northwest', 'N-Northwest'
				];
				$('#weather').html(
					'<span style="text-align:center;"><img src="https://openweathermap.org/img/w/' + data.weather[0].icon + '.png"></span>' +
					'<span>' +
						data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1) +
						'<br>' +
						data.main.temp.toFixed(0) + '&deg;C' +
					'</span>' +
					'<span style="color:#777;"><i class="fas fa-wind fa-2x"></i></span>' +
					'<span>' +
						windDir[(Math.floor((data.wind.deg / 22.5) + 0.5)) % 16] +
						'<br>' +
						(data.wind.speed * 2.236936).toFixed(1) + ' mph' +
					'</span>'
				);
			}
			else if ($('#inputDebug').is(':checked')) console.debug('ERROR: ' + data.name + ' - ' + this.url);
		}
	});
}

// https://github.com/enginkizil/FeedEk
function showMapEditsRss() {
	// use map bounds and add date as a 1 hour cache-buster
	// feeds - zverik.osm.rambler.ru / simon04.dev.openstreetmap.org
	var feedUrl = 'https://simon04.dev.openstreetmap.org/whodidit/scripts/rss.php?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',') +
		'&r=' + new Date().getDate() + '' + new Date().getHours();
	var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url="' + feedUrl + '" LIMIT 4';
	$.ajax({
		url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(YQLstr) + '&format=json&diagnostics=' + $('#inputDebug').is(':checked'),
		dataType: 'json',
		success: function (data) {
			if (data.query.count) {
				var s = '', t, u, l;
				if (!(data.query.results.rss instanceof Array)) data.query.results.rss = [data.query.results.rss];
				$.each(data.query.results.rss, function (e, itm) {
					t = itm.channel.item.title.split('changeset: ');
					u = t[0].split('User ')[1].split(' has uploaded')[0];
					l = itm.channel.item.link.replace('https://www.openstreetmap.org/browse/changeset/', 'https://osmcha.mapbox.com/changesets/');
					s += '<li><span class="fa-li"><i class="fas fa-sync"></i></span><a href="' + l + '" title="View changeset on OSMCha"><i>' + t[1].substring(1, t[1].length - 1) + '</i></a>' +
					' - <a href="https://www.openstreetmap.org/user/' + u + '" title="View user on OpenStreetMap">' + u + '</a>' +
					' - ' + date_parser(itm.channel.item.date.split('T')[0], 'short') + '</span></li>';
				});
				$('#feedRss')
					.html('Latest map edits:<ul class="fa-ul">' + s + '</ul><p><hr>')
					.slideDown();
				$('#feedRss a')
					.attr('onClick', 'return window.confirm("This link will open an external website to review the edit, continue?")')
					.attr('target', '_blank');
					
			}
			else if ($('#inputDebug').is(':checked')) console.debug('ERROR: ' + data.query.meta.url.status + ' - ' + this.url);
		}
	});
}

// https://github.com/medialize/URI.js
// M = basemap, O = overlay, OP = overlay opacity, S = settings, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, Q = geocode query, W = walkpoints
function permalinkSet() {
	var uri = URI(window.location.href);
	var selectedPois = '', walkCoords = '', settingChk, tourPage, overlayOpacity, c;
	var walkWayp = (routingControl) ? routingControl.getWaypoints() : undefined;
	var tab = (actTab === defTab) ? undefined : actTab;
	var baseLayer = (actBaseTileLayer === defBaseTileLayer) ? undefined : actBaseTileLayer;
	if (actOverlayLayer) {
		overlayOpacity = Math.floor(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity * 100);
		if (overlayOpacity === 0 || overlayOpacity === tileOverlayLayer[actOverlayLayer].opacity * 100) overlayOpacity = undefined;
	}
	if (walkWayp && walkWayp[0].latLng && walkWayp[1].latLng)
		for (c in walkWayp) { walkCoords += L.Util.formatNum(walkWayp[c].latLng.lat, 5) + 'x' + L.Util.formatNum(walkWayp[c].latLng.lng, 5) + '_'; }
	else if (walkWayp && walkWayp[0].latLng)
		walkCoords = L.Util.formatNum(walkWayp[0].latLng.lat, 5) + 'x' + L.Util.formatNum(walkWayp[0].latLng.lng, 5) + '_';
	walkCoords = walkCoords ? walkCoords.slice(0, -1) : undefined;
	if (actTab === 'tour' && $('#tourList option:selected').val() > 0) tourPage = $('#tourList option:selected').val();
	$('.poi-icons .poi-checkbox input:checked').each(function (i, element) { selectedPois += element.id + '-'; });
	selectedPois = selectedPois ? selectedPois.slice(0, -1) : undefined;
	if ($('#settings input:checkbox:checked').not('#inputDebug').length) {
		settingChk = '';
		for (c = 0; c < $('#settings input:checkbox').not('#inputDebug').length; c++) {
			settingChk += $('#settings input:checkbox').eq(c).is(':checked') ? '1' : '0';
		}
	}
	uri.query({ 'M': baseLayer, 'O': actOverlayLayer, 'OP': overlayOpacity, 'S': settingChk, 'T': tab, 'U': tourPage, 'G': imgLayer, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
	history.replaceState(null, null, uri.resource());
}
function permalinkReturn() {
	var uri = URI(window.location.href), c;
	if (uri.hasQuery('M') && tileBaseLayer[uri.search(true).M]) actBaseTileLayer = uri.search(true).M;
	if (uri.hasQuery('O') && tileOverlayLayer[uri.search(true).O]) {
		actOverlayLayer = uri.search(true).O;
		if (uri.hasQuery('OP')) overlayOpacity = uri.search(true).OP / 100;
	}
	if (uri.hasQuery('S')) {
		var settingChk = uri.search(true).S;
		for (c = 0; c < settingChk.length; c++) {
			$('#settings input:checkbox').eq(c).prop('checked', parseInt(settingChk.charAt(c), 10));
		}
		if ($('#inputDebug').is(':checked')) $('#inputDebug').trigger('change');
	}
	// set up measurement units
	$('#inputUnit').trigger('change');
	if (uri.hasQuery('T')) actTab = uri.search(true).T;
	if (uri.hasQuery('U')) {
		var tourNum = uri.search(true).U;
		if ($('#tourList option[value=' + tourNum + ']').length && !$('#tourList option[value=' + tourNum + ']')[0].disabled)
			$('#tourList').val(tourNum).trigger('change');
	}
	if (uri.hasQuery('G')) tour(uri.search(true).G);
	if (uri.hasQuery('W')) {
		var walkPoints = uri.search(true).W;
		walkPoints = walkPoints.split('_');
		for (c in walkPoints) {
			walkPoints[c] = walkPoints[c].replace('x', ', ');
			routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkPoints[c] + ']'));
		}
	}
	if (uri.hasQuery('P')) {
		var groupedPoi = uri.search(true).P;
		if (groupedPoi.indexOf('-') !== -1) groupedPoi = groupedPoi.split('-');
		setTimeout(function () {
			if (!$.isArray(groupedPoi)) {
				$('.poi-icons input[id=' + groupedPoi + ']').prop('checked', true);
				// scroll to checkbox
				if (actTab !== 'none') {
					sidebar.open(actTab);
						$('.poi-icons')
							.scrollTop(0)
							.scrollTop($('.poi-icons .poi-checkbox input[id="' + groupedPoi + '"]').parent().position().top - 50);
				}
			}
			else {
				for (c in groupedPoi) {
					// the last poi has a "/" on it because leaflet-hash
					var multiplePois = groupedPoi[c].replace('/', '');
					$('.poi-icons input[id=' + multiplePois + ']').prop('checked', true);
					if (actTab !== 'none') sidebar.open(actTab);
				}
			}
			poi_changed();
		}, 500);
	}
	else if (uri.hasQuery('I')) {
		var singlePoi = uri.search(true).I;
		rQuery = true;
		setTimeout(function () { show_overpass_layer(elementType(singlePoi.slice(0, 1)) + '(' + singlePoi.slice(1) + ');'); }, 500);
	}
	else if (uri.hasQuery('Q')) {
		$('.leaflet-control-geocoder-icon').click();
		$('.leaflet-control-geocoder-form input').val(uri.search(true).Q);
		geocode._geocode();
	}
	// if not returning from a permalink, give defaults
	if (!uri.hasQuery('W') || !uri.hasQuery('P') || !uri.hasQuery('I')) {
		if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
		if (($(window).width() >= 768 || actTab !== 'home') && actTab !== 'none') sidebar.open(actTab);
	}
}
permalinkReturn();
tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
if (actOverlayLayer) {
	tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].addTo(map);
	if (overlayOpacity) tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(overlayOpacity);
}
