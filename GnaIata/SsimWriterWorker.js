const GnaIataJs = await import('./Gna.Iata.js');  

import { WorkerInitializedMessage, WorkerResponseMessage } from './worker.js';

onmessage = async (e) => {  

    var writer = e.data[0];
    var isZip = false;
    var fileName = null;
    var isStream = false;
        
    if (e.data.length > 1) {
        if (typeof e.data[1] === 'string' || e.data[1] instanceof String) {
            isStream = true;
            fileName = e.data[1];
        }
        else
            isZip = e.data[1];
    }

    if (e.data.length > 2)
        isZip = e.data[2]; 

    let s = new WorkerResponseMessage(null, null);

    try {
        const avionworx = await GnaIataJs.Init();

        let res = "";
        if (isStream)
            res = await avionworx.Gna.Iata.Js.SsimWriter.WriteToStreamAsync(writer, fileName, isZip); 
        else
            res = await avionworx.Gna.Iata.Js.SsimWriter.WriteToStringAsync(writer, isZip); 

        s = new WorkerResponseMessage(res, null);        
    }
    catch (e) { 
        console.log(e.message);
        s = new WorkerResponseMessage(JSON.parse(writer), e.message); 
    } 
    postMessage(s,s); 
}; 

postMessage(WorkerInitializedMessage);