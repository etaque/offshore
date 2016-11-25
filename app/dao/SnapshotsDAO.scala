package dao

import anorm.SqlParser._
import anorm._
import models.Snapshot
import org.joda.time.DateTime
import play.api.Play.current
import play.api.db.DB
import utils.AnormParsers._

object SnapshotsDAO {
  val table = "snapshots"

  val snapshotIdSerial = "snapshot_id_serial"

  private object Columns {
    val id = "id"
    val timestamp = "timestamp"
    val gribFilename = "gribFilename"
    val startDate = "startDate"
    val endDate = "endDate"
    val canceled = "canceled"
  }

  private val single = for {
    id <- get[Long](Columns.id)
    timestamp <- get[DateTime](Columns.timestamp)
    gribFilename <- get[String](Columns.gribFilename)
    startDate <- get[DateTime](Columns.startDate)
    endDate <- get[Option[DateTime]](Columns.endDate)
    canceled <- get[Boolean](Columns.canceled)
  } yield Snapshot(id, timestamp, gribFilename, startDate, endDate, canceled)

  def processed(timestamp: DateTime): Boolean = DB.withConnection { implicit c =>
    SQL"SELECT 1 FROM snapshots WHERE timestamp = $timestamp AND endDate IS NOT NULL"
      .as(scalar[Long].singleOpt)
      .isDefined
  }

  def create(timestamp: DateTime, gribFilename: String): Option[Snapshot] = {
    DB.withConnection { implicit c =>
      val startDate = DateTime.now()
      SQL"INSERT INTO snapshots(id, timestamp, grib_filename, startDate) VALUES (nextval('snapshot_id_serial'), $timestamp, $gribFilename, $startDate)"
        .executeInsert(scalar[Long].singleOpt)
        .map(id => Snapshot(id, timestamp, gribFilename, startDate, None, canceled = false))
    }
  }

  def validate(snapshotId: Long) = DB.withConnection { implicit c =>
    val endDate = DateTime.now()
    SQL"UPDATE snapshots SET endDate = $endDate WHERE id = $snapshotId"
      .executeUpdate()
  }

  def cancel(snapshotId: Long) = DB.withConnection { implicit c =>
    SQL"UPDATE snapshots SET canceled = TRUE WHERE id = $snapshotId"
      .executeUpdate()
  }

  def cancelNotTerminated() = DB.withConnection { implicit c =>
    SQL"UPDATE snapshots SET canceled = TRUE WHERE endDate IS NULL"
      .execute()
  }
}
