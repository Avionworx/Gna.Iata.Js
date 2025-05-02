import { csvParseRows } from 'https://esm.sh/d3-dsv';

import { FlightLeg } from './GnaIata/Gna.Iata.FlightLeg.js';

export async function GetSampleLegs() {

    var legs = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat')
        .then(res => res.text())
        .then(d => GetLegs(d));

    return legs;
}

function addHours(date, hours) {
    const hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date;
}

function GetLegs(d) {

    var flights = new Map();
    var prevAirline = ""; 

    var rows = csvParseRows(d);

    rows.forEach(row => {

        let leg = new FlightLeg();
        leg.AirlineCode = row[0];

        var legs = flights.get(leg.AirlineCode);
        if (!legs)
            legs = [];
            
        leg.FlightNumber = legs.length + 1;
        leg.DepAirportCode = row[2];
        leg.ArrAirportCode = row[4];
        leg.FlightDate = UtcNow();
        leg.FlightDate.setHours(0, 0, 0);
        leg.STD = new Date(new Date().toUTCString().slice(0, -3));
        leg.STDLocal = leg.STD;
        leg.STA = new Date(new Date().toUTCString().slice(0, -3));
        leg.STA.setHours(leg.STA.getHours() + 1);
        leg.STALocal = leg.STA;
        leg.AcTypeCode = row[8].split(" ")[0]; 

        legs.push(leg);

        flights.set(leg.AirlineCode, legs);
        
    }); 

    var ret = []

    let random = getRandomInt(flights.size);

    flights.forEach(f => {

        if (random-- == 0) {
            ret = f;
        };
    });

    return ret;
} 

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function UtcNow() { 
    var tmLoc = new Date(); 
    return new Date(tmLoc.getTime() + tmLoc.getTimezoneOffset() * 60000);
}