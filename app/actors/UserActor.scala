package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{WsCommand, _}
import play.api.Logger
import play.api.libs.concurrent.Akka
import play.api.libs.json.JsValue
import play.api.Play.current

object UserActor {

  val weather = Akka.system.actorOf(Props[WeatherActor], "weather")

  def props(out: ActorRef, user: String) = Props(new UserActor(out, weather, user))
}

class UserActor(out: ActorRef, weather: ActorRef, user: String) extends Actor with ActorLogging {

  override def preStart() = weather ! Join(user)

  override def postStop() = weather ! Leave(user)

  def receive = LoggingReceive {

    // Client to server
    case js:JsValue => WsCommand.fromJson(js).map{ cmdOpt =>
        cmdOpt match {

          case m:MoveWindow =>

            weather ! m

          case r:Rotate =>

            weather ! r

          case _ => Logger.debug("Invalid input")
        }

      }.getOrElse{
        Logger.debug("Invalid input")
      }

    // Server to client
    case r:RefreshWind =>

      out ! WsCommand.toJson(r)

    case r:RefreshBoat =>

      out ! WsCommand.toJson(r)

    // ignore else
    case _ =>
      Logger.debug("Invalid input")
  }
}