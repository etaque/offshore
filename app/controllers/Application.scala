package controllers

import dao._
import models._
import play.api.mvc._
import services.GribLoader
import utils.DateUtils
import org.joda.time.DateTime
import play.api.libs.ws.WS
import utils.Conf
import play.api.libs.iteratee._
import play.api.libs.ws.ning._
import services.LandPolygonsExtractor

import scala.concurrent.Future

object Application extends Controller {

  def index = Action.async { implicit request =>
    Future.successful(Ok(views.html.Application.index()))
  }

  def cells = Action.async { implicit request =>
    val start = System.nanoTime
    val cellsInBox = WindCellsDAO.inBox(1L, Box(Position(0, 0), Position(30, 30)))
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok(cellsInBox.length.toString))
  }

  /**
    * Loads the last GRIB file.
    */
  def load(start: String = "", end: String = "") = Action.async { implicit request =>
    val startPerf = System.nanoTime
    val startDateOpt = DateUtils.toDateTime(start)
    val endDateOpt = DateUtils.toDateTime(end)
    (startDateOpt, endDateOpt) match {
      case (Some(startDate), Some(endDate)) => GribLoader.load(startDate, endDate)
      case (Some(date), None) => GribLoader.load(date)
      case _ => GribLoader.load()
    }
    println((System.nanoTime - startPerf) / 1e6)
    Future.successful(Ok("Done."))
  }

  def postgis = Action.async {
    LandPolygonsExtractor.extract
    Future.successful(Ok)
  }

}

