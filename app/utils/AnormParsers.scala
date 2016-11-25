package utils

import java.sql.Timestamp

import anorm._
import org.postgresql.geometric.{PGbox, PGpoint}
import models._
import org.joda.time.DateTime


object AnormParsers {
  implicit val rowToPosition: Column[Position] = Column.nonNull1 {
    (value, _) => value match {
      case p: PGpoint => Right(Position(p.y, p.x))
      case _ => Left(TypeDoesNotMatch("Cannot convert " + value + ":" + value.asInstanceOf[AnyRef].getClass))
    }
  }

  implicit val positionToStatement = new ToStatement[Position] {
    def set(s: java.sql.PreparedStatement, index: Int, aValue: Position): Unit = {
      s.setObject(index, new PGpoint(aValue.lon, aValue.lat))
    }
  }

  implicit val boxToStatement = new ToStatement[Box] {
    def set(s: java.sql.PreparedStatement, index: Int, aValue: Box): Unit = {
      s.setObject(index, new PGbox(new PGpoint(aValue.p1.lon, aValue.p1.lat), new PGpoint(aValue.p2.lon, aValue.p2.lat)))
    }
  }

  implicit val dateTimeToStatement = new ToStatement[DateTime] {
    def set(s: java.sql.PreparedStatement, index: Int, aValue: DateTime): Unit = {
      s.setTimestamp(index, new Timestamp(aValue.getMillis))
    }
  }

}
