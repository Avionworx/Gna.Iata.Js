import { dotnet } from './_framework/dotnet.js'
import { AssertLoaded } from './Gna.Iata.js'
export function SsimReader(obj)  
{
    this.DisrespectLocalTimes = false;
    this.IgnoreSegmentData = false;
    this.SuppressSsimErrors = false;
    this.SkipValidation = false;  

    this.ReadFromString = function (str) { return ReadFromString(str); };

    this.ReadFromStream = function (str) { return ReadFromStream(this, str); };
    //this.ReadFromStreamAsync = async function (str) { return await ReadFromStreamAsync(str); };

    //this.ReadFromFile = function (file) { return ReadFromFile(file).result; };
    this.ReadFromFileAsync = async function (file) { return await ReadFromFileAsync(this, file); };

    if (obj)
        for (var prop in obj) this[prop] = obj[prop];
}


function ReadFromString(str) {
    AssertLoaded();
    return JSON.parse(window.avionworx.Gna.Iata.Js.SsimReader.ReadFromString(str));
} 

function ReadFromStream(stream) {
    AssertLoaded();
    return JSON.parse(window.avionworx.Gna.Iata.Js.SsimReader.ReadFromStream(stream));
}

async function ReadFromStreamAsync(stream, isZip) {
    AssertLoaded();
    var r = await window.avionworx.Gna.Iata.Js.SsimReader.ReadFromStreamAsync(stream, isZip);
    return JSON.parse(r);
}

const readFile = (file = {}, method = 'readAsText') => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader[method](file)
        reader.onload = evt => {
            resolve(evt.target.result)
        }
        reader.onerror = (error) => reject(error)
    })
}
//function ReadFromFile(reader, file) {
//    AssertLoaded();

//    let fileName = file.name;
//    let extension = fileName.split('.').pop();
//    let isZip = extension?.toUpperCase() == "ZIP";

//    const data = await readFile(file, "readAsArrayBuffer");

//    var array = new Uint8Array(data);
//    var legs2 = ReadFromStreamAsync(array, isZip);
//    performance.mark("EndRead");

//    return legs2;
//}
 
async function ReadFromFileAsync(reader, file) {
    AssertLoaded();

    let fileName = file.name;
    let extension = fileName.split('.').pop();
    let isZip = extension?.toUpperCase() == "ZIP";

    const data = await readFile(file, "readAsArrayBuffer"); 
     
    var array = new Uint8Array(data); 
    var legs2 = await ReadFromStreamAsync(array, isZip);
    performance.mark("EndRead"); 

    return legs2; 
}
