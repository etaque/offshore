# --- !Ups

ALTER TABLE snapshots ADD COLUMN startDate TIMESTAMP NULL;

ALTER TABLE snapshots ADD COLUMN endDate TIMESTAMP NULL;

ALTER TABLE snapshots ADD COLUMN canceled BOOLEAN NOT NULL DEFAULT FALSE;

DROP MATERIALIZED VIEW wind_info;

CREATE MATERIALIZED VIEW wind_info AS
SELECT
  s.id            AS snaphost_id,
  s.timestamp     AS timestamp,
  s.grib_filename AS grib_filename,
  wc.position     AS position,
  wc.u            AS u,
  wc.v            AS v
FROM snapshots s
LEFT JOIN wind_cells wc ON s.id = wc.snapshot_id
WHERE s.canceled = FALSE AND s.endDate IS NOT NULL;

# --- !Downs

ALTER TABLE snapshots DROP COLUMN startDate;

ALTER TABLE snapshots DROP COLUMN endDate;

ALTER TABLE snapshots DROP COLUMN canceled;

DROP MATERIALIZED VIEW wind_info;

CREATE MATERIALIZED VIEW wind_info AS
SELECT
  s.id            AS snaphost_id,
  s.timestamp     AS timestamp,
  s.grib_filename AS grib_filename,
  wc.position     AS position,
  wc.u            AS u,
  wc.v            AS v
FROM snapshots s
LEFT JOIN wind_cells wc ON s.id = wc.snapshot_id;