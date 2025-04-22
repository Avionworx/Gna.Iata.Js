import { Init } from './GnaIata/Gna.Iata.js'

import { Season } from './GnaIata/Gna.Iata.Season.js'

import { SsimReader } from './GnaIata/Gna.Iata.Ssim.SsimReader.js'

import { MakeGlobe, ClearGlobe } from './globe.js'

await Init();

afterInit();
 
function bindFileInput() {
    const elem = document.getElementById("fileInput");
    elem.type = "file";

    elem.addEventListener("change", async () => {
        if (elem.files.length == 1) {

            hideError();

            ClearGlobe();

            showProgressBar();
            try {
                ClearTable();

                const stats = document.getElementById("fileStats");
                stats.innerText = "";

                var ssimReader = new SsimReader();


                ssimReader.Options.SkipValidation = isChecked("checkSkipValidation");
                ssimReader.Options.SuppressSsimErrors = isChecked("checkSuppressSsimErrors");
                ssimReader.Options.IgnoreSegmentData = isChecked("checkIgnoreSegmentData");
                
                let start = performance.now();

                var legs = (await ssimReader.ReadFromFileAsync(elem.files[0])).Legs;

                let parsingTimeConsumed = performance.now() - start;

                console.log(`ReadFromFileAsync: ${legs.length} legs, time: ${parsingTimeConsumed}`);

                //  CreateTable(legs);


                var routes = getRoutes(legs);

                stats.innerText = `Total of ${legs.length} legs \n Total of ${routes.length} routes \n Parsing time taken: ${(parsingTimeConsumed / 1000).toFixed(2)} seconds `;

                start = performance.now();

                MakeGlobe(routes);

                let renderTimeConsumed = performance.now() - start;

                stats.innerText += `\n 3d prepare time taken: ${(renderTimeConsumed / 1000).toFixed(2)} seconds `;
            }
            catch(ex)
            {
                showError(ex);
            }
            finally {
                hideProgressBar();
            }
        }
    });
}

function isChecked(id) {
    var checkbox = document.getElementById(id);
    if (checkbox)
        return checkbox.checked;
    return false;
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

function hideProgressBar() {
    document.getElementById("out").classList.add("d-none");
}

function showProgressBar() {
    document.getElementById("out").classList.remove("d-none");
}

function showError(error) {
    document.getElementById("fileInput").classList.add("is-invalid");
    document.getElementById("fileError").innerHTML = error;
    fileError
}

function hideError() {
    document.getElementById("fileInput").classList.remove("is-invalid");
    document.getElementById("fileError").innerHTML = "";
}

function afterInit() {

    bindFileInput();

    hideProgressBar();
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