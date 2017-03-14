# CHANGELOG

## v2.6.0 - Update POI markers

**Date:** 14/03/2017

Updated js
 - leaflet.contextmenu.min.js 1.3.0

Site changes
 - Updated POI markers with solid colours, rearranged categories, hide checkbox controls
 - Allow sidebar to remain closed from permalink
 - Bugfix where chrome was confused with safari when adjusting iframe
 - Bugfix where popup width wasn't being set correctly


## v2.5.1

**Date:** 08/03/2017

Site changes
 - Fixed a bug when looking up generic poi
 - Minimap interaction automatically closes sidebar on mobile devices


## v2.5.0 - Bounce markers

**Date:** 08/03/2017

Added js
 - bouncemarker-min.js 1.0

Site changes
 - Markers selected through group POIs now bounce on selection
 - Count number of POIs on the map are now displayed in an overlay control
 - Moved overpass error messages to an overlay control
 - Added Bing satellite overlay
 - Redirect access to tour pages to iframe (checkframe.js)
 - Support comments in opening hours
 - Cleaned up some css


## v2.4.0 - Street history

**Date:** 22/02/2017

Updated js
 - opening_hours+deps.min.js 3.5.0
 - URI.js 1.18.7

Site changes
 - Use XML street history data from Bexhill Museum for displaying information on highways
 - Different levels of lookup on context menu depending on zoom level - area / street / place
 - Centre map option on context menu
 - Added some custom icons for streets / houses / apartments / construction
 - Included icons in autocomplete categories
 - Cleaned up some class names and css


## v2.3.0 - Highlight selected object

**Date:** 11/02/2017

Updated js
 - URI.js 1.18.6

Added js
 - leaflet-osm.js 0.1.0

Site changes
 - Render polygons over selected osm objects on popup
 - Removed some unnecessary variables using Util.Templates
 - Merged 'listed_status' and 'HEref' tags into one label
 - Tooltips now include objects name if it exists
 - Remove country-code from phone numbers if user is local
 - Renamed 'improve map' to 'report problem' on context menu
 - Changed middle-click to only action on map layer


## v2.2.0 - Contact Parser

**Date:** 25/01/2017

Updated js
 - URI.js 1.18.5
 - leaflet-routing-machine.min.js 3.2.5

Site changes
 - Added contact parser to show email, facebook and twitter as icons
 - Added own custom tile base layer
 - Historic Tour article
 - Mobile devices get an additional zoom level to search data
 - Loading screen
 - Some css tidying


## v2.1.2

**Date:** 25/01/2017

Updated js
 - leaflet.js 1.0.3

Site changes
 - Merged guest_house and hotel pois
 - Set theme colour in css


## v2.1.1

**Date:** 24/01/2017

Updated js
 - jquery.easy-autocomplete.min.js

Site changes
 - Fixed a bug where keypresses on autocomplete input weren't being recognised on some mobile devices
 - Added a custom font for sidebar tab titles
 - Spinner shows for initial website load


## v2.1.0 - Food Hygine Rating Standards API

**Date:** 21/01/2017

Updated js
 - opening_hours+deps.min.js
 - Control.Loading.js 0.1.24
 - jQuery UI (removed unnecessary component)

Site changes
 - Display FHRS ratings through api
 - Lots of CSS changes, added hover on some elements and better fitting on mobile devices
 - Moved callback function to tag-parsers.js
 - Tooltips and Titles for POI are more descriptive
 - POI names are displayed in header of popups
 - Changed ice-cream POI to show items with ice_cream=yes
 - Couple more Historic Tour articles


## v2.0.0 - Historic Tour

**Date:** 04/01/2017

Updated js
 - Minified all plugins

Site changes
 - Re-write of creating POI checkbox tables, now a single tab with page jump links.  Complete automated import from pois-types.js
 - Changed URL encoding to not use unsafe characters and less parameters, old links will no longer work.
 - Added a Historic Tour tab. Contains controls linking to an iframe containing various articles that interact with the map
 - Suggested walks now use switch statement
 - Wikipedia images now display proper attribution through their api
 - Added 'shelter' POI
 - Customised 404 page
 - Various code improvements


 ## v1.7.3

**Date:** 07/12/2016

Updated js
 - URI.js 1.18.3
 - leaflet.js 1.0.2

Site changes
 - Added xmas decorations that appear mid November - end December
 - Swapped church icon used for 'place of worship' with prayer icon
 - Expanded 'Attraction' POI to include more places
 - New 'Wiki Photos' POI
 - Now using historicengland.org.uk for listed buildings
 - Optional 'Hillshading' overlay
 - Minimap update


## v1.7.2

**Date:** 11/11/2016

Updated js
 - mustache.min.js removed

Site changes
 - Debug mode, type 'siteDebug = true' in console to see current data requests
 - Improvement for keeping popups on mobile within screen
 - Replaced mustache with leaflet's L.Util.template


## v1.7.1

**Date:** 26/10/2016

Updated js
 - opening_hours.js

Site changes
 - Fix for calculating opening hours
 - Amended a walk to show related info boards


## v1.7.0 - Wikimedia images

**Date:** 22/10/2016

Updated js
 - jquery-ui.min.js 1.12.1

Added js
 - jquery.md5.min.js 1.2.1

Site changes
 - Support for Wikimedia images using 'image=File:example.jpg' tag
 - Expandable opening hours table with next open/close time
 - Compressed all png files using compresspng.com


## v1.6.0 - Permalinking for walks and reverse lookups

**Date:** 15/10/2016

Updated js
 - leaflet-routing-machine.min.js 3.2.4

Site changes
 - Added permalinking to walking routes and markers found with reverse lookup
 - Reverse lookups that have no group poi now use generic_poi_parser
 - Adding walking points is one context-menu option now
 - New green waypoint markers for walking points
 - Made facility_parser icons colour coded (green - yes, red - no)
 - More code tidying


## v1.5.0 -  Address Search Reverse Lookup

**Date:** 09/10/2016

Updated js
 - leaflet.js 1.0.1 (moved back to hosted)
 - Control.Geocoder.js 1.5.2
 - leaflet-routing-machine.min.js 3.2.0
 - leaflet.contextmenu.js 1.0.1

Site changes
 - Reverse lookup now works for 'Find address' button
 - Recoded some parsers to get relevant labels from tags rather than code
 - Added parser for Food Hygine ids, facility parser shows useful icons
 - Disable caching


## v1.4.0 - Leaflet 1.0

**Date:** 01/10/2016

Updated js
 - leaflet.js 1.0.0
 - Control.Loading.js 0.1.23
 - easy-button.js 1.3.1
 - leaflet-routing-machine.min.js 3.1.2

Site changes
 - Removed leaflet.label.js and replaced with leaflet's built-in version
 - Added scale to map
 - Made middle-mouse button a shortcut to lookup
 - Added surveillance, school, rental apartment pois and parsers
 - Use new flyTo, instead of setView for minimap


## v1.3.1 - Edit on OSM

**Date:** 07/09/2016

Site changes
 - Added link to edit selected POI on OSM
 - Combined some functions and other code tidying


## v1.3.0 - Reverse Lookup

**Date:** 17/08/2016

Site changes
 - Added 'Lookup' to context-menu, allowing users to view individual POIs
 - If POI is not found, returns geocoder for address
 - Added some status code messages to overpass if there was an error
 - Reformatted address parser
 - Added pub, hairdresser, clothes parsers
 - Added Facebook links
 - Tidy up of code using JSLint


## v1.2.3 - Smooth Scrolling

**Date:** 10/08/2016

Updated js
 - Control.Loading.js 0.1.22
 - mustache.js > mustache.min.js

Site changes
 - Page anchors now smooth scroll
 - Added help and information menu anchors
 - Context menu 'improve map' option opens osm.org and creates note
 - Separate beauty and hairdresser pois
 - Replaced toilet_parser with gender_parser
 - Delay added to image-map-resizer to accommodate sidebar opening
 - Cleaned up some code where 'name' was used instead of 'id'


## v1.2.2 - Minimap

**Date:** 04/08/2016

Updated js
 - jquery-sidebar.min.js (changed to jquery minified version)
 - leaflet.js (moved to local, added exception that would cause firefox mobile to break sidebar)

Added js
 - imageMapResizer.min.js

Site changes
 - Clickable minimap to jump between suburbs
 - 'Open now' checkbox with permalink
 - New parsers for payment, diet and social_facility
 - Thunderforest api key
 - Replaced some images with cleaner ones


## v1.2.1 - Basemap Layer Permalink

**Date:** 27/07/2016

Updated js
 - jQuery 2.2.4 (downgraded for jquery mobile support)

Added js
 - jquery.mobile.custom.min.js 1.4.5

Site changes
 - Basemap layer connected to url on permalink
 - New favicons
 - Swipe away sidebar with mobile
 - Sidebar headers are now in fixed position
 - Right-click on 'clear map' completely reloads page to defaults
 - Parsing on pois 'dog', 'wheelchair', 'bathroom'
 - More global variables on site.js
 - Various cosmetic changes to try and be consistent on more browsers


## v1.2.0 - Walking routes update

**Date:** 15/07/2016

Updated js
 - opening_hours.js (reverted to local hosted due to stablility issues)
 - OverPassLayer.js 1.0.2
 - URI.js 1.18.1
 - jQuery UI 1.12.0

Added js
 - leaflet.contextmenu.js
 - leaflet-routing-machine.js

Site changes
 - New walking directions tab
 - Suggested walks
 - Map context menu to drop direction markers
 - Reduced and removed some unnecessary images and icons
 - Set some global variables at top of site.js
 - Spinner gets reset on clear map
 - Url hash now keeps map position and tab
 - Improve Map - links to osm's add note to map


## v1.1.1 - opening_hours.js update

**Date:** 05/07/2016

Updated js
 - opening_hours.js (now remote hosted)

Site changes
 - Fixed some POIs not parsing title tag correctly
 - Top/bottom jumps links on all POI tabs (easier for smaller mobile devices)


## v1.1.0 - Find Interest Input

**Date:** 01/07/2016

Updated js
 - jQuery 3.0.0
 
Added js
 - jquery-ui.min.js
 - jquery.easy-autocomplete.js
 
Site changes
 - New 'find interest' input that finds POIs based on keywords
 - Checkboxes briefly highlight when selected by 'find interest' or returning from link
 - Smaller screen devices hide sidebar instead of highlighting


## v1.0.0 - New Fork Bexhill-OSM

**Date:** 22/06/2016

Updated js
 - leaflet.js 0.7.7
 - Sidebar-v2 0.3.0
 - FontAwesome 4.6.3
 - Control.Geocoder.js 1.5.1
 - URI.js 1.18.1
 - mustache.js 2.2.1
 - leaflet-locatecontrol 0.52.0
 - jQuery 1.8.0

Added js
 - opening_hours.js
 - easy-button.js

Site changes
 - Restrict map area to bounds
 - Many new poi icons added, grouped and colour coded
 - Poi icons are now divided into tabs
 - Maximum 3 pois can be selected at a time
 - Clear poi checkboxes on tab change
 - Extra zoom levels
 - Permalink button
 - Clear map button
 - Narrower tab bar on mobile devices
 - Geocoder only searches area in bounds
 - Geocoder highlights area on result
 - 'Spinner' uses FontAwesome icons

Added additional parsing for the following tags:
 - addr:housename
 - facebook
 - email
 - wikipedia
 - school / college
 - cafe / fast_food / restaurant
 - taxi
 - recycling
 - car_parking
 - bicycle_parking
 - healthcare
 - defibrillator
 - toilets
 - artwork
 - historic
 - wheelchair
 - information
 - description
 - opening_hours
