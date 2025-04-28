
export const WorkerInitializedMessage = "init";

export function WorkerResponseMessage(data, error) {

    this.Data = data;
    this.Error = error;
}
 
export async function ExecuteAsync(url, message) { 

    const worker = new Worker(new URL(url, import.meta.url), { type: "module" }); 

    let resolver = undefined; 
    const messagePromise = new Promise(
        (resolve) => resolver = resolve);  

    let s = new WorkerResponseMessage(null, "No result");

    try {
        worker.onmessage = (p) => {

            if (p.data == WorkerInitializedMessage) {

                worker.onmessage = (payload) => {

                   s = payload.data;
                   resolver?.();
                }

                worker.postMessage(message);
            }
            else
                messagePromise.resolve();
        };

        await messagePromise;

        if (s.Error)
            throw new Error(s.Error);

        return s.Data;
    }
    finally {
        worker.terminate();
    } 
}