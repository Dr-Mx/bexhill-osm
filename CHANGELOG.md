# CHANGELOG

## v5.9.0 - OSM Notes

**Date:** 20/09/2020

Updated js
 - leaflet.js 1.7.1
 - jquery.js 3.5.1 
 - L.Control.Locate.min.js 0.72.1
 
Site changes
 - Show OSM notes and comment history
 - Added OpenCageData server for reverse lookups
 - Notification icon to history tour if user opens historic overlay and sidebar closed from link
 - Then and Now slideshow can now be any number of images
 - Setting option to use Google Street View as default
 - YouTube contact links for POIs
 - Add contrast to Lidar layer


## v5.8.0 - Mapillary support

**Date:** 18/05/2020

Updated js
 - L.Control.Locate.min.js 0.72.0
 
Site changes
 - Right-click 'Panoramic view' opens a panoramic Mapillary Street Level iframe, if not found use Google Street View
 - Hide back-to-top anchor button when at top of tab
 - Replace loading spinner gif with svg
 - More uniform theme colour and add box-shadow on controls
 - Remodel streetnames xml/xsl book
 - Redo Tour references
 - ww2bombs renamed to ww2incidents
 - Tutorial modals remember which ones have been dismissed
 - As always, many other bug fixes and improvements


## v5.7.0 - Support for National Grid Refs

**Date:** 27/03/2020

Added js
 - geotools.min.js
 
Updated js
 - Control.Geocoder.min.js 1.12.0
 - L.Control.Locate.min.js 0.70.0
 
Site changes
 - Right-click on the map to directly copy coordinates (LatLng & NationalGridRef)
 - Direct links to property records on UK Land Registry
 - Pop-up image sizes slightly larger
 - Adjustment to location "what's around me" depending on accuracy
 - Use location.replace rather than src to change iframes (stops back button breaking things)
 - Reverse lookup server options in Development Tools
 - As always, many other bug fixes and improvements


## v5.6.0 - WW2 bomb-map timeline

**Date:** 29/01/2020

Site changes
 - Add a slider for WW2 bomb map showing timeline
 - Sort bomb map and arp shelter markers by date as default
 - Fix a bug in caching of requests
 - Better touch screen checks and experience
 - If location active show distance for all types of markers in POI results
 - Change diaper > changing_table
 - Add frozen_food to supermarkets
 - Add coast_guard to emergency
 - As always, many other bug fixes and improvements


## v5.5.3

**Date:** 06/12/2019

Updated js
 - leaflet.js 1.6.0

Site changes
 - Cleaner transitions
 - Removed some old POI parsers
 - Xmas update
 - Bug fixes and improvements


## v5.5.0 - Then and Now

**Date:** 31/08/2019

Site changes
 - Add a new tab for showing slideshows of images past and present
 - Experimental bounding using osm relation area
 - Rename tabs: POI > Places, Walking Routes > Walking, History Tour > History
 - Load website with location on by using 'loc' parameter
 - Don't show Food Hygiene Ratings on attic data
 - Larger and zoomable images in History tab


## v5.4.1 - Offset overlay

**Date:** 03/07/2019

Updated js
 - leaflet.wms.min.js (added load event)

Site changes
 - Set offsets of overlays using metres
 - Experimental dark theme


## v5.4.0 - Filter POIs

**Date:** 02/07/2019

Updated js
 - jQuery 3.4.1

Site changes
 - Filter list of POIs based on keyword input
 - Simplified message status box
 - Move bookmarks button to map control
 - Changed spinner to use background-image
 - Add 'noopener' to links
 - Updated icon for History Tour
 - As always, many other bug fixes and improvements


## v5.3.0 - Lightbox library

**Date:** 25/05/2019

Added js
 - jquery.fancybox.js

Updated js
 - leaflet.js 1.5.1
 - Control.Geocoder.min.js 1.7.0
 - leaflet-locatecontrol 0.67.0

Site changes
 - Replace window.open for lightbox library, opens popup images, 360 panoramas and tour videos as overlay
 - Added a URI query 'data' for custom Overpass queries (e.g bexhill-osm.org.uk?data=[fixme])
 - Better debug console messages
 - Added 1962 OS overlay
 - Support for 'hearing_impaired:induction_loop' tags for facilities parser
 - Always many other bug fixes and improvements


## v5.2.0 - Single click reverse-lookup

**Date:** 26/04/2019

Updated js
 - imageMapResizer.min.js 1.0.10

Site changes
 - Edited status box control to display reverse-lookup information from photon.komoot.de when map is single clicked
 - Favourites renamed to Bookmarks
 - Highlights on sidebar now give a notification of the number of elements
 - Sandwich cuisine icon
 - Don't limit number of results for bus times
 - Cleaner booking.com affilation link


## v5.1.0 - Bookmark favourites

**Date:** 20/03/2019

Updated js
 - imageMapResizer.min.js 1.0.9
 - leaflet-locatecontrol 0.66.2
 - leaflet.contextmenu.min.js 1.5.1

Site changes
 - Ability to bookmark POIs (cached to localStorage)
 - Highlight Points of Interest sidebar tab if results shown
 - Highlight Walking Routes sidebar tab if directions shown
 - Historic Tour markers now show in POI list
 - Lightened sidebar colours slightly
 - Remove POI filter switch
 - Convert all Historic Tour markers to use geojson and function templates
 - Add photobooth POI
 - Generic shop icon


## v5.0.0 - Permalink for open popups

**Date:** 22/01/2019

Updated js
 - leaflet.js 1.4.0
 - bouncemarker-min.js 1.2.0

Site changes
 - Set a new sidebar width for smaller devices to avoid overlap obscuring the map too much
 - Combine guest_house, hotel, apartment, caravan_site to one POI
 - Add webcam POI
 - Icons for cemetery and speed_camera
 - Move osm update feed to osmcha api
 - Highlight POI in results list when opening popup
 - Open popups now permalink
 - Moved functions that didn't need to be globally accessible
 - Improved some error messages so they display in a leaflet control instead of alert
 - Cleaner return-to-top anchor points
 - Add new animations of clearing results and scrolling
 - As always, many other bug fixes and improvements


## v4.9.0 - Colour themes

**Date:** 14/12/2018

Updated js
 - leaflet-locatecontrol 0.65.1

Site changes
 - Global variables in CSS allow colour theme changes, for holiday seasons for example!
 - Expand / shrink images in popups by clicking, overlayed small zoom icon to show interaction
 - 'View image' link that opens popup images in a new window
 - Setting checkbox to expand images in popups by default
 - Better fullscreen detection for changing fullscreen button state
 - Additional 'clear' buttons to remove pois and walking directions separately
 - Larger FontAwesome icons shown popup/results
 - Icons for recycling types shown in popup/results
 - Icons for telephone box features shown in popup/results
 - Icons for bus-stop features shown in popup/results
 - Swapped key:social_centre for key:club in pois
 - Recreation poi now includes horse_riding and sports_centre
 - As always, many other bug fixes and improvements


## v4.8.0 - Cache API requests

**Date:** 23/11/2018

Site changes
 - Cache Overpass API requests to localStorage and memory
 - Cache OpenStreetMap API vectors to memory
 - Developer tool for setting localStorage duration (default 48hrs)
 - Keyword search for Historic Tour articles
 - Push map attribution link to sidebar
 - Use local navigator.language localisation
 - Hide developer tools for iFrames
 - Many other bug fixes and improvements


## v4.7.0 - Dynamic URI

**Date:** 15/10/2018

Site changes
 - Replace permalink button with a dynamic URI, permalink button removed
 - Add homepage weather api from openweathermap.org
 - Add more images for special holidays
 - Add public bookcase to library poi
 - Finally fix iFrame scrolling bug on some devices
 - Better tip navigation
 - Many other bug fixes and improvements


## v4.6.0

**Date:** 15/09/2018

Updated js
 - leaflet.js 1.3.4
 - Control.Geocoder.min.js 1.6.0

Site changes
 - Toggle overlay transparency with CTRL key
 - Support for using key:image and key:wikimedia_commons together
 - Historic Tour geojson WW2 air-raid shelter map
 - Change circles for icons on WW2 bomb map, resize on zoom
 - More dinosaur footprints
 - Remove inline Tour 'onclick' in favour of function
 - Many bug fixes and improvements


## v4.5.0 - Query features toggle

**Date:** 09/07/2018

Updated js
 - OverPassLayer.js [remove screen bounding box option]

Site changes
 - Query features toggle button to allow single clicking on map to get POI
 - Compress all POI icons
 - Add gender distinguishable hairdresser POI icons
 - Add Mexican restaurant POI icon
 - Historic tour article on OS Survey Points
 - Ability to swap POI images using mouse-wheel
 - Ability to download complete bounding box area from Overpass


## v4.4.0 - Tutorial modals

**Date:** 13/06/2018

Added js
 - leaflet.wms.min.js

Site changes
 - Added a function to show tutorial modals on selected elements, sets flag in localstorage not to be shown once dismissed
 - Option to get WMS overlays as one single tile
 - Ward boundaries POI
 - Update some fontawesome icons
 - Add a Normans Bay walk
 - Fix tooltips showing opening_hours colour
 - Option to keep tooltips permanent on certain POIs
 - Postbox parser showing colour depending on collection_times state
 - Single clicking map shows POI
 - Outline elements on POI load instead of popupopen
 - Open map-editor and improve-map links in modal window instead of _blank
 - Improve Overpass API queries
 - Sundial icon


## v4.3.0 - Traveline bus times

**Date:** 30/04/2018

Added js
 - config.js
 
Updated js
 - opening_hours+deps.min.js [removed other localisations]
 
Site changes
 - Get next bus times from NaPTAN codes on bus-stops using API from Traveline
 - Images show as thumbnails until hovered or tapped
 - Left single-click now does reverse lookup, with some workarounds to ignore double-clicks
 - Remove some unnecessary css filters causing slowdown
 - Move API keys to config.js file, see config.example.js
 - Add clearer error messages coming from the OverPassAPI
 - Support for images using [wikipedia_commons]
 - Added some generic templates for parsing data inside popups
 - Modified some POI queries to better filter results
 - Glazier POI
 - More improvements and fixes


## v4.2.0 - Attic data

**Date:** 02/04/2018

Updated js
 - jQuery 3.3.1
 - jquery.mobile.custom.min.js 1.5.0a
 - easy-button.min.js 3.0.0
 
Site changes
 - Larger overlay opacity slider with added close button
 - Show Overpass 'attic data' for a certain date in development options
 - Increase map padding area around bounds
 - Historic tour article on boundary stones


## v4.1.0 - 360 panoramas

**Date:** 13/02/2018

Updated js
 - URI.js 1.19.1

Site changes
 - Support for 360 panoramas [image:360] using wikimedia popup
 - Overlay opacity permalink
 - Group walks with a select list
 - Change POI table to use inline-block
 - Option to show only on most popular POI selections
 - Style checkboxes into switches
 - Map edit feed now links to OSMCha with an external website warning
 - Various other improvements


## v4.0.0 - Opening hours table

**Date:** 16/01/2018

Updated js
 - Control.Geocoder.js 1.5.8
 - leaflet.js 1.3.0

Site changes
 - Font Awesome 5
 - Complete week opening_hours table in popups
 - Extended minimap to new areas
 - Moved plugins to separate directory
 - Tooltips are coloured depending on opening_hours state
 - Customised loading spinner
 - Move overlay opacity slider to below layers list
 - Move FHRS ratings to popup header
 - More dynamic, flexible POI results list
 - Construction POI
 - Parsers for allotment, telephone, tap
 - Adjusted queries to only use specific elements (i.e. node, way) - more efficient for OverPass servers
 - Xmas related items
 - Smoother loading of tour iframes
 - Historic tour article on lost heritage
 - Various other improvements


## v3.2.0 - Permalink modal

**Date:** 07/10/2017

Updated js
 - Control.Geocoder.js 1.5.5
 - URI.js 1.19.0

Site changes
 - New modal to share permalink to clipboard in a click
 - Redesigned favicon
 - POI results list now shows items facilities
 - Loop gallery of images within popups
 - Improve POI tab population code
 - Add emergency & copyshop/printer POIs
 - Various other improvements


## v3.1.0 - Multiple images

**Date:** 30/08/2017

Updated js
 - URI.js 1.18.12
 - leaflet-locatecontrol 0.62.0
 - easy-button.min.js 2.2.2

Site changes
 - Tag support for multiple images (image_1, image_2, etc)
 - Tag support for url:booking-com and referrals
 - Tag support for fair_trade
 - Tag support for beer_garden
 - Full screen button
 - Centre map around POI results button
 - Shortcut keys - ctrl-f, alt-enter, ctrl-del
 - Mapbox API directions v5
 - Include golf courses under recreation areas
 - More uniform map loading spinner
 - OverPass requests now use a single BBOX in header
 - Disable POI checkboxes when performing a request
 - Map overlay permalink support
 - Show various website tips on home tab
 - Historic tour article on notable people
 - Various other improvements


## v3.0.0 - Settings tab

**Date:** 30/07/2017

Updated js
 - leaflet.js 1.1.0

Site changes
 - Rewrite of callback function to use switch cases
 - Show all POIs within map bounds by default
 - Settings tab: change system of unit, get results within screen bounds, hide images, adjust overlay opacity
 - Development tools: outputs debug information console, input custom overpass queries, change overpass server
 - listed_parser now parses data on architecture, architect and dates for all buildings
 - Added carshop_parser for various car services
 - Links to TheBexhillHistoryTrail on selected POIs
 - Community bus POI
 - Added a cross-origin server for food rating lookups on HTTPS
 - New sidebar icons
 - Custom POI icons for food cuisine and various other elements
 - Adjusted sidebar sizes slightly
 - Added Yeakell & Gardener 1776 overlay


## v2.10.0 - POI result list

**Date:** 02/06/2017

Site changes
 - Added list of results when selecting a group POI, colours show current open state. Mouse-over an item to see tooltip, click to open popup.
 - Removed 'facilities open right now' checkbox
 - Use alternative method to get thumbnail from wikimedia without MD5 plugin


## v2.9.0 - RSS feed of latest edits

**Date:** 22/05/2017

Site changes
 - Show latest edits on home tab through OSM's whodidit rss feed (simon04.dev.openstreetmap.org/whodidit)
 - Prevent map bouncing on bounds, add 10% padding to map, keep overpass queries within original bounds
 - Royal cypher parser for post-boxes
 - Add pop-up help section


## v2.8.0

**Date:** 04/05/2017

Updated js
 - easy-button.min.js 2.2.0

Site changes
 - Date parser for ISO 8601 (en-gb)
 - 'Get map link' changed to 'Share' button
 - Tour image layers can now be shared
 - Make a geocode query using a URI (e.g. '/?Q=bexhill police')
 - Can now geocode search using the autocomplete input by hitting enter
 - Changed wrongly named bounding box variables
 - Changed directory structure for Tour
 - Tour references now link and highlight on source page
 - Surveillance now includes speed cameras
 - Dog waste bin POI
 - Larger images for desktop users


## v2.7.0

**Date:** 08/04/2017

Updated js
 - URI.js 1.18.10
 - jquery-ui.min.js

Site changes
 - Renamed 'Lookup' to 'Query' (more in-line with osm.org)
 - Added 'Depends on' state for opening hours
 - social_facility, hotel, and general facility parser update
 - More descriptive looking icons
 - jQuery UI tooltip for sidebar tabs
 - Use window.ontouchstart instead of L.Browser.touch to check if touch device
 - If location is turned on and user is within the bounds of the map, additional walking direction options are show in popups and context-menu
 - Two new Historic Tour articles, including a geojson bomb map of ww2
 - Bugfix where openstreetmap api would error if trying to select a node
 - Recreated favicons and logos
 - Various other improvements


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


## v2.1.0 - Food Hygiene Rating Standards API

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
 - Re-write of creating POI checkbox tables, now a single tab with page jump links. Complete automated import from pois-types.js
 - Changed URL encoding to not use unsafe characters and less parameters, old links will no longer work.
 - Added a Historic Tour tab. Contains controls linking to an iframe containing various articles that interact with the map
 - Suggested walks now use switch statement
 - Wikimedia images now display proper attribution through their api
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


## v1.5.0 - Address Search Reverse Lookup

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
