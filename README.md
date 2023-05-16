<h1> <img src="https://bexhill-osm.org.uk/favicon-32x32.png"> Bexhill OpenStreetMap - https://bexhill-osm.org.uk </h1>

[![License](https://bexhill-osm.org.uk/assets/img/info-github.svg)](https://github.com/Dr-Mx/bexhill-osm/blob/master/LICENSE)
[![Twitter](https://bexhill-osm.org.uk/assets/img/info-twitter.svg)](https://twitter.com/BexhillOSM)
[![YouTube](https://bexhill-osm.org.uk/assets/img/info-youtube.svg)](https://www.youtube.com/@bexhillosm)

Searchable OpenStreetMap data showing POIs, walking directions, overlays, history and other information for the town of Bexhill-on-Sea, UK

![Cover image of Bexhill-OSM](https://bexhill-osm.org.uk/assets/img/og-image.jpg)

## Features
- Mobile and desktop friendly
- Light/dark theme support
- Map display
  - Switch between metric and imperial
  - Adjust overlay opacity
  - Set map layer offset
- Local caching of OSM API requests
- Detailed POI markers through Overpass API
  - Bookmark favourite POIs
  - Facility icons
    - Wheelchair (key:wheelchair)
    - Elevator (key:elevator)
    - Hearing induction loop (key:hearing_impaired:induction_loop)
    - Braille (key:tactile_writing:braille)
    - Internet (key:internet_access)
    - Dog friendly (key:dog)
    - Toilets (key:male, key:female, key:unisex, key:changing_table)
    - Drinking water refills (key:drinking_water:refill)
    - Recycling types (key:recycling:\*)
    - Telephone (key:sms)
    - Bus-stop (key:bin, key:bench)
    - Covered (key:covered, key:shelter)
    - Live music (key:live_music)
  - Payment parser (key:payment:\*)
  - Diet parser (key:diet:\*)
  - Cuisine parser (key:cuisine, key:breakfast, key:lunch)
  - Ordering parser (key:takeaway, key:delivery, key:outdoor_seating, key:beer_garden, key:reservation)
  - Building details (key:architect, key:building:architecture, key:start_date, key:HE_ref, key:listed_status)
  - Current open state with 7 day opening hours table (key:opening_hours)
  - Last postbox collection time state (key:collection_times)
  - UK Food Hygiene Rating System API (key:fhrs:id)
  - Real-time Traveline API information on bus-stops (key:naptan:AtcoCode)
  - Multiple image support including Wikimedia Commons API (key:wikimedia_commons, key:image)
  - Multiple video support using Wikimedia Commons (key:wikimedia_commons:video)
  - Multiple spherical panorama support using Wikimedia Commons (key:wikimedia_commons:pano)
  - Fallback to main Overpass server on failure
  - Area outlines
- Find an address by searching (Nominatim > Overpass)
- Query any feature on map by clicking (Nominatim > Overpass)
- Manually select groups of POIs from list or using a keyword
- POI result list with current opening_hours / collection_times state
- Detailed walking directions with Mapbox API
- Geolocate user
- Mapillary/Google street spherical panorama support
- History Tour articles that link to various overlays on the map
- Direct link to edit an element on OSM or edit Wikidata
- Share any current map state with dynamic permalink
- OpenWeatherMap API
- Development tools
  - Display OSM notes
  - Export current query to Overpass Turbo
  - Download all data within map bounds
  - Custom OverpassAPI queries
  - Query OSM attic data from a certain date
  - Output debug info to console

## Demo

https://github.com/Dr-Mx/bexhill-osm/assets/20068052/219ff558-a94b-46af-8f66-8eb8652f461c

## Futher Reading on the Project

- https://wiki.openstreetmap.org/wiki/Bexhill-on-Sea
- https://taginfo.openstreetmap.org/projects/bexhillosm
- https://osmuk.org/case-studies/bexhill-osm-celebrating-local-pride/
- https://blog.opencagedata.com/post/openstreetmap-in-bexhill-uk

## Attribution

Originally forked from:
 - https://github.com/humitos/osm-pois (Humitos)
