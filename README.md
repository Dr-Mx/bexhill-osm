<h1> <img src="http://bexhill-osm.org.uk/favicon-32x32.png"> Bexhill-OSM - https://bexhill-osm.org.uk/ </h1>

[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://github.com/Dr-Mx/bexhill-osm/blob/master/LICENSE)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=B3X9MHLW4W9TG&source=url)
[![Twitter](https://img.shields.io/twitter/follow/BexhillOSM.svg?label=Twitter)](https://twitter.com/BexhillOSM)

Searchable OpenStreetMap data showing POIs, walking directions, overlays, history and other information for the town of Bexhill-on-Sea, UK

![Image of Bexhill-OSM](http://bexhill-osm.org.uk/assets/img/preview.jpg)

## Features
- Mobile and desktop friendly
- Local caching of API requests
- Detailed POI markers through Overpass API
  - Bookmark favourite POIs
  - Facility icons
    - Wheelchair (key:wheelchair)
    - Internet (key:internet_access)
    - Dog (key:dog)
    - Toilets (key:male, key:female, key:unisex, key:diaper)
    - Recycling types (key:recycling:\*)
    - Telephone (key:sms)
    - Bus-stop (key:bin, key:bench)
    - Covered (key:covered, key:shelter)
  - Payment parser (key:payment:\*)
  - Diet parser (key:diet:\*)
  - Cuisine parser (key:cuisine, key:breakfast, key:lunch)
  - Ordering parser (key:takeaway, key:delivery, key:outdoor_searing, key:beer_garden, key:reservation)
  - Building details (key:architect, key:building:architecture, key:start_date, key:HE_ref, key:listed_status)
  - Current open state with 7 day opening hours table (key:opening_hours)
  - Last postbox collection time state (key:collection_times)
  - UK Food Hygiene Rating System API (key:fhrs:id)
  - Real-time Traveline API information on bus-stops (key:naptan:AtcoCode)
  - Multiple image support including Wikimedia Commons API (key:wikimedia_commons, key:image, key:image_1, key:image_2, etc)
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
