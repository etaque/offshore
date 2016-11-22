package controllers

import java.io.{File, FileOutputStream}

import scala.concurrent.Future

import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._

import models._
import dao._
import org.joda.time.DateTime
import play.api.libs.ws.{WS}
import utils.Conf
import play.api.libs.iteratee._
import play.api.libs.ws.ning._



object Application extends Controller {

  def index = Action.async { implicit request =>
    val start = System.nanoTime
    val cellsInBox = WindCellsDAO.inBox(1L, Box(Position(0, 0), Position(30, 30)))
    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok(cellsInBox.length.toString))
  }

  private def downloadGfsFile: Future[File] = {
    val completeGfsFileName = DateTime.now.toString("yyyyMMdd") + "00" + Conf.gfsFileName
    val outputFile = File.createTempFile("gfs","tmp")

    implicit val wslient = NingWSClient()

    WS.clientUrl(Conf.gfsBaseUrl + completeGfsFileName).getStream().flatMap {
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

  def load = Action.async { implicit request =>

    val start = System.nanoTime

    for {
      file <- downloadGfsFile
    } yield {
      1.to(20).map { n =>
        val cells = services.GribExtractor.extract(file.getPath, n)
        WindCellsDAO.copy(cells)
      }
    }

    println((System.nanoTime - start) / 1e6)
    Future.successful(Ok("Done."))
  }

  def world = Action.async { implicit request =>
    Future.successful(Ok(views.html.Application.world()))
  }

}

