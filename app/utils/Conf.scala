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

  val lpBaseUrl = getString("ws.lp.baseUrl")
  val lpFileName = getString("ws.lp.fileName")

  val lpSRID = getString("lp.srid")
  val lpSchema = getString("lp.schema")
  val lpDBtable = getString("lp.dbtable")
  val lpHost = getString("lp.host")
  val lpDatabase = getString("lp.database")
  val lpUser = getString("lp.user")

  private def getValue[A](getter: String => Option[A], key: String): A = getter(key).getOrElse(sys.error(s"Missing config key: $key"))

  private def getString(key: String) = getValue(conf.getString(_), key)
  private def getBoolean(key: String) = getValue(conf.getBoolean, key)
  private def getMilliseconds(key: String) = getValue(conf.getMilliseconds, key)
  private def getInt(key: String) = getValue(conf.getInt, key)
}
