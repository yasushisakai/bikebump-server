# bikebump - server

## Api Endpoint Documentation

### 1. add a ding

POST
``` https://bikebump.media.mit.edu/api/dings/add ```

```
params (body, x-www-from-urlencoded)
  lat:number
  lat:number
  uid:string
  timestamp:number
  value:number
```

result:

```json
['success']
```
- handles add or append to existing ding, just need to send

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

### node and npm versions
some version may not work, these are tested enviroments
- mac(development), npm v3.10.3, node v6.3.0,
- ubuntu(production), npm v3.10.9, node v7.2.0 





