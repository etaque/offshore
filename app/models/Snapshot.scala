package models

import java.time.LocalDateTime

case class Snapshot(id: Long, timestamp: LocalDateTime, gribFilename: String)
