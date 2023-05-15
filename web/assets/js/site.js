// all main functions for site

// don't forget to create config.js with your api keys
if (typeof window.BOSM === 'undefined') window.alert('Error: No API keys defined, please see config.example.js');
// map area
const osmRelation = '12710197'; // osm relation for overpass queries, if blank bbox will be used
const mapBounds = { south: 50.802, west: 0.372, north: 50.878, east: 0.525 };
const LBounds = L.latLngBounds([mapBounds.south, mapBounds.west], [mapBounds.north, mapBounds.east]);
const mapMinZoom = 10;
// map open location
const mapCentre = [50.8470, 0.4675];
const mapZoom = ($(window).width() < 768) ? 13 : 14;
// default map layers
const defBaseTileLayer = 'osmstd';
let actBaseTileLayer = defBaseTileLayer, actOverlayLayer;
// default tab to open
const defTab = 'home';
let actTab = ($(window).width() < 768) ? 'none' : defTab;
// set image width inside popups
const imgSize = ($(window).width() < 512) ? 256 : 310;
// maximum poi groups that can be selected
const maxPOICheckbox = 3;
// maximum overpass poi results
const maxOpResults = 250;
// maximum nominatim search results
const maxNomResults = 5;
// website checks
const noTouch = window.ontouchstart === undefined;
const noIframe = window.top === window.self;
let noPermalink = !new URL(window.location.href).searchParams.toString() || new URL(window.location.href).searchParams.toString() === 'T=none';
// title tag tooltip defaults
const tooltipDef = {
	disabled: noTouch ? false : true,
	hide: false,
	show: { delay: 200, duration: 50 },
	track: true,
	position: { my: 'left+15 top+10' },
	create: function() { $('.ui-helper-hidden-accessible').remove(); }
};
// local
const email = 'info' + String.fromCharCode(64) + 'bexhill-osm.org.uk';
const lang = $('html').attr('lang');

// https://fancyapps.com/fancybox/3
// show popup images in a lightbox
$.extend($.fancybox.defaults, {
	spinnerTpl: '<div class="spinner" style="left:0;" title="Loading...">' + $('.spinner').html() + '</div>',
	btnTpl: {
		slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><i class="fa-solid fa-circle-play fa-2x"></i><i class="fa-solid fa-circle-pause fa-2x"></i></button>',
		close: '<button data-fancybox-close class="fancybox-button fancybox-close" title="{{CLOSE}}"><i class="fa-solid fa-times-circle fa-2x"></i></button>',
		arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><i class="fa-solid fa-square-caret-left fa-2x"></i></button>',
		arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><i class="fa-solid fa-square-caret-right fa-2x"></i></button>'
	},
	idleTime: false,
	hash: false,
	loop: true,
	transitionEffect: 'slide',
	transitionDuration: 500,
	animationDuration: 500,
	mobile: {
		clickContent: false,
		clickSlide: 'close',
		dblclickContent: function(current) { return current.type === 'image' ? 'zoom' : false; }
	},
	slideShow: { speed: 4000 },
	opts: { iframe: { preload: true } }
});

// set swipe triggers for touch devices
// close sidebar
$('.sidebar-header').on('swipeleft', function() { $('.sidebar-close:visible').click(); });
// prev/next tour iframe
$('#tourControls')
	.on('swiperight', function() { $('#tourPrev').trigger('click'); })
	.on('swipeleft', function() { $('#tourNext').trigger('click'); })
	.on('wheel', function(e) {
		if (e.originalEvent.deltaY > 0) $('#tourNext').trigger('click');
		else if (e.originalEvent.deltaY < 0) $('#tourPrev').trigger('click');
		e.preventDefault();
	});

$('.sidebar-tabs li').click(function() {
	// get current sidebar-tab
	actTab = ($('.sidebar.collapsed').length || actTab === 'closing') ? 'none' : $('.sidebar-pane.active').attr('id');
	$('.sidebar-close').removeClass('wobble');
	// resize links on minimap
	if (actTab === 'home') {
		if (!$('#weather:visible').length && noIframe) { showWeather(); showEditFeed(); }
		setTimeout(function() { $('#minimap > map').imageMapResize(); }, 400);
	}
	if (actTab === 'tour') {
		$('#tourList').trigger('change');
		$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif:visible').hide();
	}
	if (actTab === 'thennow' && actImgLayer !== 'thennow') tour('thennow', '', false);
	// animate map recentre on sidebar open/close, matches sidebar transition-duration
	if ($(window).width() >= 768 && $(window).width() < 1024) {
		let x = 0, timer = setInterval(function() {
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

// ignore map single click in some cases
L.Map.addInitHook(function() {
	let that = this, h;
	if (that.on) {
		that.on('click', check_later);
		that.on('dblclick', function() { setTimeout(clear_h); });
	}
	function check_later(e) {
		clear_h();
		// clear msg status box
		if ($('#msgStatus:visible').length) {
			clickOutline.clearLayers();
			$('#msgStatus').hide();
		}
		// ignore map click if... low zoom / dragging walk markers / overlay control is open / layerNoclick / spinner is shown / popup is open on screen
		else if (map.getZoom() >= 15 && !$('.leaflet-marker-draggable, .leaflet-control-layers-expanded, .layerNoclick').length && !imageOverlay.getLayers().length &&
		 !$('.spinner:visible').length && !($('.leaflet-popup').length && map.getBounds().contains(map.layerPointToLatLng($('.leaflet-popup')[0]._leaflet_pos)))) {
			that.fire('visualclick', L.Util.extend(e, { type: 'visualclick' }));
			// drop marker and reverse lookup on single click
			h = setTimeout(function() {
				clickOutline.clearLayers().addLayer(L.circleMarker(e.latlng, {
					radius: 10,
					weight: 2,
					color: $('html').css('--main-color'),
					opacity: 1,
					fillColor: darkMode ? '#000' : '#fff',
					fillOpacity: 0.5,
					interactive: noTouch ? true : false,
					bubblingMouseEvents: false
				}).on('click' , function() {
					if ($('#msgStatus .msgStatusBodyAddr').length) $('#msgStatus .msgStatusBodyAddr').click();
				}));
				reverseQuery(e, 1);
			}, 350);
		}
		// highlight action to enable map click again
		else if (!$('.leaflet-popup, .leaflet-control-layers-expanded, .leaflet-marker-draggable').length) {
			if (imageOverlay.getLayers().length) $('#btnClearmap .fa-solid').addClass('fa-beat-fade');
			else if ($('.layerNoclick').length) $('#inputOpacity .fa-solid').addClass('fa-beat-fade');
			else if (map.getZoom() < 15) $('.leaflet-control-zoom-in .fa-solid').addClass('fa-beat-fade');
		}
	}
	function clear_h() {
		$('#btnClearmap .fa-solid, #inputOpacity .fa-solid, .leaflet-control-zoom-in .fa-solid').removeClass('fa-beat-fade');
		if (h !== null) {
			clearTimeout(h);
			h = null;
		}
	}
});

// initialise map
const map = new L.map('map', {
	maxBoundsViscosity: 0.9,
	minZoom: mapMinZoom,
	maxZoom: 20,
	bounceAtZoomLimits: false,
	// https://github.com/aratcliffe/Leaflet.contextmenu
	contextmenu: true,
	contextmenuWidth: 140,
	contextmenuItems: [{
		text: '<i class="fa-solid fa-hand-pointer fa-fw"></i> Query feature',
		index: 0,
		callback: reverseQuery
	}, {
		text: '<i class="fa-solid fa-person-walking fa-fw"></i> Walk to here',
		index: 1,
		callback: walkHere
	}, {
		text: '<i class="fa-solid fa-location-dot fa-fw"></i> Add a walk point',
		index: 2,
		callback: walkPoint
	}, {
		text: '<i class="fa-solid fa-crosshairs fa-fw"></i> Centre map here',
		index: 3,
		callback: centreMap
	}, '-', {
		text: '<i class="fa-regular fa-sticky-note fa-fw"></i> Leave a note here',
		index: 4,
		callback: improveMap
	}, {
		text: '<i class="fa-solid fa-wrench fa-fw"></i> FixMyStreet',
		index: 5,
		callback: fixMyStreet
	}, {
		text: '<i class="fa-solid fa-street-view fa-fw"></i> Photosphere view',
		index: 6,
		callback: panoView
	}, '-', {
		text: '<span id="copyGeos" class="comment" title="Copy to clipboard"></span>',
		index: 7,
		callback: copyGeos
	}]
}).whenReady(function() {
	map.attributionControl.setPrefix('<a onclick="switchTab(\'info\', \'software\');" title="Attribution"><i class="fa-solid fa-circle-info fa-fw"></i></a>');
	if (!noIframe) {
		$('#devTools').hide();
		$('.leaflet-control-locate').hide();
		$('#btnBookm').parent().hide();
		map.attributionControl.addAttribution('<a href="/" target="_blank">Bexhill-OSM</a>');
	}
	if (!localStorageAvail()) {
		$('#devTools').hide();
		$('#btnReset').parent().hide();
		$('#btnBookm').parent().hide();
	}
	// sidebar information
	sidebar.fadeIn();
	$('.sidebar-tabs, .sidebar-close, .leaflet-bar a, button, #setOptions .setLabel').tooltip(tooltipDef);
	getTips('random');
	if (actTab === defTab && noIframe) { showWeather(); showEditFeed(); }
	else $('#weather').hide();
	$('#creditFooter > span').append(
		new Date().getFullYear() + ' | <a href="https://github.com/Dr-Mx/bexhill-osm/blob/master/CHANGELOG.md" title="Changelog" target="_blank" rel="noopener">v' +
		$('script').last().attr('src').split('v=')[1] + '</a>'
	);
	$('#walkList, #tourList').trigger('change');
	// metadata badges updated via cronjob.sh
	const dailyCache = '?d=' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate();
	$('#info #gotoabout .mylinks').append('<br><br>' +
		'<a href="https://www.twitter.com/bexhillosm" target="_blank" rel="noopener" title="Twitter followers"><img src="assets/img/info-twitter.svg' + dailyCache +'"></a><br>' +
		'<a href="https://www.youtube.com/@bexhillosm" target="_blank" rel="noopener" title="YouTube subscribers"><img src="assets/img/info-youtube.svg' + dailyCache +'"></a><br><br>' +
		'<a href="https://osm.org/user/Bexhill-OSM" target="_blank" rel="noopener" title="OpenStreetMap edits"><img src="assets/img/info-osm.svg' + dailyCache +'"></a><br>' +
		'<a href="https://commons.wikimedia.org/wiki/Special:ListFiles?user=Dr-Mx" target="_blank" rel="noopener" title="Wikimedia Commons uploads"><img src="assets/img/info-wikimedia.svg' + dailyCache +'"></a><br>' +
		'<a href="https://archive.org/details/@dr-mx" target="_blank" rel="noopener" title="Internet Archive uploads"><img src="assets/img/info-archive.svg' + dailyCache +'"></a>'
	);
	// add overlay opacity slider to layer control
	$('.leaflet-top.leaflet-right').append(
		'<div id="inputOpacity" class="leaflet-control leaflet-bar">' +
			'<input type="range" min="0.05" max="1" step="0.05">' +
			'<div class="leaflet-popup-close-button" title="Remove overlay" onclick="map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);"><i class="fa-solid fa-xmark fa-sm"></i></div>' +
		'</div>'
	);
	$('.leaflet-bottom.leaflet-right').prepend('<div id="msgStatus" class="leaflet-control"></div>');
	// back to top button
	$('.anchor')
		.hide()
		.attr('title', 'Return to top')
		.click(function() {
			$(this).parent()[0].scroll({ top: 0, behavior: 'smooth' });
		})
		.parent().scroll(function() {
			if ($(this).scrollTop() > 350) $(this).find('.anchor').fadeIn(200);
			else $(this).find('.anchor').fadeOut(200);
		});
	setTimeout(setOverlayLabel, 10);
	// tutorial modals
	if (localStorageAvail() && !window.localStorage.tutorial) window.localStorage.tutorial = '';
	if (noPermalink && noIframe && localStorageAvail() && window.localStorage.tutorial.indexOf('modals') === -1) {
		const showModalTutor = function(txt, sty) {
			sty.targ.before(
				'<div id="modalT' + sty.id + '" class="modalTutor leaflet-control" style="' + sty.dir + ':' + sty.dist + 'px;position:' + sty.pos + ';">' +
				'<div class="modalText"><span>' + (sty.id+1) + '/<span>0</span>:</span> ' + txt + '</div>' +
				'<button type="button" class="modalButton theme">Got it</button>' +
				'<div class="modalArrow" style="' + sty.dir + ':-5px;"></div></div>'
			);
			L.DomEvent.disableClickPropagation($('#modalT' + sty.id)[0]).disableScrollPropagation($('#modalT' + sty.id)[0]);
			$('.modalText > span > span').text(sty.id+1);
			$('#modalT' + sty.id + ' .modalButton').on('click', function() {
				$(this).parent().fadeOut(100, function() { $(this).remove(); });
				if ($('#modalT' + (sty.id+1)).length) $('#modalT' + (sty.id+1)).fadeIn(100, function() { $(this).find('button').focus(); });
				else window.localStorage.tutorial += 'modals;';
			});
		};
		showModalTutor(
			'Choose from a growing number of modern and historical maps.' + (noTouch ? '<br>Tapping <kbd>CTRL</kbd> will fade loaded overlays in and out.' : ''),
			{ id: 0, targ: $('.leaflet-control-layers'), dist: '50', dir: 'right', pos: 'fixed' }
		);
		showModalTutor(
			'Display articles on Bexhill\'s history; from dinosaurs, to Martello towers, to WWII incidents.',
			{ id: 1, targ: $('li a[href="#tour"]').parent(), dist: '40', dir: 'left', pos: 'fixed' }
		);
		showModalTutor(
			'Zoom in and ' + (noTouch ? 'click' : 'tap') + ' on the map to find information on almost any place.<br>This button will clear any map markers.',
			{ id: 2, targ: $('#btnClearmap'), dist: '30', dir: 'left', pos: 'absolute' }	
		);
		$('#modalT0 button').focus();
	}
	// easter holiday decorations
	if (new Date().getMonth() === 2 && new Date().getDate() >= 29 && new Date().getDate() <= 31) $('#home .sidebar-header-text').html($('#home .sidebar-header-text').html().replace('O', '&#x1F95A'));
	// halloween holiday decorations
	else if (new Date().getMonth() === 9) $('#home .sidebar-header-text').html($('#home .sidebar-header-text').html().replace('O', '&#x1F383;'));
	// xmas holiday decorations
	else if ((new Date().getMonth() === 10 && new Date().getDate() >= 25) || new Date().getMonth() === 11) {
		$('html').css({ '--main-color': '#b00000', '--second-color': '#993c3c' });
		// central
		L.imageOverlay('assets/img/holidays/xmasMapTree.svg', [[50.84090, 0.47320], [50.84055, 0.47370]], { className: 'xmasMapTree', opacity: 0.9 }).addTo(map);
		// little common
		L.imageOverlay('assets/img/holidays/xmasMapTree.svg', [[50.84545, 0.43400], [50.84510, 0.43350]], { className: 'xmasMapTree', opacity: 0.9 }).addTo(map);
		sidebar.append('<img id="holidayImg" alt="" src="assets/img/holidays/xmasSb.png">');
		$('#homeBox').after('<div id="xmasMsg" title="Show on map" onclick="tour(\'xmas\');">' +
			'<div id="xmasTitle">~ <span>Christmas Window Display Competition</span> ~</div>' +
			'<div class="comment">2022\'s theme is \'A Magical Christmas\', in association with Bexhill Festival of the Sea</div>' +
		'</div>');
	}
	// prevent click-through on map controls
	L.DomEvent.disableClickPropagation($('#inputOpacity')[0]).disableScrollPropagation($('#inputOpacity')[0]);
	L.DomEvent.disableClickPropagation($('#msgStatus')[0]).disableScrollPropagation($('#msgStatus')[0]);
	$('.leaflet-control, .leaflet-popup').on('contextmenu', function(e) { e.stopPropagation(); });
	$('.leaflet-control-geocoder-form').click(function(e) { e.stopPropagation(); });
	// refocus status message on mouseover
	$('#msgStatus').on('mouseover tap', function() { if ($(this).is(':animated')) $(this).stop(true).css('opacity', 1); });
	// add delay after load for sidebar to animate open
	setTimeout(function() {
		$('#minimap > map').imageMapResize();
		if ($(window).width() >= 768 && $(window).width() < 1024) map.invalidateSize();
	}, 500);
	// filter poi using keywords
	$('#poi-filter-in').on('input', function() {
		$('.poi-checkbox input').each(function() {
			if ($(this).data('keyword').indexOf($('#poi-filter-in').val().toLowerCase()) != -1 || $(this).parent('.poi-checkbox-selected').length) $(this).parent().parent().show();
			else $(this).parent().parent().hide();
		});
		$('.poi-group').each(function() {
			$(this).show();
			if (!$(this).find('.poi-checkbox:visible').length) $(this).hide();
		});
		$('#poi-filter').css('position', $('#poi-filter-in').val() ? 'sticky' : '');
		$('#poi-icons .comment').html(!$('.poi-group .poi-checkbox:visible').length ? 'No places found.' : 'Make up to ' + maxPOICheckbox + ' selections at a time.');
	});
	$('#poi-filter .leaflet-routing-remove-waypoint').on('click', function() { $('#poi-filter-in').val('').trigger('input'); });
	// set attic data max date
	$('#inputAttic').prop('max', new Date().toISOString().substring(0,10));
	// clear loading elements
	if (spinner > 0) spinner--;
	else $('.spinner').fadeOut(500);
}).on('contextmenu.show', function(e) {
	$('#copyGeos').html(L.Util.formatNum(e.latlng.lat, 3) + ', ' + L.Util.formatNum(e.latlng.lng, 3) + ' | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 3) + '<span class="ele"></span>');
	// https://www.opentopodata.org
	$.ajax({
		url: 'https://bexhill-osm.opentopodata.org/v1/eudem25m?locations=' + e.latlng.lat + ',' + e.latlng.lng,
		dataType: 'json',
		mimeType: 'application/json',
		success: function(json) {
			if (json.status === 'OK') $('#copyGeos .ele').html('<br>Elevation: ' + ($('#inputUnit').is(':checked') ? L.Util.formatNum(json.results[0].elevation, 2) + ' m' : L.Util.formatNum(json.results[0].elevation*3.280839895, 2) + ' ft'));
			else this.error();
		},
		error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OPENTOPODATA:', encodeURI(this.url)); }
	});
	// show walkHere if user located within map and accuracy is high
	if (lc._active && lc._event && map.options.maxBounds && map.options.maxBounds.contains(lc._event.latlng) && map.getZoom() >= 14 && lc._circle.getRadius() <= 100) $('.leaflet-contextmenu-item').eq(1).show();
	else $('.leaflet-contextmenu-item').eq(1).hide();
}).on('tooltipopen', function(e) {
	highlightOutline(e.tooltip._source._leaflet_id, 1);
}).on('tooltipclose', function(e) {
	if (!e.tooltip._source.isPopupOpen()) highlightOutline(e.tooltip._source._leaflet_id, 0);
}).on('popupopen', function(e) {
	const popupThis = $(e.popup.getElement());
	const osmId = e.popup._source._leaflet_id;
	// add/remove favourites
	if ($('a.popup-bookm').length) {
		if (!window.localStorage.favourites) window.localStorage.favourites = '';
		if (window.localStorage.favourites.indexOf(elementType(osmId) + '(' + osmId.slice(1) + ');') >= 0) popupThis.find($('a.popup-bookm i').removeClass('fa-regular').addClass('fa-solid'));
		$('a.popup-bookm').unbind('click').click(function() {
			if ($('a.popup-bookm i.fa-solid').length) {
				window.localStorage.favourites = window.localStorage.favourites.replace(elementType(osmId) + '(' + osmId.slice(1) + ');', '');
				popupThis.find($('a.popup-bookm i').removeClass('fa-solid').addClass('fa-regular'));
			}
			else {
				window.localStorage.favourites = window.localStorage.favourites + elementType(osmId) + '(' + osmId.slice(1) + ');';
				popupThis.find($('a.popup-bookm i').removeClass('fa-regular').addClass('fa-solid'));
			}
		});
	}
	// edit on osm.org
	$('.popup-edit').unbind('click').click(function() {
		popupWindow('popup', 'https://www.openstreetmap.org/edit?' + elementType(osmId) + '=' + osmId.slice(1) + '#map=19/' + e.popup._latlng.lat + '/' + e.popup._latlng.lng, 'editWindow');
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
	if (popupThis.find($('.popup-fhrs.notloaded')).length) $.ajax({
		url: 'https://api.ratings.food.gov.uk/establishments/' + encodeURI(popupThis.find($('.popup-fhrs')).data('fhrs')),
		headers: { 'x-api-version': 2 },
		dataType: 'json',
		cache: true,
		success: function(result) {
			const RatingDate = (result.RatingValue.length === 1) ? ' (' + new Date(result.RatingDate).toLocaleDateString(lang) + ')' : '';
			popupThis.find($('.popup-fhrs')).html(
				'<a href="https://ratings.food.gov.uk/business/en-GB/' + encodeURI(result.FHRSID) + '" title="Food Hygiene Rating\n' + result.BusinessName + RatingDate + '" target="_blank" rel="noopener">' +
				'<img alt="Hygiene: ' + result.RatingValue + '" src="assets/img/fhrs/' + result.RatingKey + '.png"></a>'
			).removeClass('notloaded');
			if ($('#inputDebug').is(':checked')) console.debug('Food Hygiene Rating:', result);
		},
		error: function() {
			popupThis.find($('.popup-fhrs')).empty();
			if ($('#inputDebug').is(':checked')) console.debug('ERROR FHRS:', encodeURI(this.url));
		}
	});
	// https://www.travelinedata.org.uk/traveline-open-data/nextbuses-api
	// show bus times
	if (popupThis.find($('.popup-bsTable')).length) $.ajax({
		type: 'POST',
		url: 'https://cors.bridged.cc/' + 'https://nextbus.mxdata.co.uk/nextbuses/1.0/1',
		headers: { 'Authorization': 'Basic ' + btoa(window.BOSM.trvllneApi.u + ':' + window.BOSM.trvllneApi.p), 'x-cors-grida-api-key': window.BOSM.corsKey },
		contentType: 'text/xml',
		dataType: 'xml',
		cache: false,
		data:
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Siri version="1.0" xmlns="http://www.siri.org.uk/">' +
			'<ServiceRequest>' +
				'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
				'<RequestorRef>' + window.BOSM.trvllneApi.u + '</RequestorRef>' +
				'<StopMonitoringRequest version="1.0">' +
					'<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>' +
					'<MessageIdentifier>12345</MessageIdentifier>' +
					'<MonitoringRef>' + popupThis.find($('.popup-bsTable')).data('naptan') + '</MonitoringRef>' +
				'</StopMonitoringRequest>' +
			'</ServiceRequest>' +
			'</Siri>',
		success: function(xml) {
			const numResults = $(xml).find('MonitoredVehicleJourney').length;
			if (numResults) {
				popupThis.find($('.popup-bsTable')).empty();
				for (let c = 0; c < numResults; c++) {
					const departTime = $(xml).find('ExpectedDepartureTime').eq(c).text() ? $(xml).find('ExpectedDepartureTime').eq(c).text() : $(xml).find('AimedDepartureTime').eq(c).text();
					const departTimer = minToTime((new Date(departTime) - new Date()) / 60000);
					popupThis.find($('.popup-bsTable')).append(
						'<tr><td>' + $(xml).find('PublishedLineName').eq(c).text() + '</td>' +
						'<td>' + $(xml).find('DirectionName').eq(c).text() + '</td>' +
						'<td>' + (departTimer === -1 ? 'Due' : (departTimer + ' (' + new Date(departTime).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + ')')) + '</td></tr>'
					);
				}
				popupThis.find($('.popup-bsTable')).after('<div class="popup-imgAttrib">Data: <a href="https://www.travelinedata.org.uk/" target="_blank" rel="noopener">Traveline NextBuses</div>');
				if (e.popup.options.autoPan) e.popup._adjustPan();
			}
			else popupThis.find($('.popup-bsTable')).html('<span class="comment">No buses due at this time.</span>');
			if ($('#inputDebug').is(':checked')) console.debug('Nextbus:', xml);
		},
		error: function() {
			popupThis.find($('.popup-bsTable').empty());
			if ($('#inputDebug').is(':checked')) console.debug('ERROR BUSES:', encodeURI(this.url));
		}
	});
	highlightOutline(osmId, 1);
	// highlight in results list and add openpopup to permalink
	if (poiList.length && !popupThis.find($('span#userLoc')).length && !$('#inputDebug').is(':checked')) {
		popupThis.find($('#poi-results-list tr#' + osmId).addClass('poi-result-selected'));
		if ($('.poi-result-selected').length) $('.poi-result-selected')[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
		markerId = osmId;
		permalinkSet();
	}
	if (popupThis.find($('.popup-imgContainer')).length) {
		// reduce height of long descriptions if image exists
		if (popupThis.find($('.popup-longDesc')).length) popupThis.find($('.popup-longDesc')).css('--popup-long-desc-height', '150px');
		setTimeout(function() {
			popupThis.find($('.popup-imgContainer').each(function(i, element) {
				// dynamically load images and attribution
				$(element).find('img').attr('src', $(element).find('a').attr('href') + ($(element).find('a').data('srcset') ? '&width=' + imgSize : ''));
				if (popupThis.find($(element).find('.notloaded')).length) getWikiAttrib(popupThis.find($(element)));
				// save popup content
				else if (!popupThis.find('.notloaded').length) map._layers[osmId].setPopupContent();
			}));
		}, 200);
		popupThis.find($('.popup-imgContainer img'))
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
				popupThis.find($('.popup-imgContainer').css('pointer-events', 'none'));
				popupThis.find($('.popup-imgAttrib')).empty();
			});
		popupThis.find($('.popup-imgContainer, .navigateItem'))
			.on('dragstart', false)
			.on('selectstart', false);
		popupThis.find($('#img0 img'))
			.on('load', function() {
				try {
					// stop placeholder images from being zoomed
					if (popupThis.find($('.popup-imgContainer img')).attr('src').indexOf('000placehldr') >= 0) popupThis.find($('.popup-imgContainer').css('pointer-events', 'none'));
					popupThis.find($('.popup-imgContainer img')).attr('alt', 'Image of ' + popupThis.find($('.popup-header h3')).text());
					// add padding on attribution for navigation buttons
					if (popupThis.find($('.navigateItem')).length) popupThis.find($('.popup-imgAttrib')).css('padding-right', 20*popupThis.find($('.navigateItem i:visible')).length + 'px');
					if (e.popup.options.autoPan && map.getBounds().contains(e.popup._latlng)) e.popup._adjustPan();
				}
				catch(err) {
					if ($('#inputDebug').is(':checked')) console.debug(err + '- Popup was probably closed.');
				}
			});
	}
	// add padding for navigation icons without image
	else if (popupThis.find($('.navigateItem')).length && !popupThis.find($('.popup-imgContainer')).length) popupThis.find($('.popup-body')).css('padding-bottom', '12px');
	// set that user has already seen bouncing navigation icons
	if (noIframe && localStorageAvail() && window.localStorage.tutorial.indexOf('bouncedicon') === -1 && popupThis.find($('.pano .fa-bounce, .vid .fa-bounce')).length) window.localStorage.tutorial += 'bouncedicon;';
	// photosphere and video attribution
	$('.pano.notloaded, .vid.notloaded').each(function(i, element) {
		$(element).data('caption', '<a href="https://commons.wikimedia.org/wiki/' + encodeURI($(element).data('caption')) + '" title="Wikimedia Commons" target="_blank" rel="noopener">Wikimedia Commons</a>').removeClass('notloaded');
	});
}).on('popupclose', function(e) {
	if (e.popup._source._tooltip && !e.popup._source.isTooltipOpen()) highlightOutline(markerId, 0);
	// unselect from poi list
	if (poiList.length) {
		$('#poi-results-list tr').removeClass('poi-result-selected');
		if (!rQuery) markerId = undefined;
		permalinkSet();
	}
}).on('baselayerchange', function(e) {
	// get layer name on change
	for (let c in baseTileList.name) if (e.name === baseTileList.name[c]) actBaseTileLayer = baseTileList.keyname[c];
	if (tileBaseLayer[actBaseTileLayer].offset) map.fire('zoomend');
	if (noIframe && localStorageAvail()) window.localStorage.baseLayer = actBaseTileLayer;
	permalinkSet();
}).on('overlayadd', function(e) {
	loadingControl._showIndicator();
	// remove previous overlay
	setTimeout(function() {
		if ($('.leaflet-control-layers-overlays input:checked').length > 1) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		// get layer name on change
		for (let c in overlayTileList.name) if (e.name === overlayTileList.name[c]) actOverlayLayer = overlayTileList.keyname[c];
		if (darkMode && actOverlayLayer === 'xmas') {
			tileOverlayLayer.xmas.opacity = 0.1;
			tileOverlayLayers[tileOverlayLayer.xmas.name].setOpacity(tileOverlayLayer.xmas.opacity);
		}
		// set overlay opacity controls
		$('#inputOpacity').show(100);
		$('#inputOpacity input')
			.val(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity)
			.on('input', function() { tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(this.value); })
			.on('change', permalinkSet)
			.on('mouseover', function() { this.focus(); })
			.attr('title', tileOverlayLayer[actOverlayLayer].name + ' opacity');
		setOverlayLabel();
		permalinkSet();
		if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].offset) {
			if (tileOverlayLayer[actOverlayLayer].wmsOverlay) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).on('load', function() {
				setTimeout(function() { changeOffset('overlay', tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]._currentOverlay._image); });
			});
			else map.fire('zoomend');
		}
	}, 10);
}).on('overlayremove', function() {
	if (tileOverlayLayer[actOverlayLayer].hide) setPageTitle();
	if (tileOverlayLayer[actOverlayLayer].offset && tileOverlayLayer[actOverlayLayer].wmsOverlay) $(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]).off('load');
	if (!$('.leaflet-control-layers-overlays input:checked').length) {
		actOverlayLayer = undefined;
		$('#inputOpacity').fadeOut(100);
	}
	setOverlayLabel();
	permalinkSet();
}).on('zoomend', function() {
	if (tileBaseLayer[actBaseTileLayer].offset) changeOffset('base', tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].getContainer());
	if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].offset && !tileOverlayLayer[actOverlayLayer].wmsOverlay) changeOffset('overlay', tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].getContainer());
});

function highlightOutline(i, on) {
	// outline highlighting
	if (areaOutline.getLayer('o_' + i)) areaOutline.getLayer('o_' + i).setStyle({ opacity: on ? 0.7 : 0.3 });
	if (Object.keys(imageOverlay._layers).length) {
		const layer = imageOverlay.getLayer(i) || imageOverlay._layers[Object.keys(imageOverlay._layers)[0]].getLayer(i) || '';
		if (layer && layer.options.fill) layer.setStyle({ fillOpacity: on ? 0.75 : 0.5, weight: on ? 3 : 2 });
	}
}
function setOverlayLabel() {
	// adds a title and hides some layers in control
	if (!$('.controlTitle').length) {
		$('.leaflet-control-layers-overlays label').first().before('<div class="controlTitle">Overlays</div>');
		$('.leaflet-control-layers-overlays label:contains("Bing")').first().before('<div class="controlTitle">Air photography</div>');
		$('.leaflet-control-layers-overlays label:contains("Ordnance")').first().before('<div class="controlTitle">Historical maps</div>');
		$('.leaflet-control-layers-overlays label').last().after('<a class="controlTitle" onclick="switchTab(\'tour\', \'overlays\');">More...</a>');
	}
	for (let tileBase in tileBaseLayer) if (tileBaseLayer[tileBase].hide) $('.leaflet-control-layers-base label:contains("' + tileBaseLayer[tileBase].name + '")').addClass('hideLayer');
	for (let tileOverlay in tileOverlayLayer) if (tileOverlayLayer[tileOverlay].hide) $('.leaflet-control-layers-overlays label:contains("' + tileOverlayLayer[tileOverlay].name + '")').addClass('hideLayer');
	if (!$('.leaflet-control-layers-list.custscroll').length) $('.leaflet-control-layers-list').addClass('custscroll');
	if (!$('.leaflet-control-layers-toggle span').length) $('.leaflet-control-layers-toggle').html('<span style="margin:5px;" class="fa fa-solid fa-layer-group fa-2x"></span>');
}
function changeOffset(layer, container) {
	// offset layer, metres to pixels
	const metresPerPixel = 40075017 * Math.cos(map.getCenter().lat * (Math.PI/180)) / Math.pow(2, map.getZoom()+8);
	layer = (layer === 'base') ? tileBaseLayer[actBaseTileLayer] : tileOverlayLayer[actOverlayLayer];
	$(container).css({
		'left': Math.floor(layer.offset[0] / metresPerPixel) + 'px',
		'top': Math.floor(layer.offset[1] / metresPerPixel) + 'px'
	});
}

// https://github.com/davidjbradshaw/image-map-resizer
$('#minimap > map > area').click(function() {
	// bounding coordinates for minimap
	const mBounds = {
		'Bexhill-on-Sea': LBounds,
		'Barnhorn': [[50.8507, 0.4301], [50.8415, 0.4066]],
		'Central': [[50.8425, 0.4801], [50.8351, 0.4649]],
		'Collington': [[50.8472, 0.4604], [50.8352, 0.4406]],
		'Cooden': [[50.8417, 0.4416], [50.8305, 0.4195]],
		'Glenleigh Park': [[50.8573, 0.4641], [50.8476, 0.4454]],
		'Glyne Gap': [[50.8485, 0.5102], [50.8423, 0.4954]],
		'The Highlands': [[50.8637, 0.4615], [50.8566, 0.4462]],
		'Little Common': [[50.8501, 0.4424], [50.8399, 0.4244]],
		'Normans Bay': [[50.8302, 0.4020], [50.8216, 0.3814]],
		'Old Town': [[50.8484, 0.4841], [50.8419, 0.4706]],
		'Pebsham': [[50.8589, 0.5140], [50.8472, 0.4882]],
		'Sidley': [[50.8607, 0.4833], [50.8509, 0.4610]],
	}[$(this).attr('title')];
	if (mBounds) {
		map.flyToBounds(L.latLngBounds(mBounds));
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
	}
});

let rQuery = false;
function reverseQuery(e, singlemapclick) {
	const geoServer = $('#inputRevServer').val();
	let geocoder, geoMarker;
	if (singlemapclick) setMsgStatus('fa-solid fa-spinner fa-spin-pulse', '', '');
	else $('.spinner').show();
	if (geoServer === 'nominatim') geocoder = L.Control.Geocoder.nominatim({ reverseQueryParams: { format: 'jsonv2', namedetails: 1, email: email } });
	else if (geoServer === 'opencage') geocoder = L.Control.Geocoder.opencage({ apiKey: window.BOSM.ocKey, reverseQueryParams: { limit: 1, roadinfo: (map.getZoom() < 17 ? 1 : 0) } });
	else if (geoServer === 'photon') geocoder = L.Control.Geocoder.photon({ reverseQueryParams: { distance_sort: true, radius: 0.05 } });
	else if (geoServer === 'openrouteservice') geocoder = L.Control.Geocoder.openrouteservice({ apiKey: window.BOSM.orsKey, reverseQueryParams: { 'boundary.circle.radius': 0.05, size: 1, sources: 'osm' } });
	geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom() > 16 ? 18 : 17), function(results) {
		if (geoServer === 'opencage') geoMarker = results[0];
		else geoMarker = results[0] ? results[0].properties : '';
		if ($('#inputDebug').is(':checked') && results[0]) console.debug(titleCase(geoServer) + 'reverse search:', results[0]);
		if (geoMarker.osm_id || (geoMarker.source_id && geoMarker.source_id.indexOf('/')) > 0) {
			if (singlemapclick && $('#msgStatus:visible').length) {
				let msgStatusHead, msgStatusBody;
				if (geoServer === 'nominatim') {
					const geoName = geoMarker.namedetails.ref || geoMarker.namedetails.name || geoMarker.namedetails['addr:housename'] || '';
					const geoRoad = geoMarker.address.road || geoMarker.address.footway || geoMarker.address.pedestrian || geoMarker.address.path || geoMarker.address.locality || '';
					msgStatusHead = titleCase(geoMarker.type === 'yes' || geoMarker.type === geoMarker.addresstype ? geoMarker.category : geoMarker.type + (geoMarker.addresstype === 'road' ? ' road' : ''));
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoName ? '<b>' + geoName + '</b><br>' : '') +
						(geoMarker.address.house_number ? geoMarker.address.house_number + ' ' : '') + (geoRoad ? geoRoad + (geoMarker.address.postcode ? ', ' + geoMarker.address.postcode + '<br>' : '') : '') +
						(geoMarker.address.retail ? geoMarker.address.retail : '') + '</a>';
				}
				else if (geoServer === 'opencage') {
					msgStatusHead = titleCase(geoMarker.type);
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');"><b>' + geoMarker.name.replace(',', '</b><br>').replace(', United Kingdom', '') + '</a>';
				}
				else if (geoServer === 'photon') {
					msgStatusHead = geoMarker.osm_value !== 'yes' ? titleCase(geoMarker.osm_value + ' ' + geoMarker.osm_key) : '';
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.osm_type + '\', \'' + geoMarker.osm_id + '\');">' + (geoMarker.name ? '<b>' + geoMarker.name + '</b><br>' : '') +
						(geoMarker.housenumber ? geoMarker.housenumber + ' ' : '') + (geoMarker.street + (geoMarker.postcode ? ', ' + geoMarker.postcode : '') ? geoMarker.street : '') + '</a>';
				}
				else if (geoServer === 'openrouteservice') {
					msgStatusHead = titleCase(geoMarker.layer);
					msgStatusBody = '<a class="msgStatusBodyAddr" onclick="reverseQueryOP(\'' + geoMarker.source_id.charAt(0) + '\', \'' + geoMarker.source_id.split('/')[1] + '\');">' + '<b>' + geoMarker.name + '</b><br>' +
						(geoMarker.postalcode ? geoMarker.postalcode : '') + '</a>';
				}
				if ($('#inputAttic').val()) msgStatusBody += '<br><span class="comment">Above result may differ to actual attic data.</span>';
				if (actOverlayLayer === 'landreg') msgStatusBody += '<hr><a onclick="popupWindow(\'popup\', \'https://search-property-information.service.gov.uk/search/map-search/find-by-map\', \'editWindow\');"><i>Land Registry Lookup</i> <i class="theme fa-solid fa-up-right-from-square fa-sm"></i></a>';
				setMsgStatus('fa-solid fa-magnifying-glass-location', msgStatusHead, msgStatusBody);
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
			setMsgStatus('fa-solid fa-circle-info', 'No places found', 'Please try another area.', 4);
			clickOutline.clearLayers();
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
	const wp = routingControl.getWaypoints();
	for (let c in wp) if (!wp[c].name) {
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
function improveMap(e, id) {
	// create a note on osm.org
	if (id === undefined) id = 'new';
	popupWindow('popup', 'https://www.openstreetmap.org/note/' + id + '#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng + '&layers=N', 'noteWindow');
}
function fixMyStreet(e) {
	popupWindow('popup', 'https://osm.fixmystreet.com/around?zoom=4&latitude=' + e.latlng.lat + '&longitude=' + e.latlng.lng, 'fmsWindow');
}
function panoView(e, fromSequence) {
	// tries to find photospheres from Mapillary, if none use Google
	$('.spinner').show();
	$.ajax({
		url: 'https://graph.mapillary.com/images?access_token=' + window.BOSM.mpllryKey + '&fields=id,camera_type&bbox=' + (e.latlng.lng-0.00015) + ',' + (e.latlng.lat-0.0001) + ',' + (e.latlng.lng+0.00015) + ',' + (e.latlng.lat+0.0001),
		dataType: 'json',
		mimeType: 'application/json',
		cache: true,
		success: function(json) {
			let imgId;
			if (json.data.length > 0) json.data.forEach(x => { if (x.camera_type === 'equirectangular') imgId = x.id; });
			if (imgId && ($('#inputStView').is(':checked') || fromSequence)) {
				$('.spinner').hide();
				popupWindow('iframe', 'https://www.mapillary.com/embed?image_key=' + imgId + '&x=0.5&y=0.5&style=photo', '', 'Mapillary Street-Level');
			}
			else this.error();
		},
		error: function() {
			if ($('#inputDebug').is(':checked') && $('#inputStView').is(':checked')) console.debug('ERROR MAPILLARY IMAGES:', encodeURI(this.url));
			if (!fromSequence) {
				$('.spinner').hide();
				popupWindow('iframe', 'https://www.google.com/maps/embed/v1/streetview?location=' + e.latlng.lat + ',' + e.latlng.lng + '&fov=90&key=' + window.BOSM.googleKey, '', 'Google Street View');
			}
		}
	});
}
function copyGeos(e) {
	const geos = L.Util.formatNum(e.latlng.lat, 5) + '°N ' + L.Util.formatNum(e.latlng.lng, 5) + '°E | ' + wgs84ToGridRef(e.latlng.lat, e.latlng.lng, 6);
	navigator.clipboard.writeText(geos).then(
		function() { setMsgStatus('fa-solid fa-copy', 'Clipboard', 'Coordinates copied successfully.<p class="comment">' + geos + '</p>', 4); },
		function() { setMsgStatus('fa-solid fa-copy', 'Clipboard Error', 'Could not copy coordinates. Manually copy below <p class="comment">' + geos + '</p>'); }
	);
}

$('#walkList').change(function() {
	$('#walkDesc').html('<figure><img alt="Walk preview" src="assets/img/walks/' + $(this).val() + '.jpg"><figcaption>' + suggestWalk($('#walkList').val(), 0) + '</figcaption></figure>');
});
$('#walkSelect').click(function() {
	clear_map('walk');
	routingControl.zoomBounds = true;
	routingControl.setWaypoints(suggestWalk($('#walkList').val(), 1));
	if ($(window).width() < 768) $('.sidebar-close:visible').click();
});
function suggestWalk(walkId, isWP) {
	return {
		ww2h: [
			'The route of this walk is marked out by a series of 10 plaques along the promenade. ' +
			'Launched in 2011, it hopes to encourage people to regularly walk a specific distance along the promenade. ' +
			'Small plinths are placed at ground level opposite every third beach groyne between numbers 48 and 72.',
			[[50.83567, 0.45892], [50.83701, 0.47363]]
		],
		tmrt: [
			'In May 1902 Bexhill-on-Sea became "The Birthplace of British Motor Racing". ' +
			'Follow five seafront Motoring Heritage panels and two galleries dedicated to the story of those intrepid ' +
			'early motoring pioneers (the 5th panel is situated outside ' +
			'<a class="theme" onclick="map.flyTo([50.833, 0.427], 18);">Cooden Beach Hotel <i class="theme fa-solid fa-magnifying-glass fa-sm"></i></a>).',
			[[50.84059, 0.49121], [50.83729, 0.47612], [50.83647, 0.46637], [50.83732, 0.46639]]
		],
		neye: [
			'Pevensey Levels was a tidal inlet until the eastward drift of coastal shingle isolated it and a salt marsh developed. ' +
			'The walk starts and ends at The Star Inn pub, heading north-west towards the archaeological site of Northeye, a village abandoned to flooding in the Middle Ages. ' +
			'Before making your way back round, you will see evidence of a wooden sea defence from the 14th century called Crooked Ditch.<br>' +
			'Although sometimes rough and wet in places, there are great open views of countryside and plenty of grazing sheep to keep you company.',
			[[50.83026, 0.39324], [50.83832, 0.38729], [50.83618, 0.40594], [50.83007, 0.39370]]
		],
		hwds: [
			'Starting at the Wheatsheaf Inn, this walk takes you on a public right-of-way through wood, farmland and down country lanes. ' +
			'Pass through Whydown and see the extraordinary early 20th century Gotham Wood House, before arriving at the south-west corner of ancient Highwoods.',
			[[50.84536, 0.43353], [50.84958, 0.42689], [50.85671, 0.42740], [50.86120, 0.42984]]
		],
		gnwy: [
			'The Greenway runs alongside the Combe Valley Way, providing access for walkers, cyclists and horse riders between Bexhill and Hastings. ' +
			'It links up with public bridleways and footpaths in the area, including the 1066 Country Walk Bexhill Link, with two sections where horse ' +
			'riders take an alternative route to walkers and cyclists.',
			[[50.85676, 0.47898], [50.87003, 0.52085]]
		],
		ad1066: [
			'The route commemorates the 1066 Battle of Hastings, linking the places and the people of that important time. ' +
			'This is a section of the Bexhill - Battle link, the full route can be found on ' +
			'<a href="https://hiking.waymarkedtrails.org/#route?id=3161493&map=13!50.8789!0.4901" target="_blank" rel="noopener">waymarkedtrails.org <i class="theme fa-solid fa-up-right-from-square fa-sm"></i></a>.',
			[[50.84522, 0.48044], [50.85591, 0.49312], [50.87800, 0.50009]]
		],
		bcr1: [
			'This is an edge of town walk of about 6 miles. It includes riverside fields and farmland, hedgerow remains of ancient woodland, ' +
			'reedbeds, vegetated shingle and a wonderful mile of rock pools at low tide. There are no hills or particularly muddy areas. Refreshments and toilets are ' +
			'available at the start point - Bexhill railway station - and towards the end of the walk.',
			[[50.84125, 0.47717], [50.84484, 0.47876], [50.84523, 0.48052], [50.85590, 0.49312], [50.86230, 0.51823],
			[50.84808, 0.52014], [50.83780, 0.47660], [50.84093, 0.47718]]
		]
	}[walkId][isWP];
}

// navigation controls for history tour
$('#tourNext').click(function() { $('#tourList option:selected').nextAll(':enabled').eq(0).prop('selected', true).trigger('change'); });
$('#tourPrev').click(function() { $('#tourList option:selected').prevAll(':enabled').eq(0).prop('selected', true).trigger('change'); });
$('#tourList').change(function() {
	const tourVal = $(this).val();
	// only load iframe on focus or a new item selected
	if (actTab === 'tour' && $('#tourFrame')[0].contentWindow.location.href.indexOf('/list' + titleCase(tourVal)) === -1) {
		$('#tourControls').children().prop('disabled', true);
		$('#tourFrame').hide();
		$('#tourLoading').show();
		$('#tourFrame')[0].contentWindow.location.replace(window.location.origin + '/' + 'tour/list' + titleCase(tourVal) + '/index.html');
		$('#tourFrame').one('load', function() {
			$('#tourLoading').hide();
			$(this).fadeIn();
			$(this).contents().find('sup').click(function() { tourRef(tourVal, this.innerText); });
			$(this).contents().find('sup').attr('title', 'View reference');
			// create fancybox gallery from iframe images
			const tourImg = $(this).contents().find('img').not('.maplink img'), tourGall = [];
			tourImg.each(function() { tourGall.push({ 'src': this.src, 'caption': $(this).parent('figure').find('figCaption').html() || this.alt }); });
			tourImg.off('click').click(function() { $.fancybox.open(tourGall, {}, tourImg.index(this)); });
			$('#tourControls').children().prop('disabled', false);
			if ($('#tourList').prop('selectedIndex') === 0) $('#tourPrev').prop('disabled', true);
			else if ($('#tourList').prop('selectedIndex') === $('#tourList option').length-1) $('#tourNext').prop('disabled', true);
		});
		permalinkSet();
	}
	else $('#inputTheme').trigger('change');
});

// https://github.com/Leaflet/Leaflet
const iconLayer = new L.featureGroup(), clickOutline = new L.featureGroup(), areaOutline = new L.featureGroup(), imageOverlay = new L.featureGroup();
let tileBaseLayer = {}, tileBaseLayers = {}, baseTileList = {name: [], keyname: []};
let tileOverlayLayer = {}, tileOverlayLayers = {}, overlayTileList = {name: [], keyname: []};
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
			const quadKey = [];
			for (let i = z; i > 0; i--) {
				let digit = '0';
				let mask = 1 << (i - 1);
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
	const attribution = '&copy; <a href="https://openstreetmap.org/copyright" title="Copyright and License" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
	tileBaseLayer = {
		osmstd: {
			name: 'OpenStreetMap',
			url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
			maxNativeZoom: 19,
			className: 'layerDark'
		},
		bosm: {
			name: 'OSM Bexhill',
			url: 'https://api.mapbox.com/styles/v1/drmx/cjyfrglvo1v3c1cqqlcvzyd07/tiles/256/{z}/{x}/{y}@2x?access_token=' + window.BOSM.mapboxKey,
			attribution: attribution + ', <a href="https://mapbox.com/" target="_blank" rel="noopener">MapBox</a>',
			className: 'layerDark'
		},
		osmuk: {
			name: 'OSM UK',
			url: 'https://map.atownsend.org.uk/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://map.atownsend.org.uk/maps/map/map.html" target="_blank" rel="noopener">Andy Townsend</a>',
			className: 'layerDark'
		},
		general: {
			name: 'OSM Humanitarian',
			url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
			attribution: attribution + ', <a href="https://www.hotosm.org/" target="_blank" rel="noopener">HOTOSM</a>',
			maxNativeZoom: 20,
			className: 'layerDark'
		},
		cycle: {
			name: 'OSM OpenCycleMap',
			url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + window.BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/opencyclemap/" target="_blank" rel="noopener">ThunderForest</a>',
			className: 'layerDark'
		},
		trnsprt: {
			name: 'OSM Public Transport',
			url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + window.BOSM.thuforKey,
			attribution: attribution + ', <a href="https://thunderforest.com/maps/transport/" target="_blank" rel="noopener">ThunderForest</a>',
			className: 'layerDark'
		},
		bing: {
			name: 'Bing Aerial',
			url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
			attribution: '<a href="https://maps.bing.com/" target="_blank" rel="noopener">Microsoft Bing</a>',
			subdomains: '0123',
			maxNativeZoom: 19,
			quadkey: true,
			errorTileUrl: 'https://ecn.t0.tiles.virtualearth.net/tiles/a1202020223330?g=737&n=z',
			offset: [-1, 1]
		}
	};
	for (let tile in tileBaseLayer) {
		const tbl = tileBaseLayer[tile], bOptions = {
			attribution: tbl.attribution || attribution,
			subdomains: tbl.subdomains || 'abc',
			maxZoom: map.getMaxZoom(),
			maxNativeZoom: tbl.maxNativeZoom,
			errorTileUrl: tbl.errorTileUrl,
			className: tbl.className || ''
		};
		if (tbl.quadkey) tileBaseLayers[tbl.name] = new L.TileLayer.QuadKeyTileLayer(tbl.url, bOptions);
		else tileBaseLayers[tbl.name] = L.tileLayer(tbl.url, bOptions);
		// create object array for all basemap layers
		baseTileList.name.push(tbl.name);
		baseTileList.keyname.push(tile);
	}
	// overlays, set an offset by using metres (offset: [left, top])
	tileOverlayLayer = {
		landreg: {
			name: 'Land Registry',
			url: 'https://tiles.osmuk.org/PropertyBoundaries/{z}/{x}/{y}.png',
			attribution: '<a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty/view/LrInspireIdInit.do" target="_blank" rel="noopener">HM Land Registry</a>',
			opacity: 1,
			minNativeZoom: 18,
			maxNativeZoom: 20,
			minZoom: 16,
			offset: [-1, 1]
		},
		lidar: {
			name: 'Lidar DTM 1m',
			url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m-2022/wms',
			wms: {
				layers: '1',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://www.gov.uk/government/organisations/environment-agency/" target="_blank" rel="noopener">Environment Agency</a>',
			opacity: 0.8
		},
		tpo: {
			name: 'Tree Preservation Orders',
			url: 'https://maps.rother.gov.uk/geoserver/re/wms',
			wms: {
				layers: 're:Tree_Preservation_Orders',
				format: 'image/png',
				transparent: true
			},
			attribution: '<a href="https://maps.rother.gov.uk/tpo.html" target="_blank" rel="noopener">Rother District Council</a>',
			opacity: 1
		},
		osm2012: {
			name: '2012 OpenStreetMap',
			url: 'https://map.fosm.org/default/{z}/{x}/{y}.png',
			opacity: 1,
			hide: 1,
			className: 'layerNoclick layerDark'
		},
		xmas: {
			name: 'Xmas Snow',
			url: 'tour/itemXmas/overlay-snow.gif',
			opacity: 0.5,
			hide: 1,
			className: 'layerNoclick'
		},
		// air photography
		bing: {
			name: 'Bing Aerial',
			url: 'https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
			attribution: '<a href="https://maps.bing.com/" target="_blank" rel="noopener">Microsoft Bing</a>',
			subdomains: '0123',
			opacity: 0.5,
			maxNativeZoom: 19,
			quadkey: true,
			offset: [-1, 1]
		},
		bm1975: {
			name: '1975 Aerial (coast)',
			url: 'https://tiles.bexhillheritage.com/bm1975/{z}/{x}/{y}.png',
			attribution: 'Meridian Airmaps Ltd, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layerNoclick'
		},
		bm1967: {
			name: '1967 Aerial',
			url: 'https://tiles.bexhillheritage.com/bm1967/{z}/{x}/{y}.png',
			attribution: 'BKS Surveys, <a href="https://bexhillmuseum.org.uk/" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layerNoclick'
		},
		br1959: {
			name: '1959 Aerial (railway)',
			url: 'https://tiles.bexhillheritage.com/br1959/{z}/{x}/{y}.png',
			attribution: 'British Rail, <a href="https://car57.zenfolio.com/" target="_blank" rel="noopener">Michael Pannell</a>',
			bounds: L.latLngBounds([50.83722, 0.45732], [50.8907, 0.5134]),
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layerNoclick'
		},
		os1950: {
			name: '1950 Aerial',
			url: 'https://tiles.bexhillheritage.com/os1950/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layerNoclick'
		},
		raf1946t: {
			name: '1946 RAF (town)',
			url: 'https://tiles.bexhillheritage.com/raf1946t/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			bounds: L.latLngBounds([50.853, 0.473], [50.835, 0.499]),
			opacity: 1,
			minNativeZoom: 14,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		raf1946p: {
			name: '1946 RAF (p.levels)',
			url: 'https://tiles.bexhillheritage.com/raf1946p/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			bounds: L.latLngBounds([50.857, 0.379], [50.828, 0.428]),
			opacity: 1,
			minNativeZoom: 14,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		raf1941c: {
			name: '1941 RAF (central)',
			url: 'https://tiles.bexhillheritage.com/raf1941c/{z}/{x}/{y}.png',
			attribution: 'RAF CPEUK',
			bounds: L.latLngBounds([50.841, 0.474], [50.836, 0.480]),
			opacity: 1,
			minNativeZoom: 15,
			maxNativeZoom: 19,
			hide: 1,
			className: 'layerNoclick'
		},
		// historical maps
		os1962: {
			name: '1962 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/os/britain10knatgrid/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 16,
			offset: [5, 3],
			className: 'layerNoclick'
		},
		os1955: {
			name: '1955 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/london_1940s/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 19,
			offset: [1, 1],
			className: 'layerNoclick'
		},
		wl1950: {
			name: '1950 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1950/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.852, 0.445], [50.832, 0.494]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		ob1944: {
			name: '1944 Observer Bomb Map',
			url: 'https://tiles.bexhillheritage.com/ob1944/{z}/{x}/{y}.png',
			bounds: L.latLngBounds([50.826, 0.411], [50.878, 0.508]),
			opacity: 1,
			maxNativeZoom: 16,
			hide: 1,
			className: 'layerNoclick'
		},
		arp1942: {
			name: '1942 Air Raid Precautions',
			url: 'https://tiles.bexhillheritage.com/arp1942/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.8292, 0.4157], [50.8713, 0.5098]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		wl1940: {
			name: '1940 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1940/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.851, 0.454], [50.832, 0.492]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		os1938: {
			name: '1938 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1938/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: L.latLngBounds([50.874, 0.380], [50.833, 0.518]),
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layerNoclick'
		},
		os1930: {
			name: '1930 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1930/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [-2, -2],
			className: 'layerNoclick'
		},
		mc1925: {
			name: '1925 Maynards Chronicle',
			url: 'https://tiles.bexhillheritage.com/mc1925/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.869, 0.417], [50.827, 0.509]),
			opacity: 1,
			maxNativeZoom: 17,
			hide: 1,
			className: 'layerNoclick'
		},
		wl1911: {
			name: '1911 Ward Lock',
			url: 'https://tiles.bexhillheritage.com/wl1911/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.848, 0.459], [50.834, 0.488]),
			opacity: 1,
			maxNativeZoom: 18,
			hide: 1,
			className: 'layerNoclick'
		},
		os1909: {
			name: '1909 Ordnance Survey',
			url: 'https://mapseries-tilesets.s3.amazonaws.com/25_inch/holes_england/{z}/{x}/{y}.png',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 18,
			offset: [2, 2],
			className: 'layerNoclick'
		},
		mt1902: {
			name: '1902 Motor Track',
			url: 'https://tiles.bexhillheritage.com/mt1902/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.bexhillmuseum.org.uk" target="_blank" rel="noopener">Bexhill Museum</a>',
			bounds: L.latLngBounds([50.83575, 0.50081], [50.84238, 0.47520]),
			opacity: 1,
			minNativeZoom: 12,
			maxNativeZoom: 19,
			hide: 1,
			className: 'layerNoclick'
		},
		os1899: {
			name: '1899 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1899/{z}/{x}/{y}.jpg',
			attribution: '<a href="https://maps.nls.uk/projects/api/" target="_blank" rel="noopener">NLS Maps API</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 17,
			offset: [7, 2],
			className: 'layerNoclick'
		},
		os1873: {
			name: '1873 Ordnance Survey',
			url: 'https://tiles.bexhillheritage.com/os1873/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.ordnancesurvey.co.uk/" target="_blank" rel="noopener">Crown Copyright Ordnance Survey</a>',
			bounds: LBounds,
			opacity: 1,
			maxNativeZoom: 16,
			offset: [5, -7],
			className: 'layerNoclick'
		},
		bt1839: {
			name: '1839 Bexhill Tithe',
			url: 'https://tiles.bexhillheritage.com/bt1839/{z}/{x}/{y}.png',
			attribution: '<a href="https://apps.eastsussex.gov.uk/leisureandtourism/localandfamilyhistory/tithemaps/MapDetail.aspx?ID=112769" target="_blank" rel="noopener">ESRO TDE 141</a>',
			bounds: L.latLngBounds([50.815, 0.351], [50.890, 0.536]),
			opacity: 1,
			maxNativeZoom: 18,
			className: 'layerNoclick'
		},
		mb1805: {
			name: '1805 Manor of Bexhill',
			url: 'https://tiles.bexhillheritage.com/mb1805/{z}/{x}/{y}.png',
			attribution: '<a href="https://www.thekeep.info/collections/getrecord/GB179_AMS5819" target="_blank" rel="noopener">ESRO AMS 5819</a>',
			bounds: L.latLngBounds([50.805, 0.376], [50.883, 0.511]),
			opacity: 1,
			maxNativeZoom: 17,
			className: 'layerNoclick'
		},
		yg1778: {
			name: '1778 Yeakell & Gardner',
			url: 'https://tiles.bexhillheritage.com/yg1778/{z}/{x}/{y}.png',
			attribution: '<a href="http://www.envf.port.ac.uk/geo/research/historical/webmap/sussexmap/" target="_blank" rel="noopener">University of Portsmouth</a>',
			bounds: L.latLngBounds([50.810, 0.320], [50.890, 0.631]),
			opacity: 1,
			maxNativeZoom: 16,
			className: 'layerNoclick'
		}
	};
	for (let tile in tileOverlayLayer) {
		const tol = tileOverlayLayer[tile], oOptions = {
			attribution: tol.attribution,
			subdomains: tol.subdomains || 'abc',
			bounds: tol.bounds,
			opacity: tol.opacity,
			maxZoom: map.getMaxZoom(),
			minZoom: tol.minZoom || map.getMinZoom(),
			maxNativeZoom: tol.maxNativeZoom,
			minNativeZoom: tol.minNativeZoom,
			className: tol.className || ''
		};
		if (tol.quadkey) tileOverlayLayers[tol.name] = new L.TileLayer.QuadKeyTileLayer(tol.url, oOptions);
		else if (tol.wms) tileOverlayLayers[tol.name] = L.tileLayer.wms(tol.url, $.extend(tol.wms, oOptions));
		else if (tol.wmsOverlay) tileOverlayLayers[tol.name] = L.WMS.overlay(tol.url, $.extend(tol.wmsOverlay, oOptions));
		else tileOverlayLayers[tol.name] = L.tileLayer(tol.url, oOptions);
		// create object array for all overlay layers
		overlayTileList.name.push(tol.name);
		overlayTileList.keyname.push(tile);
	}
	L.control.layers(tileBaseLayers, tileOverlayLayers).addTo(map);
}
setLeaflet();

// BUTTON zoom icon style
$('.leaflet-control-zoom-in').html('<i class="fa-solid fa-plus"></i>');
$('.leaflet-control-zoom-out').html('<i class="fa-solid fa-minus"></i>');

// BUTTON full screen events
const fcnFullscr = L.easyButton({
	id: 'btnFullscr',
	states: [{
		stateName: 'normalScreen',
		icon: 'fa-solid fa-expand',
		title: 'Full screen',
		onClick: function(control) {
			const viewer = $('html')[0];
			const rFS = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
			rFS.call(viewer);
			control.state('fullScreen');
		}
	}, {
		stateName: 'fullScreen',
		icon: 'fa-solid fa-compress',
		title: 'Exit full screen',
		onClick: function(control) {
			const cFS = document.exitFullscreen || document.webkitExitFullscreen;
			cFS.call(document);
			control.state('normalScreen');
		}
	}]
}).addTo(map);
$(document).on('fullscreenchange', btnFullscrState).on('webkitfullscreenchange', btnFullscrState);
function btnFullscrState() {
	const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
	if (!fullscreenElement) fcnFullscr.state('normalScreen');
}

// https://github.com/domoritz/leaflet-locatecontrol
// BUTTON locate control
const lc = L.control.locate({
	icon: 'fa-solid fa-location-arrow',
	iconLoading: 'fas fa-compass fa-spin',
	iconElementTag: 'i',
	setView: true,
	flyTo: true,
	keepCurrentZoomLevel: true,
	metric: false,
	showPopup: true,
	circleStyle: { interactive: false },
	markerStyle: { radius: 8 },
	strings: {
		title: 'Show your location',
		popup: '<span id="userLoc">Accuracy: {distance} {unit}</span>'
	},
	locateOptions: {
		enableHighAccuracy: false
	},
	onLocationError: function() {
		setMsgStatus('fa-solid fa-triangle-exclamation', 'Location Error', 'Sorry, we could not locate you.', 4);
	},
	onLocationOutsideMapBounds: function() {
		setMsgStatus('fa-solid fa-circle-info', 'Out of Bounds', 'You appear to be located outside the map area. Come visit us!', 4);
		lc.stop();
	}
}).addTo(map);

// https://github.com/perliedman/leaflet-control-geocoder
// BUTTON search
const geocode = L.Control.geocoder({
	geocoder: L.Control.Geocoder.nominatim({
		geocodingQueryParams: {
			bounded: 1,
			viewbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			limit: maxNomResults,
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
	if ($('#inputDebug').is(':checked')) console.debug('Nominatim search:', e.geocode);
	const geoMarker = e.geocode.properties;
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
$('.leaflet-control-geocoder-icon').html('<i class="fa-solid fa-magnifying-glass"></i><i style="display:none;" class="fa-solid fa-spinner fa-spin-pulse"></i>').attr('title','Address search');
// automate a geocode from a given address
function searchAddr(addr) {
	$('.leaflet-control-geocoder-form input').val(addr);
	geocode.options.geocoder.options.geocodingQueryParams.limit = 1;
	geocode._geocode();
	$('.leaflet-control-geocoder-form input').val('');
	geocode.options.geocoder.options.geocodingQueryParams.limit = maxNomResults;
}

// BUTTON mapillary sequences
const fcnStLvl = L.easyButton({
	id: 'btnStLvl',
	states: [{
		stateName: 'offStLvl',
		icon: 'fa-solid fa-street-view',
		title: 'Photosphere views',
		onClick: function() { tour('pano'); }
	}, {
		stateName: 'onStLvl',
		icon: 'fa-solid fa-street-view',
		title: 'Photosphere views',
		onClick: function() { zoom_area(); }
	}]
}).addTo(map);

// BUTTON bookmarks
L.easyButton({
	id: 'btnBookm',
	states: [{
		icon: 'fa-solid fa-bookmark',
		title: 'Show bookmarks',
		onClick: function() {
			if (window.localStorage.favourites) {
				$('#inputOverpass').val('(' + window.localStorage.favourites + ')');
				customQuery('(' + window.localStorage.favourites + ')', true);
			}
			else setMsgStatus('fa-solid fa-circle-info', 'Bookmarks', 'Add your favourite places by clicking <i class="fa-regular fa-bookmark fa-fw"></i> within a popup.', 4);
		}
	}]
}).addTo(map);

// https://github.com/cliffcloud/Leaflet.EasyButton
// BUTTON clear map
L.easyButton({
	id: 'btnClearmap',
	states: [{
		icon: 'fa-solid fa-trash',
		title: 'Clear layers',
		onClick: function() { clear_map('all'); }
	}]
}).addTo(map);

// https://github.com/ebrelsford/Leaflet.loading
// BUTTON loading spinner
const loadingControl = L.Control.loading({ separate: true });
map.addControl(loadingControl);
$('.leaflet-control-loading').html('<i class="fa-solid fa-spinner fa-spin-pulse"></i>');

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
			else $('#goto' + anchorTour)[0].scrollIntoView();
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
const sidebar = $('#sidebar').sidebar();

// https://github.com/mlevans/leaflet-hash
new L.Hash(map);

// https://github.com/perliedman/leaflet-routing-machine
let routingControl;
function setRoutingControl(units) {
	routingControl = L.Routing.control({
		units: units,
		collapsible: false,
		fitSelectedRoutes: false,
		reverseWaypoints: true,
		routeWhileDragging: false,
		showAlternatives: false,
		router: L.Routing.mapbox(window.BOSM.mapboxKey, {
			profile: 'mapbox/walking'
		}),
		lineOptions: {
			styles: [{
				color: 'darkgreen',
				opacity: 0.6,
				weight: noTouch ? 5 : 8
			}]
		},
		pointMarkerStyle: {
			radius: 8,
			color: 'darkgreen',
			opacity: 0.6,
			fillColor: '#fff',
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
				$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', false);
				if ($('#inputDebug').is(':checked')) console.debug('Nominatim walkpoint:', e.waypoints);
			}
			else {
				$('.sidebar-tabs ul li [href="#walking"] .sidebar-notif').hide();
				$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', true);
			}
		}, 50);
	})
	.on('routeselected', function() {
		if (routingControl.zoomBounds) {
			map.flyToBounds(routingControl._line.getBounds().pad(0.5));
			routingControl.zoomBounds = false;
		}
	});
	$('#routingControl').html(routingControl.onAdd(map));
	$('.leaflet-routing-geocoders').append('<button class="leaflet-routing-delete-waypoints" type="button" onclick="clear_map(\'walk\');" title="Clear waypoints"><i class="fa-solid fa-trash"></i></i></button>');
	$('.leaflet-routing-reverse-waypoints').html('<i class="fa-solid fa-retweet"></i>').attr('title', 'Reverse waypoints');
	$('.leaflet-routing-add-waypoint').html('<i class="fa-solid fa-plus"></i>').attr('title', 'Add a waypoint');
	$('.leaflet-routing-delete-waypoints, .leaflet-routing-reverse-waypoints').prop('disabled', true);
}

function populatePoiTab() {
	let poiTags = {}, category = [], categoryList = [], c;
	for (let poi in pois) if (pois[poi].catName && pois[poi].tagKeyword) {
		// get all keywords and put into categories
		poiTags[poi] = pois[poi].tagKeyword;
		category.push({ listLocation: poi, header: '<img data-key="poi" src="assets/img/icons/' + pois[poi].iconName + '.png">' + pois[poi].catName + ' - ' + pois[poi].name });
		// get unique category label for poi checkbox tab
		if (categoryList.indexOf(pois[poi].catName) === -1) categoryList.push(pois[poi].catName);
	}
	for (c = 0; c < $('#tourList option').length - 1; c++) if ($('#tourList option:enabled').eq(c).data('keyword')) {
		category.push({ listLocation: $('#tourList option').eq(c).text(), header: '<img data-key="' + $('#tourList option').eq(c).val() + '" src="assets/img/sb-tour.png">Tour - ' + $('#tourList option').eq(c).text() });
		poiTags[$('#tourList option').eq(c).text()] = $('#tourList option').eq(c).data('keyword').split(', ');
	}
	// https://github.com/pawelczak/EasyAutocomplete
	const options = {
		data: poiTags,
		minCharNumber: 3,
		list: {
			showAnimation: { type: 'fade', time: 100 },
			hideAnimation: { type: 'slide', time: 100 },
			maxNumberOfElements: 10,
			match: { enabled: true },
			onLoadEvent: function() {
				// removes empty categories
				$('#eac-container-autocomplete li').last().nextAll('.eac-category').remove();
			},
			onChooseEvent: function() {
				// select poi
				if ($('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).find('img').data('key') === 'poi') {
					// find selected items category and split it to get checkbox, then display
					clear_map('markers');
					$('a[href="#pois"]').click();
					$('.poi-checkbox label[title="' + $('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).text().split(' - ')[1] + '"] input').prop('checked', true);
					poi_changed();
				}
				// select tour
				else switchTab('tour', $('#eac-container-autocomplete .selected').prevAll('.eac-category').eq(0).find('img').data('key'));
				$('#autocomplete').val('');
				if ($('#poi-filter-in').val().length) $('#poi-filter-in').val('').trigger('input');
			}
		},
		categories: category
	};
	$('#autocomplete').easyAutocomplete(options);
	$('div.easy-autocomplete').removeAttr('style');
	// create checkbox tables using poi categories
	let checkboxContent = '<div id="poi-filter"><input id="poi-filter-in" type="text" placeholder="Filter, e.g. \'dog\', \'park\', \'eat\', \'bed\'" title="Enter a keyword"><span class="leaflet-routing-remove-waypoint"></span></div>' +
			'<div class="comment" style="text-align:right;">Make up to ' + maxPOICheckbox + ' selections at a time.</div>';
	for (let c = 0; c < categoryList.length; c++) {
		checkboxContent += '<div id="goto' + categoryList[c] + '" class="poi-group"><hr><h3>' + categoryList[c] + '</h3>';
		for (let poi in pois) if (pois[poi].catName === categoryList[c]) checkboxContent += L.Util.template(
			'<div class="poi-checkbox">' +
				'<label title="{name}">' +
					'<img alt="" src="assets/img/icons/{icon}.png">' +
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

// localStorage detection
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
function localStorageAvail() {
	let storage;
	try {
		storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
	}
}

// highlight textboxes on focus
$(':text').on('focus', function() { $(this).select(); });

// iframe and popup window
// type of popup, url, popup title, iframe caption, iframe animation
function popupWindow(type, url, pTitle, iCap, iAni) {
	const wSize = $(window).width() >= 1024 && $(window).height() >= 500;
	// The Story of Bexhill Street Names book
	if (type === 'streetbook') {
		type = 'auto';
		url = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/tour/itemStreetNames/streetnames.xml#' + (darkMode ? 'darkMode' : 'lightMode');
		pTitle = 'bookWindow';
		iCap = '<a href="https://bexhill-osm.org.uk/streetnames" target="_blank">https://bexhill-osm.org.uk/streetnames</a>';
		iAni = 'fade';
	}
	// YouTube video
	else if (type === 'youtube') {
		if (wSize) $.fancybox.open({
			src: 'https://www.youtube.com/embed/' + url,
			youtube: {
				modestbranding: 1,
				iv_load_policy: 3,
				rel: 0
			}
		});
		else {
			type = 'popup';
			url = 'https://www.youtube.com/watch?v=' + url;
		}
	}
	// iframe if larger screen size
	if (type === 'iframe' || (type === 'auto' && wSize)) $.fancybox.open([{
		src: url,
		type: 'iframe',
		opts: {
			caption: iCap || '',
			animationEffect: iAni || 'circular'
		}
	}]);
	// popup window
	else if (type === 'popup' || type === 'auto') window.open(url, pTitle || 'aWindow', 'noopener width=1024, height=768, menubar=0, toolbar=0, resizable=1').focus();
}

// keyboard shortcuts
let oInterval;
$('html').keydown(function(e) {
	clearInterval(oInterval);
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
		if ($('#inputOpacity input').val() >= 0.5) oInterval = setInterval(() => {
			$('#inputOpacity input').val(+$('#inputOpacity input').val() - 0.05).trigger('input');
			if ($('#inputOpacity input').val() == 0.05) {
				clearInterval(oInterval);
				$('#inputOpacity input').trigger('change');
			}
		}, 40);
		else if ($('#inputOpacity input').val() < 0.5) oInterval = setInterval(() => {
			$('#inputOpacity input').val(+$('#inputOpacity input').val() + 0.05).trigger('input');
			if ($('#inputOpacity input').val() == 1) {
				clearInterval(oInterval);
				$('#inputOpacity input').trigger('change');
			}
		}, 40);
		e.preventDefault();
	}
});

// if user presses ENTER instead of selecting a category on home search bar
$('#autocomplete').keydown(function(e) {
	if (e.keyCode === $.ui.keyCode.ENTER && !$('#eac-container-autocomplete ul:visible').length) autocomplete();
});
function autocomplete() {
	if ($('#autocomplete').val()) {
		if ($(window).width() < 768) $('.sidebar-close:visible').click();
		// grid reference lookup
		if ($('#autocomplete').val().startsWith('TQ')) {
			const latlngPoint = new GridRefToWgs84($('#autocomplete').val(), 5);
			clear_map('all');
			if (actOverlayLayer) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
			map.setView(latlngPoint, 18);
			setTimeout(function() { map.fire('click', {
				latlng: latlngPoint,
				layerPoint: map.latLngToLayerPoint(latlngPoint),
				containerPoint: map.latLngToContainerPoint(latlngPoint)
			}); }, 400);
		}
		// address search
		else {
			$('.leaflet-control-geocoder-icon').click();
			$('.leaflet-control-geocoder-form input').val($('#autocomplete').val());
			geocode._geocode();
		}
	}
}

// map display options
let darkMode, scaleControl;
$('#inputTheme').change(function() {
	const cssVar = getComputedStyle($('html')[0],null);
	if ((window.matchMedia('(prefers-color-scheme: dark)').matches && $(this).val() === 'auto') || $(this).val() === 'dark') {
		$('#darkcss').prop('disabled', false);
		$('#tourFrame').contents().find('html').css({
			'--text-color': cssVar.getPropertyValue('--text-color'),
			'--bg-color': cssVar.getPropertyValue('--bg-color'),
			'--bg-color2': cssVar.getPropertyValue('--bg-color2')
		});
		$('#map').css('background', '#0f0f0f');
		darkMode = true;
	}
	else {
		$('#darkcss').prop('disabled', true);
		$('#tourFrame').contents().find('html').prop('style', '');
		$('#map').css('background', '#e6e6e6');
		darkMode = false;
	}
	// apply theme to iframes
	$('#tourFrame').contents().find('html').css({
		'--main-color': cssVar.getPropertyValue('--main-color'),
		'--scr-track': cssVar.getPropertyValue('--scr-track'),
		'--scr-thumb': cssVar.getPropertyValue('--scr-thumb')
	});
	if (noIframe && localStorageAvail()) window.localStorage.theme = $(this).prop('selectedIndex');
});
$('#settings input').not('#inputDebug').change(function() {
	if ($(this).attr('id') === 'inputUnit') {
		// change unit of measurement
		if (routingControl) $('#btnClearmap').click();
		if (scaleControl) scaleControl.remove();
		if ($(this).is(':checked')) {
			scaleControl = L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('metric');
			lc.options.metric = true;
		}
		else {
			scaleControl = L.control.scale({ metric: false, position: 'bottomleft' }).addTo(map);
			setRoutingControl('imperial');
			lc.options.metric = false;
		}
	}
	else if ($(this).attr('id') === 'inputStView') {
		if ($(this).is(':checked')) $('#btnStLvl').parent().show();
		else $('#btnStLvl').parent().hide();
	}
	permalinkSet();
});
$('#btnReset').click(function() {
	window.localStorage.clear();
	window.location.href = window.location.origin;
	return false;
});

// developer tools
$('#devTools').accordion({
	heightStyle: 'content',
	animate: 150,
	collapsible: true,
	active: $('#inputDebug').is(':checked') ? 0 : false,
	activate: function(event, ui) { if (ui.oldPanel[0]) $('#inputOverpass, #inputAttic').val(''); }
});
$('#btnExportQuery').click(function() {
	// https://wiki.openstreetmap.org/wiki/Overpass_turbo/Development
	window.open('https://overpass-turbo.eu/?Q=' + encodeURIComponent(queryBbox.replace('[out:json];', '') + '(._;>;);out meta qt;') + '&C=' + mapCentre.join(';') + ';' + mapZoom + '&R', '_blank');
});
$('#btnDownloadBB').click(function() {
	// https://wiki.openstreetmap.org/wiki/Overpass_API/XAPI_Compatibility_Layer
	window.location = 'https://' + $('#inputOpServer').val() + '/api/map?bbox=' + [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(',');
	$(this).prop('disabled', true);
	setTimeout(function() { $('#btnDownloadBB').prop('disabled', false); }, 20000);
});
$('#inputOpCache').change(function() {
	if ($(this).val() > 720) $(this).val(720);
	else if ($(this).val() < 0) $(this).val(0);
	else if ($(this).val() === '') $(this).val(120);
	if (window.localStorage) window.localStorage.OPLCacheDur = $(this).val();
	eleCache = [];
});
$('#inputOverpass').keydown(function(e) {
	if (e.keyCode == $.ui.keyCode.ENTER && $(this).val()) customQuery($(this).val(), true);
});
function customQuery(q, fromInput) {
	spinner++;
	if (fromInput) clear_map('all');
	if (q.charAt(0) === '[' && q.charAt(q.length-1) === ']') show_overpass_layer('(nw' + ($('#inputOverpassR input').is(':checked') ? 'r' : '') + q + ';);', '', {
		custom: true,
		bound: true,
		forceBbox: false
	});
	else if (q.charAt(0) === '(' && q.charAt(q.length-1) === ')') show_overpass_layer(q + ';', '', {
		custom: true,
		bound: true,
		forceBbox: false
	});
	else setMsgStatus('fa-solid fa-circle-info', 'Incorrect query', 'Enclose queries with [ ] for tags,<br>and ( ) for element ids.', 4);
	if (spinner > 0 && fromInput) spinner--;
}
$('#inputRevServer').change(function() { if (window.localStorage) window.localStorage.RevServer = $(this).prop('selectedIndex'); });
$('#inputOpServer').change(function() { if (window.localStorage) window.localStorage.OPServer = $(this).prop('selectedIndex'); });
$('#inputDebug').change(function(e, init) {
	if ($(this).is(':checked')) {
		console.debug('%cDEBUG MODE%c\nAPI requests output to console, map bounds unlocked.', 'color: ' + $('html').css('--main-color') + ';font-weight:bold;');
		setMsgStatus('fa-solid fa-bug', 'Debug Mode Enabled', 'Check web console for output for details.', 4);
		$('#devTools').accordion({ collapsible: false });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').show();
		map.setMaxBounds();
		map.options.minZoom = 1;
	}
	else {
		$('#devTools').accordion({ collapsible: true });
		$('.sidebar-tabs ul li [href="#settings"] .sidebar-notif').hide();
		map.setMaxBounds(LBounds.pad(1));
		map.options.minZoom = mapMinZoom;
		if (!init) console.debug('%cDEBUG MODE OFF%c', 'color: ' + $('html').css('--main-color') + ';font-weight:bold;');
	}
});
$('#inputDebug').trigger('change', [true]);

// clear layers
function clear_map(layer) {
	if (layer === 'markers' || layer === 'all') {
		$('.poi-checkbox input:checked').prop('checked', false);
		poi_changed();
		$('.poi-checkbox').removeClass('poi-loading');
		queryBbox = undefined;
		$('#btnExportQuery').prop('disabled', true);
		rQuery = false;
		imageOverlay.clearLayers();
		fcnStLvl.state('offStLvl');
		$('.sidebar-tabs ul li [href="#tour"] .sidebar-notif').hide();
		actImgLayer = undefined;
		$('#thennow img').off('mouseenter mouseleave');
		$('#inputWw2').remove();
		$('div[role="tooltip"]').remove();
		if (actOverlayLayer && tileOverlayLayer[actOverlayLayer].hide) map.removeLayer(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name]);
		setPageTitle();
	}
	if (layer === 'all' && $('#poi-filter-in').val().length) $('#poi-filter-in').val('').trigger('input');
	if (layer === 'walk' || layer === 'all') routingControl.setWaypoints([]);
	spinner = 0;
	$('.spinner').hide();
	$('#msgStatus').hide();
	permalinkSet();
}

// fly to bounds of layer
function zoom_area(closeTab, layer) {
	let offset = 0, layers = layer || areaOutline.getBounds().extend(iconLayer.getBounds()).extend(imageOverlay.getBounds());
	if ($(window).width() < 768 && closeTab) $('.sidebar-close:visible').click();
	else if ($(window).width() >= 1024 && !$('.sidebar.collapsed').length) offset = Math.round(sidebar.width());
	map.closePopup();
	map.flyToBounds(layers, { paddingTopLeft: [offset, 0] } );
}

function poi_changed(newcheckbox) {
	const poiChk = $('.poi-checkbox input:checked');
	rQuery = false;
	// limit number of active checkboxes
	if (poiChk.length <= maxPOICheckbox) {
		// remove old poi markers and results
		$('#poi-results').css('pointer-events', '');
		$('#poi-results button').prop('disabled', true);
		map.closePopup();
		iconLayer.clearLayers();
		clickOutline.clearLayers();
		areaOutline.clearLayers();
		imageOverlay.clearLayers();
		fcnStLvl.state('offStLvl');
		actImgLayer = undefined;
		setPageTitle();
		poiList = [];
		if (poiChk.is(':checked')) {
			$('#poi-results h3').html('Results loading...');
			$('#poi-results-list').css('opacity', 0.5);
			$('#poi-results').css('min-height', '');
			//build overpass query
			let query = '', selectedPois = '', poiLabels = '';
			poiChk.each(function(i, element) {
				query += pois[element.id].query;
				selectedPois += element.id + '-';
				poiLabels += pois[element.id].name + ', ';
			});
			show_overpass_layer(query, selectedPois.slice(0, -1), {
				bound: true,
				forceBbox: false
			});
			setPageTitle(poiLabels.substring(0,poiLabels.length-2));
		}
		else {
			markerId = undefined;
			$('#poi-results h3').html('Results cleared.');
			$('#poi-results-list').fadeOut(250, function() { $(this).empty(); });
			$('#poi-results').css('min-height', 'unset').slideUp(400, function() { $(this).css('height', ''); });
			$('.sidebar-tabs ul li [href="#pois"] .sidebar-notif').hide();
			permalinkSet();
		}
	}
	else if (poiChk.length > maxPOICheckbox) {
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
	const that = this;
	// timeout fix for chrome not redrawing poi list
	setTimeout(function() {
		if ($(that).prop('checked')) $(that).parent().addClass('poi-checkbox-selected');
		else $(that).parent().removeClass('poi-checkbox-selected');
	}, 500);
});
// jump to next result item
function poi_next() {
	$('#btnPoiResultsNext').prop('disabled', true);
	if (!$('.poi-result-selected').length || $('#poi-results-list tr').last().hasClass('poi-result-selected')) $('#poi-results-list tr').eq(0).click();
	else $('#poi-results-list tr').eq($('#poi-results-list tr.poi-result-selected').index('tr')+1).click();
	setTimeout(function() { $('#btnPoiResultsNext').prop('disabled', false); }, 1000);
}

// sets the page title
function setPageTitle(subTitle) {
	$(document).attr('title', (subTitle ? subTitle + ' | ' + $('meta[name=\'application-name\']').attr('content') : $('meta[property=\'og:title\']').attr('content')));
}

// set status message modal
function setMsgStatus(headerIco, headerTxt, msgBody, closeTime) {
	$('#msgStatus').stop(true).html(
		'<div id="msgStatusHead">' +
			'<i class="' + headerIco + ' fa-lg fa-fw"></i> ' + headerTxt +
			'<div class="leaflet-popup-close-button" onclick="clickOutline.clearLayers();$(\'#msgStatus\').stop(true).hide();"><i class="fa-solid fa-xmark fa-sm"></i></div>' +
		'</div>' +
		'<div id="msgStatusBody">' + msgBody + '</div>'
	).fadeIn(200);
	if (closeTime > 0) $('#msgStatus').delay(closeTime*1000).fadeOut(3000);
}

// show tips
function getTips(tip) {
	let nextTip;
	const tips = [
		'Right-click or long-press the map to see a context menu with information on that area.',
		'Click an area of the above minimap to quickly <i class="fa-solid fa-magnifying-glass-plus fa-sm"></i> to that location.',
		'Zoom into the map and click almost any place to see more details.',
		'Find any address by entering part of it into Search <i class="fa-solid fa-magnifying-glass fa-sm"></i> and pressing enter.',
		'Almost every street in Bexhill has a history behind its name, Search <i class="fa-solid fa-magnifying-glass fa-sm"></i> for a road to learn more.',
		'Zoom into the map and click a bus-stop <i class="fa-solid fa-bus fa-sm"></i> to see real-time information on arrivals.',
		'Use the mouse wheel or swipe to see the next image in a pop-up. Click an image to see it full-screen.',
		'Click <i class="fa-solid fa-location-arrow fa-sm"></i> to turn on your location to see place results ordered by distance.',
		'Quickly create walking <i class="fa-solid fa-person-walking fa-sm"></i> directions by turning on <i class="fa-solid fa-location-arrow fa-sm"></i> and right-clicking the map.',
		'Choose between miles or kilometres in <a onclick="switchTab(\'settings\');">Settings <i class="fa-solid fa-gear fa-sm"></i></a>.',
		'Dark theme can be enabled/disabled in <a onclick="switchTab(\'settings\');">Settings <i class="fa-solid fa-gear fa-sm"></i></a>.',
		'Click <i class="fa-solid fa-trash fa-sm"></i> to clear all layers from the map.',
		'Touch screen users can quickly close the sidebar by swiping <i class="fa-solid fa-hand-point-up fa-sm"></i> the sidebar title.',
		'Personally bookmark any place by clicking <i class="fa-regular fa-bookmark fa-sm"></i> in a popup, click it again to remove.',
		'We have a number of historical map overlays, select them using the top-right layer control <i class="fa-solid fa-layer-group fa-sm"></i> .',
		'Results in Places are coloured to show currently open (green) or closed (red).',
		'Zoom into the map and click a postbox <i class="fa-solid fa-envelope fa-sm"></i> to see the next post collection.',
		'You can find booking information on accommodation under <a onclick="switchTab(\'pois\', \'Leisure-Tourism\');">Leisure-Tourism</a>.',
		'Get the latest food hygiene ratings on businesses under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Find your closest <i class="fa-solid fa-recycle fa-sm"></i> container and the materials it recycles under <a onclick="switchTab(\'pois\', \'Amenities\');">Amenities</a>.',
		'Have a look at our WW2 Incident Map under <a onclick="switchTab(\'tour\', \'ww2\', \'\', \'bombmap\');">History <i class="fa-solid fa-book fa-sm"></i></a>.',
		'Some places have a photosphere view, click <i class="fa-solid fa-street-view fa-fw"></i> in a popup to view it.',
		'View superimposed and colourised images of Bexhill past and present under <a onclick="switchTab(\'thennow\');">Then and Now <i class="fa-regular fa-image fa-sm"></i></a>.',
		'Notice something wrong or missing on the map? Right-click the area and <i class="fa-regular fa-sticky-note fa-sm"></i> Leave a note.',
		'<i class="fa-solid fa-map-pin fa-sm"></i> Over 1,100 photos, 20,000 buildings and 250 miles of roads/paths within 15 miles&sup2; have been mapped thus far!',
		'The data behind Bexhill-OSM is open-source and can be used by anyone however they wish!',
		'For a mobile, offline version of this map - give <a href="https://organicmaps.app" target="_blank" rel="noopener">Organic Maps</a> a try.',
		'Anyone can help with building the <i class="fa-regular fa-map fa-sm"></i>, visit <a href="https://osm.org" target="_blank" rel="noopener">OpenStreetMap.org</a> on how to get started.'
	];
	if (tip === 'random') nextTip = Math.floor(Math.random() * tips.length);
	else if (parseInt($('#tipsText').data('tip')) === tips.length - 1) nextTip = 0;
	else nextTip = parseInt($('#tipsText').data('tip')) + 1;
	$('#tipsText').stop(true).fadeOut(150, function() { $(this).html(tips[nextTip]).data('tip', nextTip); }).fadeIn(150);
	$('#tipsButton').attr('title', 'Next tip (' + (nextTip + 1) + ' of ' + tips.length + ')');
}

function showWeather() {
	// get tides
	let tideData = '', wtooltip = '';
	$.ajax({
		// downloaded twice weekly via cron job from https://admiraltyapi.portal.azure-api.net/
		url: 'assets/data/tides.json',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		success: function(json) {
			let nextTide = '';
			const iconTide = { HighWater: 'up', LowWater: 'down' };
			$.each(json, function(i, element) { if (new Date().getTime() > new Date(element.DateTime + 'Z').getTime()) nextTide = i+1; });
			if (nextTide && nextTide < json.length-1) {
				wtooltip += '<hr>' + json[nextTide].EventType + ': ' + L.Util.formatNum(json[nextTide].Height, 2) + 'm<br>' +
					json[nextTide+1].EventType + ': ' + L.Util.formatNum(json[nextTide+1].Height, 2) + 'm';
				tideData =
					'<span class="wtide1"><i class="fa-solid fa-water fa-2x"></i></span><span class="wtide2">' +
					'<i class="fa-solid fa-sm fa-turn-' + iconTide[json[nextTide].EventType] + '"></i> ' + new Date(json[nextTide].DateTime + 'Z').toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<br>' +
					'<i class="fa-solid fa-sm fa-turn-' + iconTide[json[nextTide+1].EventType] + '"></i> ' + new Date(json[nextTide+1].DateTime + 'Z').toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '</span>';
			}
			else this.error();
		},
		error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR TIDES:', encodeURI(this.url)); }
	});
	// get weather
	$.ajax({
		url: 'https://api.openweathermap.org/data/2.5/weather',
		dataType: 'json',
		mimeType: 'application/json',
		cache: false,
		data: { id: '2655777', units: 'metric', appid: window.BOSM.owmKey },
		success: function(json) {
			if (json.weather) {
				const tempIcon = {
					'01d': 'sun', '02d': 'cloud-sun', '03d': 'cloud', '04d': 'cloud', '09d': 'cloud-sun-rain', '10d': 'cloud-rain', '11d': 'cloud-showers-heavy', '13d': 'snowflake', '50d': 'smog',
					'01n': 'moon', '02n': 'cloud-moon', '03n': 'cloud', '04n': 'cloud', '09n': 'cloud-moon-rain', '10n': 'cloud-rain', '11n': 'cloud-showers-heavy', '13n': 'snowflake', '50n': 'smog'
				}, windDir = [
					'North', 'North-northeast', 'Northeast', 'East-northeast',
					"East",  'East-southeast', 'Southeast', 'South-southeast',
					'South', 'South-southwest', 'Southwest', 'West-southwest',
					'West',  'West-northwest', 'Northwest', 'North-northwest'
				], getWinddir = json.wind.deg ? windDir[(Math.floor((json.wind.deg / 22.5) + 0.5)) % 16] : 'Calm';
				$('#weather').html(
					'<span class="wtemp"><i class="fa-solid fa-' + tempIcon[json.weather[0].icon] + ' fa-2x"></i></span>' +
					'<span class="wtemp">' +
						json.weather[0].description.charAt(0).toUpperCase() + json.weather[0].description.slice(1) + '<br>' +
						json.main.temp.toFixed(1) + '&deg;C' +
					'</span>' +
					'<span class="wwind"><i class="fa-solid fa-wind fa-2x"' + (json.wind.deg ? ' style="transform:rotate(' + (json.wind.deg + 90) + 'deg);"' : '') + '></i></span>' +
					'<span class="wwind">' +
						getWinddir + '<br>' +
						'<span>' + (json.wind.speed * 2.236936).toFixed(1) + 'mph</span>' +
					'</span>' +
					(tideData ? tideData : '')
				).show().attr('onclick', 'popupWindow("popup", "https://openweathermap.org/city/' + json.id + '", "owWindow");');
				wtooltip =
						'Sunrise: ' + new Date(json.sys.sunrise * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<br>' +
						'Sunset: ' + new Date(json.sys.sunset * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) + '<hr>' +
						'Gust: ' + (json.wind.gust * 2.236936).toFixed(1) + 'mph<br>' +
						'Cloud: ' + json.clouds.all + '%<br>' +
						'Humidity: ' + json.main.humidity + '%' + wtooltip;
				$('#weather').attr('title', '').tooltip({
					classes: { 'ui-tooltip': 'wtooltip' },
					position: tooltipDef.position,
					content: wtooltip,
					disabled: noTouch ? false : true,
					hide: false,
					show: tooltipDef.show,
					track: true,
				});
			}
			else this.error();
			if ($('#inputDebug').is(':checked')) console.debug('Openweather:', json);
		},
		error: function() {
			if ($('#inputDebug').is(':checked')) console.debug('ERROR OPENWEATHER:', encodeURI(this.url));
			$('#weather').hide();
			$('#minimap').css('padding-top', '2px');
		}
	});
}

// https://github.com/mapbox/osmcha-frontend/wiki/API
// display latest osm changesets
function showEditFeed() {
	const timeSince = function(date) {
		const seconds = Math.floor((new Date() - new Date(date)) / 1000);
		let str;
		if (seconds / 31536000 > 1 && seconds / 31536000 < 2) str = 'One year ago';
		if (seconds / 31536000 > 1) str = Math.floor(seconds / 31536000) + ' years ago';
		else if (seconds / 2592000 > 1 && seconds / 2592000 < 2) str = 'One month ago';
		else if (seconds / 2592000 > 1) str = Math.floor(seconds / 2592000) + ' months ago';
		else if (seconds / 604800 > 1 && seconds / 604800 < 2) str = 'One week ago';
		else if (seconds / 604800 > 1) str = Math.floor(seconds / 604800) + ' weeks ago';
		else if (seconds / 86400 > 1 && seconds / 86400 < 2) str = 'One day ago';
		else if (seconds / 86400 > 1) str = Math.floor(seconds / 86400) + ' days ago';
		else if (seconds / 3600 > 1 && seconds / 3600 < 2) str = 'One hour ago';
		else if (seconds / 3600 > 1) str = Math.floor(seconds / 3600) + ' hours ago';
		else if (seconds / 60 > 2) str = Math.floor(seconds / 60) + ' minutes ago';
		else str = 'Just now';
		return str;
	};
	$.ajax({
		url: 'https://osmcha.org/api/v1/changesets/',
		headers: { 'Authorization': 'Token ' + window.BOSM.osmchaTok },
		dataType: 'json',
		cache: false,
		data: {
			page: 1,
			page_size: 5,
			in_bbox: [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north].join(','),
			area_lt: 5
		},
		success: function(data) {
			if (data.features) {
				let s = '';
				$.each(data.features, function(e, itm) {
					s += '<li><span class="fa-li"><i class="fa-solid fa-circle-check"></i></span><a href="https://overpass-api.de/achavi/?changeset=' + encodeURI(itm.id) + '&layers=B0FTTFT"' +
					' title="' + dateFormat(itm.properties.date, 'short') + '\n' + itm.properties.create + ' created\n' + itm.properties.modify + ' modified\n' + itm.properties.delete + ' deleted\n">' + timeSince(itm.properties.date) + '</a>' +
					' - <a href="https://www.openstreetmap.org/user/' + encodeURI(itm.properties.user) + '" title="User">' + itm.properties.user + '</a>' +
					'<span class="comment">' + itm.properties.comment + '</span></li>';
				});
				$('#osmFeed')
					.html('Recent map edits:<ul class="fa-ul">' + s + '</ul>')
					.slideDown();
				$('#osmFeed a')
					.attr({
						'onClick': 'return window.confirm("This link will open an external website to review.");',
						'target': '_blank',
						'rel': 'noopener'
					});
				if ($('#inputDebug').is(':checked')) console.debug('OSM feed:', data);
			}
			else this.error();
		},
		error: function() { if ($('#inputDebug').is(':checked')) console.debug('ERROR OSM-FEED:', encodeURI(this.url)); }
	});
}

// M = basemap, O = overlay, OP = overlay opacity, S = settings, T = tab, U = tour frame, G = image layer, P = grouped pois, I = single poi, W = walkpoints
// TN = thennow slideshow, QG = geocode query, QO = overpass query, QL = location query
function permalinkSet() {
	// get clean url without parameters and hash
	const uri = new URL(window.location.href.split('?')[0].split('#')[0]);
	let selectedPois = '', walkCoords = '', setChk, overlayOpacity, c;
	const walkWayp = routingControl ? routingControl.getWaypoints() : undefined;
	if (actTab !== defTab) uri.searchParams.set('T', actTab);
	if (actBaseTileLayer !== defBaseTileLayer) uri.searchParams.set('M', actBaseTileLayer);
	if (actImgLayer && actTab !== 'thennow') uri.searchParams.set('G', actImgLayer);
	if (actOverlayLayer) {
		uri.searchParams.set('O', actOverlayLayer);
		overlayOpacity = Math.floor(tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].options.opacity * 100);
		if (overlayOpacity === tileOverlayLayer[actOverlayLayer].opacity * 100) overlayOpacity = undefined;
		if (overlayOpacity) uri.searchParams.set('OP', overlayOpacity);
	}
	if (walkWayp) {
		for (c = 0; c < walkWayp.length; c++) if (walkWayp[c].latLng) walkCoords += L.Util.formatNum(walkWayp[c].latLng.lat, 5) + 'x' + L.Util.formatNum(walkWayp[c].latLng.lng, 5) + '_';
		if (walkCoords) uri.searchParams.set('W', walkCoords.slice(0, -1));
	}
	if (actTab === 'tour' && $('#tourList option').eq(0).val() !== $('#tourList option:selected').eq(0).val()) uri.searchParams.set('U', $('#tourList option:selected').val());
	if ($('[data-thennow]').length) uri.searchParams.set('TN', $('[data-thennow]').attr('data-thennow'));
	$('.poi-checkbox input:checked').each(function(i, element) { selectedPois += element.id + '-'; });
	if (selectedPois) uri.searchParams.set('P', selectedPois.slice(0, -1));
	else if (queryCustom && queryBbox && $('#inputOverpass').val()) uri.searchParams.set('QO', ($('#inputOverpassR input').is(':checked') ? 'r' : '') + $('#inputOverpass').val());
	if ($('#settings input[data-uri]:checkbox:checked').length) {
		setChk = '';
		for (c = 0; c < $('#settings input[data-uri]:checkbox').length; c++) setChk += $('#settings input[data-uri]:checkbox').eq(c).is(':checked') ? '1' : '0';
		uri.searchParams.set('S', setChk);
	}
	if (noIframe && localStorageAvail()) {
		window.localStorage.setChk = '';
		for (c = 0; c < $('#settings input[data-cache]:checkbox').length; c++) window.localStorage.setChk += $('#settings input[data-cache]:checkbox').eq(c).is(':checked') ? '1' : '0';
	}
	if (markerId && !(rQuery && actImgLayer) && !$('#inputAttic').val()) uri.searchParams.set('I', markerId);
	window.history.replaceState(null, null, uri + window.location.hash);
}
function permalinkReturn() {
	let uri = new URL(window.location.href).searchParams, junkQ = window.location.href.split('?');
	let c;
	// split fix for facebook and other junk trackers adding ?fbclid etc and busting queries
	if (junkQ.length > 2) {
		uri = URI(junkQ.slice(0, 2).join('?'));
		window.history.replaceState(null, null, '?' + junkQ.slice(0, 2)[1]);
	}
	// check localstorage for settings
	if (noIframe && localStorageAvail()) {
		// set theme
		if (parseInt(window.localStorage.theme) >= 0 && parseInt(window.localStorage.theme) < $('#inputTheme option').length) $('#inputTheme').prop('selectedIndex', window.localStorage.theme);
		// set checkboxes
		if (window.localStorage.setChk) for (c = 0; c < window.localStorage.setChk.length; c++)	$('#settings input[data-cache]:checkbox').eq(c).prop('checked', parseInt(window.localStorage.setChk.charAt(c)));
		// set basemap if none specified
		if (window.localStorage.baseLayer) actBaseTileLayer = window.localStorage.baseLayer;
		// set cache duration
		if (parseInt(window.localStorage.OPLCacheDur) >= 0 && parseInt(window.localStorage.OPLCacheDur) <= 240)	$('#inputOpCache').val(parseInt(window.localStorage.OPLCacheDur));
		else $('#inputOpCache').val($('#inputOpCache').attr('value'));
		// set servers
		if (parseInt(window.localStorage.RevServer) >= 0 && parseInt(window.localStorage.RevServer) < $('#inputRevServer option').length) $('#inputRevServer').prop('selectedIndex', window.localStorage.RevServer);
		if (parseInt(window.localStorage.OPServer) >= 0 && parseInt(window.localStorage.OPServer) < $('#inputOpServer option').length) $('#inputOpServer').prop('selectedIndex', window.localStorage.OPServer);
	}
	else if (!noIframe) $('#inputTheme').val('light');
	$('#inputTheme, #inputUnit, #inputStView').trigger('change');
	if (!noPermalink) {
		if (uri.has('M') && tileBaseLayer[uri.get('M')]) actBaseTileLayer = uri.get('M');
		if (uri.has('O') && tileOverlayLayer[uri.get('O')]) {
			actOverlayLayer = uri.get('O');
			tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].addTo(map);
			if (uri.has('OP')) tileOverlayLayers[tileOverlayLayer[actOverlayLayer].name].setOpacity(uri.get('OP') / 100);
		}
		if (uri.has('S')) {
			const setChk = uri.get('S');
			for (c = 0; c < setChk.length; c++) $('#settings input[data-uri]:checkbox').eq(c).prop('checked', parseInt(setChk.charAt(c)));
			if ($('#inputDebug').is(':checked')) $('#inputDebug').trigger('change');
		}
		if (uri.has('T')) actTab = uri.get('T');
		if (uri.has('U')) {
			const tourVal = uri.get('U');
			if ($('#tourList option[value=' + tourVal + ']').length && !$('#tourList option[value=' + tourVal + ']')[0].disabled)
				$('#tourList').val(tourVal).trigger('change');
		}
		if (uri.has('W')) {
			let walkPoints = uri.get('W');
			walkPoints = walkPoints.split('_');
			for (c = 0; c < walkPoints.length; c++) {
				walkPoints[c] = walkPoints[c].replace('x', ', ');
				routingControl.spliceWaypoints(c, 1, JSON.parse('[' + walkPoints[c] + ']'));
			}
		}
		if (uri.has('G')) {
			// if no latlng tell tour function to zoom to area
			if (window.location.hash.indexOf('/') !== 3) tour(uri.get('G'), '', false);
			else if (uri.get('G') === 'thennow') tour('thennow', uri.has('TN') ? uri.get('TN') : '', true);
			else tour(uri.get('G'), uri.has('I') ? uri.get('I') : '', true);
		}
		else if (uri.has('P')) {
			let groupedPoi = uri.get('P');
			if (groupedPoi.indexOf('-') !== -1) groupedPoi = groupedPoi.split('-');
			if (uri.has('I')) markerId = uri.get('I');
			setTimeout(function() {
				if (!Array.isArray(groupedPoi)) $('#' + groupedPoi).prop('checked', true);
				// the last poi has a '/' on it because leaflet-hash
				else for (c = 0; c < groupedPoi.length; c++) { $('#' + groupedPoi[c].replace('/', '')).prop('checked', true); }
				poi_changed(groupedPoi);
			}, 500);
			spinner++;
		}
		else if (uri.has('QO')) {
			let QO = decodeURIComponent(uri.get('QO'));
			if (QO.charAt(0) === 'r') {
				QO = uri.get('QO').slice(1);
				$('#inputOverpassR input').prop('checked', true);
			}
			else $('#inputOverpassR').prop('checked', false);
			$('#inputOverpass').val(QO);
			customQuery(QO);
			if (uri.has('I')) markerId = uri.get('I');
			$('#devTools').accordion({ active: 0 });
		}
		else if (uri.has('I')) {
			const singlePoi = uri.get('I');
			rQuery = true;
			spinner++;
			setTimeout(function() { show_overpass_layer(elementType(singlePoi) + '(' + singlePoi.slice(1) + ');', singlePoi.toUpperCase()); }, 500);
		}
		else if (uri.has('QG')) searchAddr(decodeURIComponent(uri.get('QG')));
		if (uri.has('QL')) setTimeout(function() { lc.start(); }, 500);
	}
	else if (uri.has('T')) actTab = uri.get('T');
	tileBaseLayers[tileBaseLayer[actBaseTileLayer].name].addTo(map);
	if (window.location.hash.indexOf('/') !== 3) map.setView(mapCentre, mapZoom);
	if ($('.sidebar-pane#' + actTab).length) {
		sidebar.open(actTab);
		if (actTab === 'thennow' && !uri.has('I')) tour('thennow', uri.has('TN') ? uri.get('TN') : '', true);
	}
	else actTab = 'none';
	// animate sidebar close button on smaller devices if layers underneath
	if ($('.sidebar-pane#' + actTab).length && $(window).width() < 768 && (uri.has('O') || uri.has('G') || uri.has('P') || uri.has('I') || uri.has('W')))
		$('.sidebar-close').addClass('fa-fade');
}
permalinkReturn();

// allow postMessage from these websites when in an iframe
window.addEventListener('message', function(event) {
	const iframeAccess = ['//www.discoverbexhill.com', '//bexhillheritage.com', '//www.bexhillmuseum.org.uk'];
	if (!noIframe && iframeAccess.findIndex(x => x === event.origin.split(':')[1]) >= 0) {
		clear_map('markers');
		switchTab('none', '', event.data);
	}
	else return;
});
