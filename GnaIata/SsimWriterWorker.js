const GnaIataJs = await import('./Gna.Iata.js');  

import { WorkerInitializedMessage, WorkerResponseMessage } from './worker.js';

onmessage = async (e) => {  

    let writer = e.data[0];
    let isZip = false;
    let fileName = null;
    let isStream = false;
        
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

    let response;

    try {
        const avionworx = await GnaIataJs.Init();

        let res = "";
        if (isStream)
            res = avionworx.Gna.Iata.Js.SsimWriter.WriteToStream(writer, fileName, isZip); 
        else
            res = await avionworx.Gna.Iata.Js.SsimWriter.WriteToStringAsync(writer); 

        response = new WorkerResponseMessage(res, null);        
    }
    catch (e) { 
        console.log(e.message);
        response = new WorkerResponseMessage(JSON.parse(writer), e.message); 
    } 
    postMessage(response,response); 
}; 

postMessage(WorkerInitializedMessage);