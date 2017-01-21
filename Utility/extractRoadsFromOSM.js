var fs = require('fs')

// const filename = 'map(42.417, -71.202)_(42.319, -70.967).json'
const filename = process.argv[2] || 'map(42.417, -71.202)_(42.319, -70.967).json'
let roads={};

//
// This file extracts road data from nina's geobits
//

function  formatRoad({properties,geometry}){
  return {
    id:properties.id,
    name:properties.name || '',
    highway: properties.highway || '',
    motor_vehicle: properties.motor_vehicle || '',
    bicycle: properties.bicycle || '',
    cycleway: properties.cycleway || '',
    kind: properties.kind || '',
    foot: properties.foot || '',
    geometry: geometry
  }
}

fs.readFile(filename,(error,data)=>{
  error ? console.log(error) : null
  const json_data = JSON.parse(data)

  json_data.map((chunk)=>{
    chunk.roads.features.map((raw_road)=>{
      roads[raw_road.properties.id] = formatRoad(raw_road)
    })
  })

  fs.writeFile(`${filename}_exported_roads.json`,JSON.stringify(roads, null, 4))
})