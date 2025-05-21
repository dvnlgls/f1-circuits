DROP TABLE IF EXISTS circuits;

CREATE TABLE circuits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  map TEXT,
  trackType TEXT,
  direction TEXT,
  location TEXT,
  country TEXT,
  lastLengthKm REAL,
  lastLengthMi REAL,
  turns INTEGER,
  grandPrixes TEXT,
  seasons TEXT,
  grandPrixesHeld INTEGER
);