package models

import org.joda.time.DateTime

case class WindInfo(timestamp: DateTime, windCell: WindCell) {
  def toCell: Cell = {
    val wind: Wind = Wind(windCell.u, windCell.v)
    Cell(windCell.position.lat, windCell.position.lon, wind.speed, wind.origin)
  }
}