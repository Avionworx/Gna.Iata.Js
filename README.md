About:
-------
This repository demonstrates use of C# IATA SSIM Parsing Writing Library [Gna.Iata](https://www.nuget.org/packages/Gna.Iata) in regular javaScript website (as WASM module). The implementation does use web workers to not block the main UI thread when working with SSIM file.

Working demo: 
-------------
https://avionworx.github.io/Gna.Iata.Js/
* Iata Ssim parsing <a class="link" href="https://www.avionworx.aero">Avionworx</a> [wasm]
* 3D Visualisation: <a class="link" href="https://globe.gl/">Globe.GL</a> [threejs]
* Airport data: <a class="link" href="https://ourairports.com/data/">OurAirports</a>
* Random data: <a class="link" href="https://github.com/jpatokal/openflights/tree/master/data">jpatokal /openflights</a>
* CSS :<a class="link" href="https://getbootstrap.com/">Bootstrap</a> [css]

How to use it:
-------

index.html

```html

...
  <input type="file" id="fileInput">
...
  <script type="module" src="index.js"></script>
...
```

index.js

```js  

// import Gna.Iata.JS modules

import { Init } from './GnaIata/Gna.Iata.js'
import { SsimReader } from './GnaIata/Gna.Iata.Ssim.SsimReader.js'
import { SsimWriter } from './GnaIata/Gna.Iata.Ssim.SsimWriter.js'

...

// init Gna.Iata web assembly
await Init();

...

// Ssim reading

let ssimReader = new SsimReader();

const elem = document.getElementById("fileInput");

elem.addEventListener("change", async () => {
        if (elem.files.length == 1) {

            // Read legs from selected file            
            let legs = (await ssimReader.ReadFromFileAsync(elem.files[0])).Legs;
            // do something with legs here
            // legs.forEach(leg => { ... })

        }
});

// Ssim writing

let ssimWriter = new SsimWriter();
ssimWriter.Legs = legs;
ssimWriter.Options.LocalTime = true;

let output = await ssimWriter.WriteToStringAsync();
// do something with output

```

Performance:
---------------------

|Number of legs| .NET Read | WASM Read | .NET Write | WASM Write |
|--------------|-----------|-----------|------------|------------|
| 6710  | 15 ms | 66 ms | 19 ms | 226 ms |
| 79651 | 66 ms | 352 ms | 198 ms | 1354 ms| 
| 235599 | 409 ms | 1131 ms | 937 ms |3829 ms | 

Although the numbers above show that execution under AOT WASM is, on average, four times slower than native .NET execution, it's worth noting that WASM is limited to a single thread, which is likely the main reason for the significant performance difference.

It is also important to mention that:

- The above measurements do not include the communication overhead between JavaScript (Web Workers) and the WASM module.
- The WASM modules were compiled using the [AOT](https://learn.microsoft.com/en-us/aspnet/core/blazor/webassembly-build-tools-and-aot?view=aspnetcore-9.0) option.
