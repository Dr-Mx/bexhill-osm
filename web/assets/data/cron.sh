#!/bin/sh
# Cron Jobs, executed daily

# Mapillary sequences
# /usr/bin/wget -O /home/bexhillo/public_html/assets/data/panoramas.geojson "https://a.mapillary.com/v3/sequences?bbox=0.3724,50.8025,0.529,50.8785&usernames=bexhill_osm&client_id=dm4wZ3R0VEl0ano1aVdiZXpEdkUwZzplNTdhOTY2N2ZkNjgxZDE3"

# Metadata badges for info page
# Twitter
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-twitter.svg "https://img.shields.io/twitter/follow/BexhillOSM?logo=twitter&logoColor=%231da1f2&labelColor=rgba(0,0,0,0.4)&color=%231da1f2&label=Twitter&style=for-the-badge"
# YouTube
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-youtube.svg "https://img.shields.io/youtube/channel/subscribers/UCS3phqTevP6eHysdqvoU1_w?logo=youtube&logoColor=%23ff0000&labelColor=rgba(0,0,0,0.4)&label=YouTube&color=%23ff0000&style=for-the-badge"
# OpenStreetMap
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-osm.svg "https://img.shields.io/badge/dynamic/json?logo=openstreetmap&logoColor=%236aa755&style=for-the-badge&labelColor=rgba(0,0,0,0.4)&color=%236aa755&label=OpenStreetMap&query=%24.user.changesets.count&url=https%3A%2F%2Fapi.openstreetmap.org%2Fapi%2F0.6%2Fuser%2F2462713.json"
# Wikimedia Commons
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-wikimedia.svg "https://img.shields.io/badge/dynamic/json?logo=wikimediacommons&logoColor=%2301639a&style=for-the-badge&labelColor=rgba(0,0,0,0.4)&color=%2301639a&label=Wikimedia%20Commons&query=%24.counts.count&url=https%3A%2F%2Fxtools.wmflabs.org%2Fapi%2Fuser%2Fpages_count%2Fcommons.wikimedia%2FDr-Mx%2F6"
# Internet Archive
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-archive.svg "https://img.shields.io/badge/dynamic/json?logo=internetarchive&logoColor=%23ffffff&style=for-the-badge&labelColor=rgba(0,0,0,0.4)&color=%23000000&label=Internet%20Archive&query=%24.response.numFound&url=https%3A%2F%2Farchive.org%2Fadvancedsearch.php%3Fq%3Duploader%253A%28Dr-Mx%29%26fl%3Dname%26rows%3D%26output%3Djson"
