// all main functions for site
// don't forget to create config.js with your api keys
if (typeof BOSM === 'undefined') alert('Error: No API keys defined, please see config.example.js');

// map area
var osmRelation = ''; // 9825836 WIP leave blank if osm relation doesn't exist, we'll use bounds
var mapBounds = { south: 50.8025, west: 0.3724, north: 50.8785, east: 0.5290 };
var LBounds = L.latLngBounds([mapBounds.south, mapBounds.west], [mapBounds.north, mapBounds.east]);
// map open location
var mapCentre = [50.8470, 0.4675];
var mapZoom = ($(window).width() < 768) ? 13 : 14;
// map layers
var defBaseTileLayer = 'osmstd', actBaseTileLayer = defBaseTileLayer, actOverlayLayer;
// tab to open
var defTab = 'home', actTab = defTab;
// image width for popups
var imgSize = ($(window).width() < 512) ? 256 : 310;
// overpass layer options
var maxPOICheckbox = 3;
var maxOpResults = 250;
// website checks
var noTouch = window.ontouchstart === undefined;
var noIframe = top === self;
var noPermalink = !URI(window.location.href).search() || URI(window.location.href).search() === '?T=none';
// title tag tooltip defaults
var tooltipDef = {
	disabled: noTouch ? false : true,
	hide: false,
	show: { delay: 200, duration: 50 },
	track: true,
	position: { my: 'left+15 top+10' },
	create: function () { $('.ui-helper-hidden-accessible').remove(); }
};
// dark mode css
var darkMode = '<style>.spinner, #map, #sidebar, #minimap, img, .fancybox-content, .fancybox-content iframe { filter: hue-rotate(180deg) invert(100%); }</style>';
// email
var email = 'info' + '@' + 'bexhill-osm.org.uk';

// https://fancyapps.com/fancybox/3/
// show popup images in a lightbox
$.extend($.fancybox.defaults, {
	spinnerTpl: '<div class="spinner" style="position:relative;opacity:0.5;" title="Loading..."></div>',
	btnTpl: {
		slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><i class="fas fa-play-circle fa-2x"></i><i class="fas fa-pause-circle fa-2x"></i></button>',
		close: '<button data-fancybox-close class="fancybox-button fancybox-close" title="{{CLOSE}}"><i class="fas fa-times-circle fa-2x"></i></button>',
		arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><i class="fas fa-caret-square-left fa-2x"></i></button>',
		arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><i class="fas fa-caret-square-right fa-2x"></i></button>'
	},
	idleTime: false,
	hash: false,
	loop: true,
	transitionEffect: 'slide',
	transitionDuration: 500,
	animationDuration: 500,
	mobile: {
		clickContent: function() { return false; },
		clickSlide: function() { return 'close'; },
		dblclickContent: function(current) { return current.type === 'image' ? 'zoom' : false; }
	},
	slideShow: { speed: 2000 }
});

// set swipe triggers for touch devices
// close sidebar
$('.sidebar-header').on('swipeleft', function() { $('.sidebar-close:visible').click(); });
// prev/next tour iframe
$('#tour')
	.on('swiperight', function() { $('#tourPrev').trigger('click'); })
	.on('swipeleft', function() { $('#tourNext').trigger('click'); })
	.on('wheel', function(e) {
		if (e.originalEvent.deltaY > 0) $('#tourNext').trigger('click');
		else if (e.originalEvent.deltaY < 0) $('#tourPrev').trigger('click');
		e.preventDefault();
	});

// smooth scrolling to anchor
$(document).on('click', 'a[href*="#goto"]', function(e) {
	var target = $('#' + this.hash.slice(1));
	$('#poi-icons, .sidebar-body').stop().animate({ scrollTop: target.offset().top - 55 - ((actTab === 'pois' && $('#poi-results:visible')) ? $('#poi-results').height() : 0) }, 500);
	e.preventDefault();
});

$('.sidebar-tabs li').click(function() {
	// get current sidebar-tab
	actTab = ($('.sidebar.collapsed').length || actTab === 'closing') ? 'none' : $('.sidebar-pane.active').attr('id');
	$('.sidebar-close').removeClass('wobble');
	// resize links on minimap
	if (actTab === 'home') {
		if (!$('#weather:visible').length) { showWeather(); showEditFeed(); }
		setTimeout(function() { $('#minimap > map').imageMapResize(); }, 400);
	}
	if (actTab === 'tour') $('#tourList').trigger('change');
	if (actTab === 'thennow') tour('thennow', false);
	// animate map recentre on sidebar open/close
	if ($(window).width() >= 768 && $(window).width() < 1300) {
		x = 0;
		var timer = setInterval(function() {
			map.invalidateSize({ animate: true });
			if (++x === 4) clearInterval(timer);
		}, 100);
	}
	permalinkSet();
});
// no sidebar-tab
$('.sidebar-close').click(function() {
	actTab = 'closing';
	$('.sidebar-tabs li.active').click();
});

// ignore map single click (reverse lookup) in some cases
L.Map.addInitHook(function() {
	var that = this, h;
	if (that.on) {
		that.on('click', check_later);
		that.on('dblclick', function() { setTimeout(clear_h, 0); } );
	}
	function check_later(e) {
		clear_h();
		// clear msg status box
		if ($('#msgStatus:visible').length) {
			clickOutline.clearLayers();
			$('#msgStatus').hide();
		}
		// ignore map click if dragging walk markers / overlay control is open / overlay displayed / spinner is shown / popup is open on screen
		else if (!$('.leaflet-marker-draggable, .leaflet-control-layers-expanded').length && !imageOverlay.getLayers().length && !spinner &&
			!($('.leaflet-popup').length && map.getBounds().contains(map.layerPointToLatLng($('.leaflet-popup')[0]._leaflet_pos)))) h = setTimeout(check, 500);
		function check() { that.fire('singleclick', L.Util.extend(e, { type: 'singleclick' } )); }
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
	maxBoundsViscosity: 0.9,
	minZoom: 10,
	maxZoom: 20,
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
	}, '-', {
		text: '<i class="far fa-sticky-note fa-fw"></i> Leave a note here',
		index: 4,
		callback: improveMap
	}, {
		text: '<i class="fas fa-wrench fa-fw"></i> FixMyStreet',
		index: 5,
		callback: fixMyStreet
	}, {
		text: '<i class="fas fa-street-view fa-fw"></i> Panoramic view',
		index: 6,
		callback: panoView
	}, '-', {
		text: '<i class="far fa-copy fa-fw" style="color:#808080"></i><span id="copyGeos" class="comment"></span>',
		index: 7,
		callback: copyGeos
	}]
}).whenReady(function() {
	map.attributionControl.setPrefix('<a onclick="switchTab(\'info\', \'software\');" title="Attribution"><i class="fas fa-info-circle fa-fw"></i></a>');
	if (!noIframe) {
		$('#btnBookm').parent().hide();
		map.attributionControl.addAttribution('<a href="/" target="_blank" rel="noopener">Bexhill-OSM</a>');
	}
	// sidebar information
	sidebar.fadeIn();
	$('.sidebar-tabs, .sidebar-close, .leaflet-bar a, button, .switch').tooltip(tooltipDef);
	getTips('rand');
	if (actTab === defTab) {
		showWeather();
		showEditFeed();
	}
	else $('#weather').hide();
	$('#home .sidebar-body').append('<p><img style="vertical-align:text-top;" src="favicon-16x16.png"> <span class="comment">&copy; Bexhill-OSM 2016-' +
		new Date().getFullYear() + ' | <a style="color:inherit;" href="https://github.com/Dr-Mx/bexhill-osm/blob/master/CHANGELOG.md" title="Changelog" target="_blank" rel="noopener">v' + $('script').eq($('script').length - 1).attr('src').split('v=')[1] + '</a></span></p>');
	$('#walkList, #tourList').trigger('change');
	// add overlay opacity slider to layer control
	$('.leaflet-top.leaflet-right').append(
		'<div id="inputOpacity" class="leaflet-control leaflet-bar">' +
			'<input type="range" min="0.05" max="1" step="0.05">' +
			'<div class="leaflet-popup-close-button" title="Remove overlay" onclick="map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);">×</div>' +
		'</div>'
	);
	$('.leaflet-bottom.leaflet-right').prepend('<div id="msgStatus" class="leaflet-control"></div>');
	// back to top button
	$('.anchor')
		.hide()
		.click(function() {
			if ($(this).parent().scrollTop()) $(this).parent().stop().animate({ scrollTop: 0 }, 500);
		})
		.parent().scroll(function() {
			if ($(this).scrollTop() > 350) $(this).find('.anchor').fadeIn(200);
			else $(this).find('.anchor').fadeOut(200);
		});
	setTimeout(setOverlayLabel, 10);
	// tutorial modal
	if (noPermalink && noIframe && window.localStorage) {
		if (!window.localStorage.tutorial || window.localStorage.tutorial === '0') window.localStorage.tutorial = '';
		var showModalTutor = function(target, id, dist, text, arrowDir) { if (window.localStorage.tutorial.indexOf(id) === -1) {
			target.before(
				'<div id="' + id + '" class="modalTutor leaflet-control" style="left:' + dist + 'px;">' + text +
				'<button type="button" class="modalButton theme">Got it</button>' +
				'<div class="modalTutorArrow" style="' + arrowDir + ':-5px;"></div></div>'
			);
			L.DomEvent.disableClickPropagation($('#' + id)[0]).disableScrollPropagation($('#' + id)[0]);
			$('#' + id + ' .modalButton').on('click', function() {
				$(this).parent().fadeOut(100);
				window.localStorage.tutorial += $(this).parent().attr('id') + ';';
			});
		} };
		showModalTutor($('.leaflet-control-layers'), 'modalT1', '-160', 'Choose from a growing number of modern and historical maps to overlay.', 'right');
		showModalTutor($('#btnClearmap'), 'modalT2', '40', 'Clean up any map markers using this button. Try clicking the map to find information on almost any place.', 'left');
		showModalTutor($('.sidebar-tabs ul li').eq(3), 'modalT3', '40', 'Display articles on the history of the area. From dinosaur footprints to WW2 incidents.', 'left');
		showModalTutor($('#inputOpacity input'), 'modalT4', '-160', 'This slider changes the opacity of the overlay.' + (noTouch ? ' Tapping CTRL will fade the overlay in and out.' : ''), 'right');
	}
	// holiday decorations overlay
	if (new Date().getMonth() === 3 && new Date().getDate() >= 10 && new Date().getDate() <= 13) sidebar.append('<img id="holidayImg" src="assets/img/holidays/easterSb.png">');
	else if (new Date().getMonth() === 9 && new Date().getDate() === 31) sidebar.append('<img id="holidayImg" src="assets/img/holidays/halloweenSb.png">');
	else if ((new Date().getMonth() === 10 && new Date().getDate() >= 25) || new Date().getMonth() === 11) {
		$('html').css('--main-color', 'darkred');
		// new town
		L.imageOverlay('assets/img/holidays/xmasMapTree.png', [[50.84090, 0.47320], [50.84055, 0.47370]], { opacity: 0.9 }).addTo(map);
		L.imageOverlay('assets/img/holidays/xmasMapLights.png', [[50.84037, 0.47415], [50.83800, 0.46980]], { opacity: 0.9 }).addTo(map);
		// little common
		L.imageOverlay('assets/img/holidays/xmasMapTree.png', [[50.84545, 0.43400], [50.84510, 0.43350]], { opacity: 0.9 }).addTo(map);
		sidebar.append('<img id="holidayImg" src="assets/img/holidays/xmasSb.png">');
		$('#homeBox').after('<div id="xmasMsg" title="Show on map" onclick="tour(\'xmas\');">' +
			'<div id="xmasTitle">~ <span>Christmas Window Display Competition</span> ~</div>' +
			'<div class="comment">2019 is festive food and drink themed, in association with Light Up Bexhill</div>' +
		'</div>');
	}
	// prevent click-through on map controls
	L.DomEvent.disableClickPropagation($('#inputOpacity')[0]).disableScrollPropagation($('#inputOpacity')[0]);
	L.DomEvent.disableClickPropagation($('#msgStatus')[0]).disableScrollPropagation($('#msgStatus')[0]);
	$('.leaflet-control').bind('contextmenu', function(e) { e.stopPropagation(); });
	$('.leaflet-control-geocoder-form').click(function(e) { e.stopPropagation(); });
	// refocus status message on mouseover
	$('#msgStatus').on('mouseover tap', function() { if ($(this).is(':animated')) $(this).stop().css('opacity', 1); });
	// add delay after load for sidebar to animate open
	setTimeout(function() {
		$('#minimap > map').imageMapResize();
		if ($(window).width() >= 768 && $(window).width() < 1300) map.invalidateSize();
	}, 500);
	// filter poi using keywords
	$('#poi-filter-in').on('keyup', function() {
		$('.poi-checkbox input').each(function() {
			if ($(this).data('keyword').indexOf($('#poi-filter-in').val().toLowerCase()) != -1) $(this).parent().parent().show();
			else $(this).parent().parent().hide();
		});
		$('.poi-group').each(function() {
			$(this).show();
			if (!$(this).find('.poi-checkbox:visible').length) $(this).hide();
		});
		$('#poi-filter').css('position', $('#poi-filter-in').val() ? 'sticky' : '');
		$('#poi-icons .comment').html(!$('.poi-group .poi-checkbox:visible').length ? 'No places found' : 'Make up to ' + maxPOICheckbox + ' selections at a time.');
	});
	$('#poi-filter-cl').on('click', function() {
		$('#poi-filter-in').val('').trigger('keyup');
	});
	// clear loading elements
	$('#map').css('background', '#e6e6e6');
	if (spinner === 0) $('.spinner').fadeOut(500);
}).on('singleclick', function(e) {
	// reverse lookup
	if (map.getZoom() >= 15) {
		clickOutline.clearLayers().addLayer(L.circleMarker(e.latlng, {
			radius: 10,
			weight: 2,
			color: $('html').css('--main-color'),
			opacity: 1,
			fillColor: '#fff',
			fillOpacity: 0.5,
			interactive: noTouch ? true : false,
			bubblingMouseEvents: false
		}).on('click' , function() {
			if ($('#msgStatus .msgStatusBodyAddr').length) $('#msgStatus .msgStatusBodyAddr').click();
		}));
		reverseQuery(e, 1);
	}
}).on('contextmenu.show', function(e) {
	// https://github.com/aratcliffe/Leaflet.contextmenu
	// show walkHere if user located within map and accuracy is high
	if (lc._active && lc._event && map.options.maxBounds && map.options.maxBounds.contains(lc._event.latlng) && map.getZoom() >= 14 && lc._circle.getRadius() <= 100) $('.leaflet-contextmenu-item').eq(1).show();
	else $('.leaflet-contextmenu-item').eq(1).hide();
	$('#copyGeos').html(L.Util.formatNum(e.latlng.lat, 3) + ', ' + L.Util.formatNum(e.latlng.lng, 3) + ' | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 3));
}).on('popupopen', function(e) {
	var popupThis = $(e.popup._container);
	var osmId = e.popup._source._leaflet_id;
	// padding so popup is not obfuscated by map controls
	e.popup.options.autoPanPaddingTopLeft = ($(window).width() < 1300) ? [20, 40] : [sidebar.width() + 50, 5];
	// add/remove favourites
	if ($('.popup-bookm').length) {
		if (!window.localStorage.favourites) window.localStorage.favourites = '';
		if (window.localStorage.favourites.indexOf(elementType(osmId) + '(' + osmId.slice(1) + ');') >= 0) popupThis.find($('.popup-bookm i').removeClass('far').addClass('fas'));
		$('.popup-bookm').click(function() {
			if ($('.popup-bookm i.fas').length) {
				window.localStorage.favourites = window.localStorage.favourites.replace(elementType(osmId) + '(' + osmId.slice(1) + ');', '');
				popupThis.find($('.popup-bookm i').removeClass('fas').addClass('far'));
			}
			else {
				window.localStorage.favourites = window.localStorage.favourites + elementType(osmId) + '(' + osmId.slice(1) + ');';
				popupThis.find($('.popup-bookm i').removeClass('far').addClass('fas'));
			}
		});
	}
	// edit on osm.org
	$('.popup-edit').click(function() {
		popupWindow('https://www.openstreetmap.org/edit?' + elementType(osmId) + '=' + osmId.slice(1) + '#map=19/' + e.popup._latlng.lat + '/' + e.popup._latlng.lng, 'editWindow', 1024, 768);
	});
	popupThis.find($('.popup-header > a, .popup-facilities i, .navigateItem a')).tooltip(tooltipDef);
	// opening-hours accordion
	popupThis.find($('.popup-ohContainer')).accordion({
		heightStyle: 'content',
		animate: 150,
		collapsible: true,
		active: false
	});
	// https://ratings.food.gov.uk/open-data/en-GB
	// show food hygiene ratings
	if (popupThis.find($('.popup-fhrs')).length) $.ajax({
		url: 'https://api.ratings.food.gov.uk/establishments/' + popupThis.find($('.popup-fhrs')).attr('fhrs-key'),
		headers: { 'x-api-version': 2 },
		dataType: 'json',
		cache: true,
		success: function(result) {
			var RatingDate = (result.RatingValue !== 'AwaitingInspection') ? new Date(result.RatingDate).toLocaleDateString(navigator.language) : 'TBC';
			popupThis.find($('.popup-fhrs')).html(
				'<a href="https://ratings.food.gov.uk/business/en-GB/' + result.FHRSID + '" title="Food Hygiene Rating (' + RatingDate + ')" target="_blank" rel="noopener">' +
				'<img alt="Hygiene: ' + result.RatingValue + '" src="assets/img/fhrs/' + result.RatingKey + '.png"></a>'
			);
			if ($('#inputDebug').is(':checked')) console.debug('Food Hygiene Rating:', result);
		},
		error: function() {
			popupThis.find($('.popup-fhrs')).empty();
			if ($('#inputDebug').is(':checked')) console.debug('ERROR FHRS:', this.url);
		}
	});
	// https://www.travelinedata.org.uk/traveline-open-data/nextbuses-api/
	// show bus times
	var corsUrl = 'https://cors-anywhere.herokuapp.com/';
	if (popupThis.find($('.popup-bsTable')).length) $.ajax({
		type: 'POST',
		url: corsUrl + 'https://nextbus.mxdata.co.uk/nextbuses/1.0/1',
		headers: { 'Authorization': 'Basic ' + btoa(BOSM.trvllneApi.u + ':' + BOSM.trvllneApi.p) },
		contentType: 'text/xml',
		dataType: 'xml',
		cache: false,
		data:
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Siri version="1.0" xmlns="http://www.siri.org.uk/">' +
			'<ServiceRequest>' +
				'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
				'<RequestorRef>' + BOSM.trvllneApi.u + '</RequestorRef>' +
				'<StopMonitoringRequest version="1.0">' +
					'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
					'<MessageIdentifier>12345</MessageIdentifier>' +
					'<MonitoringRef>' + popupThis.find($('.popup-bsTable')).attr('naptan-key') + '</MonitoringRef>' +
				'</StopMonitoringRequest>' +
			'</ServiceRequest>' +
			'</Siri>',
		success: function(xml) {
			var numResults = $(xml).find('MonitoredVehicleJourney').length;
			if (numResults) {
				popupThis.find($('.popup-bsTable')).empty();
				for (var c = 0; c < numResults; c++) {
					var departTime = $(xml).find('ExpectedDepartureTime').eq(c).text() ? $(xml).find('ExpectedDepartureTime').eq(c).text() : $(xml).find('AimedDepartureTime').eq(c).text();
					var departTimer = time_parser((new Date(departTime) - new Date()) / 60000);
					popupThis.find($('.popup-bsTable')).append(
						'<tr><td>' + $(xml).find('PublishedLineName').eq(c).text() + '</td>' +
						'<td>' + $(xml).find('DirectionName').eq(c).text() + '</td>' +
						'<td>' + (departTimer === -1 ? 'Due' : departTimer + ' (' + new Date(departTime).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })) + ')</td></tr>'
					);
				}
				popupThis.find($('.popup-bsTable')).after('<div class="popup-imgAttrib">Data: <a href="https://www.travelinedata.org.uk/" target="_blank" rel="noopener">Traveline NextBuses</div>');
				e.popup._adjustPan();
			}
			else popupThis.find($('.popup-bsTable')).html('<span class="comment">No buses due at this time.</span>');
			if ($('#inputDebug').is(':checked')) console.debug('Nextbus:', xml);
		},
		error: function() {
			popupThis.find($('.popup-bsTable').empty());
			if ($('#inputDebug').is(':checked')) console.debug('ERROR BUSES:', this.url);
		}
	});
	// highlight in results list and add openpopup to permalink
	if (poiList.length && !popupThis.find($('a#userLoc')).length && !$('#inputDebug').is(':checked')) {
		popupThis.find($('#poi-results-list tr#' + $.map(poiList, function(o, i) { if (o._leaflet_id === osmId) return i; })).css('background-color', 'rgba(255, 255, 255, 0.5'));
		markerId = osmId;
		permalinkSet();
	}
	if (popupThis.find($('.popup-imgContainer')).length) {
		// reduce height of long descriptions if image exists
		if (popupThis.find($('.popup-longDesc')).length) popupThis.find($('.popup-longDesc')).css('--popup-long-desc-height', '150px');
		setTimeout(function() {
			for (x = 0; x < popupThis.find($('.popup-imgContainer')).length; x++) if (!popupThis.find($('#img' + x + ' .attribd')).length) getWikiAttrib(popupThis.find($('#img' + x)));
		}, 500);
		$('.popup-imgContainer img')
			.on('swiperight', function() { navImg(0); })
			.on('swipeleft', function() { navImg(1); })
			.on('wheel', function(e) {
				if (e.originalEvent.deltaY < 0) navImg(0);
				else if (e.originalEvent.deltaY > 0) navImg(1);
				e.preventDefault();
			})
			.on('error', function() {
				// error if image not found
				popupThis.find($('.popup-imgContainer img')).attr('alt', 'Error: Image not found');
				popupThis.find($('.popup-imgAttrib')).empty();
			});
		$('.popup-imgContainer, .navigateItem')
			.on('dragstart', false)
			.on('selectstart', false);
		$('#img0 img')
			.on('load', function() {
				popupThis.find($('.popup-imgContainer img')).attr('alt', 'Image of ' + popupThis.find($('.popup-header h3')).text());
				// add padding on attribution for navigation buttons
				if (popupThis.find($('.navigateItem')).length) {
					var rpad = 75;
					if (popupThis.find($('.navigateItem a')).length === 1) rpad = 20;
					else if (popupThis.find($('.navigateItem a')).length === 2) rpad = 60;
					popupThis.find($('.popup-imgAttrib')).css('padding-right', rpad + 'px');
				}
				e.popup._adjustPan();
			});
	}
}).on('popupclose', function() {
	if (poiList.length) {
		$('#poi-results-list tr').css('background-color', '');
		if (!rQuery) markerId = undefined;
		permalinkSet();
	}
}).on('baselayerchange', function(e) {
	// get layer name on change
	for (var c in baseTileList.name) if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	permalinkSet();
}).on('overlayadd', function(e) {
	loadingControl._showIndicator();
	// remove previous overlay
	setTimeout(function() {
		if ($('.leaflet-control-layers-overlays input:checked').length > 1) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		// get layer name on change
		for (var c in overlayTileList.name) if (e.name === overlayTileList.name[c]) actOverlayLayer = overlayTileList.keyname[c];
		// set overlay opacity controls
		$('#inputOpacity').show(100);
		$('#inputOpacity input')
			.val(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity)
			.on('input change', function() { tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(this.value); })
			.on('change', permalinkSet)
			.on('mouseover', function() { this.focus(); })
			.attr('title', tileOverlayLayer[actOverlayLayer].name + ' opacity');
		setOverlayLabel();
		permalinkSet();
		// offset overlay, metres to pixels
		if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].offset) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).on('load', function() {
			setTimeout(function() {
				var overlayContainer = tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]._container || tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]._currentOverlay._image;
				var metresPerPixel = 40075017 * Math.cos(map.getCenter().lat * (Math.PI/180)) / Math.pow(2, map.getZoom()+8);
				$(overlayContainer).css({
					'left': Math.floor(tileOverlayLayer[actOverlayLayer].offset[0] / metresPerPixel) + 'px',
					'top': Math.floor(tileOverlayLayer[actOverlayLayer].offset[1] / metresPerPixel) + 'px'
				});
			}, 0);
		});
	}, 10);
}).on('overlayremove', function() {
	if (tileOverlayLayer[actOverlayLayer].offset) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).off('load');
	if (!$('.leaflet-control-layers-overlays input:checked').length) {
		actOverlayLayer = undefined;
		$('#inputOpacity').fadeOut(100);
	}
	setOverlayLabel();
	permalinkSet();
});
function setOverlayLabel() {
	// adds a title and hides some layers in control
	if (!$('.controlTitle').length) $('.leaflet-control-layers-overlays label:contains("1975")').before('<div class="controlTitle">Historic overlays</div>');
	for (var tileBase in tileBaseLayer) if (tileBaseLayer[tileBase].hide) $('.leaflet-control-layers-base label:contains("' + tileBaseLayer[tileBase].name + '")').hide();
	for (var tileOverlay in tileOverlayLayer) if (tileOverlayLayer[tileOverlay].hide) $('.leaflet-control-layers-overlays label:contains("' + tileOverlayLayer[tileOverlay].name + '")').hide();
}

// https://github.com/davidjbradshaw/image-map-resizer
// bounding coordinates for minimap
$('#minimap > map > area').click(function() {
	var mLoc = $(this).attr('title'), mBounds = [];
	switch (mLoc) {
		case 'Bexhill-on-Sea': mBounds = LBounds; break;
		case 'Barnhorn': mBounds = [[50.8507, 0.4301], [50.8415, 0.4066]]; break;
		case 'Central': mBounds = [[50.8425, 0.4801], [50.8351, 0.4649]]; break;
		case 'Collington': mBounds = [[50.8472, 0.4604], [50.8352, 0.4406]]; break;
		case 'Cooden': mBounds = [[50.8417, 0.4416], [50.8305, 0.4195]]; break;
		case 'Glenleigh Park': mBounds = [[50.8573, 0.4641], [50.8476, 0.4454]]; break;
		case 'Glyne Gap': mBounds = [[50.8485, 0.5102], [50.8423, 0.4954]]; break;
		case 'The Highlands': mBounds = [[50.8637, 0.4615], [50.8566, 0.4462]]; break;
		case 'Little Common': mBounds = [[50.8501, 0.4424], [50.8399, 0.4244]]; break;
		case 'Normans Bay': mBounds = [[50.8302, 0.4020], [50.8216, 0.3814]]; break;
		case 'Old Town': mBounds = [[50.8484, 0.4841], [50.8419, 0.4706]]; break;
		case 'Pebsham': mBounds = [[50.8589, 0.5140], [50.8472, 0.4882]]; break;
		case 'Sidley': mBounds = [[50.8607, 0.4833], [50.8509, 0.4610]]; break;
	}
	if (mBounds) {
		map.flyToBounds(L.latLngBounds(mBounds));
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
	}
});

var rQuery = false;
function reverseQuery(e, singlemapclick) {
	var geocoder, geoMarker;
	if (singlemapclick) setMsgStatus('fas fa-spinner fa-pulse', '', '');
	else $('.spinner').show();
	if ($('#inputRevServer').val() === 'nominatim') geocoder = L.Control.Geocoder.nominatim({ reverseQueryParams: { format: 'jsonv2', namedetails: 1, email: email } });
	else if ($('#inputRevServer').val() === 'photon') geocoder = L.Control.Geocoder.photon({ reverseQueryParams: { distance_sort: true, radius: 0.05 } });
	else if ($('#inputRevServer').val() === 'openrouteservice') geocoder = L.Control.Geocoder.openrouteservice(BOSM.orsKey, { reverseQueryParams: { 'boundary.circle.radius': 0.05, size: 1, sources: 'osm' } });
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom() > 16 ? 18 : 17), function(results) {
		geoMarker = results[0] ? results[0].properties : '';
		if ($('#inputDebug').is(':checked') && results[0]) console.debug('Reverse search ' + titleCase($('#inputRevServer').val()), results[0]);
		if (geoMarker.osm_id || (geoMarker.source_id && geoMarker.source_id.indexOf('/')) > 0) {
			if (singlemapclick && $('#msgStatus:visible').length) {
				var msgStatusIcon = 'fas fa-search-location', msgStatusHead, msgStatusBody;
				if ($('#inputRevServer').val() === 'nominatim') {
					var geoName = geoMarker.namedetails.name || geoMarker.namedetails['addr:housename'] || '';
					var geoRoad = geoMarker.address.road || geoMarker.address.footway || geoMarker.address.pedestrian || geoMarker.address.path || '';
					msgStatusHead = titleCase(geoMarker.type !== 'yes' ? geoMarker.type + ' ' + geoMarker.addresstype : geoMarker.category);
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoName ? '<b>' + geoName + '</b><br>' : '') +
						(geoMarker.address.house_number ? geoMarker.address.house_number + ' ' : '') + (geoRoad ? geoRoad + ', ' : '') + (geoMarker.address.postcode ? geoMarker.address.postcode : '') + '</a>';
				}
				else if ($('#inputRevServer').val() === 'photon') {
					msgStatusHead = geoMarker.osm_value !== 'yes' ? titleCase(geoMarker.osm_key + ' ' + geoMarker.osm_value) : '';
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoMarker.name ? '<b>' + geoMarker.name + '</b><br>' : '') +
						(geoMarker.housenumber ? geoMarker.housenumber + ' ' : '') + (geoMarker.street ? geoMarker.street + ', ' : '') + (geoMarker.postcode ? geoMarker.postcode : '') + '</a>';
				}
				else if ($('#inputRevServer').val() === 'openrouteservice') {
					msgStatusHead = titleCase(geoMarker.layer);
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.source_id.charAt(0) + '\', \'' + geoMarker.source_id.split('/')[1] + '\');">' + '<b>' + geoMarker.name + '</b><br>' +
						(geoMarker.postalcode ? geoMarker.postalcode : '') + '</a>';
				}
				if ($('#inputAttic').val()) msgStatusBody += '<br><span class="comment">Above result may differ to actual attic data.</span>';
				if (actOverlayLayer === 'landreg') {
					// query land registry by converting lat+lng to eastings+northings
					var wgs84 = new GT_WGS84();
					wgs84.setDegrees(e.latlng.lat, e.latlng.lng);
					var osgb = wgs84.getOSGB();
					var landRegUrl = 'https://eservices.landregistry.gov.uk/eservices/FindAProperty/view/MapEnquiryRadiusSearch.do?findPropertiesGroup=on&radius=5&mapType=r&ukMapX=' + osgb.eastings + '&ukMapY=' + osgb.northings + '&zoomLevel=' + map.getZoom();
					msgStatusBody += '<hr><a onclick="popupWindow(\'' + landRegUrl + '\', \'editWindow\', 1024, 768);"><i>Land Registry Lookup</i></a>';
				}
				setMsgStatus(msgStatusIcon, msgStatusHead, msgStatusBody);
				// move click location to address location on hover
				if (noTouch) $('#msgStatus .msgStatusBodyAddr').hover(
					function() { if (clickOutline.getLayers()[0]) clickOutline.getLayers()[0].setLatLng(results[0].center); },
					function() { if (clickOutline.getLayers()[0]) clickOutline.getLayers()[0].setLatLng(e.latlng); }
				);
			}
			else reverseQueryOP(geoMarker.osm_type || geoMarker.source_id.charAt(0), geoMarker.osm_id || geoMarker.source_id.split('/')[1]);
		}
		else {
			$('.spinner').fadeOut(200);
			setMsgStatus('fas fa-info-circle', 'No places found', 'Please try another area.', 1);
		}
	});
}
function reverseQueryOP(type, id) {
	// pass reverse lookup to overpass
	clear_map('markers');
	rQuery = true;
	$('#msgStatus').fadeOut(200);
	show_overpass_layer(elementType(type) + '(' + id + ');', type.charAt(0).toUpperCase() + id);
}
function walkPoint(e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	// drop a walk marker if one doesn't exist
	var wp = routingControl.getWaypoints();
	for (var c in wp) if (!wp[c].name) {
		routingControl.spliceWaypoints(c, 1, e.latlng);
		return;
	}
	routingControl.spliceWaypoints(wp.length, 0, e.latlng);
}
function walkHere(e) {
	if ($(window).width() >= 768 && actTab !== 'walking' && actTab !== 'none') $('a[href="#walking"]').click();
	routingControl.setWaypoints([
		[lc._event.latlng.lat, lc._event.latlng.lng],
		[e.latlng.lat, e.latlng.lng]
	]);
}
function centreMap(e) {
	map.panTo(e.latlng);
}
function improveMap(e) {
	// create a note on osm.org
	popupWindow('https://www.openstreetmap.org/note/new#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng, 'noteWindow', 1024, 768);
}
function fixMyStreet(e) {
	popupWindow('https://osm.fixmystreet.com/around?zoom=4&latitude=' + e.latlng.lat + '&longitude=' + e.latlng.lng, 'fmsWindow', 1024, 768);
}
function panoView(e) {
	// tries to find panoramic photos from Mapillary, if none default to Google
	var svUrl = 'https://www.google.com/maps/embed/v1/streetview?location=' + e.latlng.lat + ',' + e.latlng.lng + '&fov=90&key=' + window.BOSM.googleKey;
	var svCaption = 'Google Street View';
	$.ajax({
		async: false,
		url: 'https://a.mapillary.com/v3/images?per_page=1&pano=true&radius=10&closeto=' + e.latlng.lng + ',' + e.latlng.lat + '&client_id=' + window.BOSM.mpllryKey,
		dataType: 'json',
		mimeType: 'application/json',
		cache: true,
		success: function(json) {
			if (json.features.length > 0) {
				svUrl = 'https://embed-v1.mapillary.com/embed?version=1&style=photo&image_key=' + json.features[0].properties.key + '&client_id='  + window.BOSM.mpllryKey;
				svCaption = 'Mapillary Street Level';
			}
		}
	});
	$.fancybox.open([{
		src: svUrl,
		type: 'iframe',
		opts: {
			caption: svCaption,
			animationEffect: 'circular'
		}
	}]);
}
function copyGeos(e) {
	navigator.clipboard.writeText(L.Util.formatNum(e.latlng.lat, 5) + '°N ' + L.Util.formatNum(e.latlng.lng, 5) + '°E | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 6))
		.then(
			function() { setMsgStatus('fas fa-copy', 'Clipboard', 'Coordinates copied successfully.', 1); },
			function() { setMsgStatus('fas fa-exclamation-triangle', 'Clipboard Error', 'Could not copy coordinates.', 1); }
		);
}

$('#walkList').change(function() {
	$('#walkDesc').html(suggestWalk($('#walkList').val(), 1) + '<img alt="Walk preview" src="assets/img/walks/' + $(this).val() + '.jpg">');
});
$('#walkSelect').click(function() {
	routingControl.setWaypoints(suggestWalk($('#walkList').val(), 0));
	if ($(window).width() < 768) $('.sidebar-close:visible').click();
});
function suggestWalk(walkId, isDesc) {
	var w;
	if (!isDesc) {
		clear_map('walk');
		routingControl.zoomBounds = true;
	}
	switch (walkId) {
		case 'ww2h':
			if (isDesc) w =
				'The route of this walk is marked out by a series of 10 plaques along the promenade. ' +
				'Launched in 2011, it hopes to encourage people to regularly walk a specific distance along the promenade. ' +
				'Small plinths are placed at ground level opposite every third beach groyne between numbers 48 and 72.';
			else w = [
				[50.83567, 0.45892],
				[50.83701, 0.47363]
			];
			break;
		case 'tmrt':
			if (isDesc) w =
				'In May 1902 Bexhill-on-Sea became "The Birthplace of British Motor Racing". ' +
				'Follow five seafront Motoring Heritage panels and two galleries dedicated to the story of those intrepid ' +
				'early motoring pioneers (the 5th panel is situated outside ' +
				'<a class="theme" onclick="map.flyTo([50.833, 0.427], 18);">Cooden Beach Hotel <i class="theme fas fa-search fa-sm"></i></a>).';
			else w = [
				[50.84059, 0.49121],
				[50.83729, 0.47612],
				[50.83647, 0.46637],
				[50.83732, 0.46639]
			];
			break;
		case 'neye':
			if (isDesc) w =
				'Pevensey Levels was a tidal inlet until the eastward drift of coastal shingle isolated it and a salt marsh developed. ' +
				'The walk starts and ends at The Star Inn pub, heading north-west towards the archaeological site of Northeye, a village abandoned to flooding in the Middle Ages. ' +
				'Before making your way back round, you will see evidence of a wooden sea defense from the 14th century called Crooked Ditch.<br>' +
				'Although sometimes rough and wet in places, there are great open views of countryside and plenty of grazing sheep to keep you company.';
			else w = [
				[50.83026, 0.39324],
				[50.83832, 0.38729],
				[50.83618, 0.40594],
				[50.83007, 0.39370]
			];
			break;
		case 'hwds':
			if (isDesc) w =
				'Starting at the Wheatsheaf Inn, this walk takes you on a public right-of-way through wood, farmland and down country lanes. ' +
				'Pass through Whydown and see the extraordinary early 20th century Gotham Wood House, before arriving at the west corner of ancient Highwoods.';
			else w = [
				[50.84536, 0.43353],
				[50.84958, 0.42689],
				[50.85671, 0.42740],
				[50.86120, 0.42984]
			];
			break;
		case 'gnwy':
			if (isDesc) w =
				'The Greenway runs alongside the Combe Valley Way, providing access for walkers, cyclists and horse riders between Bexhill and Hastings. ' +
				'It links up with public bridleways and footpaths in the area, including the 1066 Country Walk Bexhill Link, with two sections where horse ' +
				'riders take an alternative route to walkers and cyclists.';
			else w = [
				[50.85676, 0.47898],
				[50.86033, 0.48303],
				[50.86530, 0.48571],
				[50.87003, 0.52085]
			];
			break;
		case '1066':
			if (isDesc) w =
				'The route commemorates the 1066 Battle of Hastings, linking the places and the people of that important time. ' +
				'This is a section of the Bexhill - Battle link, the full route can be found on ' +
				'<a href="https://hiking.waymarkedtrails.org/#route?id=3161493&map=13!50.8789!0.4901" target="_blank" rel="noopener">waymarkedtrails.org <i class="theme fas fa-external-link-alt fa-sm"></i></a>.';
			else w = [
				[50.84522, 0.48044],
				[50.85591, 0.49312],
				[50.87800, 0.50009]
			];
			break;
		case 'bcr1':
			if (isDesc) w =
				'This is an edge of town walk of about 6 miles. It includes riverside fields and farmland, hedgerow remains of ancient woodland, ' +
				'reedbeds, vegetated shingle and a wonderful mile of rock pools at low tide. There are no hills or particularly muddy areas. Refreshments and toilets are ' +
				'available at the start point - Bexhill railway station - and towards the end of the walk.';
			else w = [
				[50.84125, 0.47717],
				[50.84484, 0.47876],
				[50.84523, 0.48052],
				[50.85590, 0.49312],
				[50.86230, 0.51823],
				[50.84808, 0.52014],
				[50.84056, 0.49142],
				[50.83792, 0.47660],
				[50.84093, 0.47718]
			];
			break;
	}
	return w;
}

// navigation controls for history tour
$('#tourNext').click(function() {
	if ($('#tourList option:selected').next().is(':enabled')) $('#tourList option:selected').next().prop('selected', true).trigger('change');
});
$('#tourPrev').click(function() {
	if ($('#tourList option:selected').prev().is(':enabled')) $('#tourList option:selected').prev().prop('selected', true).trigger('change');
});
$('#tourList').change(function() {
	var tourNum = ($(this).val().length === 1) ? '0' + $(this).val() : $(this).val();
	// only load iframe on focus or a new item selected
	if (actTab === 'tour' && $('#tourFrame')[0].contentWindow.location.href.indexOf('tour' + tourNum) === -1) {
		$('#tourControls').children().prop('disabled', true);
		$('#tourFrame').hide();
		$('#tourLoading').show();
		$('#tourFrame')[0].contentWindow.location.replace((window.location.origin !== 'null' ? window.location.origin + '/' : '') + 'tour/tour' + tourNum + '/index.html');
		$('#tourFrame').one('load', function() {
			$(this).contents().find('html').css('--main-color', getComputedStyle($('html')[0],null).getPropertyValue('--main-color'));
			if ($('#inputDark').is(':checked')) $('#tourFrame').contents().find('head').append(darkMode);
			$('#tourLoading').hide();
			$(this).fadeIn();
			$(this).contents().find('sup').click(function() { tourRef($('#tourList').val(), this.innerText); });
			$(this).contents().find('sup').attr('title', 'View reference');
			$(this).contents().find('img').click(function() { $.fancybox.open([{ src: $(this)[0].currentSrc, caption: $(this).attr('alt') }]); });
			$('#tourControls').children().prop('disabled', false);
		});
		permalinkSet();
	}
});

// https://github.com/Leaflet/Leaflet
var iconLayer = new L.featureGroup(), clickOutline = new L.featureGroup(), areaOutline = new L.featureGroup(), imageOverlay = new L.featureGroup();
var tileBaseLayer = {}, tileBaseLayers = {}, baseTileList = {name: [], keyname: []};
var tileOverlayLayer = {}, tileOverlayLayers = {}, overlayTileList = {name: [], keyname: []};
function setLeaflet() {
	map.addLayer(iconLayer).addLayer(clickOutline).addLayer(imageOverlay).addLayer(areaOutline);
	// leaflet icon image path
	L.Icon.Default.imagePath = 'assets/img/leaflet/';
	// quadkey layers
	L.TileLayer.QuadKeyTileLayer = L.TileLayer.extend({
		getTileUrl: function(tilePoint) {
			return L.Util.template(this._url, {
				s: this._getSubdomain(tilePoint),
				q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
			});
		},
		_quadKey: function(x, y, z) {
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
	var attribution = '&copy; <a href="https://openstreetmap.org/copyright" title="Copyright and License" target="_blank" rel="noopener">OpenStreetMap</a>';
	tileBaseLayer = {
		bosm: {
			name: 'Bexhill-OSM',
			url: 'https://api.mapbox.com/styles/v1/drmx/cjyfrglvo1v3c1cqqlcvzyd07/tiles/256/{z}/{x}/{y}@2x?access_token=' + BOSM.mapboxKey,
			attribution: attribution + ', <a href="https://mapbox.com/" target="_blank" rel="noopener">MapBox</a>'
		},
		osmstd: {
			name: 'OpenStreetMap',
			url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			maxNativeZoom: 19
		},
		mpsrfr: {
			name: 'Mapsurfer',
			url: 'https://api.openrouteservice.org/mapsurfer/{z}/{x}/{y}.png?api_key=' + BOSM.orsKey,
			maxNativeZoom: 19,
			atribution: attribution + ', <a href="https://openrouteservice.org/" target="_blank" rel="noopener">MapSurfer.NET</a>',
			hide: 1
		},
		general: {
			name: 'General Purpose',
			url: 'https://tile-c.openstreetmap.fr/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://www.hotosm.org/" target="_blank" rel="noopener">HOTOSM</a>'
		},
		osmuk: {
			name: 'OpenStreetMap UK',
			url: 'https://map.atownsend.org.uk/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://map.atownsend.org.uk/maps/map/map.html" target="_blank" rel="noopener">Andy Townsend</a>'
		},
		cycle: {
			name: 'OpenCycleMap',
			url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/opencyclemap/" target="_blank" rel="noopener">ThunderForest</a>'
		},
		trnsprt: {
			name: 'Public Transport',
			url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/transport/" target="_blank" rel="noopener">ThunderForest</a>'
		},
		bing: {
			name: 'Bing Aerial',
			url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
			attribution: '<a href="https://maps.bing.com/" target="_blank" rel="noopener">Microsoft Bing</a>',
			subdomains: '0123',
			maxNativeZoom: 19,
			quadkey: true,
			errorTileUrl: 'https://ecn.t0.tiles.virtualearth.net/tiles/a1202020223330?g=737&n=z'
		}
	};
	for (var tile in tileBaseLayer) {
		var bOptions = {
			attribution: tileBaseLayer[tile].attribution || attribution,
			subdomains: tileBaseLayer[tile].subdomains || 'abc',
			maxZoom: map.getMaxZoom(),
			maxNativeZoom: tileBaseLayer[tile].maxNativeZoom,
			errorTileUrl: tileBaseLayer[tile].errorTileUrl
		};
		if (tileBaseLayer[tile].quadkey) tileBaseLayers[tileBaseLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileBaseLayer[tile].url, bOptions);
		else tileBaseLayers[tileBaseLayer[tile].name] = L.tileLayer(tileBaseLayer[tile].url, bOptions);
		// create object array for all basemap layers
		baseTileList.name.push(tileBaseLayer[tile].name);
		baseTileList.keyname.push(tile);
	}
	// overlays, you can set an offset by using metres (offset: [left, top])
	tileOverlayLayer = {
		osm2012: {
			name: 'OpenStreetMap 2012',
			url: 'http://map.fosm.org/default/{z}/{x}/{y}.png',
			bounds: LBounds,
			opacity: 1,
			hide: 1
		},
		lidar: {
			name: 'Lidar DTM 2m',
			url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-surface-model-dtm-2m/wms',
			wms: {
				layers: 'LIDAR_Composite_DTM_2m',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://www.gov.uk/government/organisations/environment-agency/" target="_blank" rel="noopener">Environment Agency</a>',
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
			attribution: '<a href="https://www.eastsussex.gov.uk/leisureandtourism/countryside/rightsofway/" target="_blank" rel="noopener">East Sussex County Council</a>',
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layerProw'
		},
		landreg: {
			name: 'Land Registry',
			url: 'http://inspire.landregistry.gov.uk/inspire/ows',
			wmsOverlay: {
				layers: 'inspire:CP.CadastralParcel',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty/view/LrInspireIdInit.do" target="_blank" rel="noopener">HM Land Registry</a>',
			opacity: 0.7,
			minZoom: 17,
			offset: [2, 2]
		},
		bing: {
			name: 'Bing Aerial',
			url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
			attribution: '<a href="https://maps.bing.com/" target="_blank" rel="noopener">Microsoft Bing</a>',
			subdomains: '0123',
			opacity: 0.5,
			maxNativeZoom: 19,
			quadkey: true
		},
		// historic
		bm1975: {
			name: '1975 Aerial (coast)',
			url: 'https://tiles.bexhillheritage.org.uk/bm1975/{z}/{x}/{y}.png',
			// url: 'assets/maptiles/bm1975/{z}/{x}/{y}.png',
			attribution: 'Meridian Airmaps Ltd, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18
		},
		bm1967: {
			name: '1967 Aerial',
			url: 'https://tiles.bexhillheritage.org.uk/bm1967/{z}/{x}/{y}.png',
			// url: 'assets/maptiles/bm1967/{z}/{x}/{y}.png',
			attribution: 'BKS Surveys, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18
		},
		os1962: {
			name: '1962 Ordnance Survey',
			url: 'https://geo.nls.uk/mapdata3/os/britain10knatgrid/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 16,
			offset: [5, 3]
		},
		br1959: {
			name: '1959 Aerial (west branch)',
			url: 'assets/maptiles/br1959/{z}/{x}/{y}.png',
			attribution: 'British Rail, <a href="https://car57.zenfolio.com/" target="_blank" rel="noopener">Michael Pannell</a>',
			bounds: L.latLngBounds([50.83722, 0.45732], [50.8907, 0.5134]),
			opacity: 1,
			maxNativeZoom: 18
		},
		os1955: {
			name: '1955 Ordnance Survey',
			url: 'https://geo.nls.uk/mapdata3/os/ldn_tile/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 19,
			offset: [2, 2]
		},
		bm1946: {
			name: '1946 Aerial (p.levels)',
			url: 'assets/maptiles/bm1946/{z}/{x}/{y}.png',
			attribution: 'CPEUK, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			minNativeZoom: 14,
			maxNativeZoom: 18,
			hide: 1
		},
		arp1942: {
			name: '1942 Air Raid Precautions',
			url: 'assets/maptiles/arp1942/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.8292, 0.4157], [50.8713, 0.5098]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1
		},
		ob1944: {
			name: '1944 Observer Bomb Map',
			url: 'assets/maptiles/ob1944/{z}/{x}/{y}.png',
			bounds: L.latLngBounds([50.826, 0.411], [50.878, 0.508]),
			opacity: 1,
			maxNativeZoom: 16,
			hide: 1
		},
		os1930: {
			name: '1930 Ordnance Survey',
			url: 'assets/maptiles/os1930/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [-2, -2]
		},
		os1909: {
			name: '1909 Ordnance Survey',
			url: 'assets/maptiles/os1909/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			minZoom: 13,
			minNativeZoom: 14,
			maxNativeZoom: 17,
			offset: [2, 2]
		},
		mt1902: {
			name: '1902 Motor Track',
			url: 'assets/maptiles/mt1902/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.83645, 0.47571], [50.84225, 0.49826]),
			opacity: 1,
			minNativeZoom: 12,
			maxNativeZoom: 19,
			hide: 1
		},			
		os1899: {
			name: '1899 Ordnance Survey',
			url: 'assets/maptiles/os1899/{z}/{x}/{y}.jpg',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [7, 6]
		},
		os1878: {
			name: '1878 Ordnance Survey',
			url: 'assets/maptiles/os1878/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 16,
			offset: [5, -7]
		},
		os1873: {
			name: '1873 Ordnance Survey',
			url: 'assets/maptiles/os1873/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17
		},
		bt1839: {
			name: '1839 Bexhill Tithe',
			url: 'assets/maptiles/bt1839/{z}/{x}/{y}.png',
			attribution: '<a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/MapDetail.aspx?ID=112769" target="_blank" rel="noopener">ESRO TDE 141</a>',
			bounds: L.latLngBounds([50.815, 0.351], [50.890, 0.536]),
			opacity: 1,
			maxNativeZoom: 17
		},
		mb1805: {
			name: '1805 Manor of Bexhill',
			url: 'assets/maptiles/mb1805/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.thekeep.info/collections/getrecord/GB179_AMS5819" target="_blank" rel="noopener">ESRO AMS 5819</a>',
			bounds: L.latLngBounds([50.805, 0.376], [50.883, 0.511]),
			opacity: 1,
			maxNativeZoom: 17
		},
		yg1778: {
			name: '1778 Yeakell & Gardner',
			url: 'assets/maptiles/yg1778/{z}/{x}/{y}.png',
			attribution: '<a href="http://www.envf.port.ac.uk/geo/research/historical/webmap/sussexmap/" target="_blank" rel="noopener">University of Portsmouth</a>',
			bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.631]),
			opacity: 1,
			maxNativeZoom: 15
		},
		xmas: {
			name: 'Xmas Snow',
			url: 'tour/tourXmas/overlay-snow.gif',
			opacity: 0.75,
			hide: 1
		}
	};
	for (tile in tileOverlayLayer) {
		var oOptions = {
			attribution: tileOverlayLayer[tile].attribution,
			subdomains: tileOverlayLayer[tile].subdomains || 'abc',
			bounds: tileOverlayLayer[tile].bounds,
			opacity: tileOverlayLayer[tile].opacity,
			maxZoom: map.getMaxZoom(),
			minZoom: tileOverlayLayer[tile].minZoom || map.getMinZoom(),
			maxNativeZoom: tileOverlayLayer[tile].maxNativeZoom,
			minNativeZoom: tileOverlayLayer[tile].minNativeZoom,
			className: tileOverlayLayer[tile].className || ''
		};
		if (tileOverlayLayer[tile].quadkey) tileOverlayLayers[tileOverlayLayer[tile].name] = new L.TileLayer.QuadKeyTileLayer(tileOverlayLayer[tile].url, oOptions);
		else if (tileOverlayLayer[tile].wms) tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer.wms(tileOverlayLayer[tile].url, $.extend(tileOverlayLayer[tile].wms, oOptions));
		else if (tileOverlayLayer[tile].wmsOverlay) tileOverlayLayers[tileOverlayLayer[tile].name] = L.WMS.overlay(tileOverlayLayer[tile].url, $.extend(tileOverlayLayer[tile].wmsOverlay, oOptions));
		else tileOverlayLayers[tileOverlayLayer[tile].name] = L.tileLayer(tileOverlayLayer[tile].url, oOptions);
		// create object array for all overlay layers
		overlayTileList.name.push(tileOverlayLayer[tile].name);
		overlayTileList.keyname.push(tile);
	}
	L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);
}
setLeaflet();

// full screen events
var fcnFullscr = L.easyButton({
	id: 'btnFullscr',
	states: [{
		stateName: 'normalScreen',
		icon: 'fas fa-expand',
		title: 'Full screen',
		onClick: function(control) {
			var viewer = $('html')[0];
			var rFS = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
			rFS.call(viewer);
			control.state('fullScreen');
		}
	}, {
		stateName: 'fullScreen',
		icon: 'fas fa-compress',
		title: 'Exit full screen',
		onClick: function(control) {
			var cFS = document.exitFullscreen || document.webkitExitFullscreen;
			cFS.call(document);
			control.state('normalScreen');
		}
	}]
}).addTo(map);
$(document)
	.on('fullscreenchange', btnFullscrState)
	.on('webkitfullscreenchange', btnFullscrState);
function btnFullscrState() {
	var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
	if (!fullscreenElement) fcnFullscr.state('normalScreen');
}

// https://github.com/domoritz/leaflet-locatecontrol
var lc = L.control.locate({
	icon: 'fas fa-location-arrow',
	iconLoading: 'fas fa-compass fa-spin',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: true,
	circleStyle: { interactive: false },
	markerStyle: { radius: 8 },
	strings: {
		title: 'Show your location',
		popup: '<a id="userLoc" onclick="userLoc();"><br><h3>What is around me?</h3></a><span class="comment">Accuracy: {distance} {unit}</span>'
	},
	locateOptions: {
		enableHighAccuracy: false
	},
	onLocationError: function() {
		setMsgStatus('fas fa-exclamation-triangle', 'Location Error', 'Sorry, we could not locate you.', 1);
	},
	onLocationOutsideMapBounds: function() {
		setMsgStatus('fas fa-info-circle', 'Out of Bounds', 'You appear to be located outside the map area. Come visit us!', 1);
		lc.stop();
	}
}).addTo(map);
// show pois within a radius if accuracy is high
function userLoc() {
	if (lc._circle.getRadius() <= 100) {
		map.closePopup();
		clear_map('markers');
		show_overpass_layer('(nwr(around:100,' + lc._event.latlng.lat + ',' + lc._event.latlng.lng + ')[~"."~"."];);', '');
	}
	else setMsgStatus('fas fa-location-arrow', 'Accuracy Too Low', 'Sorry, we could not locate your exact location.', 1);
}

// https://github.com/perliedman/leaflet-control-geocoder
var geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			email: email
		}
	}),
	expand: 'click',
	defaultMarkGeocode: false,
	showResultIcons: true,
	position: 'topleft',
	placeholder: 'Type address or place name...'
}).on('markgeocode', function(e) {
	// pass nominatim address query to overpass
	if ($('#inputDebug').is(':checked')) console.debug('Search Nominatim:', e.geocode);
	var geoMarker = e.geocode.properties;
	if (geoMarker.osm_id) {
		clear_map('markers');
		rQuery = true;
		show_overpass_layer(geoMarker.osm_type + '(' + geoMarker.osm_id + ');', geoMarker.osm_type.charAt(0).toUpperCase() + geoMarker.osm_id);
		// hide geocoder controls
		setTimeout(function() {
			$('.leaflet-control-geocoder-alternatives').addClass('leaflet-control-geocoder-alternatives-minimized');
			$('.leaflet-control-geocoder-form input').blur();
			$('.leaflet-control-geocoder').removeClass('leaflet-control-geocoder-expanded');
		}, 50);
	}
}).addTo(map);
$('.leaflet-control-geocoder-icon').html('<i class="fas fa-search"></i>').attr('title','Address search');

function searchAddr(addr) {
	$('.leaflet-control-geocoder-icon').click();
	$('.leaflet-control-geocoder-form input').val(addr);
	geocode._geocode();
}

// bookmarks bypass poi filter with oQuery
var oQuery = false;
L.easyButton({
	id: 'btnBookm',
	states: [{
		icon: 'fas fa-bookmark',
		title: 'Show bookmarks',
		onClick: function() {
			if (window.localStorage.favourites) {
				clear_map('markers');
				oQuery = true;
				show_overpass_layer('(' + window.localStorage.favourites + ');');
			}
			else setMsgStatus('fas fa-info-circle', 'Bookmarks', 'Add your favourite places by clicking <i class="far fa-bookmark fa-fw"></i> within a popup.', 1);
		}
	}]
}).addTo(map);

// full reload on right click
$('#btnClearmap').bind('contextmenu', function() {
	window.localStorage.clear();
	$(location).attr('href', window.location.pathname);
	return false;
});

// https://github.com/cliffcloud/Leaflet.EasyButton
// clear map button
L.easyButton({
	id: 'btnClearmap',
	states: [{
		icon: 'fas fa-trash',
		title: 'Clear layers',
		onClick: function() { clear_map('all'); }
	}]
}).addTo(map);
// full reload on right click
$('#btnClearmap').bind('contextmenu', function() {
	window.localStorage.clear();
	$(location).attr('href', window.location.pathname);
	return false;
});

// switches to a tab; links to an anchor; a tour; a tour overlay
function switchTab(tab, anchorTour, poi, actImgLayer) {
	if (tab) {
		if (tab !== actTab) {
			if (tab === 'none') $('.sidebar-close:visible').click();
			else {
				$('a[href="#' + tab + '"]').click();
				$('#' + (tab === 'pois' ? tab + ' #poi-icons,' : tab) + ' .sidebar-body').scrollTop(0);
			}
		}
		if (anchorTour) {
			if (tab === 'tour') {
				$('#tourList').val(anchorTour).trigger('change');
				if (tab !== actTab) $('a[href="#tour"]').click();
			}
			else $('a[href="#goto' + anchorTour + '"]').click();
		}
	}
	if (poi) {
		if (!tab && $(window).width() < 768) $('.sidebar-close:visible').click();
		clear_map('markers');
		$('#' + poi).prop('checked', true);
		poi_changed();
	}
	else if (actImgLayer) tour(actImgLayer);
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
			fillColor: 'white',
			fillOpacity: 0.4
		},
		geocoder: L.Control.Geocoder.nominatim({
			geocodingQueryParams: {
				bounded: 1,
				viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',')
			}
		})
	})
	.on('waypointschanged', function(e) {
		permalinkSet();
		setTimeout(function() {
			if (e.waypoints[0].latLng) {
				$('.sidebar-tabs ul li [href="#walking"] .sidebar-notif').text($('.leaflet-marker-draggable').length).show();
				if ($('#inputDebug').is(':checked')) console.debug('Walkpoint Nominatim:', e.waypoints);
			}
			else $('.sidebar-tabs ul li [href="#walking"] .sidebar-notif').hide();
		}, 50);
	})
	.on('routeselected', function() {
		if (routingControl.zoomBounds) {
			map.flyToBounds(routingControl._line.getBounds().pad(0.5));
			routingControl.zoomBounds = false;
		}
	});
	$('#routingControl').html(routingControl.onAdd(map));
	$('.leaflet-routing-geocoders').append('<button class="leaflet-routing-delete-waypoints" "type="button" onclick="clear_map(\'walk\');" title="Clear waypoints"></button>');
	$('.leaflet-routing-reverse-waypoints').attr('title', 'Reverse waypoints');
	$('.leaflet-routing-add-waypoint').attr('title', 'Add a waypoint');
}

function populatePoiTab() {
	var poiTags = {}, category = [], categoryList = [], c;
	for (var poi in pois) if (pois[poi].catName && pois[poi].tagKeyword) {
		// get all keywords and put into categories
		poiTags[poi] = pois[poi].tagKeyword;
		category.push({ listLocation: poi, header: '<img data-key="poi" src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name });
		// get unique category label for poi checkbox tab
		if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
	}
	for (c = 1; c < $('#tourList option').length - 1; c++) if ($('#tourList option').eq(c).data('keyword')) {
		category.push({ listLocation: $('#tourList option').eq(c).text().split('- ')[1], header: '<img data-key="tour' + c + '" src="assets/img/sb-tour.png">Tour ' + $('#tourList option').eq(c).text() });
		poiTags[$('#tourList option').eq(c).text().split('- ')[1]] = $('#tourList option').eq(c).data('keyword').split(', ');
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
			onChooseEvent: function() {
				// select poi
				if ($('.eac-category').eq($('#autocomplete').getSelectedItemIndex()).find('img').data('key') === 'poi') {
					// find selected items category and split it to get checkbox, then display
					var catSplit = $('.eac-category').eq($('#autocomplete').getSelectedItemIndex()).text().split(' - ')[1];
					clear_map('markers');
					$('a[href="#pois"]').click();
					$('.poi-checkbox label[title="' + catSplit + '"] input').prop('checked', true);
					// scroll to checkbox
					$('#poi-icons').scrollTop(0).scrollTop($('.poi-checkbox label[title="' + catSplit + '"]').position().top - 50);
					poi_changed();
				}
				// select tour
				else switchTab('tour', $('.eac-category').eq($('#autocomplete').getSelectedItemIndex()).find('img').data('key').split('tour')[1]);
				$('#autocomplete').val('');
				if ($('#poi-filter-in').val().length) $('#poi-filter-in').val('').trigger('keyup');
			}
		},
		categories: category
	};
	$('#autocomplete').easyAutocomplete(options);
	$('div.easy-autocomplete').removeAttr('style');
	// create checkbox tables using poi categories
	var checkboxContent = '<div id="poi-filter"><input id="poi-filter-in" type="text" placeholder="Filter, e.g. \'dog\', \'park\', \'eat\', \'bed\'"/><span id="poi-filter-cl"></span></div>' +
			'<div class="comment" style="text-align:right;">Make up to ' + maxPOICheckbox + ' selections at a time.</div>';
	for (c in categoryList) {
		checkboxContent += '<div id="goto' + categoryList[c] + '" class="poi-group"><hr><h3>' + categoryList[c] + '</h3><a href="#goto' + categoryList[c] + '"></a>';
		for (poi in pois) if (pois[poi].catName === categoryList[c]) checkboxContent += L.Util.template(
			'<div class="poi-checkbox">' +
				'<label title="{name}">' +
					'<img src="assets/img/icons/{icon}.png"></img>' +
					'<input type="checkbox" id="{key}" data-keyword="{keyword}"><span>{name}</span>' +
				'</label>' +
			'</div>',
			{ key: poi, name: pois[poi].name, icon: pois[poi].iconName, keyword: pois[poi].tagKeyword.join(',') }
		);
		checkboxContent += '</div>';
	}
	$('#poi-icons').append(checkboxContent + '<a class="theme anchor"></a>');
}
populatePoiTab();

// highlight textboxes on focus
$(':text').on('focus', function() { $(this).select(); });

// popup window
function popupWindow(url, title, w, h) {
	window.open(url, title, 'width=' + w + ', height=' + h + ', menubar=0, toolbar=0, resizable=1').focus();
}

// keyboard shortcuts
var interval;
$('html').keydown(function(e) {
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
}).keyup(function(e) {
	// CTRL down: switch overlay transparency on
	if (e.keyCode === 17 && actOverlayLayer) {
		clearInterval(interval);
		if ($('#inputOpacity input').val() > 0.05) interval = setInterval(() => {
			$('#inputOpacity input').val(+$('#inputOpacity input').val() - 0.05).trigger('change');
			if ($('#inputOpacity input').val() == 0.05) clearInterval(interval);
		}, 40);
		else if ($('#inputOpacity input').val() < 1) interval = setInterval(() => {
			$('#inputOpacity input').val(+$('#inputOpacity input').val() + 0.05).trigger('change');
			if ($('#inputOpacity input').val() == 1) clearInterval(interval);
		}, 40);
		e.preventDefault();
	}
});

// if user presses ENTER instead of selecting a category, do an address search with the value
$('#autocomplete').keydown(function(e) {
	if (e.keyCode === $.ui.keyCode.ENTER && $(this).val() && !$('#eac-container-autocomplete ul:visible')) {
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
		$('.leaflet-control-geocoder-icon').click();
		$('.leaflet-control-geocoder-form input').val($(this).val());
		geocode._geocode();
	}
});

var scaleControl;
$('#settings input').not('#inputDebug').change(function() {
	// change unit of measurement
	if ($(this).attr('id') === 'inputUnit') {
		if (routingControl) $('#btnClearmap').click();
		if ($(this).is(':checked')) {
			if (scaleControl) scaleControl.remove();
			scaleControl = L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('metric');
		}
		else {
			if (scaleControl) scaleControl.remove();
			scaleControl = L.control.scale({ metric: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('imperial');
		}
		$('#msgStatus').prependTo('.leaflet-bottom.leaflet-right');
	}
	if ($(this).attr('id') === 'inputDark') {
		if ($(this).is(':checked')) {
			$('head').append(darkMode);
		}
		else $('head style').remove();
		$('#tourList').trigger('change');
	}
	permalinkSet();
});

// developer tools
if (!noIframe) $('#devTools').hide();
$('#devTools').accordion({
	heightStyle: 'content',
	animate: 150,
	collapsible: true,
	active: $('#inputDebug').is(':checked') ? 0 : false,
	activate: function(event, ui) { if (ui.oldPanel[0]) $('#inputDebug').prop('checked', false).trigger('change'); }
});
$('#inputDebug').change(function() {
	if ($(this).is(':checked')) {
		$('#devTools').accordion({ collapsible: false });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').show();
		map.setMaxBounds();
	}
	else {
		$('#devTools').accordion({ collapsible: true });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').hide();
		$('#inputAttic, #inputOverpass').val('');
		map.setMaxBounds(LBounds.pad(0.5));
	}
});
$('#inputDebug').trigger('change');
$('#inputOverpass').keydown(function(e) {
	if (e.keyCode == $.ui.keyCode.ENTER && $(this).val()) {
		clear_map('all');
		$('#inputDebug').prop('checked', true).trigger('change');
		if ($(this).val().indexOf('[') !== 0) $(this).val('[' + $(this).val() + ']');
		show_overpass_layer('(nwr' + $(this).val() + ';);', '', true);
	}
});
$('#inputOpCache').change(function() {
	if ($(this).val() > 240) $(this).val(240);
	else if ($(this).val() < 0) $(this).val(0);
	else if ($(this).val() === '') $(this).val(48);
	if (window.localStorage) window.localStorage.OPLCacheDur = $(this).val();
});
function exportQuery() {
	// https://wiki.openstreetmap.org/wiki/Overpass_turbo/Development
	if (queryBbox) window.open('https://overpass-turbo.eu/?Q=' + encodeURIComponent(queryBbox) + 'out center;&C=' + mapCentre.join(';') + ';' + mapZoom + '&R', '_blank');
	else setMsgStatus('fas fa-info-circle', 'Nothing to export', 'Please select a query.', 1);
}
function downloadBB() {
	window.location = 'https://' + $('#inputOpServer').val() + '/api/map?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',');
}

// clear layers
function clear_map(layer) {
	if (layer === 'markers' || layer === 'all') {
		$('.poi-checkbox input:checked').prop('checked', false);
		poi_changed();
		$('.poi-checkbox').removeClass('poi-loading');
		queryBbox = undefined;
		rQuery = false;
		imageOverlay.clearLayers();
		actImgLayer = undefined;
		$('#thennow img').off('mouseenter mouseleave');
		$('#inputWw2').remove();
		setPageTitle();
	}
	if (layer === 'all' && $('#poi-filter-in').val().length) $('#poi-filter-in').val('').trigger('keyup');
	if (layer === 'walk' || layer === 'all') routingControl.setWaypoints([]);
	if (layer === 'all' && actOverlayLayer && tileOverlayLayer[actOverlayLayer].hide) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
	spinner = 0;
	$('.spinner').hide();
	$('#msgStatus').hide();
	permalinkSet();
}

// fly to bounds of layer
function zoom_area(closeTab) {
	if ($(window).width() < 768 && closeTab) $('.sidebar-close:visible').click();
	map.closePopup();
	map.flyToBounds(areaOutline.getBounds().extend(iconLayer.getBounds()).extend(imageOverlay.getBounds()));
}

function poi_changed(newcheckbox) {
	var poiChk = $('.poi-checkbox input:checked');
	rQuery = false;
	// limit number of active checkboxes
	if (poiChk.length <= maxPOICheckbox) {
		// remove old poi markers and results
		$('#poi-results').css('pointer-events', '');
		map.closePopup();
		iconLayer.clearLayers();
		clickOutline.clearLayers();
		areaOutline.clearLayers();
		imageOverlay.clearLayers();
		actImgLayer = undefined;
		setPageTitle();
		poiList = [];
		if (poiChk.is(':checked')) {
			$('#poi-results h3').html('Results loading...');
			$('#poi-results-list').fadeTo(250, 0.5);
			//build overpass query
			var query = '(', selectedPois = '';
			poiChk.each(function(i, element) {
				query += pois[element.id].query;
				selectedPois += element.id + '-';
			});
			query += ');';
			show_overpass_layer(query, selectedPois.slice(0, -1), true);
		}
		else {
			markerId = undefined;
			$('#poi-results h3').html('Results cleared.');
			$('#poi-results').css('height', '').slideUp(500);
			$('#poi-results-list').fadeOut(250);
			$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').hide();
			permalinkSet();
		}
	}
	else {
		// flash selected pois when max number reached
		poiChk.parent().fadeTo(100, 0.3, function() { $(this).fadeTo(500, 1.0); });
		$('#' + newcheckbox).prop('checked', false);
	}
	$('.poi-checkbox input').trigger('change');
}
$('.poi-checkbox input').click(function() {
	poi_changed($(this).attr('id'));
});
// checkbox highlight
$('.poi-checkbox input').change(function() {
	var that = this;
	// timeout fix for chrome not redrawing poi list
	setTimeout(function() {
		if ($(that).prop('checked')) $(that).parent().addClass('poi-checkbox-selected');
		else $(that).parent().removeClass('poi-checkbox-selected');
	}, 500);
});

// sets the page title
function setPageTitle(subTitle) {
	$(document).attr('title', $('meta[property=\'og:title\']').attr('content') + (subTitle ? ': ' + subTitle : ''));
}

// set status message modal
function setMsgStatus(headerIco, headerTxt, msgBody, autoClose) {
	$('#msgStatus').stop().html(
		'<div id="msgStatusHead">' +
			'<i class="' + headerIco + ' fa-lg fa-fw"></i> ' + headerTxt +
			'<div class="leaflet-popup-close-button" onclick="clickOutline.clearLayers();$(\'#msgStatus\').stop().hide();">×</div>' +
		'</div>' +
		'<div id="msgStatusBody">' + msgBody + '</div>'
	).fadeIn(200);
	if (autoClose) $('#msgStatus').delay(3000).fadeOut(3000);
}

// show tips
function getTips(tip) {
	var nextTip, tips = [
		'Click an area of the above minimap to quickly <i class="fas fa-search-plus fa-sm"></i> to that location.',
		'You can zoom-in and click almost any place on the map to see more details.',
		'Find any address by entering part of it into Search <i class="fas fa-search fa-sm"></i> and pressing enter.',
		'Almost street in Bexhill has a history behind its name, Search <i class="fas fa-search fa-sm"></i> for a road to learn more.',
		'Click a bus-stop <i class="fas fa-bus fa-sm"></i> to see real-time information on arrivals.',
		'Click a post-box <i class="fas fa-envelope fa-sm"></i> to see today\'s last post collection.',
		'Use the mouse wheel or swipe to see the next image in a pop-up. Click "View image" to see it in a larger size.',
		'Click <i class="fas fa-location-arrow fa-sm"></i> to turn on your location and see places ordered by distance.',
		'Choose between miles or kilometres in <a onclick="switchTab(\'settings\');">Settings <i class="fas fa-cog fa-sm"></i></a>.',
		'Click <i class="fas fa-trash fa-sm"></i> to clear all layers from the map, right-clicking the button resets the map to defaults.',
		'Touch screen users can quickly close the sidebar by swiping <i class="fas fa-hand-point-up fa-sm"></i> the sidebar title.',
		'See your what places are around you by turning on <i class="fas fa-location-arrow fa-sm"></i> and clicking on your blue marker.',
		'Quickly create walking <i class="fas fa-walking fa-sm"></i> directions by turning on <i class="fas fa-location-arrow fa-sm"></i> and right-clicking the map.',
		'Bookmark any place by clicking the <i class="far fa-bookmark fa-sm"></i> icon in a popup.',
		'We have a number of historical map overlays, select them using the top-right layer control <i class="fas fa-layer-group fa-sm"></i> .',
		'Results in Places are coloured to show currently open (green) or closed (red).',
		'You can find booking, location and ratings on all accommodation under <a onclick="switchTab(\'pois\', \'Leisure-Tourism\');">Leisure-Tourism</a>.',
		'Get the latest Food Hygiene Ratings on every business in the area under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Find your closest <i class="fas fa-recycle fa-sm"></i> container and the materials it recycles under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Have a look at our WW2 Incident Map under <a onclick="switchTab(\'tour\', 9);">History <i class="fas fa-book fa-sm"></i></a>.',
		'View superimposed and colourised images of Bexhill past and present under <a onclick="switchTab(\'thennow\');">Then and Now <i class="far fa-image fa-sm"></i></a>.',
		'Notice something wrong or missing on the map? Right-click the area and Leave a note <i class="far fa-sticky-note fa-sm"></i>.',
		'<i class="fas fa-map-pin fa-sm"></i> 1,000 photos, 20,000 buildings and 250 miles of roads/paths within 15 miles&sup2; have been mapped thus far!',
		'The data behind Bexhill-OSM is completely <i class="fas fa-lock-open fa-sm"></i> and free to use for anyone however they wish!',
		'For a mobile, offline version of this map - give Maps.Me a try.',
		'Anyone can help with building the <i class="far fa-map fa-sm"></i>, visit OpenStreetMap.org on how to get started.'
	];
	if (tip === 'rand') nextTip = Math.floor(Math.random() * tips.length);
	else if (parseInt($('#tipsText').data('tip')) === tips.length - 1) nextTip = 0;
	else nextTip = parseInt($('#tipsText').data('tip')) + 1;
	$('#tipsText').fadeOut(150, function() { $(this).html(tips[nextTip]).data('tip', nextTip); }).fadeIn(150);
	$('#tipsButton').attr('title', 'Next tip (' + (nextTip + 1) + ' of ' + tips.length + ')');
}

// https://openweathermap.org
function showWeather() {
	$.ajax({
		url: 'https://api.openweathermap.org/data/2.5/weather',
		dataType: 'json',
		cache: false,
		data: { id: '2655777', units: 'metric', appid: window.BOSM.owmKey },
		success: function(data) {
			if (data.weather) {
				var windDir = [
					'North','N-Northeast','Northeast','E-Northeast',
					"East",'E-Southeast','Southeast','S-Southeast',
					'South','S-Southwest','Southwest','W-Southwest',
					'West','W-Northwest','Northwest','N-Northwest'
				], getWinddir = data.wind.deg ? windDir[(Math.floor((data.wind.deg / 22.5) + 0.5)) % 16] : 'Calm';
				$('#weather').html(
					'<span><img src="https://openweathermap.org/img/w/' + data.weather[0].icon + '.png"></span>' +
					'<span>' +
						data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1) + '<br>' +
						data.main.temp.toFixed(0) + '&deg;C' +
					'</span>' +
					'<span><i class="fas fa-wind fa-2x"' + (data.wind.deg ? ' style="transform:rotate(' + (data.wind.deg + 90) + 'deg);"' : '') + '></i></span>' +
					'<span>' +
						getWinddir + '<br>' +
						(data.wind.speed * 2.236936).toFixed(1) + ' mph' +
					'</span>'
				).attr({
					'title': 'Current weather in ' + data.name + '\nOpenWeather',
					'onclick': 'popupWindow("https://openweathermap.org/city/' + data.id + '", "owWindow", 1024, 768);'
				}).show();
			}
			else this.error();
			if ($('#inputDebug').is(':checked')) console.debug('Openweather:', data);
		},
		error: function() {
			if ($('#inputDebug').is(':checked')) console.debug('ERROR OPENWEATHER:', this.url);
			$('#weather').hide();
		}
	});
}

// https://github.com/mapbox/osmcha-frontend/wiki/API
// display latest osm changesets
function showEditFeed() {
	$.ajax({
		url: 'https://osmcha.org/api/v1/changesets/',
		headers: { 'Authorization': 'Token ' + BOSM.osmchaTok },
		dataType: 'json',
		cache: false,
		data: {
			page: 01,
			page_size: 05,
			in_bbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			area_lt: 2
		},
		success: function(data) {
			if (data.features) {
				var s = '';
				$.each(data.features, function(e, itm) {
					s += '<li><span class="fa-li"><i class="fas fa-sync"></i></span><a href="https://overpass-api.de/achavi/?changeset=' + itm.id + '&layers=B0FTTFT" title="View changeset"><i>' + itm.properties.comment + '</i></a>' +
					' - <a href="https://www.openstreetmap.org/user/' + itm.properties.user + '" title="View user">' + itm.properties.user + '</a>' +
					' - <span title="' + date_parser(itm.properties.date, 'long') + '">' + date_parser(itm.properties.date.split('T')[0], 'short') + '</span></li>';
				});
				$('#osmFeed')
					.html('Recent map changes:<ul class="fa-ul">' + s + '</ul><p><hr>')
					.slideDown();
				$('#osmFeed a')
					.attr({
						'onClick': 'return window.confirm("This link will open an external website to review, continue?");',
						'target': '_blank',
						'rel': 'noopener'
					});
				if ($('#inputDebug').is(':checked')) console.debug('OSM feed:', data);
			}
			else this.error();
		},
		error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-FEED:', this.url); }
	});
}

// https://github.com/medialize/URI.js
// M = basemap, O = overlay, OP = overlay opacity, S = settings, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, W = walkpoints
// search = geocode query, data = overpass query, loc = location on
function permalinkSet() {
	var uri = URI(window.location.href);
	var selectedPois = '', walkCoords = '', settingChk, tourPage, overlayOpacity, c;
	var walkWayp = routingControl ? routingControl.getWaypoints() : undefined;
	var tab = (actTab === defTab) ? undefined : actTab;
	var baseLayer = (actBaseTileLayer === defBaseTileLayer) ? undefined : actBaseTileLayer;
	var imgLayer = (actTab === actImgLayer) ? undefined : actImgLayer;
	if (actOverlayLayer) {
		overlayOpacity = Math.floor(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity * 100);
		if (overlayOpacity === tileOverlayLayer[actOverlayLayer].opacity * 100) overlayOpacity = undefined;
	}
	if (walkWayp) for (c in walkWayp) if (walkWayp[c].latLng) walkCoords += L.Util.formatNum(walkWayp[c].latLng.lat, 5) + 'x' + L.Util.formatNum(walkWayp[c].latLng.lng, 5) + '_';
	walkCoords = walkCoords ? walkCoords.slice(0, -1) : undefined;
	if (actTab === 'tour' && $('#tourList option:selected').val() > 0) tourPage = $('#tourList option:selected').val();
	$('.poi-checkbox input:checked').each(function(i, element) { selectedPois += element.id + '-'; });
	selectedPois = selectedPois ? selectedPois.slice(0, -1) : undefined;
	if ($('#settings input:checkbox:checked').not('#inputDebug').length) {
		settingChk = '';
		for (c = 0; c < $('#settings input:checkbox').not('#inputDebug').length; c++) settingChk += $('#settings input:checkbox').eq(c).is(':checked') ? '1' : '0';
	}
	uri.query({ 'M': baseLayer, 'O': actOverlayLayer, 'OP': overlayOpacity, 'S': settingChk, 'T': tab, 'U': tourPage, 'G': imgLayer, 'P': selectedPois, 'I': markerId, 'W': walkCoords });
	history.replaceState(null, null, uri.resource());
}
function permalinkReturn() {
	var uri = URI(window.location.href), junkQ = window.location.href.split('?'), c;
	// split fix for facebook and other junk trackers adding ?fbclid etc and busting queries
	if (junkQ.length > 2) {
		uri = URI(junkQ.slice(0, 2).join('?'));
		history.replaceState(null, null, '?' + junkQ.slice(0, 2)[1]);
	}
	if (!noPermalink) {
		if (uri.hasQuery('M') && tileBaseLayer[uri.search(true).M]) actBaseTileLayer = uri.search(true).M;
		if (uri.hasQuery('O') && tileOverlayLayer[uri.search(true).O]) {
			actOverlayLayer = uri.search(true).O;
			tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].addTo(map);
			if (uri.hasQuery('OP')) tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(uri.search(true).OP / 100);
		}
		if (uri.hasQuery('S')) {
			var settingChk = uri.search(true).S;
			for (c = 0; c < settingChk.length; c++) $('#settings input:checkbox').eq(c).prop('checked', parseInt(settingChk.charAt(c), 10));
			if ($('#inputDebug').is(':checked')) $('#inputDebug').trigger('change');
		}
		$('#inputUnit, #inputDark').trigger('change');
		if (uri.hasQuery('T')) actTab = uri.search(true).T;
		if (uri.hasQuery('U')) {
			var tourNum = uri.search(true).U;
			if ($('#tourList option[value=' + tourNum + ']').length && !$('#tourList option[value=' + tourNum + ']')[0].disabled)
				$('#tourList').val(tourNum).trigger('change');
		}
		if (uri.hasQuery('W')) {
			var walkPoints = uri.search(true).W;
			walkPoints = walkPoints.split('_');
			for (c in walkPoints) {
				walkPoints[c] = walkPoints[c].replace('x', ', ');
				routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkPoints[c] + ']'));
			}
		}
		if (uri.hasQuery('G')) {
			if (uri.hasQuery('I')) markerId = uri.search(true).I;
			tour(uri.search(true).G, true);
		}
		else if (uri.hasQuery('P')) {
			var groupedPoi = uri.search(true).P;
			if (groupedPoi.indexOf('-') !== -1) groupedPoi = groupedPoi.split('-');
			if (uri.hasQuery('I')) markerId = uri.search(true).I;
			setTimeout(function() {
				if (!$.isArray(groupedPoi)) $('#' + groupedPoi).prop('checked', true);
				// the last poi has a "/" on it because leaflet-hash
				else for (c in groupedPoi) { $('#' + groupedPoi[c].replace('/', '')).prop('checked', true); }
				poi_changed(groupedPoi);
			}, 500);
		}
		else if (uri.hasQuery('I')) {
			var singlePoi = uri.search(true).I;
			rQuery = true;
			setTimeout(function() { show_overpass_layer(elementType(singlePoi) + '(' + singlePoi.slice(1) + ');', singlePoi.toUpperCase()); }, 500);
		}
		else if (uri.hasQuery('search')) searchAddr(decodeURIComponent(uri.search(true).search));
		else if (uri.hasQuery('data')) {
			$('#devTools').accordion({ active: 0 });
			$('#inputDebug').prop('checked', true).trigger('change');
			$('#inputOverpass').val(decodeURIComponent(uri.search(true).data));
			setTimeout(function() { show_overpass_layer('(nwr' + decodeURIComponent(uri.search(true).data) + ';);', '', true); }, 500);
		}
		if (uri.hasQuery('loc')) setTimeout(function() { lc.start(); }, 500);
	}
	else {
		$('#inputUnit, inputDark').trigger('change');
		if (uri.hasQuery('T')) actTab = uri.search(true).T;
	}
	tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
	if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
	if ($(window).width() < 768 && actTab === 'home') actTab = 'none';
	if (actTab === 'thennow') tour('thennow', true);
	if (actTab !== 'none') sidebar.open(actTab);
	// animate sidebar close button on smaller devices if layers underneath
	if (actTab !== 'none' && $(window).width() < 768 && (uri.hasQuery('O') || uri.hasQuery('G') || uri.hasQuery('P') || uri.hasQuery('I') || uri.hasQuery('W')))
		$('.sidebar-close').addClass('wobble');
	if (noIframe && window.localStorage && parseInt(window.localStorage.OPLCacheDur) >= 0 && parseInt(window.localStorage.OPLCacheDur) <= 240)
		$('#inputOpCache').val(parseInt(window.localStorage.OPLCacheDur));
	else $('#inputOpCache').val(48);
}
permalinkReturn();

// allow postMessage from these websites when in an iFrame
window.addEventListener('message', function(event) {
	var iframeAccess = ['//www.discoverbexhill.com', '//bexhillheritage.org.uk', '//www.bexhillmuseum.org.uk'];
	if (!noIframe && iframeAccess.findIndex(x => x === event.origin.split(':')[1]) >= 0) {
		clear_map('markers');
		switchTab('none', '', event.data);
	}
	else return;
});
