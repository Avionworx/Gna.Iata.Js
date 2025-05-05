import { csvParseRows } from 'https://esm.sh/d3-dsv';

const routesLimit = 1000;

let myGlobe = null;

let Airports = new Map();

export async function MakeGlobe(legs) {

    const OPACITY = 1;

    if (myGlobe == null)
        myGlobe = new Globe(document.getElementById('globeViz'))
            .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
            .showGraticules(true)
            .showAtmosphere(true)

            .arcLabel(d => `${d.airline}: ${d.srcIata} &#8594; ${d.dstIata}`)
            .arcStartLat(d => d.srcAirport.lat)
            .arcStartLng(d => d.srcAirport.lng)
            .arcEndLat(d => d.dstAirport.lat)
            .arcEndLng(d => d.dstAirport.lng)
            .arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`])
            .arcDashLength(0.8)
            .arcDashGap(0.8)
            .arcDashAnimateTime(1500)
            .pointColor(() => 'orange')
            .pointAltitude(0)
            .pointRadius(0.04)
            .pointsMerge(true);

    let legAirports = new Set();
    let legRoutes = new Set();
    let routes = [];

    legs.forEach(leg => {
        legAirports.add(leg.DepAirportCode);
        legAirports.add(leg.ArrAirportCode);

        let route = leg.DepAirportCode + leg.ArrAirportCode;

        if (routes.length > routesLimit) return;

        if (!legRoutes.has(route)) {
            legRoutes.add(route);
            routes.push(
                {
                    airline: leg.AirlineCode,
                    airlineId: 1,
                    codeshare: "",
                    dstIata: leg.ArrAirportCode,
                    equipment: leg.AcTypeCode,
                    srcIata: leg.DepAirportCode,
                });
        }
    });

    Airports = await GetAirportsByIata(legAirports); 

    const filteredRoutes = routes
        .filter(d => Airports.has(d.srcIata) && Airports.has(d.dstIata))  
        .map(d => Object.assign(d, {
            srcAirport: Airports.get(d.srcIata),
            dstAirport: Airports.get(d.dstIata)
        }))

    let a = GetAirports();
    let c = getLatLngCenter(a);
    const MAP_CENTER = { lat: c[0], lng: c[1], altitude: 0.5 };

    myGlobe
        .pointsData(a)
        .arcsData(filteredRoutes)
        .pointOfView(MAP_CENTER, 4000);
}
 

async function GetAirportsByIata(legAirports) {

    let d = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv')
        .then(res => res.text());

    let ret = new Map()

    let rows = csvParseRows(d); 

    rows.forEach(row => {
         
        if (legAirports.has(row[13])) {

            let airport = {
                iata: row[13],
                icao: row[12],
                lat: parseFloat( row[4]),
                lng: parseFloat( row[5]),
                name: row[3] 
            }

            ret.set(airport.iata, airport);
        }
    });

    return ret;
}

export function GetAirports() {

    return [...Airports.values()];
}


export function ClearGlobe() {

    Airports = new Map();

    if (myGlobe != null) {
        myGlobe
            .pointsData([])
            .arcsData([]);
    }
}

function rad2degr(rad) { return rad * 180 / Math.PI; }
function degr2rad(degr) { return degr * Math.PI / 180; }

/// https://stackoverflow.com/questions/6671183/calculate-the-center-point-of-multiple-latitude-longitude-coordinate-pairs
function getLatLngCenter(latLngInDegr) {
 
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;

    for(let i = 0; i < latLngInDegr.length; i++) {
        let iLat = degr2rad(latLngInDegr[i].lat);
        let iLng = degr2rad(latLngInDegr[i].lng);
        // sum of cartesian coordinates
        sumX += Math.cos(iLat) * Math.cos(iLng);
        sumY += Math.cos(iLat) * Math.sin(iLng);
        sumZ += Math.sin(iLat);
    }

    let avgX = sumX / latLngInDegr.length;
    let avgY = sumY / latLngInDegr.length;
    let avgZ = sumZ / latLngInDegr.length;

    // convert average x, y, z coordinate to latitude and longtitude
    let lng = Math.atan2(avgY, avgX);
    let hyp = Math.sqrt(avgX * avgX + avgY * avgY);
    let lat = Math.atan2(avgZ, hyp);

    return ([rad2degr(lat), rad2degr(lng)]);
}