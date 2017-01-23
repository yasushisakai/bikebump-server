# bikebump - server

## Api Endpoint Documentation

### 1. get closest road
GET
``` api/road/closest?lng=LONGITUDE&lat=LATITUDE ```

result:

```json
{
  "roadId":263564405,
  "name":"Vassar St.",
  "closestPt":{"x":-71.10305807897596,"y":42.35612624703218},
  "distance":2.3902881847059056,
  "closestLine":{
    "st":{"x":-71.10352,"y":42.3559},
    "en":{"x":-71.09813,"y":42.35854}
  }
}
```
- name may be an empty string
- distance is in meters
- backend will check if this road is saved in the firebase if not, backend will add it.
- working example: [https://bikebump.media.mit.edu/api/road/closest?lng=42.3561917&lat=-71.1030615](https://bikebump.media.mit.edu/api/road/closest?lng=42.3561917&lat=-71.1030615)
- check [https://www.google.com/maps/@42.3561917,-71.1030615,18.73z](https://www.google.com/maps/@42.3561917,-71.1030615,18.73z)

### 2. get road data

GET
``` https://bikebump.media.mit.edu/api/road/ROADID ```

result:

```json
{
  "roadId":263564405, 
  "name":"Vassar St.",
  "highway":"secondary",
  "motor_vehicle":"",
  "bicycle":"",
  "cycleway":"track",
  "kind":"major_road",
  "foot":"",
  "geometry":
    {
      "type":"LineString",
      "coordinates":[[-71.10352,42.3559],[-71.09813,42.35854]]
    }
}
```
- details on the geometry are in [LineString](https://msdn.microsoft.com/en-us/library/bb895372.aspx), and [MultiLineString](http://wiki.openstreetmap.org/wiki/Relation:multilinestring)
- working example: [https://bikebump.media.mit.edu/api/road/263564405/](https://bikebump.media.mit.edu/api/road/263564405/)

## to start dev server
to run this you will need a few files. Request it from yasushi put them
in the directories as mentioned below.

1. ```data/exported_roads.json```
  - json file that was converted from OSM.
2. ```config/bikebump-ea3b1-firebase-adminsdk-ephgk-53ad7855df.json```
  - credentials file from firebase to establish connection
3. if you don't have npm and node, install the latest one
4. then ```npm install``` && ```npm run start```
5. check ```localhost:8080```






