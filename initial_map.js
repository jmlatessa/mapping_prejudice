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
	    'viewloc' : [39.08, -84.5],
	    'viewz' : 11,
	    'city_msa_file' : 'zcta_within_msas/cincinnati.csv'
  	}

  let races_1970 = ['chinese', 'filipino', 'hawaiian', 'indian', 'japanese', 'korean', 'negro', 'white', 'other']
	let neigh_geojson = await d3.json("Cincinnati_Community_Council_Neighborhoods.geojson")
  let censusjson = await d3.json('ohio_hamilton_join_tracts_project.json')
  let censusjson_2010 = await d3.json('us_ohio_hamilton_tract_2010_project_join.json')
  let wards_1855_3_5 = await d3.json('us_ohio_cincinnati_1855_wards_project_3-5.json')
  let wards_1855_3_4 =  await d3.json('us_ohio_cincinnati_1855_wards_project_3-4.json')


  censusjson = ArcgisToGeojsonUtils.arcgisToGeoJSON(censusjson);
  censusjson_2010 = ArcgisToGeojsonUtils.arcgisToGeoJSON(censusjson_2010);
  wards_1855_3_5 = ArcgisToGeojsonUtils.arcgisToGeoJSON(wards_1855_3_5)
  wards_1855_3_4 = ArcgisToGeojsonUtils.arcgisToGeoJSON(wards_1855_3_4)


  

  censusjson.features.forEach(function(r){
      r.properties.total_pop = 0
      races_1970.forEach(function(race){
        r.properties.total_pop += r.properties[race]
      })
  })

  censusjson_2010.features.forEach(function(r){
      r.properties.total_pop = r.properties.H7X001
      r.properties.white = r.properties.H7X002
     
   
  })

  wards_1855_3_5.features.forEach(function(r){
    let black_pop = r.properties.black + r.properties.mulattoes;
    let pop_float = (black_pop / (r.properties.black_per + r.properties.mulattoper)) * 100
    pop_float = Math.floor(pop_float)
    let total_pop = parseInt(pop_float);

    r.properties.total_pop = total_pop;
    r.properties.bandm_pop = black_pop;
     r.properties.ward = r.properties["Id"]
  })


  wards_1855_3_4.features.forEach(function(r){
    console.log(r)
    let black_pop = r.properties.black + r.properties.mulattoes;
    let pop_float = (black_pop / (r.properties.black_per + r.properties.mulattoper)) * 100
    pop_float = Math.floor(pop_float)
    let total_pop = parseInt(pop_float);
    r.properties.total_pop = total_pop;
    r.properties.bandm_pop = black_pop;
     r.properties.ward = r.properties["Id"]
  })


  console.log(censusjson)
  console.log(neigh_geojson)

	let name_points = {
		type: "FeatureCollection", 
		features: [],
	}
  let ward_name_points = {
    type: "FeatureCollection", 
    features: [],
  }
  wards_1855_3_5.features.forEach(function(f){
    let point = turf.centerOfMass(f, f.properties)
    ward_name_points.features.push(point)
  })
	neigh_geojson.features.forEach(function(f){
		let point = turf.centerOfMass(f, f.properties)
		//let circle = turf.point(point.geometry.coordinates, f.properties)
		name_points.features.push(point)
	})
	const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrNndpeTJ4eDA2NDEzbm52NG5jeTAyeDAifQ.IaHIVaAkQ_dEGVBtoSA9xw'

function getTooltip({object}) {
  let the_html = ``
  if (object == undefined){
    return
  }
  if (object.properties.bandm_pop != undefined){
    return object && {
      html : `\
      <div>
      <div>Ward ${object.properties.ward}</div>
      <div>Total Population: ${object.properties.total_pop}</div>
      <div>Black & Mulatto Population: ${object.properties.bandm_pop}</div>
      </div`
    }
  }
  if (object.properties.NEIGH == undefined){
    the_html =  `\
  <div>
   <div>${object.properties.AREANAME}</div>
   <div>Total population:${object.properties.total_pop}</div>
  <div>White population:${object.properties.white}</div>
  </div>`
  }
  else {
   the_html =  `\
  <div>
  <div>${object.properties.NEIGH}</div></div>
  `
  }
  return (
    object && {
      html: the_html
    }
  );
}

let checkobj = {}
checkobj.neighcheck = true
checkobj.census_1970 = true
checkobj.census_2010 = false

var screenheight = window.innerHeight;
var screenwidth = window.innerWidth
console.log(screenheight)
d3.select("#census_map")
  .style("height", screenheight)
  .style("width", screenwidth)


d3.select('#wards_map')
  .style("height", screenheight)
  .style("width", screenwidth)

const deckInstance = new deck.DeckGL({
  container : "census_map",
  id : 'census_map_canvas',
  height : screenheight,
  width : screenwidth,
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
  getTooltip
});

const wardsInstance =  new deck.DeckGL({
  container : "wards_map",
  id : 'wards_map_canvas',
  height : screenheight,
  width : screenwidth,
  mapboxApiAccessToken: mapboxAccessToken,
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  initialViewState: {
    latitude: cincinnati.viewloc[0],
    longitude: cincinnati.viewloc[1],
    zoom: 12,
    maxZoom: 16,
    pitch: 45
  },
  controller: true,
  getTooltip
});


function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

let colorscale = d3.interpolateGreens
let colorscale2 = d3.interpolateBlues

d3.select("#ward-legend-high").style("background", colorscale2(1))
d3.select("#ward-legend-low").style("background", '#d3d3d3')
d3.select("#census-legend-high").style("background", colorscale(1))
d3.select("#census-legend-low").style("background", '#d3d3d3')
function colorchooser(val){
  let proportion = 1 - (val.properties.white / val.properties.total_pop)
  let retcolor = colorscale(proportion)
  retcolor = retcolor.split("(")[1].split(")")[0].split(",")
  retcolor = retcolor.map(x => parseInt(x))
  return retcolor
}

function render_wards(val){
   var wards_data;
   if (val == "table_3_5"){
    wards_data = wards_1855_3_5
   }
   if (val == "table_3_4"){
    wards_data = wards_1855_3_4
   }

  const wards_layer = new deck.GeoJsonLayer({
    data: wards_data,
    opacity: .5,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: true,
    fp64: true,
    getElevation: function(f){
      return 0
    } ,
    lineWidthScale: 1000,
    getFillColor: function(d){
      let proportion = ((d.properties.black_per  + d.properties.mulattoper) / 100)
      let retcolor = colorscale2(proportion)
      retcolor = retcolor.split("(")[1].split(")")[0].split(",")
      retcolor = retcolor.map(x => parseInt(x))
      return retcolor
    },
    getLineColor: f => [0, 0, 0],
    pickable: true,
    visible: checkobj.neighcheck
  })
 
  let  ward_points = ward_name_points.features

  const wardstextLayer = new deck.TextLayer({
      id : 'ward_names',
      data : ward_points,
      getPosition: function(d){
        return d.geometry.coordinates
      },
      getText: function(d){
        //console.log(d.properties)
        return "Ward " + d.properties.ward
      },
      getSize: 20,
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
  })
   let layers = [wards_layer, wardstextLayer]
  wardsInstance.setProps({layers})
}

function render(){
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
    lineWidthScale: 1000,
    getFillColor: f => [255, 255, 255],
    getLineColor: f => [0, 0, 0],
    pickable: true,
    visible: checkobj.neighcheck
  });

  const censusTractLayer = new deck.GeoJsonLayer({
    data : censusjson,
    opacity: .5,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: true,
    fp64: true,

    getElevation: function(f){
      return 0
    } ,
    lineWidthScale: 100,
    getFillColor: colorchooser,
    getLineColor: f => [0, 255, 0],
    pickable: true,
    visible: checkobj.census_1970
  })

  const censusTractLayer_2010 = new deck.GeoJsonLayer({
    data : censusjson_2010,
    opacity: .5,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: true,
    fp64: true,

    getElevation: function(f){
      return 0
    } ,
    lineWidthScale: 100,
    getFillColor: colorchooser,
    getLineColor: f => [0, 255, 0],
    pickable: true,
    visible: checkobj.census_2010
  })


  let textData = name_points.features
  console.log(textData)
  const textLayer = new deck.TextLayer({
      data : textData,
      pickable: true,
      getPosition: function(d){
      	return d.geometry.coordinates
      },
      getText: d => d.properties.NEIGH,
      getSize: 20,
      getAngle: 0,
      getTextAnchor: 'start',
      getAlignmentBaseline: 'bottom',
      visible: checkobj.neighcheck
  })
  let layers =  [neighborhoodlayer, textLayer, censusTractLayer, censusTractLayer_2010]

  deckInstance.setProps({layers})

}
//map controller
function toggler(e){
  console.log("HI THERE")
  let this_id = $(this).attr("id")
  if ($(this).prop("checked") == true){
    checkobj[this_id] = true
  }
  else{
    checkobj[this_id] = false
  }
  render()
}

function wards_toggler(e){
  console.log($(this).prop("value"))
  render_wards($(this).prop("value"))
}

$('#neighcheck').on("click", toggler)
$('#census_1970').on("click", toggler)
$('#census_2010').on("click", toggler)
$('#wards-select').change(wards_toggler)
render()
render_wards("table_3_5")
}//wrapper



wrapper()