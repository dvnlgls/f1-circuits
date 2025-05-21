const { JSDOM } = require("jsdom");
const fs = require('fs'); 
const removeAccents = require('remove-accents');

function getWikiData() {
  const url = "https://en.wikipedia.org/wiki/List_of_Formula_One_circuits";
  fetch(url)
    .then(res => res.text())
    .then(html => {
      let circuits = [];
      const { document } = (new JSDOM(html)).window;

      const table = document.querySelectorAll('table')[2];
      const tbody = table.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');

      rows.forEach(row => {
        // skip header
        if (row !== rows[0]) {
          const columns = row.querySelectorAll('td');

          const name = removeAccents(columns[0].textContent.replace('*', '').replaceAll('\n', ''));
          const map = 'https:' + row.querySelectorAll('td')[1].querySelector('img').getAttribute('src');
          const trackType = columns[2].textContent.replaceAll('\n', '');
          const direction = columns[3].textContent.replaceAll('\n', '');
          const location = removeAccents(columns[4].textContent.replaceAll('\n', ''));
          const country = removeAccents(columns[5].childNodes[2].textContent.replaceAll('\n', ''));
          const lastLength = columns[6].querySelector('span').innerHTML.replace(/&nbsp;/g, ' ').split(' ');
          const lastLengthKm = lastLength[0];
          const lastLengthMi = lastLength[2].replace('(', '');
          const turns = columns[7].textContent.replaceAll('\n', '');
          const grandPrixes = [...columns[8].querySelectorAll('a')].map(a => removeAccents(a.textContent.replaceAll('\n', '')));
          const seasons = columns[9].textContent.replaceAll('\n', '').replaceAll(' ', '').split(','); // ex: [1955, 1957, 1959, 1961–1962]
          const grandPrixesHeld = columns[10].textContent.replaceAll('\n', '');

          const expandedSeasons = [];
          seasons.forEach((season) => {
            if (season.includes('–')) {
              const startYear = Number(season.split('–')[0]);
              const endYear = Number(season.split('–')[1].slice(0,4)); // necessary because of the presence of [a], [c] etc. Replace won't work because the brackets appear in a code form, which I didn't have time to investigate. Phew!
              for (let i = startYear; i <= endYear; i++) {
                expandedSeasons.push(i);
              }
            } else {
              expandedSeasons.push(Number(season));
            }
          });
          expandedSeasons.sort((a, b) => {
            return a - b
          });

          const circuit = {
            name,
            map,
            trackType,
            direction,
            location,
            country,
            lastLengthKm,
            lastLengthMi,
            turns,
            grandPrixes,
            seasons: expandedSeasons,
            grandPrixesHeld
          };

          circuits.push(circuit);
        }
      });

      fs.writeFileSync('./circuits.json', JSON.stringify(circuits), 'utf-8');
    })

}

function insertIntoDB() {
  const circuits = require('./circuits.json');
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('f1.db');

  db.serialize(function() {
    circuits.forEach(circuit => {
      const insert = `INSERT INTO circuits (
        name, map, trackType, direction, location, country, lastLengthKm, lastLengthMi, turns, grandPrixes, seasons, grandPrixesHeld
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [
        circuit.name,
        circuit.map,
        circuit.trackType,
        circuit.direction,
        circuit.location,
        circuit.country,
        circuit.lastLengthKm,
        circuit.lastLengthMi,
        circuit.turns,
        JSON.stringify(circuit.grandPrixes),
        JSON.stringify(circuit.seasons),
        circuit.grandPrixesHeld
      ];
      db.run(insert, values);
    });
  });
  db.close();
}

function main() {
  /*
  manual cleanup:
  1) Indianapolis Motor Speedway. remove [b]

  Note: 
  - Silverstone Circuit and the Bahrain International Circuit held two races each in 2020.
  - The Red Bull Ring held two races per season in both 2020 and 2021.
  */


  getWikiData();
  insertIntoDB();
}

main();