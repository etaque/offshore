package dao

import java.sql.{Connection, DriverManager}

import org.postgresql.core.BaseConnection
import play.api.{Application, Play}

object DBService {
  def withBaseConnection[A](name: String = "default")(block: BaseConnection => A)(implicit app: Application): A = {
    val dbUrl = Play.current.configuration.getString(s"db.$name.url").getOrElse(sys.error(s"db conf '$name' not found"))
    val conn = DriverManager.getConnection(dbUrl)
    try {
      block(conn.asInstanceOf[BaseConnection])
    } catch {
      case e: Exception =>
        println(e)
        throw e
    } finally {
      try {
        conn.close()
      } catch {
        case e: Exception => println(e)
      }
    }
  }

  def withBaseConnection[A](block: BaseConnection => A)(implicit app: Application): A =
    withBaseConnection()(block)
}
