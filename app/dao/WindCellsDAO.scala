package dao

import java.sql.Connection
import java.sql.DriverManager
import org.postgresql.copy.PGCopyOutputStream
import org.postgresql.core.BaseConnection
import anorm.SqlParser._
import anorm._
import anorm.~
import play.api.db.DB
import play.api._
import play.api.Play.current
import models._


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

  def copy(cells: Seq[WindCell]): Unit = {
    val dbUrl = Play.current.configuration.getString("db.default.url").getOrElse(sys.error("db conf not found"))
    val conn = DriverManager.getConnection(dbUrl)

    try {
      val baseConn = conn.asInstanceOf[BaseConnection]
      val copyStream = new PGCopyOutputStream(baseConn, s"COPY $table FROM STDIN")
      cells.foreach { cell =>
        val cols = Seq(cell.snapshotId.toString, s"(${cell.position.lon},${cell.position.lat})", cell.u.toString, cell.v.toString)
        val line = s"${cols.mkString("\t")}\n"
        copyStream.writeToCopy(line.getBytes, 0, line.getBytes.length)
      }
      copyStream.endCopy()
    } finally {
      conn.close()
    }

  }
}
