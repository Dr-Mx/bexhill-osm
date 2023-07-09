#!/bin/sh
# Cron Jobs, executed daily

# Mapillary sequences
# /usr/bin/wget -O /home/bexhillo/public_html/assets/data/panoramas.geojson "https://a.mapillary.com/v3/sequences?bbox=0.3724,50.8025,0.529,50.8785&usernames=bexhill_osm&client_id=dm4wZ3R0VEl0ano1aVdiZXpEdkUwZzplNTdhOTY2N2ZkNjgxZDE3"

# Metadata badges for info page
# Email
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-email.svg "https://img.shields.io/static/v1?logo=data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjgwMHB4IiB3aWR0aD0iODAwcHgiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDQ5MCA0OTAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0cm9rZT0iI2ZmZmZmZiI+Cg08ZyBpZD0iU1ZHUmVwb19iZ0NhcnJpZXIiIHN0cm9rZS13aWR0aD0iMCIvPgoNPGcgaWQ9IlNWR1JlcG9fdHJhY2VyQ2FycmllciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cg08ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+IDxnPiA8Zz4gPGc+IDxwYXRoIGQ9Ik0yOTUuMiwyNTcuOEwyNTEuNCwyOTVjLTMuNSwyLjktOC42LDIuOS0xMiwwbC00My44LTM3LjFMMTYuNyw0MDkuMWg0NTYuNkwyOTUuMiwyNTcuOHoiLz4gPHBvbHlnb24gcG9pbnRzPSIwLDkyLjIgMCwzOTcuOCAxODAuMSwyNDUgIi8+IDxwb2x5Z29uIHBvaW50cz0iMTYuNyw4MC45IDI0NSwyNzQuNiA0NzMuMyw4MC45ICIvPiA8cG9seWdvbiBwb2ludHM9IjMwOS45LDI0NSA0OTAsMzk3LjggNDkwLDkyLjIgIi8+IDwvZz4gPC9nPiA8L2c+IDwvZz4KDTwvc3ZnPg==&color=%23a04900&style=flat&label=email&labelColor=rgba(0,0,0,0.4)&message=info@bexhill-osm.org.uk"
# Twitter
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-twitter.svg "https://img.shields.io/twitter/follow/BexhillOSM?logo=twitter&logoColor=%231da1f2&labelColor=rgba(0,0,0,0.4)&color=%231da1f2&label=Twitter&style=flat"
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-twitter.svg "https://img.shields.io/static/v1?logo=twitter&logoColor=%231da1f2&labelColor=rgba(0,0,0,0.4)&color=%231da1f2&label=Twitter&style=flat&message=298"
# YouTube
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-youtube.svg "https://img.shields.io/youtube/channel/subscribers/UCS3phqTevP6eHysdqvoU1_w?logo=youtube&logoColor=%23ff0000&labelColor=rgba(0,0,0,0.4)&label=YouTube&color=%23ff0000&style=flat"
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-youtube.svg "https://img.shields.io/static/v1?logo=youtube&logoColor=%23ff0000&labelColor=rgba(0,0,0,0.4)&label=YouTube&color=%23ff0000&style=flat&message=97"
# OpenStreetMap
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-osm.svg "https://img.shields.io/badge/dynamic/json?logo=openstreetmap&logoColor=%233d7729&style=flat&labelColor=rgba(0,0,0,0.4)&color=%233d7729&label=OpenStreetMap&query=%24.user.changesets.count&url=https%3A%2F%2Fapi.openstreetmap.org%2Fapi%2F0.6%2Fuser%2F2462713.json"
# Wikimedia Commons
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-wikimedia.svg "https://img.shields.io/badge/dynamic/json?logo=wikimediacommons&logoColor=%2301639a&style=flat&labelColor=rgba(0,0,0,0.4)&color=%2301639a&label=Wikimedia%20Commons&query=%24.counts.count&url=https%3A%2F%2Fxtools.wmflabs.org%2Fapi%2Fuser%2Fpages_count%2Fcommons.wikimedia%2FDr-Mx%2F6"
# Internet Archive
/usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-archive.svg "https://img.shields.io/badge/dynamic/json?logo=internetarchive&logoColor=%23ffffff&style=flat&labelColor=rgba(0,0,0,0.4)&color=%23000000&label=Internet%20Archive&query=%24.response.numFound&url=https%3A%2F%2Farchive.org%2Fadvancedsearch.php%3Fq%3Duploader%253A%28Dr-Mx%29%26fl%3Dname%26rows%3D%26output%3Djson"
# Github
# /usr/bin/wget -O /home/bexhillo/public_html/assets/img/info-archive.svg "https://img.shields.io/github/license/Dr-Mx/Bexhill-OSM?logo=github&logoColor=white&color=%23a04900&label=Github&labelColor=rgba(0,0,0,0.4)&style=flat"
