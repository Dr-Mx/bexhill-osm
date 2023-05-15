// the story of bexhill street names

// open with random header image
const imgPath = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/img', imgCount = 15;
let imgCurrent = Math.round(Math.random() * imgCount);
function setHeaderImg() {
	$('#header').attr({
		src: imgPath + '/street' + imgCurrent + '.jpg',
		title: 'Image ' + (imgCurrent+1) + ' of ' + (imgCount+1)
	});
	imgCurrent = (imgCurrent === imgCount) ? 0 : imgCurrent+1;
}
setHeaderImg();

// darkmode
if (window.location.hash === '#darkMode' || (!window.location.hash && window.matchMedia('(prefers-color-scheme: dark)').matches)) $('html').addClass('darkMode');
if (window.location.hash) $('#btnTheme').hide();

$(document).ready(function() {
	// cleaner url
	if (window.location.host === 'bexhill-osm.org.uk') history.replaceState(null, null, '/streetnames');
	$('.credit').last().append(', ' + new Date().getFullYear());
	if ($('#wipdesc').text()) $('#wipdesc').text($('#wipdesc').text().replace(/; $/, '.'));
	else $('#wip').next('p').text('Nothing - we are are up to date!');
	$('#btnTheme').on('click', function() { $('html').toggleClass('darkMode'); });
	// index links and alphabetic dividers
	$('#links a').on('click', function() { $($(this).data('link'))[0].scrollIntoView({ behavior: 'smooth' }); });
	$('#street-index a').each(function() {
		if (!$('.street.' + $(this).text()).length) $(this).remove();
		else $('.street.' + $(this).text()).first().before('<div class="divider ' + $(this).text() + '">' + $(this).text() + '</div>');
		$(this).on('click', function() { $('.divider.' + $(this).text())[0].scrollIntoView({ behavior: 'smooth' }); });
	});
	// text filter
	$('#street-filter-in').on('input', function() {
		$('.street strong').each(function() {
			if ($(this).text().toLowerCase().indexOf($('#street-filter-in').val().toLowerCase()) > -1) $(this).parent().show();
			else $(this).parent().hide();
		});
		$('#street-results').html($('.street:visible').length + ' of ' + $('.street').length + ' records shown');
		if ($(this).val().length > 0) {
			$('#street-filter-cl').show();
			$('.divider').hide();
		}
		else {
			$('#street-filter-cl').hide();
			$('.divider').show();
		}
	});
	$('.divider').css('background-image', 'url(' + imgPath + '/div.png)');
	$('#street-filter-in').trigger('input');
	$('#street-filter-cl').on('click', function() { $('#street-filter-in').val('').trigger('input').focus(); });
	// anchor
	$('#anchor').on('click', function() { $('#links')[0].scrollIntoView({ behavior: 'smooth' }); });
	$(window).scroll(function() {
		if ($(this).scrollTop() > 1000) $('#anchor').show();
		else $('#anchor').fadeOut(200);
	});
});
