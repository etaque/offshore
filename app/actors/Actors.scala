package actors

import play.api.Play.current
import play.api.libs.concurrent.Akka

object Actors {
  val gribLoaderManagerName = "gribLoaderManager"

  def gribLoaderManagerRef = Akka.system.actorSelection(s"/user/$gribLoaderManagerName")

  def initMainActors(): Unit = {
    Akka.system.actorOf(GribLoaderManagerActor.props(), gribLoaderManagerName)
  }
}
