package services

import java.io.{File, FileOutputStream}

import actors.{Actors, GribLoaderManagerActor}
import akka.actor.ActorSystem
import org.joda.time.{DateTime, Duration}
import play.api.http.Status._
import play.api.libs.iteratee.Iteratee
import play.api.libs.ws.WS
import play.api.libs.ws.ning.NingWSClient
import utils.Conf

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object GribLoader {
  val maxDatesPerPeriod = 1000

  /**
    * Loads the last GRIB file.
    */
  def load(): Unit = load(getLastPeriodDateTime)

  /**
    * Loads the GRIB file corresponding to given date.
    */
  def load(date: DateTime): Unit = {
    Actors.gribLoaderManagerRef ! GribLoaderManagerActor.Load(date)
  }

  /**
    * Loads data for a period of time
    */
  def load(startDate: DateTime, endDate: DateTime): Unit = {
    if (startDate.isAfter(endDate)) {
      load(endDate, startDate)
    }
    var dates = Seq[DateTime]()
    var currentDate = startDate.withHourOfDay(startDate.getHourOfDay / Conf.gfsPeriod * Conf.gfsPeriod)
    var overflowProtection = maxDatesPerPeriod
    if (currentDate.isBefore(startDate)) currentDate = currentDate.withDurationAdded(Duration.standardHours(4), 1)
    while (!currentDate.isAfter(endDate) && overflowProtection >= 0) {
      dates = dates :+ currentDate
      overflowProtection -= 1
    }
    dates.foreach(load)
  }

  def download(date: DateTime): Future[File] = {
    val completeGfsFileName = getGfsUrl(date)
    val outputFile = File.createTempFile("gfs", "tmp")

    implicit val wslient = NingWSClient()

    WS.clientUrl(completeGfsFileName).getStream().flatMap {
      case (headers, body) if headers.status == OK =>
        val outputStream = new FileOutputStream(outputFile.getAbsolutePath)

        val iteratee = Iteratee.foreach[Array[Byte]] { bytes =>
          outputStream.write(bytes)
        }

        (body |>>> iteratee).andThen {
          case result =>
            outputStream.close()

            result.get
        }.map(_ => outputFile)

      case _ =>
        println("Error retrieving file : " + completeGfsFileName)
        Future(outputFile)
    }
  }

  def getLastPeriodDateTime: DateTime = {
    val now = DateTime.now()
    val quarterHour = now.getHourOfDay / Conf.gfsPeriod * Conf.gfsPeriod
    now.withHourOfDay(quarterHour)
  }

  def getGfsUrl(date: DateTime): String = {
    val stringDate = date.toString("yyyyMMdd")
    val stringHour = date.toString("HH")
    Seq(
      Conf.gfsBaseUrl,
      Conf.gfsDirName.replace("{date}", stringDate).replace("{hour}", stringHour),
      Conf.gfsFileName.replace("{hour}", stringHour)
    ).mkString("/")
  }
}
