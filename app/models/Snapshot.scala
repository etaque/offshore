package models

import org.joda.time.DateTime

case class Snapshot(id: Long, timestamp: DateTime, gribFilename: String)
