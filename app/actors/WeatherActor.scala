package actors

import akka.actor._
import akka.event.LoggingReceive
import models.{MoveWindow, Rotate}
import play.api.Logger

case object Join
case object Leave

class WeatherActor extends Actor with ActorLogging {

  var subscribers = Set[ActorRef]()

  def receive = LoggingReceive {

    case Join =>
      Logger.info("A new user has joined the game !")
      subscribers += sender

    case Leave =>
      Logger.info("An user has left the game !")
      subscribers -= sender

    case MoveWindow =>

      //TODO

    case Rotate =>

      //TODO

    case _ =>
      Logger.debug("Invalid input")
  }
}