package utils

import play.api.Play
import play.api.Play.current


/**
* Lists all the configuration values
*/
object Conf {
  private val conf = Play.application.configuration

  val gfsBaseUrl = getString("ws.gfs.baseUrl")
  val gfsDirName = getString("ws.gfs.dirName")
  val gfsFileName = getString("ws.gfs.fileName")
  val gfsPeriod = getInt("ws.gfs.period")

  private def getValue[A](getter: String => Option[A], key: String): A = getter(key).getOrElse(sys.error(s"Missing config key: $key"))

  private def getString(key: String) = getValue(conf.getString(_), key)
  private def getBoolean(key: String) = getValue(conf.getBoolean, key)
  private def getMilliseconds(key: String) = getValue(conf.getMilliseconds, key)
  private def getInt(key: String) = getValue(conf.getInt, key)
}
