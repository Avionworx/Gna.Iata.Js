const GnaIataJs = await import('./Gna.Iata.js');  

import { WorkerInitializedMessage, WorkerResponseMessage } from './worker.js';

onmessage = async (e) => {  

    let reader = e.data[0];
    let data = e.data[1];
    let isZip = e.data[2];
    let stringResult = "";
    let response;

    try {
        const avionworx = await GnaIataJs.Init();

        if (typeof data === 'string' || data instanceof String)
            stringResult = await avionworx.Gna.Iata.Js.SsimReader.ReadFromStringAsync(reader, data, isZip);
        else
            stringResult = await avionworx.Gna.Iata.Js.SsimReader.ReadFromStreamAsync(reader, data, isZip);

        response = new WorkerResponseMessage(JSON.parse(stringResult), null);
    }
    catch (e) {
        console.log(e.message);

        response = new WorkerResponseMessage(JSON.parse(reader), e.message);
    } 

    postMessage(response, response); 
}; 

postMessage(WorkerInitializedMessage);