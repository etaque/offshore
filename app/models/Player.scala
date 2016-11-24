package models

case class Player(
 id: Long,
 name: String,
 window: Window,
 boat: Boat
)

case class Window(latitude: Double, longitude: Double, width: Double, height: Double)
