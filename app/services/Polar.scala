package services

import play.api.Play
import Play.current
import scala.math._


case class Polar(
  windSpeeds: Seq[Double],
  windAngles: Seq[Int],
  speeds: Seq[Seq[Double]]
) {

  /**
    Speed in m/s, angle in degrees
    */
  def getSpeed(windSpeed: Double, windAngle: Int): Double = {
    val speedsForAngle: Seq[(Int,Double)] = byWindSpeed(windSpeed)

    val (angleUnder, speedUnder) = speedsForAngle.reverse.find(_._1 >= windAngle).getOrElse(
      sys.error(s"Polar error: windAngle=$windAngle windSpeed=$windSpeed"))

    val (angleOver, speedOver) = speedsForAngle.find(_._1 >= windAngle).getOrElse(
      sys.error(s"Polar error: windAngle=$windAngle windSpeed=$windSpeed"))

    if (angleUnder == angleOver) {
      speedUnder
    } else {
      // interpolation linéaire
      speedUnder + (windAngle - angleUnder) * (speedOver - speedUnder) / (angleOver - angleUnder)
    }
  }

  def byWindSpeed(windSpeed: Double): Seq[(Int, Double)] = {
    val wsIndex = windSpeeds.lastIndexWhere(_ <= windSpeed)
    windAngles zip speeds.map(_(wsIndex))
  }

  def bestVmg(windSpeed: Double, sideFilter: ((Int, Double)) => Boolean): Int =
    byWindSpeed(windSpeed).filter(sideFilter).maxBy(Polar.vmgValue)._1

  def lowVmg(windSpeed: Double): Int =
    bestVmg(windSpeed, { _._1 > 90 })

  def highVmg(windSpeed: Double): Int =
    bestVmg(windSpeed, { _._1 < 90 })
}

object Polar {
  import utils.Geo

  val imocaPath = "conf/imoca60.csv"
  val current = load(imocaPath)

  def load(path: String): Polar = {
    val matrix: Seq[Seq[String]] = io.Source.fromFile(path).getLines.map { line =>
      line.split(";").toSeq
    }.toSeq
    val windSpeeds: Seq[Double] = matrix.head.tail.map(speedParser).sorted
    val windAngles: Seq[Int] = matrix.tail.map(_.head).map(_.toInt).sorted
    val speeds: Seq[Seq[Double]] = matrix.tail.map(_.tail.map(speedParser))
    Polar(windSpeeds, windAngles, speeds)
  }

  def speedParser(s: String): Double =
    Geo.round2(Geo.knotToMps(s.toDouble))

  def vmgValue(pair: (Int, Double)): Double = pair match {
    case (angle, speed) => abs(cos(toRadians(angle)) * speed)
  }
}

