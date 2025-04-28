const GnaIataJs = await import('./Gna.Iata.js');  

import { WorkerInitializedMessage, WorkerResponseMessage } from './worker.js';

onmessage = async (e) => {  

    var reader = e.data[0];
    var data = e.data[1];
    var isZip = e.data[2];
    let stringResult = "";
    let s = new WorkerResponseMessage(null, null);

    try {
        const avionworx = await GnaIataJs.Init();

        if (typeof data === 'string' || data instanceof String)
            stringResult = await avionworx.Gna.Iata.Js.SsimReader.ReadFromStringAsync(reader, data, isZip);
        else
            stringResult = await avionworx.Gna.Iata.Js.SsimReader.ReadFromStreamAsync(reader, data, isZip);

        s = new WorkerResponseMessage(JSON.parse(stringResult), null);
    }
    catch (e) {
        console.log(e.message);

        s = new WorkerResponseMessage(JSON.parse(reader), e.message);
    } 

    postMessage(s, s); 
}; 

postMessage(WorkerInitializedMessage);