package controllers

import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._
import play.api.Play.current

import models._
import dao._


object Application extends Controller {

  def index = Action.async { implicit request =>
    val start = System.nanoTime
    val cells = services.GribExtractor.extract("/Users/emilientaque/tmp/gfs.t00z.pgrb2.1p00.f000", 1L)
    dao.WindCellsDAO.copy(cells)
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok("TODO"))
  }
}

