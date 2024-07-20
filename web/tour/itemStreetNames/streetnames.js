// the story of bexhill street names

// open with random header image
const imgPath = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/img', imgCount = 17;
let imgCurrent = Math.round(Math.random() * imgCount);
function setHeaderImg() {
	$('#header').attr({
		src: imgPath + '/street' + imgCurrent + '.jpg',
		title: 'Image ' + (imgCurrent+1) + ' of ' + (imgCount+1)
	});
	imgCurrent = (imgCurrent === imgCount) ? 0 : imgCurrent+1;
}
setHeaderImg();

$('.credit').last().append(', ' + new Date().getFullYear());

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
				className = street.name.charAt(0) + (street.status ? ' ' + street.status : '');
				streetDetail += '<p class="street ' + className + '"><strong>' + street.name + ' (' + street.date + ')</strong><br>' + street.desc + '</p>';
			});
			$.each(json.streetNames.streetWip, function(i, street) {
				streetWip += '<span>' + street.name + ' (' + street.date + ')</span>';
			});
			$('#street-results').html(streetDetail);
			if (streetWip) $('#rsrchdesc').html(streetWip);
			else $('#rsrchdesc').text('Nothing - we are are up to date!');
			// index links and alphabetic dividers
			$('#street-index a').each(function() {
				const recs = $('.street.' + $(this).text()).length;
				if (!recs) $(this).remove();
				else {
					$('.street.' + $(this).text()).first().before('<div id="' + $(this).text() +'" class="divider" title="' + recs + ' record(s)">' + $(this).text() + '</div>');
					$(this).attr({ 'href': '#' + $(this).text(), 'title': recs + ' record(s)' });
				}
			});
			$('#street-filter-input').trigger('input');
			$('.divider').css('background-image', 'url(' + imgPath + '/div.png)');
			// cleaner url
			if (window.location.host === 'bexhill-osm.org.uk') {
				history.replaceState(null, null, '/streetnames' + window.location.hash);
				$('a').each(function() { if ($(this).attr('href').startsWith('#')) $(this).attr('href', '/streetnames' + $(this).attr('href')); });
			}
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
			$('#street-filter-close').on('click', function() { $('#street-filter-input').val('').trigger('input').trigger('focus'); });
		}
	});
});
