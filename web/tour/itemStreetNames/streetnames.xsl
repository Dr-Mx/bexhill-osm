<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="book">
<html lang="en-GB">
<head>
	<!-- Display, social network, search index info -->
	<meta charset="UTF-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<meta name="description" content="The history of Bexhill-on-Sea's street and road names."/>
	<meta name="author" content="Bexhill Museum Local History Study Group"/>
	<meta name="color-scheme" content="only light"/>
	<meta name="twitter:site" content="@BexhillOSM"/>
	<meta name="twitter:creator" content="@BexhillOSM"/>
	<meta name="twitter:image" content="https://bexhill-osm.org.uk/assets/img/og-image.jpg"/>
	<meta property="og:url" content="https://bexhill-osm.org.uk/streetnames"/>
	<meta property="og:title" content="The Story of Bexhill Street Names | Bexhill-OSM"/>
	<meta property="og:description" content="The history of Bexhill-on-Sea's street and road names."/>
	<meta property="og:image" content="https://bexhill-osm.org.uk/assets/img/og-image.jpg"/>
	<meta property="og:type" content="website"/>
	<meta property="og:locale" content="en_GB"/>

	<!-- https://realfavicongenerator.net/ -->
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
	<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#a04900"/>
	<link rel="shortcut icon" href="/favicon.ico"/>
	<meta name="theme-color" content="#a04900"/>

	<!-- CSS -->
	<link rel="stylesheet" href="streetnames.css"/>

	<title>The Story of Bexhill Street Names | Bexhill-OSM</title>
</head>

<body>
	<img id="header" src="street.png"/>
	<div id="btnTheme" title="Dark/Light Theme">
		<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M 12.5 3.332031 C 9.515625 5.25 7.5 8.632812 7.5 12.5 C 7.5 16.367188 9.515625 19.75 12.550781 21.667969 C 7.433594 21.667969 3.332031 17.566406 3.332031 12.5 C 3.332031 7.4375 7.4375 3.332031 12.5 3.332031 M 31.785156 5.832031 L 34.167969 8.214844 L 8.214844 34.167969 L 5.832031 31.785156 L 31.785156 5.832031 M 21.484375 9.882812 L 19.015625 8.332031 L 16.617188 10 L 17.316406 7.167969 L 15 5.398438 L 17.917969 5.199219 L 18.882812 2.449219 L 20 5.167969 L 22.882812 5.214844 L 20.632812 7.101562 L 21.484375 9.882812 M 15.984375 15.898438 L 14.050781 14.683594 L 12.183594 15.984375 L 12.75 13.785156 L 10.933594 12.398438 L 13.199219 12.25 L 13.949219 10.101562 L 14.800781 12.214844 L 17.066406 12.265625 L 15.316406 13.714844 L 15.984375 15.898438 M 31.667969 22.5 C 31.667969 27.5625 27.5625 31.667969 22.5 31.667969 C 20.464844 31.667969 18.582031 31 17.066406 29.882812 L 29.882812 17.066406 C 31 18.582031 31.667969 20.464844 31.667969 22.5 M 24.332031 33.464844 L 28.949219 31.550781 L 28.550781 37.132812 L 24.332031 33.464844 M 31.550781 28.964844 L 33.464844 24.351562 L 37.132812 28.582031 L 31.550781 28.964844 M 33.464844 20.699219 L 31.566406 16.066406 L 37.132812 16.464844 L 33.464844 20.699219 M 16.050781 31.550781 L 20.667969 33.464844 L 16.449219 37.117188 Z M 16.050781 31.550781"/></svg>
	</div>
	<h1><xsl:value-of select="info/title"/></h1>
	<div id="intro">
		<p>In 1996 the Bexhill Museum Association published the first-ever attempt to explain how Bexhill-on-Sea’s street and road names had been acquired. That work was carried out by the Museum’s Local History Forum led by Alan Beecher.</p>
		<p>The 2014 second edition was put together by the Museum’s Local History Study Group led by Dr. Paul Wright. It started to include details of street names which no longer existed and some place names often found on maps. Dates of when a street first appears and adoption dates (where available) are now recorded.</p>
		<p>This online edition is being updated regularly with all new roads and streets. If you have any additional information, suggestions or corrections, please email <a href="mailto:info@bexhill-osm.org.uk">info@bexhill-osm.org.uk</a>.</p>
		<p>Please note, many of these street names are neologisms, in other words they have simply been made up by the builder or developer. These can be difficult to identify or locate official documentation for - we accept we may have missed some or misinterpreted others.</p>
		<p class="credit">Alan Beecher, Bexhill Museum’s Local History Forum, 1996</p>
		<p class="credit">Dr. Paul Wright, Bexhill Museum's Local History Study Group, 2014</p>
		<p class="credit">Alexis Markwick, Bexhill OpenStreetMap, 2022</p>
	</div>
	<ul id="anchorLinks">
		<li><a data-link="#wip">Work in Progress</a></li>
		<li><a data-link="#app">Appendix</a></li>
		<li><a data-link="#sou">Sources</a></li>
	</ul>
	<hr/>
	<div id="street-index"><a>B</a><a>C</a><a>D</a><a>E</a><a>F</a><a>G</a><a>H</a><a>I</a><a>J</a><a>K</a><a>L</a><a>M</a><a>N</a><a>O</a><a>P</a><a>Q</a><a>R</a><a>S</a><a>T</a><a>U</a><a>V</a><a>W</a><a>X</a><a>Y</a><a>Z</a></div>
	<div id="street-filter">
		<input id="street-filter-in" type="text" placeholder="Enter a street name or year"/><span id="street-filter-cl"></span>
		<p id="street-results"></p>
	</div>
	<div id="streetNames"><xsl:for-each select="streetNames/street"><xsl:sort select="name"/>
		<xsl:element name="p"><xsl:attribute name="class"><xsl:value-of select="concat('street', ' ', substring(name/text(),1,1), ' ', class)"/></xsl:attribute>
		<strong><xsl:value-of select="name"/> (<xsl:value-of select="date"/>)</strong><br/>
		<xsl:value-of select="desc"/></xsl:element>
	</xsl:for-each><a id="anchor" title="Return to top"></a></div>
	<p id="endresults">END OF RESULTS</p>
	<div id="outro">
		<hr/>
		<h2 id="wip">Work in Progress</h2>
		Some of these roads may still be under construction. If you can help with dates/descriptions, let us know.
		<p><xsl:for-each select="streetNames/newstreet"><xsl:sort select="name"/><xsl:value-of select="name"/>; </xsl:for-each></p>
		<hr/>
		<h2 id="app">Appendix</h2>
		<p><a href="https://www.rother.gov.uk/wp-content/uploads/2021/01/Street_Naming__Numbering_Policy_Published_Version.pdf" target="_blank" rel="noopener">Rother District Council - Street Naming and Property Numbering Policy</a> (2020, pdf)</p>
		<p><a href="https://battlehistorysociety.com/Road%20Names/" target="_blank" rel="noopener">The Battle and District Historical Society Road Names Project</a> (website)</p>
		<p>The routes and numbers of various trunk and county roads through Bexhill have changed over the years. Four examples are included here for comparison and interest:</p>
		<strong>1930</strong>
		<ul>
			<li>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</li>
			<li>A269 - Chantry Lane, Holliers Hill and Ninfield Road to Lunsford Cross.</li>
			<li>A270 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</li>
			<li>B2098 - (Upper Sea Road), Station Road, Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</li>
			<li>B2099 - Lower Station Road (London Road).</li>
		</ul>
		<strong>1956</strong>
		<ul>
			<li>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</li>
			<li>A269 - Chantry Lane, Holliers Hill and Ninfield Road to Lunsford Cross.</li>
			<li>A270 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</li>
			<li>B2098 - Upper Sea Road, Station Road, Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</li>
			<li>B2099 - London Road.</li>
			<li>B2182 - Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</li>
		</ul>
		<strong>1973</strong>
		<ul>
			<li>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</li>
			<li>A269 - Dorset Road, Magdalen Road, Upper Sea Road, Station Road, Buckhurst Place, London Road and Ninfield Road to Lunsford Cross.</li>
			<li>A2036 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</li>
			<li>B2078 - Chantry Lane and Holliers Hill.</li>
			<li>B2098 - Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</li>
			<li>B2182 - Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</li>
		</ul>
		<strong>2011</strong>
		<ul>
			<li>A259 - Barnhorn Road, Little Common Road, King Offa Way, De La Warr Road and Bexhill Road.</li>
			<li>A269 - Dorset Road, Magdalen Road, Upper Sea Road, Buckhurst Road, London Road and Ninfield Road to Lunsford Cross.</li>
			<li>A2036 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</li>
			<li>B2098 - Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</li>
			<li>B2182 - Holliers Hill, Chantry Lane, High Street, Upper Sea Road, Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</li>
		</ul>
		<hr/>
		<h2 id="sou">Sources</h2>
		<ul>
			<li>Bartley, L J. The Story of Bexhill. Parsons, 1971.</li>
			<li>Mawer, A and Stenton, F M. The Place-Names of Sussex, Part 2. Cambridge University Press, 1969.</li>
			<li>Mills, A D. Dictionary of English Place-Names. Oxford University Press, 1998.</li>
			<li>Porter, Julian. Bexhill-on-Sea, A History. Phillimore, 2004.</li>
			<li>Room, Adrian. The Street Names of England. Paul Watkins, 1992.</li>
			<li>Bexhill Census returns, 1841 to 1911</li>
			<li>Bexhill Street Directories 1890 to 1974</li>
			<li>Maps in Bexhill Museum and Bexhill Library</li>
			<li>East Sussex Records Office</li>
			<li>Margaret Cullingworth for her knowledge of Sidley</li>
		</ul>
	</div>
	<script src="../../assets/js/plugins/jquery.min.js"></script>
	<script>
		if (window.location.hash === '#darkMode' || (!window.location.hash &amp;&amp; window.matchMedia('(prefers-color-scheme: dark)').matches)) $('html').addClass('darkMode');
		if (window.location.hash) $('#btnTheme').hide();
		if (window.location.host === 'bexhill-osm.org.uk') history.replaceState(null, null, '/streetnames');
		$(document).ready(function() {
			$('#btnTheme').on('click', function() { $('html').toggleClass('darkMode'); });
			$('#anchorLinks a').on('click', function() { $($(this).data('link')).prev()[0].scrollIntoView({ behavior: 'smooth' }); });
			$('#street-index a').each(function() {
				if ($('.street.' + $(this).text()).first().length === 0) $(this).hide();
				$(this).on('click', function() {
					if ($('.street.' + $(this).text()).first().length) $('.street.' + $(this).text()).first()[0].scrollIntoView({ behavior: 'smooth' });
				});
			});
			$('#street-filter-in').on('keyup', function() {
				$('.street strong').each(function() {
					if ($(this).text().toLowerCase().indexOf($('#street-filter-in').val().toLowerCase()) > -1) $(this).parent().show();
					else $(this).parent().hide();
				});
				$('#street-results').html($('.street:visible').length + ' of ' + $('.street').length + ' records shown');
				if ($(this).val().length > 0) $('#street-filter-cl').show();
				else $('#street-filter-cl').hide();
				if ($('.street:visible').length > 10) $('#anchor').show();
				else $('#anchor').hide();
			});
			$('#street-filter-cl').on('click', function() { $('#street-filter-in').val('').trigger('keyup').focus(); });
			$('#anchor').on('click touchstart', function() { $('#street-index').prev()[0].scrollIntoView({ behavior: 'smooth' }); });
			$('#street-filter-in').trigger('keyup');
		});
	</script>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
