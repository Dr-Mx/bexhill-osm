<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="book">
<html lang="en">
<head>
	<title>Bexhill OpenStreetMap: The Story of Bexhill Street Names</title>

	<!-- Display, social network, search index info -->
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<meta name="description" content="How Bexhill-on-Sea's street and road names came to be, and the history behind them."/>
	<meta name="author" content="Dr Paul Wright"/>
	<meta name="twitter:site" content="@BexhillOSM"/>
	<meta name="twitter:creator" content="@BexhillOSM"/>
	<meta name="twitter:image" content="https://bexhill-osm.org.uk/assets/img/og-image.jpg"/>
	<meta property="og:url" content="https://bexhill-osm.org.uk/streetnames"/>
	<meta property="og:title" content="Bexhill OpenStreetMap: The Story of Bexhill Street Names"/>
	<meta property="og:description" content="How Bexhill-on-Sea's street and road names came to be, and the history behind them."/>
	<meta property="og:image" content="https://bexhill-osm.org.uk/assets/img/og-image.jpg"/>
	<meta property="og:type" content="website"/>
	<meta property="og:locale" content="en_GB"/>

	<!-- https://realfavicongenerator.net/ -->
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
	<link rel="manifest" href="/manifest.json"/>
	<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#b05000"/>
	<link rel="shortcut icon" href="/favicon.ico"/>
	<meta name="theme-color" content="#b05000"/>

	<!-- CSS -->
	<link rel="stylesheet" href="streetnames.css"/>
</head>
<body>
	<img id="header" src="street.png"/>
	<h1><xsl:value-of select="copyright/name"/></h1>
	<div id="intro">
	<p>In 1996 the Bexhill Museum Association published the first-ever attempt to explain how Bexhill-on-Sea’s street and road names had been acquired. That work was carried out by the Museum’s Local History Forum led by Alan Beecher. Eighteen years later their successors, the Local History Study Group, feel it was time for a second edition. We have drawn heavily on the work of our predecessors as well as including new research of our own. We have used the 1902 Borough of Bexhill boundary to define our study area but eagle-eyed readers will recognise that we have very occasionally crossed the border into neighbouring territory.</p>
	<p>In this edition we have also included details of street names which no longer exist but which researchers may come across on old maps or in the early censuses and street directories. Also included are some old and new place names which have yet to be associated with specific street names but which nonetheless are often found on maps eg. The Honies and Polegrove. We have used 1841 as our starting year as this coincides with the first national census. Another important date is 1886 when the first local street directory was published for Bexhill. Also an attempt has been made using the local street directories to include the date when a street first appears in the records. The date recorded is usually when property, houses or businesses were built on that street rather than when the street was laid out, and often named, which could be a few years earlier. It must also be appreciated that houses were often built in phases along a street rather than all at the same time. These dates have proved more difficult to obtain after the street directories ceased publication in 1974. The date of adoption of the street by the Borough of Bexhill, or later by Rother District Council, has also been included, when available.</p>
	<p>When consulting the early maps, census returns and street directories a significant number of inconsistencies of both names, dates and descriptions have been discovered, including some street names which have only been seen once, so a pragmatic approach has had to be adopted in this edition. As in most cities, towns and villages there are street names which are neologisms, in other words they have simply been made up by the builder or developer. In hindsight these can be difficult to identify and we accept we may have missed some or misinterpreted others. We have also found it very difficult to locate official documentation to help us discover the approved origin of many of the town’s street names. Hence some of the entries in this edition are, at best, informed guesswork. We hope our readers will understand and accept our difficulties.</p>
	<p>We would like to thank the many individuals who have helped us with the preparation of this new addition especially Julian Porter, Curator at Bexhill Museum, his staff and many museum volunteers and supporters as well as members of the public. Margaret Cullingworth has been particularly helpful with information regarding the streets around Sidley. Any errors are entirely our own responsibility. Finally we hope you enjoy reading the fruits of our endeavours.</p>
	<p class="credit">&#169; <xsl:value-of select="copyright/author"/></p>
	<p>This online edition is being currently being developed and updated with new roads and streets. If you have any additional information, suggestions or corrections, please contact <a href="mailto:info@bexhill-osm.org.uk">info@bexhill-osm.org.uk</a>.</p>
	<p class="credit">&#169; Alexis Markwick, Bexhill-OSM, 2020</p>
	</div>
	<hr/>
	<div id="street-filter"><input id="street-filter-in" type="text" placeholder="Enter a street name or year"/><span id="street-filter-cl"></span>
	<p id="street-results"></p></div>
	<div id="streetNames"><xsl:for-each select="streetNames/street"><xsl:sort select="name"/>
		<p class="street"><b><xsl:value-of select="name"/> (<xsl:value-of select="date"/>)</b><br/>
		<xsl:value-of select="desc"/></p>
	</xsl:for-each><a id="anchor"></a></div>
	<p id="endresults">END OF RESULTS</p>
	<hr/>
	<div id="outro">
	<h2>Work in Progress</h2>
	<p><xsl:for-each select="streetNames/newstreet"><xsl:sort select="name"/><xsl:value-of select="name"/>; </xsl:for-each></p>
	<hr/>
	<h2>Appendix</h2>
	<p>The routes and numbers of various trunk and county roads through Bexhill have changed over the years. Four examples are included here for comparison and interest.</p>
	<p><b>1930</b><br/>
	<span>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</span><br/>
	<span>A269 - Chantry Lane, Holliers Hill and Ninfield Road to Lunsford Cross.</span><br/>
	<span>A270 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</span><br/>
	<span>B2098 - (Upper Sea Road), Station Road, Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</span><br/>
	<span>B2099 - Lower Station Road (London Road).</span><br/></p>
	<p><b>1956</b><br/>
	<span>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</span><br/>
	<span>A269 - Chantry Lane, Holliers Hill and Ninfield Road to Lunsford Cross.</span><br/>
	<span>A270 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</span><br/>
	<span>B2098 - Upper Sea Road, Station Road, Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</span><br/>
	<span>B2099 - London Road.</span><br/>
	<span>B2182 - Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</span><br/></p>
	<p><b>1973</b><br/>
	<span>A259 - Barnhorn Road, Little Common Road, Belle Hill, High Street, De La Warr Road and Hastings Road.</span><br/>
	<span>A269 - Dorset Road, Magdalen Road, Upper Sea Road, Station Road, Buckhurst Place, London Road and Ninfield Road to Lunsford Cross.</span><br/>
	<span>A2036 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</span><br/>
	<span>B2078 - Chantry Lane and Holliers Hill.</span><br/>
	<span>B2098 - Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</span><br/>
	<span>B2182 - Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</span><br/></p>
	<p><b>2011</b><br/>
	<span>A259 - Barnhorn Road, Little Common Road, King Offa Way, De La Warr Road and Bexhill Road.</span><br/>
	<span>A269 - Dorset Road, Magdalen Road, Upper Sea Road, Buckhurst Road, London Road and Ninfield Road to Lunsford Cross.</span><br/>
	<span>A2036 - Wrestwood Road and Hastings Road to Glyne Gap roundabout.</span><br/>
	<span>B2098 - Buckhurst Place, Terminus Road, Collington Avenue and Sutherland Avenue.</span><br/>
	<span>B2182 - Holliers Hill, Chantry Lane, High Street, Upper Sea Road, Sea Road, Marina, West Parade, Richmond Road, Cooden Drive and Cooden Sea Road.</span></p>
	<hr/>
	<h2>Sources</h2>
	<span>Bartley, L J. The Story of Bexhill. Parsons, 1971.</span><br/>
	<span>Mawer, A and Stenton, F M. The Place-Names of Sussex, Part 2. Cambridge University Press, 1969.</span><br/>
	<span>Mills, A D. Dictionary of English Place-Names. Oxford University Press, 1998.</span><br/>
	<span>Porter, Julian. Bexhill-on-Sea, A History. Phillimore, 2004.</span><br/>
	<span>Room, Adrian. The Street Names of England. Paul Watkins, 1992.</span><br/>
	<span>Bexhill Census returns, 1841 to 1911</span><br/>
	<span>Bexhill Street Directories 1890 to 1974</span><br/>
	<span>Maps in Bexhill Museum and Bexhill Library</span><br/>
	<span>East Sussex Records Office</span>
	</div>
	<hr/>
	<script src="../js/plugins/jquery.min.js"></script>
	<script>
	$(document).ready(function() {
		$('#street-filter-in').on('keyup', function() { if ($('#street-filter-in').val().length >= 3 || $('#street-filter-in').val().length === 0) {
			$('.street b').each(function() {
				if ($(this).text().toLowerCase().indexOf($('#street-filter-in').val().toLowerCase()) > -1) $(this).parent().show();
				else $(this).parent().hide();
			});
			$('#street-results').html($('.street:visible').length + ' of ' + $('.street').length + ' records shown');
			if ($('.street:visible').length > 10) $('#anchor').show();
			else $('#anchor').hide();
		} });
		$('#street-filter-cl').on('click', function() { $('#street-filter-in').val('').trigger('keyup'); });
		$('#street-filter-cl').trigger('click');
		history.replaceState(null, null, '../../streetnames');
		$('#anchor').on('click touchstart', function() {
			$('html, body').stop().animate({ scrollTop: $('#street-filter').offset().top - 25 }, 500);
		});
	});
	</script>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
