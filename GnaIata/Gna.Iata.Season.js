import { AssertLoaded } from './Gna.Iata.js'
 
export class Season {
    constructor(obj) {
        this.Winter = null;
        this.Summer = null;
        this.From = null;
        this.To = null;
        this.Name = "";

        this.Now = function() { return Now(); };
        this.Previous = function() { return Previous(this); };
        this.Next = function() { return Next(this); };
        this.CreateFromName = function(name) { return CreateFromName(name); };
        this.CreateFromDate = function(date) { return CreateFromDate(date); };
        this.Contains = function(date) { return Contains(this, date); };

        if (obj)
            for (var prop in obj) this[prop] = obj[prop];
    }
}

function Now() {
    AssertLoaded();
    return new Season(JSON.parse(window.avionworx.Gna.Iata.Js.Season.Now())); 
}

function Previous(season) {
    AssertLoaded();
    return new Season(JSON.parse(window.avionworx.Gna.Iata.Js.Season.Previous(season.Name)));
}

function Next(season) {
    AssertLoaded();
    return new Season(JSON.parse(window.avionworx.Gna.Iata.Js.Season.Next(season.Name)));
}

function CreateFromName(name) {
    AssertLoaded();
    return new Season(JSON.parse(window.avionworx.Gna.Iata.Js.Season.CreateFromName(name)));
} 

function CreateFromDate(date) {
    AssertLoaded();
    return new Season(JSON.parse(window.avionworx.Gna.Iata.Js.Season.CreateFromDate(date)));
}

function Contains(season, date) {
    AssertLoaded();
    return window.avionworx.Gna.Iata.Js.Season.Contains(season.Name, date);
}