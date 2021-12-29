const Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
        item: ['status',
            'username',
            'category',
            'official',
            'description',
            'active'],
    }
});

let trailMap = new Map();
trailMap.set("hoeckler", 'https://www.trailforks.com/trails/hocklertrail-by-zuritrails/reports/rss/');
trailMap.set("adlisberg", 'https://www.trailforks.com/trails/biketrail-adlisberg/reports/rss');
trailMap.set("antennentrail", 'https://www.trailforks.com/trails/antennentrail/reports/rss');

let statusMap = new Map();
statusMap.set("1", "ampelgruen");
statusMap.set("2", "ampelgelb");
statusMap.set("3", "ampelgelb");
statusMap.set("4", "ampelrot");

let footerMap = new Map();
footerMap.set("1", "Alles offen. Happy Trails!");
footerMap.set("2", "Bitte beachte die Hinweise. Danke für deine Rücksichtnahme!");
footerMap.set("3", "Bitte beachte die Hinweise und fahre nicht bei Nässe und Schlamm. Danke für deine Rücksichtnahme!");
footerMap.set("4", "Bitte beachte die Hinweise und fahre nicht bei Nässe und Schlamm. Danke für deine Rücksichtnahme!");

let status = "1";
let description = "Keine Beschreibung gefunden / No description found.";

export function trafficlight(req, res) {
    let trail = request.query.trail;
    
    if (!trail){
        trail = "hoeckler";
    }

    (async () => {

        let feed = await parser.parseURL(trailMap.get(trail));

        for (let index = 0; index < feed.items.length; index++) {
            const item = feed.items[index];
            if (item.official === "1") {
                status = item.status;
                description = item.description;
                break;
            }
        }

        let response = `
    <!doctype html>
    <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <h1>Trailstatus</h1>    
        <span class="css-ampel ${statusMap.get(status)}"><span></span></span>
        <span id="desc">${description}
        <br>${footerMap.get(status)}</span>
        <br><span style="font-size:x-small"></span><br>
        <img id="infoIcon" src="info.png" title="Der Trailstatus mit der Ampel wird automatisch anhand vom aktuellsten offiziellen Trailforks Report bestimmt. Der Status ist also ohne Gewähr!"/>
    </body>
    <script>
        (function() {
            let height = document.getElementById("desc").offsetHeight;
            let icon = document.getElementById("infoIcon");
            let margin = 130 - height;
            icon.style.marginTop = margin + "px";
            let counter = 1;
            document.body.querySelectorAll('img').forEach(function (node) {
                if (node.id !== "infoIcon") {
                    var outerWrapper = document.createElement('span');
                    outerWrapper.appendChild(document.createTextNode(' [Bild'+ counter+']'))
                    outerWrapper.classList.add("hover");
                    var imgWrapper = document.createElement('span');
                    imgWrapper.classList.add("tooltip");
                    let parent = node.parentNode;
                    imgWrapper.appendChild(node);
                    outerWrapper.appendChild(imgWrapper);
                    parent.appendChild(outerWrapper);
                    counter++;
                }
            });
        })();
        </script>
    </html>
    `;
    if (feed.items.length > 0){
        res.status(200).send(response);
    } else {
        res.status(404).send("<html><body><h3>Cloud not load trailstatus. Try again later...</h3></body></html>");
    }


    })();
}

