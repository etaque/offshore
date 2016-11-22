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
    val cellsInBox = WindCellsDAO.inBox(1L, Box(Position(0, 0), Position(30, 30)))
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok(cellsInBox.length.toString))
  }

  def load = Action.async { implicit request =>
    val start = System.nanoTime
    1.to(20).map { n =>
      val cells = services.GribExtractor.extract("/Users/emilientaque/tmp/gfs.t00z.pgrb2.1p00.f000", n)
      WindCellsDAO.copy(cells)
    }
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok("Done."))
  }

  def world = Action.async { implicit request =>
    Future.successful(Ok(views.html.Application.world()))
  }

}

