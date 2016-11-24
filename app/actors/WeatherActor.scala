package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{MoveWindow, Rotate}
import play.api.Logger

import scala.concurrent.duration._

case class Join(user: String)
case class Leave(user: String)
case object Positions

class WeatherActor extends Actor with ActorLogging {

  protected[this] var subscribers = Map[ActorRef, String]()

  context.system.scheduler.schedule(Duration.Zero, 33.millis, self, Positions)(context.system.dispatcher)

  def receive = LoggingReceive {

    case Join(user) =>
      Logger.info(s"$user has joined the game !")
      subscribers += (sender -> user)

    case Leave(user) =>
      Logger.info(s"$user has left the game !")
      subscribers - sender

    case MoveWindow =>

      //TODO

    case Rotate =>

      //TODO

    case Positions =>


    case _ =>
      Logger.debug("Invalid input")
  }
}