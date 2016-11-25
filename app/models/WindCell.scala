package models


case class WindCell(
  snapshotId: Long,
  position: Position,
  u: Double,
  v: Double
                   ) {
  def toPGCopyLine(): String = Seq(
    snapshotId.toString,
    s"(${position.lon},${position.lat})",
    u.toString,
    v.toString
  ).mkString("", "\t", "\n")
}