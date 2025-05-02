import { csvParseRows } from 'https://esm.sh/d3-dsv';

let myGlobe = null;

export function MakeGlobe(legs) {
     
    const OPACITY = 1;

    if (myGlobe == null)
        myGlobe = new Globe(document.getElementById('globeViz'))//, { width:100,height:100 })
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
        .onArcHover(hoverArc => myGlobe
            .arcColor(d => {
                const op = !hoverArc ? OPACITY : d === hoverArc ? 0.9 : OPACITY / 4;
                return [`rgba(0, 255, 0, ${op})`, `rgba(255, 0, 0, ${op})`];
            })
        ) 
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

        if (routes.length > 1000) return;

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

    Promise.all([
        fetch('https://davidmegginson.github.io/ourairports-data/airports.csv')
            .then(res => res.text())
            .then(d => GetAirportsByIata(d, legAirports)), 
    ]).then(([byIata]) => {
         
        const filteredRoutes = routes
            .filter(d => byIata.has(d.srcIata) && byIata.has(d.dstIata)) // exclude unknown airports 
            .map(d => Object.assign(d, {
                srcAirport: byIata.get(d.srcIata),
                dstAirport: byIata.get(d.dstIata)
            })) 
        var a = [...byIata.values()];
        var c = getLatLngCenter(a);
        const MAP_CENTER = { lat: c[0], lng: c[1], altitude: 0.4 };

        myGlobe
            .pointsData(a)
            .arcsData(filteredRoutes)
            .pointOfView(MAP_CENTER, 4000);
    });
}
 

function GetAirportsByIata(d, legAirports) {

    var ret = new Map()

    var rows = csvParseRows(d); 

    rows.forEach(row => {
         
        if (legAirports.has(row[13])) {

            let airport = {
                iata: row[13],
                icao: row[12],
                lat: parseFloat( row[4]),
                lng: parseFloat( row[5]),
                name: row[3],
                airportId: row[0]
            }

            ret.set(airport.iata, airport);
        }
    });

    return ret;
}

export function ClearGlobe() {

    if (myGlobe != null) {
        myGlobe
            .pointsData([])
            .arcsData([]);
    }
}

function rad2degr(rad) { return rad * 180 / Math.PI; }
function degr2rad(degr) { return degr * Math.PI / 180; }
 
function getLatLngCenter(latLngInDegr) {
 
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    for (var i = 0; i < latLngInDegr.length; i++) {
        var lat = degr2rad(latLngInDegr[i].lat);
        var lng = degr2rad(latLngInDegr[i].lng);
        // sum of cartesian coordinates
        sumX += Math.cos(lat) * Math.cos(lng);
        sumY += Math.cos(lat) * Math.sin(lng);
        sumZ += Math.sin(lat);
    }

    var avgX = sumX / latLngInDegr.length;
    var avgY = sumY / latLngInDegr.length;
    var avgZ = sumZ / latLngInDegr.length;

    // convert average x, y, z coordinate to latitude and longtitude
    var lng = Math.atan2(avgY, avgX);
    var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
    var lat = Math.atan2(avgZ, hyp);

    return ([rad2degr(lat), rad2degr(lng)]);
}