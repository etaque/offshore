package controllers

import dao._
import models._
import play.api.mvc._
import services.GribLoader

import scala.concurrent.Future



object Application extends Controller {

  def index = Action.async { implicit request =>
    val start = System.nanoTime
    val cellsInBox = WindCellsDAO.inBox(1L, Box(Position(0, 0), Position(30, 30)))
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok(cellsInBox.length.toString))
  }

  /**
    * Loads the last GRIB file.
    */
  def load = Action.async { implicit request =>
    val start = System.nanoTime
    GribLoader.load()
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok("Done."))
  }

  def world = Action.async { implicit request =>
    Future.successful(Ok(views.html.Application.world()))
  }
}

