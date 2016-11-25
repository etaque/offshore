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



object UserActor {

  val game = Akka.system.actorOf(Props[GameActor], "weather")

  def props(out: ActorRef, user: String) = Props(new UserActor(out, game, user))

  case object Refresh

  case class TimestampChanged(timestamp: DateTime)

}

class UserActor(out: ActorRef, game: ActorRef, user: String) extends Actor with ActorLogging {
  import UserActor._

  var playerOpt: Option[Player] = None
  var windowOpt: Option[Window] = None
  var timestampOpt: Option[DateTime] = None

  override def preStart() = game ! GameActor.Join(user)

  override def postStop() = game ! GameActor.Leave(user)

  def receive = LoggingReceive {

    // Client to server
    case js: JsValue =>
      WsCommand.fromJson(js).fold(Logger.debug("Invalid input")) {
        case MoveWindow(window) =>
          windowOpt = Some(window)
          self ! Refresh

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
      self ! Refresh

    case r:RefreshBoat =>
      out ! WsCommand.toJson(r)

    case Refresh =>
      (windowOpt, timestampOpt) match {
        case (Some(window), Some(timestamp)) =>
          val windInfoList: Seq[WindInfo] = WindCellsDAO.findByTimestampAndBox(timestamp, window.toBox)
          out ! WsCommand.toJson(RefreshWind(windInfoList.map(_.toCell)))
        case _ => // ignore
      }

    // ignore else
    case _ =>
      Logger.debug("Invalid input")
  }
}