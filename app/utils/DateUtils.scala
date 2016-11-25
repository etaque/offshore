package utils

import org.joda.time.DateTime

import scala.util.Try

object DateUtils {
  def toDateTime(string: String): Option[DateTime] =
    Some(string).filter(_.nonEmpty).map(str => Try(DateTime.parse(str))).filter(_.isSuccess).map(_.get)
}
