# --- !Ups

CREATE TABLE snapshots(
  id BIGINT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  grib_filename VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE wind_cells ADD CONSTRAINT fk_wind_cell_snapshot_id_snapshots FOREIGN KEY (snapshot_id) REFERENCES snapshots(id);

# --- !Downs

DROP TABLE snapshots;
