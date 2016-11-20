package utils

object Geo {
  def degreesToAzimuth(d: Double) = if (d > 180) d - 360 else d
}
