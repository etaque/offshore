package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{RefreshWind, WsCommand, _}
import play.api.Logger
import play.api.libs.concurrent.Akka
import play.api.libs.json.JsValue
import play.api.Play.current

import scala.concurrent.duration._



object UserActor {

  val game = Akka.system.actorOf(Props[GameActor], "weather")

  def props(out: ActorRef, user: String) = Props(new UserActor(out, game, user))

  case object Refresh

}

class UserActor(out: ActorRef, game: ActorRef, user: String) extends Actor with ActorLogging {
  import UserActor._

  override def preStart() = game ! Join(user)

  override def postStop() = game ! Leave(user)

  context.system.scheduler.schedule(Duration.Zero, 33.millis, self, Refresh)(context.system.dispatcher)

  def receive = LoggingReceive {

    // Client to server
    case js:JsValue => WsCommand.fromJson(js).map{ cmdOpt =>
        cmdOpt match {

          case m:MoveWindow =>
            //TODO : calcul météo pour la fenetre concernée
            self ! Refresh

          case r:Rotate =>
            game ! r

          case _ => Logger.debug("Invalid input")
        }

      }.getOrElse{
        Logger.debug("Invalid input")
      }

    // Server to client
    case p:Player =>

    case Refresh =>

      def winds: RefreshWind = ??? //TODO

      out ! WsCommand.toJson(winds)

    case r:RefreshBoat =>

      out ! WsCommand.toJson(r)

    // ignore else
    case _ =>
      Logger.debug("Invalid input")
  }
}