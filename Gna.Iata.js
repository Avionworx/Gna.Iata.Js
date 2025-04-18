// note that it expects to load dotnet.js 
// (and wasm files) from _framework folder

import { dotnet } from './_framework/dotnet.js' 

export async function Init()
{
    if (window.avionworx === undefined) {
        const is_browser = typeof window != "undefined";
        if (!is_browser) throw new Error(`Expected to be running in a browser`);

        // get the objects needed to run exported C# code
        const { getAssemblyExports, getConfig } =
            await dotnet.create();

        // config contains the web-site configurations
        const config = getConfig();

        // exports contain the methods exported by C#
        window.avionworx = await getAssemblyExports(config.mainAssemblyName);
    }
} 

export function AssertLoaded() {
    if (window.avionworx === undefined) {
        throw new Error("Please call Init method from Gna.Iata module");
    }
}

export { dotnet };