# CHANGELOG

## v1.7.0 - Wikimedia images

**Date:** 22/10/2016

Updated js
 - jQuery UI 1.12.1

Added js
 - jQuery MD5 1.2.1

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
 - Control.Geocoder 1.5.2
 - leaflet-routing-machine.min.js 3.2.0
 - Leaflet.contextmenu 1.0.1

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
 - jQuery Mobile 1.4.5

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
 - Leaflet.contextmenu
 - leaflet-routing-machine

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
 - jQuery UI
 - EasyAutocomplete
 
Site changes
 - New 'find interest' input that finds POIs based on keywords
 - Checkboxes briefly highlight when selected by 'find interest' or returning from link
 - Smaller screen devices hide sidebar instead of highlighting


## v1.0.0 - New Fork Bexhill-OSM

**Date:** 22/06/2016

Updated js
 - Leaflet 0.7.7
 - Sidebar-v2 0.3.0
 - FontAwesome 4.6.3
 - Control.Geocoder 1.5.1
 - URI.js 1.18.1
 - Mustache 2.2.1
 - leaflet-locatecontrol 0.52.0
 - jQuery 1.8.0

Added js
 - opening_hours.js
 - Leaflet.EasyButton

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
