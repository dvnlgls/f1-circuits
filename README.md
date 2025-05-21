## This repo contains a List of Formula One circuits and their details in json and sqlite db format (as of 2025)

> Source: https://en.wikipedia.org/wiki/List_of_Formula_One_circuits

### Usage:
1. `circuits.json` and `f1.db` are ready to use.
2. Modify `index.js` to suit your needs.
3. See `db.sql` to understand the schema.

### Note:
  - manual cleanup: For the Indianapolis Motor Speedway entry, remove [b]
  - Silverstone Circuit and the Bahrain International Circuit held two races each in 2020.
  - The Red Bull Ring held two races per season in both 2020 and 2021.

### Sample query:
  - Get a list of all circuits for the 1997 season
  > `select  * from circuits, json_each(seasons) where json_each.value = 1997;`