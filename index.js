import { Init } from './GnaIata/Gna.Iata.js'

import { Season } from './GnaIata/Gna.Iata.Season.js'

import { SsimReader } from './GnaIata/Gna.Iata.SsimReader.js'
import { SsimWriter } from './GnaIata/Gna.Iata.SsimWriter.js'

import { MakeGlobe, ClearGlobe } from './globe.js'

import { GetSampleLegs } from "./sampleSsim.js"

let legs = [];
let routes = [];
let fileName = "";

const rowLimit = 1000;

await Init();

afterInit();

function bindFileInput() {
    const fileInput = document.getElementById("fileInput");
    fileInput.type = "file";

    fileInput.addEventListener("change", async () => {
        if (fileInput.files.length == 1) {

            legs = [];
            routes = [];
            fileName = "";

            hideReadError();
            hideWriteError();

            ClearGlobe();
            ClearTable();

            showProgressBar("Loading ssim file");
            try { 

                const stats = document.getElementById("fileStats");
                stats.innerText = "";

                let ssimReader = new SsimReader();


                ssimReader.Options.SkipValidation = isChecked("checkSkipValidation");
                ssimReader.Options.SuppressSsimErrors = isChecked("checkSuppressSsimErrors");
                ssimReader.Options.IgnoreSegmentData = isChecked("checkIgnoreSegmentData");
                
                let start = performance.now();

                legs = (await ssimReader.ReadFromFileAsync(fileInput.files[0])).Legs;
                fileName = fileInput.files[0].name;

                let parsingTimeConsumed = performance.now() - start;

                console.log(`ReadFromFileAsync: ${legs.length} legs, time: ${parsingTimeConsumed}`);

                routes = getRoutes(legs); 
                

                stats.innerText = `Total of ${legs.length} legs \n Total of ${routes.length} routes \n`
/// Parsing time taken: ${ (parsingTimeConsumed / 1000).toFixed(2) } seconds `;

                start = performance.now();

                MakeGlobe(routes);

                let renderTimeConsumed = performance.now() - start;

                CreateTable(legs);

//                stats.innerText += `\n 3d prepare time taken: ${(renderTimeConsumed / 1000).toFixed(2)} seconds `;
            }
            catch(ex)
            {
                showReadError(ex);
            }
            finally {
                hideProgressBar();
            }
        }
    });

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async () => {

        hideWriteError();

        if (fileName) {
            try {
                showProgressBar("Downloading ssim file");
                let ssimWriter = new SsimWriter();
                ssimWriter.Options.LocalTime = !isChecked("checkUTC")
                ssimWriter.Options.IgnoreDuplicates = isChecked("checkIgnoreDuplicates");
                ssimWriter.Legs = legs;                
                let start = performance.now();

                var filename = fileName.split('.').slice(0, -1);

                let data = "";

                if (isChecked("checkCompressed")) {
                    data = await ssimWriter.WriteToStreamAsync(filename.join(".ssim"), true);
                    filename = filename + ".zip";
                }
                else {
                    data = await ssimWriter.WriteToStringAsync();
                    filename = filename + ".ssim";
                }

                let writingTimeConsumed = performance.now() - start;
                console.log(`WriteToStringAsync: ${legs.length} legs, time: ${writingTimeConsumed}`);

                download(data, filename);
            }
            catch (ex) {
                showWriteError(ex);
            }
            finally {
                hideProgressBar();
            }
        }
        else
            showWriteError("Load ssim file first");
    });


    const sampleButton = document.getElementById("pills-demo-tab");

    sampleButton?.addEventListener("click", async () => {

       // showProgressBar("Getting sample legs");
        ClearGlobe();
        ClearTable();

        try {
            fileName = "sampleLegs.ssim";
            legs = await GetSampleLegs();

            routes = getRoutes(legs);

            MakeGlobe(routes); 
            CreateTable(legs);
        }
        catch (ex) {
            showWriteError(ex);
        }
        finally {
            hideProgressBar();
        }
    });
} 

function download(data, filename) {

    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = filename ?? '';
    anchorElement.click();
    anchorElement.remove();
    URL.revokeObjectURL(url);
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

function updateControls() {
    if (legs?.length > 0) {

        document.getElementById("pills-download-tab").removeAttribute('disabled');
        document.getElementById("pills-table-tab").removeAttribute('disabled');
        document.getElementById("pills-globe-tab").removeAttribute('disabled');

        if (legs?.length > rowLimit) {
            document.getElementById("rowCaptionTop").innerHTML = `Showing first ${rowLimit} legs only`;
            document.getElementById("rowCaptionBottom").innerHTML = `Showing first ${rowLimit} legs only`;
        }
    }
    else {
        document.getElementById("rowCaptionTop").innerHTML = "";
        document.getElementById("rowCaptionBottom").innerHTML = "";
        document.getElementById("pills-download-tab").setAttribute('disabled', '');
        document.getElementById("pills-table-tab").setAttribute('disabled', '');
        document.getElementById("pills-globe-tab").setAttribute('disabled', '');
    }

    document.getElementById("legsCount").innerHTML = legs?.length ?? 0;
    document.getElementById("routesCount").innerHTML = routes?.length ?? 0;



}

function hideProgressBar() {
    document.getElementById("progressText").innerHTML = "";
    document.getElementById("out").classList.add("d-none");
    document.getElementById("globeViz").classList.remove("d-none");
    updateControls();
}

function showProgressBar(text) {
    document.getElementById("progressText").innerHTML = text;
    document.getElementById("out").classList.remove("d-none");
    document.getElementById("globeViz").classList.add("d-none");
    updateControls();
}

function showReadError(error) {
    document.getElementById("fileInput").classList.add("is-invalid");
    document.getElementById("fileError").innerHTML = error; 
}

function showWriteError(error) {
    document.getElementById("saveButton").classList.add("is-invalid");
    document.getElementById("fileWriteError").innerHTML = error; 
}

function hideReadError() {
    document.getElementById("fileInput").classList.remove("is-invalid");
    document.getElementById("fileError").innerHTML = ""; 
}

function hideWriteError() {
    document.getElementById("saveButton").classList.remove("is-invalid");
    document.getElementById("fileWriteError").innerHTML = "";
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

    var rowCount = 0;

    parsed_data.forEach(json_data_set => {
        var tr = document.createElement("tr");

        if (rowCount++ > rowLimit)
            return;

        Object.keys(json_data_set).forEach(key => { 

            if (columns.has(key)) {
                var td = document.createElement("td")

                var cell = json_data_set[key];

                if (cell instanceof Date) {
                    if (key == "FlightDate")
                        cell = dateFormat(cell);
                    else
                        cell = dateTimeFormat(cell);
                }
                td.innerText = cell;
                tr.appendChild(td)
            }  
        });

        document.querySelector("tbody").appendChild(tr)

    });
}

const dateFormat = (date, locale = "en-US") => {
    let d = date.getDate(),
        m = date.toLocaleString(locale, { month: 'long' }).toUpperCase(),
        y = date.getFullYear().toString().substr(-2);

    return `${y}${m}${y} `;
}

const dateTimeFormat = (date, locale = "en-US") => {
    let d = date.getDate(),
        m = date.toLocaleString(locale, { month: 'long' }).toUpperCase(),
        y = date.getFullYear().toString().substr(-2),
        h = date.getHours(),
        min = date.getMinutes();

    return `${y}${m}${y} ${h}${min}`;
}