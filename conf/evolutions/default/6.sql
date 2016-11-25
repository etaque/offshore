# --- !Ups
DROP MATERIALIZED VIEW wind_info;

CREATE MATERIALIZED VIEW wind_info AS
SELECT
  s.id            AS snapshot_id,
  s.timestamp     AS timestamp,
  s.grib_filename AS grib_filename,
  wc.position     AS position,
  wc.u            AS u,
  wc.v            AS v
FROM snapshots s
LEFT JOIN wind_cells wc ON s.id = wc.snapshot_id
WHERE s.canceled = FALSE AND s.endDate IS NOT NULL;
# --- !Downs

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