package actors

import akka.actor._
import akka.event.LoggingReceive
import dao.WindCellsDAO
import models.{RefreshWind, WsCommand, _}
import org.joda.time.DateTime
import play.api.Logger
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json.JsValue

import scala.concurrent.duration.Duration
import scala.concurrent.duration._


object UserActor {

  val game = Akka.system.actorOf(Props[GameActor], "weather")

  val intervalPerRefresh = 500.millis

  def props(out: ActorRef, user: String) = Props(new UserActor(out, game, user))

  case object Refresh

  case class TimestampChanged(timestamp: DateTime)

}

class UserActor(out: ActorRef, game: ActorRef, user: String) extends Actor with ActorLogging {
  import UserActor._

  var playerOpt: Option[Player] = None
  var windowOpt: Option[Window] = None
  var timestampOpt: Option[DateTime] = None
  var previousTimestamp: Option[DateTime] = None
  var previousWindow: Option[Window] = None
  var previousSnapshot: Option[Long] = None

  context.system.scheduler.schedule(Duration.Zero, intervalPerRefresh, self, Refresh)(context.system.dispatcher)

  override def preStart() = game ! GameActor.Join(user)

  override def postStop() = game ! GameActor.Leave(user)

  def receive = LoggingReceive {

    // Client to server
    case js: JsValue =>
      WsCommand.fromJson(js).fold(Logger.debug("Invalid input")) {
        case MoveWindow(window) =>
          windowOpt = Some(window)

        case r: Rotate =>
          game ! r

        case UpdatePlayer(name, color) =>
          playerOpt.foreach { player =>
            game ! GameActor.UpdatePlayer(player.id, name, color)
          }

        case _ => Logger.debug("Invalid input")
      }

    // Server to client
    case p: Player =>
      playerOpt = Some(p)

    case TimestampChanged(timestamp) =>
      timestampOpt = Some(timestamp)

    case r:RefreshBoat =>
      out ! WsCommand.toJson(r)

    case Refresh =>
      (windowOpt, timestampOpt) match {
        case (Some(window), Some(timestamp)) =>
          // Avoid sending same data than last time.
          val timestampChanged = !previousTimestamp.exists(timestamp.equals)
          val windowChanged = !previousWindow.exists(_ == window)
          if (windowChanged) {
            previousTimestamp = Some(timestamp)
            previousWindow = Some(window)
            previousSnapshot = WindCellsDAO.findSnapshot(timestamp)
            previousSnapshot.foreach { snapshotId =>
              val windInfoList: Seq[WindInfo] = WindCellsDAO.findBySnapshotAndBox(snapshotId, window.toBox)
              WsCommand.toJson(RefreshWind(windInfoList.map(_.toCell))).foreach(json => out ! json)
            }
          } else if (timestampChanged) {
            WindCellsDAO.findSnapshot(timestamp).foreach { newSnapshotId =>
              if (!previousSnapshot.exists(newSnapshotId.equals)) {
                previousSnapshot = Some(newSnapshotId)
                val windInfoList: Seq[WindInfo] = WindCellsDAO.findBySnapshotAndBox(newSnapshotId, window.toBox)
                WsCommand.toJson(RefreshWind(windInfoList.map(_.toCell))).foreach(json => out ! json)
              }
            }
          }
        case _ => // ignore
      }

    // ignore else
    case _ =>
      Logger.debug("Invalid input")
  }
}