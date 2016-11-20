package models

import java.util.UUID


case class WindCell(
  snapshotId: Long,
  position: Position,
  u: Double,
  v: Double
)
