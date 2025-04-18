import { Init, dotnet } from './Gna.Iata.js'

import { Season } from './Gna.Iata.Season.js'

import { SsimReader } from './Gna.Iata.Ssim.SsimReader.js'

import { MakeGlobe } from './globe.js'

await Init();

afterInit();
 
function bindFileInput() {
    const elem = document.getElementById("fileInput");
    elem.type = "file";

    elem.addEventListener("change", async () => {
        if (elem.files.length == 1) {

            ClearTable();

            var ssimReader = new SsimReader();
            let start = performance.now();

            var legs = await ssimReader.ReadFromFileAsync(elem.files[0]);
            
            let timeConsumed = performance.now() - start;

            console.log(`ReadFromFileAsync: ${legs.length} legs, time: ${timeConsumed}`);

            //  CreateTable(legs);

            const stats = document.getElementById("fileStats");
            var routes = getRoutes(legs);

            stats.innerText = `Total of ${legs.length} legs \n Total of ${routes.length} routes`;

            MakeGlobe(routes);
        }
    });
}

function getRoutes(legs) {

    var legRoutes = new Set();
    var routes = [];

    legs.forEach(leg => { 

        var route = leg.DepAirportCode + leg.ArrAirportCode;

        if (!legRoutes.has(route)) {
            legRoutes.add(route);
            routes.push(leg);
        }
    });
    return routes;
}

function afterInit() {

    bindFileInput();

    document.getElementById("out").classList.add("d-none");
    document.getElementById("in").classList.remove("d-none");

    TestSeason();
}

function TestSeason() {

    const seasonNow = new Season().Now();
    const seasonPrev = seasonNow.Previous();
    const seasonNext = seasonNow.Next();
    const seasonW22 = seasonNow.CreateFromName("W22");
    const season2015 = seasonNow.CreateFromDate(new Date(2015, 11, 17, 3, 24, 0));
    const season2015contains = season2015.Contains(new Date(2015, 11, 17, 3, 24, 0));

    console.log(`Now is ${seasonNow.Name}, previous was ${seasonPrev.Name}`);

    // adding the result of Greet method call to the inner text of
    // an element out id "out"
    //document.getElementById("out").innerText = `Now is ${seasonNow.Name}, previous was ${seasonPrev.Name}`;
}

function ClearTable() {

    var thead = document.querySelector("thead");
    thead.innerHTML = "";

    var tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
}

function CreateTable(parsed_data) {

    const columns = new Set(); 

    parsed_data.forEach(json_data_set => {
        var tr = document.createElement("tr");
        Object.keys(json_data_set).forEach(key => {

            if (json_data_set[key]) {
                columns.add(key);
            } 
        });
    });

    var th = document.createElement("tr");
    columns.forEach(col => { 
        var td = document.createElement("th");
        td.innerText = col;
        th.appendChild(td)
    });
    document.querySelector("thead").appendChild(th)

    parsed_data.forEach(json_data_set => {
        var tr = document.createElement("tr")
        Object.keys(json_data_set).forEach(key => {

            if (columns.has(key)) {
                var td = document.createElement("td")
                td.innerText = json_data_set[key]
                tr.appendChild(td)
            }
        });

        document.querySelector("tbody").appendChild(tr)

    });
}