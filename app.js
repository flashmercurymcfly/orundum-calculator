let penguinStatsData;
let penguinStatsStageData;
let penguinStatsZoneData;
let zones;
let eventStages;
let timeDiffArray = [];
let timeDiffAvg;
let orundumAmount = 0;

function init() {
    const Http = new XMLHttpRequest();
    const url='https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&server=CN&show_closed_zones=true';
    Http.open("GET", url, true);
    Http.send();

    Http.onload = (e) => {
        penguinStatsData = JSON.parse(Http.responseText).matrix;

        const Http2 = new XMLHttpRequest();
        const url2='https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN';
        Http2.open("GET", url2, true);
        Http2.send();

        Http2.onload = (e) => {
            penguinStatsStageData = JSON.parse(Http2.responseText);

            const Http3 = new XMLHttpRequest();
            const url3='https://penguin-stats.io/PenguinStats/api/v2/zones';
            Http3.open("GET", url3, true);
            Http3.send();

            Http3.onload = (e) => {
                penguinStatsZoneData = JSON.parse(Http3.responseText);
                zones = penguinStatsZoneData.filter(data => !data.existence.US.exist && data.type === 'ACTIVITY');
                for(let i = 0; i < zones.length; i++) {
                    let option = document.createElement('option');
                    option.text = zones[i].zoneName_i18n.en;
                    option.value = zones[i].zoneId;
                    document.getElementById("events").add(option);
                }
                document.getElementById("eventImg").src = 'https://penguin-stats.s3.amazonaws.com' + zones[0].background;

                let zonesForTimeDiff = penguinStatsZoneData.filter(data => data.existence.US.exist && data.type === 'ACTIVITY');
                console.log(zonesForTimeDiff);
                let timeDiffTotal = 0;
                for(let i = 0; i < zonesForTimeDiff.length; i++) {
                    timeDiffTotal += zonesForTimeDiff[i].existence.US.openTime - zonesForTimeDiff[i].existence.CN.openTime;
                }
                timeDiffAvg = timeDiffTotal / zonesForTimeDiff.length;
                document.getElementById('eventTimeDiff').innerHTML = 'The estimated average time between CN and Global release dates is ' + parseFloat(timeDiffAvg/2629746000).toFixed(2) +' months';
            }
        }
    }
}

function changeEvent() {
    let eventIndex = document.getElementById('events').selectedIndex;
    document.getElementById("eventImg").src = 'https://penguin-stats.s3.amazonaws.com' + zones[eventIndex].background;
}

function calculateOrundum() {
    let currentOrundum = document.getElementById('currentO').value;
    let eventIndex = document.getElementById('events').selectedIndex;
    let monthly = document.getElementById('monthly').checked;
    let cert = document.getElementById('cert').checked;
    let anni = document.getElementById('anni').value;
    let onePermit = document.getElementById('onePermit').value;
    let tenPermit = document.getElementById('tenPermit').value;
    let prime = document.getElementById('prime').value;

    //Delayed event check here
    let actualTimeDiff = timeDiffAvg + zones[eventIndex].existence.CN.openTime - Date.now();
    if(actualTimeDiff <= 0) {
        document.getElementById('resultLabel').innerHTML = 'Looks like Yostar & Hypergryph fucked with the schedule again.  Where is this event anyways?'
        return;
    }

    let monthsAvailable = Math.floor(actualTimeDiff/2629746000);
    let daysAvailable = Math.floor(actualTimeDiff/86400000);
    let weeksAvailable = Math.floor(actualTimeDiff/604800000);
    orundumAmount = parseInt(currentOrundum);
    if(monthly) {
        orundumAmount += daysAvailable * 200;
    }
    if(cert) {
        orundumAmount += monthsAvailable * 600;
    }

    //Daily Mission6
    orundumAmount += 100 * daysAvailable;
    //Weekly Mission
    orundumAmount += 500 * weeksAvailable;

    orundumAmount += anni * weeksAvailable;
    orundumAmount += document.getElementById('prime').value === '' || document.getElementById('prime').value === 0 ? (0 * 180) : (prime * 180);
    let totalPulls = Math.floor(orundumAmount/600) + parseInt(document.getElementById('onePermit').value === '' || document.getElementById('onePermit').value === 0 ? 0 : onePermit) + parseInt(document.getElementById('tenPermit').value === '' || document.getElementById('tenPermit').value === 0 ? 0 : (tenPermit * 10));

    document.getElementById('resultLabel').innerHTML = 'This event is estimated to arrive for global in about ' + parseFloat(actualTimeDiff/2629746000).toFixed(2) + ' months.  You will have approximately ' + orundumAmount + ' orundum by the time this event may come to global.  With permits, this is around ' + Math.floor(totalPulls) + ' pulls.'
}