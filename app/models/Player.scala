package models

case class Player(
  id: Long,
  name: String,
  color: String,
  boat: Boat
)

case class Window(p1: Position, p2: Position) {
  def toBox: Box = Box(p1, p2)
}
