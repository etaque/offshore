package actors

import akka.actor._
import akka.event.LoggingReceive
import models._
import play.api.Logger

import scala.concurrent.duration._

case class Join(user: String)
case class Leave(user: String)
case object Positions

class GameActor extends Actor with ActorLogging {

  protected[this] var subscribers = Map[ActorRef, Player]()

  context.system.scheduler.schedule(Duration.Zero, 33.millis, self, Positions)(context.system.dispatcher)

  def receive = LoggingReceive {

    case Join(user) =>
      val window = Window(0,0,0,0)
      val id = scala.util.Random.nextLong()
      val boat = Boat(id,0,0,0)
      val player = Player(id, user, window, boat)

      Logger.info(s"$user has joined the game !")
      subscribers += (sender -> player)
      sender ! player

    case Leave(user) =>

      Logger.info(s"$user has left the game !")
      subscribers -= sender

    case r:Rotate =>

      val user = sender
      subscribers.get(user).map{ player =>

        subscribers += (user -> player.copy(boat = player.boat.copy(angle = r.angle)))
      }

    case Positions =>

    //TODO : calculer les nouvelles positions des bateaux (RefreshBoat)

    case _ =>
      Logger.debug("Invalid input")
  }
}