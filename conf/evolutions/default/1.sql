# --- !Ups

CREATE TABLE wind_cells (
snapshot_id BIGINT NOT NULL,
position    POINT NOT NULL,
u           FLOAT8  NOT NULL,
v           FLOAT8  NOT NULL
);

CREATE INDEX index_wind_cells_position ON wind_cells USING gist(position);

# --- !Downs

DROP TABLE wind_cells;
