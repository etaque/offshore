package models

import utils.Geo

case class Wind(u: Double, v: Double) {
  val degreeToRadian = 57.29578 // 180/pi

  lazy val direction: Double = (u, v) match {
    case (0, _) => if (v < 0) 360 else 180
    case _ =>
      (if (u < 0) 270 else 90) - math.atan(v / u) * degreeToRadian
  }

  lazy val origin: Double = Geo.ensureDegrees(direction + 180)

  lazy val speed: Double = math.sqrt(math.pow(u, 2) + math.pow(v, 2))

  def angleTo(boatDirection: Double): Double = {
    val delta = origin - boatDirection
    math.abs(
      if (delta > 180) delta - 360
      else if (delta <= -180) delta + 360
      else delta
    )
  }
}