import { AssertLoaded } from './Gna.Iata.js'
import { ExecuteAsync } from './worker.js'
export function SsimWriter(obj) {
    this.Options =
    {
        LocalTime: false,
        SkipTimezoneDifferences: false,
        IgnoreDuplicates: false
    };

    this.Legs = [];

    this.Error = null;

    this.WriteToStringAsync = function () { return WriteToStringAsync(this); }; 
    this.WriteToStreamAsync = function (fileName, isZip) { return WriteToStreamAsync(this, fileName, isZip); }; 

    if (obj)
        for (let prop in obj) this[prop] = obj[prop];
}

async function WriteToStringAsync(writer, isZip) {
    if (window?.Worker) {
        return await ExecuteAsync("./SsimWriterWorker.js", [JSON.stringify(writer), isZip], null);
    }
    else {
        const avionworx = AssertLoaded();
        let s = await avionworx.Gna.Iata.Js.SsimWriter.WriteToStringAsync(JSON.stringify(writer), isZip);
        return s;
    }
} 

async function WriteToStreamAsync(writer, fileName, isZip) {
    if (window?.Worker) {
        return await ExecuteAsync("./SsimWriterWorker.js", [JSON.stringify(writer), fileName, isZip], null);
    }
    else {
        const avionworx = AssertLoaded();
        let s = await avionworx.Gna.Iata.Js.SsimWriter.WriteToStreamAsync(JSON.stringify(writer), fileName, isZip);
        return s;
    }
} 