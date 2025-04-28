About:
-------
This repository demonstrates use of C# IATA SSIM Parsing Writing Library [Gna.Iata](https://www.nuget.org/packages/Gna.Iata) in regular JavaScript website (as wasm module). The implementation does use Web Workers to not block the main UI thread when working with SSIM file.

Working demo: 
-------------
https://avionworx.github.io/Gna.Iata.Js/
* Iata Ssim parsing <a class="link" href="https://www.avionworx.aero">Avionworx</a> [wasm]
* 3D Visualisation: <a class="link" href="https://globe.gl/">Globe.GL</a> [threejs]
* Airport data: <a class="link" href="https://ourairports.com/data/">OurAirports</a>
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


```

