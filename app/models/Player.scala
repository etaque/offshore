package models

case class Player(
  id: Long,
  name: String,
  color: String,
  boat: Boat
)

case class Window(latitude: Double, longitude: Double, width: Double, height: Double) {
  def toBox: Box = Box(
    p1 = Position(latitude, longitude),
    p2 = Position(latitude + width, longitude + height)
  )
}
