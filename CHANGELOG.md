# CHANGELOG

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
