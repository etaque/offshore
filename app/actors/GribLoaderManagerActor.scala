package actors

import akka.actor.{Actor, ActorLogging, Props}
import dao.{SnapshotsDAO, WindCellsDAO}
import models.Snapshot
import org.joda.time.DateTime
import services.{GribExtractor, GribLoader}

import scala.collection.immutable.Queue

object GribLoaderManagerActor {
  def props() = Props(new GribLoaderManagerActor())

  sealed trait Command

  case class Load(date: DateTime) extends Command

  case object Next extends Command

}

class GribLoaderManagerActor extends Actor with ActorLogging {

  import GribLoaderManagerActor._

  var queue: Queue[DateTime] = Queue()
  var current: Option[DateTime] = None

  implicit def executionContext = context.system.dispatcher

  override def preStart(): Unit = {
    super.preStart()
    SnapshotsDAO.cancelNotTerminated()
    WindCellsDAO.refreshWindInfo()
  }

  override def receive: Receive = {
    case command: Command => receiveCommand(command)
  }

  def receiveCommand(command: Command): Unit = command match {
    case Load(date) =>
      queue = queue.enqueue(date)
      self ! Next
    case Next =>
      nextElement.foreach { dateTime =>
        if (SnapshotsDAO.processed(dateTime)) {
          terminateProcess()
        } else {
          process(dateTime)
        }
      }
  }

  def nextElement: Option[DateTime] = {
    if (current.isEmpty && queue.nonEmpty) {
      queue.dequeue match {
        case (dateTime, newQueue) =>
          current = Some(dateTime)
          queue = newQueue
      }
      current
    } else {
      None
    }
  }

  def process(dateTime: DateTime): Unit = {
    val url = GribLoader.getGfsUrl(dateTime)
    val createdSnapshotOpt = SnapshotsDAO.create(dateTime, url)
    createdSnapshotOpt.fold(terminateProcess()) {
      createdSnapshot: Snapshot =>
        GribLoader
          .download(dateTime)
          .map(file => GribExtractor.extract(file.getPath, createdSnapshot.id))
          .map(cells => WindCellsDAO.copyCells(cells))
          .map(_ => validateProcess(createdSnapshot.id))
          .onFailure[Unit] {
          case _: Exception => cancelProcess(createdSnapshot.id)
        }
    }
  }

  def validateProcess(snapshotId: Long): Unit = {
    SnapshotsDAO.validate(snapshotId)
    WindCellsDAO.refreshWindInfo()
    terminateProcess()
  }

  def cancelProcess(snapshotId: Long): Unit = {
    SnapshotsDAO.cancel(snapshotId)
    terminateProcess()
  }

  def terminateProcess(): Unit = {
    current = None
    self ! Next
  }
}
