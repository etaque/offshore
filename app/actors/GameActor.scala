package actors

import akka.actor._
import akka.event.LoggingReceive
import models._
import org.joda.time.{DateTime, Duration => JodaDuration}
import play.api.Logger
import services.GribLoader

import scala.concurrent.duration._

object GameActor {
  val gameDurationInDays: Long = 30
  val durationAdditionPerRefresh: FiniteDuration = 2 seconds
  val intervalPerRefresh: FiniteDuration = 33 milliseconds
  val startPosition: Position = Position(46.5039382, -1.8734503)
  val endPosition: Position = Position(43.2701841, 5.3066804)

  sealed trait GameActorCommand

  case class Join(user: String) extends GameActorCommand

  case class Leave(user: String) extends GameActorCommand

  case object Refresh extends GameActorCommand

  case object Start extends GameActorCommand

  case class Rotate(playerId: Long, angle: Long) extends GameActorCommand

  case class UpdatePlayer(id: Long, name: String, color: String) extends GameActorCommand

  sealed trait GameState

  case class Waiting(players: Seq[Player]) extends GameState

  case class Running(gameInfo: GameInfo) extends GameState

  case class Terminated(player: Seq[Player], winner: Player) extends GameState

  case class GameInfo(timestamp: DateTime, players: Seq[Player])

}

class GameActor extends Actor with ActorLogging {

  import GameActor._

  protected[this] var subscribers: Seq[ActorRef] = Seq()

  protected[this] var state: GameState = Waiting(Seq())

  //GribLoader.load(DateTime.now().withDurationAdded(JodaDuration.standardDays(gameDurationInDays), -1), DateTime.now())
  GribLoader.load(DateTime.parse("2016-11-12T00:00:00"), DateTime.now())

  def receive = LoggingReceive(onStateWaiting)

  def onStateWaiting: Receive = {
    case Join(user) =>
      val id = scala.util.Random.nextLong()
      val boat = Boat(user, "black", startPosition.lat, startPosition.lon, 90)
      val player = Player(id, user, "black", boat)

      Logger.info(s"$user has joined the game !")
      subscribers = subscribers :+ sender
      sender ! player

      // TODO: remove this line once game starting management is done
      context.system.scheduler.scheduleOnce(10.seconds, self, Start)(context.system.dispatcher)

    case Leave(user) =>
      Logger.info(s"$user has left the game !")
      subscribers = subscribers.filter(_ != sender)

    case UpdatePlayer(id, name, color) =>
      val waitingState = state.asInstanceOf[Waiting]
      state = waitingState.copy(waitingState.players.map { player =>
        if (player.id == id) {
          player.copy(name = name, color = color)
        } else {
          player
        }
      })
      updateBoats(state.asInstanceOf[Waiting].players.map(_.boat))

    case Start =>
      // TODO: manage starting date
      val startingDate = DateTime.parse("2016-11-12T00:00:00")
      state = Running(GameInfo(timestamp = startingDate, players = state.asInstanceOf[Waiting].players))
      context.become(onStateRunning)
      context.system.scheduler.schedule(Duration.Zero, intervalPerRefresh, self, Refresh)(context.system.dispatcher)

    case _ =>
      Logger.debug("Invalid input")
  }

  def onStateRunning: Receive = {
    case Refresh =>
      val gameInfo = state.asInstanceOf[Running].gameInfo
      val oldTimestamp = gameInfo.timestamp
      val newTimestamp = oldTimestamp.withDurationAdded(durationAdditionPerRefresh.toMillis, 1)
      val players = gameInfo.players
      val updatedPlayers = computeNewPositions(players, oldTimestamp, newTimestamp)
      state = state.asInstanceOf[Running].copy(gameInfo = gameInfo.copy(
        players = updatedPlayers,
        timestamp = newTimestamp
      ))
      subscribers.foreach(_ ! UserActor.TimestampChanged(newTimestamp))
      subscribers.foreach(_ ! RefreshBoat(updatedPlayers.map(_.boat)))

    case Rotate(playerId, angle) =>
      val gameInfo = state.asInstanceOf[Running].gameInfo
      state = Running(gameInfo.copy(players = gameInfo.players.map { player =>
        if (player.id == playerId) {
          player.copy(boat = player.boat.copy(
            angle = angle
          ))
        } else {
          player
        }
      }))

    case UpdatePlayer(id, name, color) =>
      val waitingState = state.asInstanceOf[Waiting]
      state = waitingState.copy(waitingState.players.map { player =>
        if (player.id == id) {
          player.copy(name = name, color = color)
        } else {
          player
        }
      })

    case _ =>
      Logger.debug("Invalid input")
  }

  def onStateTerminated: Receive = {
    case _ =>
      Logger.debug("Invalid input")
  }

  def computeNewPositions(players: Seq[Player], oldTimestamp: DateTime, newTimestamp: DateTime): Seq[Player] = {
    players.map { player =>
      // TODO: compute
      player
    }
  }

  def updateBoats(boats: Seq[Boat]): Unit = {
    subscribers.foreach(_ ! RefreshBoat(boats))
  }
}