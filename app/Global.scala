import actors.Actors
import play.api.{Application, GlobalSettings, Logger}

object Global extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    Logger.info("onStart")
    Actors.initMainActors()
  }
}
