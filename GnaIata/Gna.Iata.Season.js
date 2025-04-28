import { AssertLoaded } from './Gna.Iata.js'

export function Season(obj) {
    this.Winter = null;
    this.Summer = null;
    this.From = null;
    this.To = null;
    this.Name = "";

    this.Now = function () { return Now(); };
    this.Previous = function () { return Previous(this); };
    this.Next = function () { return Next(this); };
    this.CreateFromName = function (name) { return CreateFromName(name); };
    this.CreateFromDate = function (date) { return CreateFromDate(date); };
    this.Contains = function (date) { return Contains(this, date); };

    if (obj)
        for (let prop in obj) this[prop] = obj[prop];
}

function Now() {
    const avionworx = AssertLoaded();
    return new Season(JSON.parse(avionworx.Gna.Iata.Js.Season.Now()));
}

function Previous(season) {
    const avionworx = AssertLoaded();
    return new Season(JSON.parse(avionworx.Gna.Iata.Js.Season.Previous(season.Name)));
}

function Next(season) {
    const avionworx = AssertLoaded();
    return new Season(JSON.parse(avionworx.Gna.Iata.Js.Season.Next(season.Name)));
}

function CreateFromName(name) {
    const avionworx = AssertLoaded();
    return new Season(JSON.parse(avionworx.Gna.Iata.Js.Season.CreateFromName(name)));
}

function CreateFromDate(date) {
    const avionworx = AssertLoaded();
    return new Season(JSON.parse(avionworx.Gna.Iata.Js.Season.CreateFromDate(date)));
}

function Contains(season, date) {
    const avionworx = AssertLoaded();
    return avionworx.Gna.Iata.Js.Season.Contains(season.Name, date);
}