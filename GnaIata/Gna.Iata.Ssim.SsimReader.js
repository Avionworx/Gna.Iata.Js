import { AssertLoaded } from './Gna.Iata.js'
export class SsimReader {
    constructor(obj) {
        this.Options =
        {
            DisrespectLocalTimes: false,
            IgnoreSegmentData: false,
            SuppressSsimErrors: false,
            SkipValidation: false
        };

        this.Legs = [];

        this.ReadFromStringAsync = function(string, isZip) { return ReadFromStringAsync(this, string, isZip); };

        this.ReadFromStreamAsync = function(stream, isZip) { return ReadFromStreamAsync(this, stream, isZip); };

        this.ReadFromFileAsync = async function(file, isZip) { return await ReadFromFileAsync(this, file, isZip); };

        if (obj)
            for (var prop in obj) this[prop] = obj[prop];
    }
} 

async function ReadFromStringAsync(reader, string, isZip) {
    AssertLoaded();
    var s = await window.avionworx.Gna.Iata.Js.SsimReader.ReadFromStringAsync(JSON.stringify(reader), string, isZip);
    var ssimReader = new SsimReader(JSON.parse(s));
    return ssimReader;
} 
 
async function ReadFromStreamAsync(reader, stream, isZip) {
    AssertLoaded();
    var s = await window.avionworx.Gna.Iata.Js.SsimReader.ReadFromStreamAsync(JSON.stringify(reader), stream, isZip);
    var ssimReader = new SsimReader(JSON.parse(s));
    return ssimReader;
}

async function ReadFromFileAsync(reader, file, isZip) { 

    let fileName = file.name;
    
    if (isZip === undefined) {
        let extension = fileName.split('.').pop();
        isZip = extension?.toUpperCase() == "ZIP";
    }

    const data = await readFile(file, "readAsArrayBuffer"); 
     
    var array = new Uint8Array(data);

    return await ReadFromStreamAsync(reader, array, isZip); 
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
