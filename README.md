# Bexhill-OSM - http://bexhill-osm.org.uk/

Searchable OpenStreetMap data showing POIs and other information for the town of Bexhill, UK

![Image of Bexhill-OSM](http://bexhill-osm.org.uk/assets/img/preview.jpg)

[Twitter Account](https://twitter.com/BexhillOSM)

## Features
 - Mobile and desktop friendly
 - Detailed POI markers through Overpass API with list of results
   - Facilities parser for wheelchair/wifi/pet access (key:wheelchair, key:internet_access, key:dog, key:male, key:female, key:diaper)
   - Payment parser (key:payment)
   - Diet parser (key:diet)
   - Cuisine parser (key:cuisine, key:breakfast, key:lunch)
   - Ordering parser (key:takeaway, key:delivery, key:outdoor_searing, key:reservation)
   - Listed building parser (key:listed_status, key:HE_ref)
   - Current open time status with full hours table (key:opening_hours)
   - UK Food Hygiene Rating System API (key:fhrs:id)
   - Images through Wikimedia Commons API (key:image)
 - Find an address by searching (Nominatim > Overpass)
 - Query a place by clicking on map (Nominatim > Overpass)
 - Selected place on map becomes highlighted (OpenStreetMap API)
 - Option to view only 'currently open' POIs
 - Display groups of POIs based on a keyword
 - Manually select groups of POIs from list
 - Detailed walking directions with Mapbox API
 - View suggested walking routes
 - Geolocate user and get walking directions from that point if within bounds of map
 - View a histoic tour that shows various overlays on the map
 - Direct link to edit an element on OSM or leave a note
 - Share any current layer via a permalink

## Attribution

Originally forked from:
 - https://github.com/humitos/osm-pois (Humitos)
