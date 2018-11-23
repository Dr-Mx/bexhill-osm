<h1> <img src="http://bexhill-osm.org.uk/favicon-32x32.png"> Bexhill-OSM - https://bexhill-osm.org.uk/ </h1>

Searchable OpenStreetMap data showing POIs and other information for the town of Bexhill, UK

![Image of Bexhill-OSM](http://bexhill-osm.org.uk/assets/img/preview.jpg)

[Twitter Account](https://twitter.com/BexhillOSM)

## Features
 - Mobile and desktop friendly
 - Local caching of API requests
 - Detailed POI markers through Overpass API
   - Facilities parser for wheelchair/wifi/pet access (key:wheelchair, key:internet_access, key:dog, key:male, key:female, key:diaper)
   - Payment parser (key:payment:?)
   - Diet parser (key:diet:?)
   - Cuisine parser (key:cuisine, key:breakfast, key:lunch)
   - Ordering parser (key:takeaway, key:delivery, key:outdoor_searing, key:beer_garden, key:reservation)
   - Building details (key:architect, key:building:architecture, key:start_date, key:HE_ref, key:listed_status)
   - Current open state with 7 day opening hours table (key:opening_hours)
   - Last postbox collection time state (key:collection_times)
   - UK Food Hygiene Rating System API (key:fhrs:id)
   - Real-time Traveline API information on bus-stops (key:naptan:AtcoCode)
   - Multiple image support including Wikimedia Commons API (key:image, key:image_1, key:image_2, etc)
   - 360 spherical panorama support using Wikimedia Commons (key:image:360)
 - Find an address by searching (Nominatim > Overpass)
 - Query any feature on map (Nominatim > Overpass)
 - Selected place on map becomes highlighted (OpenStreetMap API)
 - Manually select groups of POIs from list or using a keyword
 - Group POI result list with current open state
 - Detailed walking directions with Mapbox API
 - View suggested walking routes
 - Geolocate user and get walking directions from that point
 - Historic tour articles that link to various overlays on the map
 - Direct link to edit an element on OSM or leave a note
 - Share current map state with dynamic permalink
 - Various settings to adjust map display
 - OpenWeatherMap API
 - Debugging tools

## Attribution

Originally forked from:
 - https://github.com/humitos/osm-pois (Humitos)
