// note that it expects to load dotnet.js 
// (and wasm files) from framework folder

import { dotnet } from './framework/dotnet.js'  
 
let exports;

export async function Init()
{
    if (!exports) { 

        // get the objects needed to run exported C# code
        const { getAssemblyExports, getConfig } =
            await dotnet.create();

        // config contains the web-site configurations
        const config = getConfig();

        // exports contain the methods exported by C#
        exports = await getAssemblyExports(config.mainAssemblyName); 
    }
    return exports;
} 

export function AssertLoaded() {
    if (!exports) {
        throw new Error("Please call Init method from Gna.Iata module");
    }
    return exports;
} 