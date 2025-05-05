import { Init } from './GnaIata/Gna.Iata.js'

import { Season } from './GnaIata/Gna.Iata.Season.js'

import { SsimReader } from './GnaIata/Gna.Iata.SsimReader.js'
import { SsimWriter } from './GnaIata/Gna.Iata.SsimWriter.js'

import { MakeGlobe, ClearGlobe, GetAirports } from './globe.js'

import { GetSampleLegs } from "./sampleSsim.js"

let legs = [];
let routes = [];
let airports = [];
let fileName = "";

const rowLimit = 1000;

await Init();

afterInit();

function bindFileInput() {
    const fileInput = document.getElementById("fileInput");
    fileInput.type = "file";

    fileInput.addEventListener("change", async () => {
        if (fileInput.files.length == 1) {

            hideReadError();
            hideWriteError();

            clearAll();

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

                stats.innerText = `Total of ${legs.length} legs \n Total of ${routes.length} routes \n`; 

                await setAll();
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

                let filename = fileName.split('.').slice(0, -1);

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

        showProgressBar("Loading some data");
        clearAll();

        try {
            fileName = "sampleLegs.ssim";
            legs = await GetSampleLegs();

            routes = getRoutes(legs);

            await setAll();
        }
        catch (ex) {
            showWriteError(ex);
        }
        finally {
            hideProgressBar();
        }
    });
} 

function clearAll() {

    legs = [];
    routes = [];
    fileName = "";

    ClearGlobe();

    ClearTable("legsTable");
    ClearTable("airportsTable");
}

async function setAll() {
    await MakeGlobe(routes);
    airports = GetAirports();
    CreateTable("legsTable", legs);
    CreateTable("airportsTable", airports);
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
    let checkbox = document.getElementById(id);
    if (checkbox)
        return checkbox.checked;
    return false;
}

function getRoutes(legs) {

    let legRoutes = new Set();
    let routes = [];

    legs.forEach(leg => { 

        let route = leg.DepAirportCode + leg.ArrAirportCode;

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
        document.getElementById("pills-legs-tab").removeAttribute('disabled');
        document.getElementById("pills-airports-tab").removeAttribute('disabled');
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
        document.getElementById("pills-legs-tab").setAttribute('disabled', '');
        document.getElementById("pills-airports-tab").setAttribute('disabled', '');
        document.getElementById("pills-globe-tab").setAttribute('disabled', '');
    }

    document.getElementById("legsCount").innerHTML = legs?.length ?? 0;
    document.getElementById("airportsCount").innerHTML = airports?.length ?? 0;
    document.getElementById("routesCount").innerHTML = routes?.length ?? 0;



}

function hideProgressBar() {
    document.getElementById("out")?.removeAttribute("title");
    document.getElementById("out").classList.add("d-none"); 
    document.getElementById("pills-demo-tab").removeAttribute('disabled');
    updateControls();
}

function showProgressBar(text) {
    document.getElementById("pills-demo-tab").removeAttribute('disabled');
    document.getElementById("out")?.setAttribute("title", text);
    document.getElementById("out").classList.remove("d-none"); 
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
    seasonNow.Next();
    seasonNow.CreateFromName("W22");
    const season2015 = seasonNow.CreateFromDate(new Date(2015, 11, 17, 3, 24, 0));
    season2015.Contains(new Date(2015, 11, 17, 3, 24, 0));

    console.log(`Now is ${seasonNow.Name}, previous was ${seasonPrev.Name}`); 
}

function ClearTable(tableId) {

    let table = document.getElementById(tableId);
    table.getElementsByTagName("thead")[0].innerHTML = "";
    table.getElementsByTagName("tbody")[0].innerHTML = "";
}

function CreateTable(tableId, parsed_data) {

    const columns = new Set(); 

    parsed_data.forEach(json_data_set => {
        Object.keys(json_data_set).forEach(key => {

            if (json_data_set[key]) {
                columns.add(key);
            } 
        });
    });

    let table = document.getElementById(tableId); 

    columns.forEach(col => { 
        let th = document.createElement("th");
        th.innerText = col; 
        table.getElementsByTagName("thead")[0].appendChild(th);
    });

    let rowCount = 0; 

    parsed_data.forEach(json_data_set => {
        let tr = document.createElement("tr");

        if (rowCount++ > rowLimit)
            return;

        Object.keys(json_data_set).forEach(key => { 

            if (columns.has(key)) {
                let td = document.createElement("td")

                let cell = json_data_set[key];

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

        table.getElementsByTagName("tbody")[0].appendChild(tr);

    }); 
}

const dateFormat = (date, locale = "en-US") => {
    let  
        m = date.toLocaleString(locale, { month: 'long' }).toUpperCase(),
        y = date.getFullYear().toString().substr(-2);

    return `${y}${m}${y} `;
}

const dateTimeFormat = (date, locale = "en-US") => {
    let  
        m = date.toLocaleString(locale, { month: 'long' }).toUpperCase(),
        y = date.getFullYear().toString().substr(-2),
        h = date.getHours(),
        min = date.getMinutes();

    return `${y}${m}${y} ${h}${min}`;
}