// the story of bexhill street names

// open with random header image
const imgPath = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/img', imgDesc = [
	'Galley Hill', 'Marina', 'Sea Road', 'Church Street', 'West Parade',
	'Chantry Lane', 'Ninfield Road', 'High Street', 'Little Common Road', 'Collington Avenue',
	'Cooden Drive', 'Buckhurst Place', 'Marina', 'Sea Road', 'Central Parade',
	'East Parade', 'Belle Hill', 'St Leonards Road', 'Marina Arcade', 'Sluice Road'
];
let imgCurrent = Math.floor(Math.random() * imgDesc.length)+1;
function setHeaderImg() {
	$('#header').attr({
		src: imgPath + '/street' + (imgCurrent < 10 ? '0' + imgCurrent : imgCurrent) + '.jpg',
		title: imgDesc[imgCurrent-1] + '\nImage ' + imgCurrent + ' of ' + (imgDesc.length)
	});
	imgCurrent = (imgCurrent === imgDesc.length) ? 1 : imgCurrent+1;
}
setHeaderImg();

$('.credit').last().append(', ' + new Date().getFullYear());
$('#street-filter-close').hide();

// darkmode
if (window.location.hash === '#darkMode' || window.location.hash === '#lightMode') $('#button-theme').hide();
if (window.location.hash === '#darkMode' || (window.location.hash !== '#lightMode' && window.matchMedia('(prefers-color-scheme: dark)').matches)) $('html').addClass('darkMode');
$('#button-theme').on('click', function() { $('html').toggleClass('darkMode'); });

// anchor
$('#button-anchor').on('click', function() {
	$('#links')[0].scrollIntoView({ behavior: 'smooth' });
	window.history.pushState('', '/', window.location.pathname);
});
$(window).on('scrollend', function() {
	if ($(this).scrollTop() > 1000) $('#button-anchor').show();
	else $('#button-anchor').fadeOut(200);
}).trigger('scrollend');

$(document).ready(function() {
	$.ajax({
		url: 'streetnames.json',
		dataType: 'json',
		mimeType: 'application/json',
		success: function(json) {
			let streetDetail = '', streetWip = '', className;
			$.each(json.streetNames.street, function(i, street) {
				className = street.name.charAt(0) + (street.lost ? ' lost' : '');
				streetDetail += '<div class="street ' + className + '"><strong>' + street.name + ' (' + street.date + ')</strong>' +
				// overpass ultra link to map, check not in iframe and road exists
				(window.top === window.self && !street.lost && !street.notroad ? '<a class="street-map-link" title="Locate on map" target="_blank" rel="noopener" href="https://ultra.trailsta.sh/#map&query=' +
					encodeURIComponent(
						'---\n' +
						'options:\n' +
						'fitBounds: true\n' +
						'---\n' +
						'[out:json][bbox:50.802,0.372,50.878,0.525];rel(12710197);map_to_area->.a;' +
						'((nw(area.a)[highway](area.a)[name="' + street.name + '"];););(._;>;);out skel qt;'
					) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16,1C9.925,1,5,5.925,5,12c0,10,10,19,11,19s11-9,11-19C27,5.925,22.075,1,16,1z M16,16 c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4s4,1.791,4,4C20,14.209,18.209,16,16,16z"/></svg>' +
					'</a>' : '') +
				'<div>' + street.desc + '</div></div>';
			});
			$.each(json.streetNames.streetWip, function(i, street) {
				streetWip += '<span>' + street.name + ' (' + street.date + ')</span>';
			});
			$('#street-results').html(streetDetail);
			if (streetWip) $('#rsrchdesc').html(streetWip);
			else $('#rsrchdesc').text('Nothing - we are are up to date!');
			// index links and alphabetic dividers
			$('#street-index a').each(function() {
				let recs = $('.street.' + $(this).text()).length;
				if (!recs) $(this).addClass('permDisable');
				else {
					recs = $(this).text() + ' - ' + recs + ' record(s)';
					$('.street.' + $(this).text()).first().before('<div id="' + $(this).text() +'" class="divider" title="' + recs + '">' + $(this).text() + '</div>');
					$(this).attr({ 'href': '#' + $(this).text(), 'title': recs });
				}
			});
			$('.divider').css('background-image', 'url(' + imgPath + '/div.png)');
			// jump to anchor using hash
			if (window.location.hash.startsWith('#') && !window.location.hash.endsWith('Mode')) $(window.location.hash)[0].scrollIntoView({ behavior: 'instant' });
			// text filter
			$('#street-filter-input').on('input', function() {
				$('.street strong').each(function() {
					if ($(this).text().toLowerCase().indexOf($('#street-filter-input').val().toLowerCase()) > -1) $(this).parent().show();
					else $(this).parent().hide();
				});
				$('#street-filter-text').html($('.street:visible').length + ' of ' + $('.street').length + ' records shown');
				if ($(this).val().length > 0) {
					$('#street-index a').addClass('disable');
					$('#street-filter-close').show();
					$('.divider').hide();
				}
				else {
					$('#street-index a').removeClass('disable');
					$('#street-filter-close').hide();
					$('.divider').show();
				}
			});
			$('#street-filter-input').trigger('input');
			$('#street-filter-close').on('click', function() { $('#street-filter-input').val('').trigger('input').trigger('focus'); });
			// cleaner url
			if (window.location.host === 'bexhill-osm.org.uk') {
				history.replaceState(null, null, '/streetnames' + window.location.hash);
				$('a[href*="#"]').not('.street-map-link').each(function() { $(this).attr('href', '/streetnames' + $(this).attr('href')); });
			}
		}
	});
});
