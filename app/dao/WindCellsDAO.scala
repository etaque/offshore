package dao

import anorm.SqlParser._
import anorm._
import models._
import org.joda.time.DateTime
import org.postgresql.copy.PGCopyOutputStream
import play.api.Play.current
import play.api.db.DB


object WindCellsDAO {
  import utils.AnormParsers._

  val table = "wind_cells"

  val single = for {
    snapshotId <- get[Long]("snapshot_id")
    position <- get[Position]("position")
    u <- get[Double]("u")
    v <- get[Double]("v")
  } yield WindCell(snapshotId, position, u, v)

  def inBox(snapshotId: Long, box: Box): Seq[WindCell]= {
    DB.withConnection { implicit c =>
      SQL"SELECT * FROM #$table WHERE snapshot_id=$snapshotId AND $box @> position".as(single.*)
    }
  }

  def createSnapshot(timestamp: DateTime, gribFilename: String): Option[Snapshot] = {
    DB.withConnection { implicit c =>
      SQL"INSERT INTO snapshots(id, timestamp, grib_filename) VALUES(nextval('snapshot_id_serial'), $timestamp, $gribFilename)"
        .executeInsert(scalar[Long].singleOpt)
        .map(id => Snapshot(id, timestamp, gribFilename))
    }
  }

  def copyCells(cells: Seq[WindCell]): Unit = {
    DBService.withBaseConnection { implicit baseConnection =>
      val copyStream = new PGCopyOutputStream(baseConnection, s"COPY $table FROM STDIN")
      cells.foreach { cell =>
        val lineAsBytes = cell.toPGCopyLine().getBytes
        copyStream.writeToCopy(lineAsBytes, 0, lineAsBytes.length)
      }
      copyStream.endCopy()
    }
  }

  def refreshWindInfo(): Unit = {
    DB.withConnection { implicit c =>
      SQL"REFRESH MATERIALIZED VIEW wind_info".execute()
    }
  }
}
