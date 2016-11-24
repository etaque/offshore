package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{WsCommand, _}
import play.api.Logger
import play.api.libs.concurrent.Akka
import play.api.libs.json.{JsString, JsValue}
import play.api.Play.current

object UserActor {

  val weather = Akka.system.actorOf(Props[WeatherActor], "weather")

  def props(out: ActorRef) = Props(new UserActor(out, weather))
}

class UserActor(out: ActorRef, weather: ActorRef) extends Actor with ActorLogging {

  override def preStart() = weather ! Join

  override def postStop() = weather ! Leave

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