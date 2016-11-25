package services

import play.api.libs.iteratee.Iteratee
import play.api.libs.ws.ning.NingWSClient
import java.io.{File, FileOutputStream}

import play.api.Logger
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import utils.Conf
import play.api.http.Status._

import sys.process._
import scala.language.postfixOps
import scala.concurrent.Future

object LandPolygonsExtractor {


  private def download: Future[File] = {

    val outputFile = File.createTempFile("land-polygons",".tmp.zip")

    implicit val wslient = NingWSClient()

    WS.clientUrl(Conf.lpBaseUrl + Conf.lpFileName).getStream().flatMap {
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
        println("Error retrieving file : " + Conf.lpFileName)
        Future(outputFile)
    }
  }

  private def getListOfFiles(dir: String): Seq[File] = {
    val d = new File(dir)
    if (d.exists && d.isDirectory) {
      d.listFiles.filter(_.isFile).toSeq
    } else {
      Seq[File]()
    }
  }

  case class CmdException(stdout: String, stderr: String) extends Exception

  private def exec(cmd: String): Future[Option[String]] = {

    Logger.info(s"Exec : $cmd")

    Future {
      val stdout = new StringBuilder
      val stderr = new StringBuilder
      val status = cmd ! ProcessLogger(stdout append _+"\n", stderr append _+"\n")
      if(status == 0){
        Some(stdout.toString)
      } else {
        throw CmdException(stdout.toString, stderr.toString)
      }
    }.recover{
      case e@CmdException(stdout, stderr) =>
        Logger.error(s"$stdout\n$stderr")
        None
    }
  }

  def extract: Unit = {

    download.map{ file =>

      Logger.info(s"Download of file ${file.getName} OK")

      val origin = file.getAbsolutePath
      val dest = file.getParentFile.getAbsolutePath
      val dirName = Conf.lpFileName.replace(".zip", "")
      val rootZip = s"$dest/$dirName"

      exec(s"unzip $origin -d $dest").map{ _.map{ stdout =>

          Logger.info(stdout)

          getListOfFiles(rootZip).filter(f => !f.getName.contains("README")).map{ shapefile =>
            // doc : http://suite.opengeo.org/opengeo-docs/dataadmin/pgGettingStarted/shp2pgsql.html#dataadmin-pggettingstarted-shp2pgsql
            // The -I option will create a spatial index after the table is created. This is strongly recommended for improved performance.
            exec(s"shp2pgsql -I -s ${Conf.lpSRID} ${shapefile.getAbsolutePath} ${Conf.lpSchema}.${Conf.lpDBtable} | psql -h ${Conf.lpHost} -d ${Conf.lpDatabase} -U ${Conf.lpUser}").map{
              _.map{ output =>

                Logger.info(output)
              }
            }
          }
        }
      }
    }
  }

}