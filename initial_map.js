'use strict'

 async function wrapper(){
 	var dformat = d3.format('.3f')
	var pformat = d3.format('.2%')
  	var mformat = d3.format('$.3s')
 	let cincinnati = {
	    'name' : 'Cincinnati',
	    'stateIndex' : '39',
	    'stateInitials' : ['OH', 'KY', 'IN'],
	    'zip_geo_path' : ['data/geojson_zip_codes/oh_ohio_zip_codes_geo.min.json', 'data/geojson_zip_codes/in_indiana_zip_codes_geo.min.json', 'data/geojson_zip_codes/ky_kentucky_zip_codes_geo.min.json'],
	    'viewloc' : [39.15, -84.5],
	    'viewz' : 11,
	    'city_msa_file' : 'zcta_within_msas/cincinnati.csv'
  	}
	console.log("HI THERE")

	let featurejson = await d3.json("Cincinnati_Community_Council_Neighborhoods.geojson")
	let neigh_geojson = featurejson


	let name_points = {
		type: "FeatureCollection", 
		features: [],
	}
	neigh_geojson.features.forEach(function(f){
		let point = turf.centerOfMass(f, f.properties)
		//let circle = turf.point(point.geometry.coordinates, f.properties)
		name_points.features.push(point)
	})
	const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrNndpeTJ4eDA2NDEzbm52NG5jeTAyeDAifQ.IaHIVaAkQ_dEGVBtoSA9xw'




function getTooltip({object}) {
  return (
    object && {
      html: `\
  <div></div>
  <div>${object.properties.NEIGH}</div>
  `
    }
  );
}
console.log(neigh_geojson)
const neighborhoodlayer = new deck.GeoJsonLayer({
  data: neigh_geojson,
  opacity: .1,
  stroked: true,
  filled: true,
  extruded: true,
  wireframe: true,
  fp64: true,

  getElevation: function(f){
  	return 0
  } ,
  lineWidthScale: 5,
  getFillColor: f => [255, 255, 255],
  getLineColor: f => [0, 0, 0],
  pickable: true,
  
});


let textData = name_points.features
console.log(textData)
const textLayer = new deck.TextLayer({
    data : textData,
    pickable: true,
    getPosition: function(d){
    	console.log(d)
    	return d.geometry.coordinates
    },
    getText: d => d.properties.NEIGH,
    getSize: 20,
    getAngle: 0,
    getTextAnchor: 'start',
    getAlignmentBaseline: 'bottom'
})
new deck.DeckGL({
  mapboxApiAccessToken: mapboxAccessToken,
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  initialViewState: {
    latitude: cincinnati.viewloc[0],
    longitude: cincinnati.viewloc[1],
    zoom: 11,
    maxZoom: 16,
    pitch: 45
  },
  controller: true,
  layers: [neighborhoodlayer, textLayer],
  getTooltip
});
}

wrapper()