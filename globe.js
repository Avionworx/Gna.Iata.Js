import { csvParseRows } from 'https://esm.sh/d3-dsv';
import indexBy from 'https://esm.sh/index-array-by';

let myGlobe = null;

export function MakeGlobe(legs) {
     
    const OPACITY = 0.2;

    if (myGlobe == null)
    myGlobe = new Globe(document.getElementById('globeViz'))
        .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')

        .arcLabel(d => `${d.airline}: ${d.srcIata} &#8594; ${d.dstIata}`)
        .arcStartLat(d => d.srcAirport.lat)
        .arcStartLng(d => d.srcAirport.lng)
        .arcEndLat(d => d.dstAirport.lat)
        .arcEndLng(d => d.dstAirport.lng)
        .arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`])
        .arcDashLength(0.8)
        .arcDashGap(0.8)
        .arcDashAnimateTime(1500)
        //.onArcHover(hoverArc => myGlobe
        //    .arcColor(d => {
        //        const op = !hoverArc ? OPACITY : d === hoverArc ? 0.9 : OPACITY / 4;
        //        return [`rgba(0, 255, 0, ${op})`, `rgba(255, 0, 0, ${op})`];
        //    })
        //) 
        .pointColor(() => 'orange')
        .pointAltitude(0)
        .pointRadius(0.04)
        .pointsMerge(true);

    // load data
    const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({ airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source });
 
    var legAirports = new Set(); 
    var legRoutes = new Set();
    var routes = [];

    legs.forEach(leg => {
        legAirports.add(leg.DepAirportCode);
        legAirports.add(leg.ArrAirportCode);

        var route = leg.DepAirportCode + leg.ArrAirportCode;

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
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat').then(res => res.text())
            .then(d => csvParseRows(d, airportParse)),
      //  fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat').then(res => res.text())
       //     .then(d => csvParseRows(d, routeParse))
    ]).then(([airports/*, routes*/]) => {

        const filteredAirports = airports.filter(d => legAirports.has(d.iata));
        const byIata = indexBy(filteredAirports, 'iata', false);

        const filteredRoutes = routes
            .filter(d => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)) // exclude unknown airports
          //  .filter(d => d.stops === '0') // non-stop flights only
            .map(d => Object.assign(d, {
                srcAirport: byIata[d.srcIata],
                dstAirport: byIata[d.dstIata]
            }))
            //      .filter(d => d.srcAirport.country !== d.dstAirport.country); // international routes
            //      .filter(d => d.srcAirport.country === d.dstAirport.country); // domestic routes
         //   .filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country === COUNTRY); // domestic routes within country

        var c = getLatLngCenter(filteredAirports);
        const MAP_CENTER = { lat: c[0], lng: c[1], altitude: 0.4 };

        myGlobe
            .pointsData(filteredAirports)
            .arcsData(filteredRoutes)
            .pointOfView(MAP_CENTER, 4000);
    });
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

/**
 * @param latLngInDeg array of arrays with latitude and longtitude
 *   pairs in degrees. e.g. [[latitude1, longtitude1], [latitude2
 *   [longtitude2] ...]
 *
 * @return array with the center latitude longtitude pairs in 
 *   degrees.
 */
function getLatLngCenter(latLngInDegr) {
    var LATIDX = 0;
    var LNGIDX = 1;
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