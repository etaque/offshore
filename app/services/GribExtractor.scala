package services

import ucar.unidata.io.RandomAccessFile
import ucar.grib.grib2.{Grib2Data, Grib2Record, Grib2Input}
import collection.JavaConversions._
import models._

object GribExtractor {

  case class Cell(
    lat: Double,
    lon: Double,
    u: Double,
    v: Double
  )

  val U_WIND = 2
  val V_WIND = 3

  def extract(path: String, snapshotId: Long): Seq[WindCell] = {

    val file = new RandomAccessFile(path, "r")

    try {
      file.order(RandomAccessFile.BIG_ENDIAN)

      val data = new Grib2Data(file)

      val input = new Grib2Input(file)
      input.scan(false, false)

      val uRecord = recordForComponent(input, U_WIND)
        .getOrElse(sys.error(s"U component of wind not found in GRIB file '$path'"))

      val vRecord = recordForComponent(input, V_WIND)
        .getOrElse(sys.error(s"V component of wind not found in GRIB file '$path'"))

      val gds = uRecord.getGDS.getGdsVars

      dataForRecord(data, uRecord).zip(dataForRecord(data, vRecord)).zipWithIndex.map { case ((u, v), i) =>
        val lat = gds.getLa1.toDouble - (i / gds.getNx) * gds.getDy
        val lon = utils.Geo.degreesToAzimuth(gds.getLo1.toDouble + (i % gds.getNx) * gds.getDx)
        WindCell(snapshotId, Position(lat, lon), u.toDouble, v.toDouble)
      }
    } finally {
      file.close()
    }
  }

  private def recordForComponent(input: Grib2Input, code: Int): Option[Grib2Record] =
    input.getRecords.toSeq.find(_.getPDS.getPdsVars.getParameterNumber == code)

  private def dataForRecord(data: Grib2Data, record: Grib2Record): Seq[Float] =
    data.getData(record.getGdsOffset, record.getPdsOffset, record.getId.getRefTime).toSeq
}
