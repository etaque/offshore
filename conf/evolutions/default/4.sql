# --- !Ups

CREATE SEQUENCE snapshot_id_serial;

ALTER SEQUENCE snapshot_id_serial OWNED BY snapshots.id;

# --- !Downs

DROP SEQUENCE snapshot_id_serial;