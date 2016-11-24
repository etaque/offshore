package models

import play.api.libs.json._

sealed trait WsCommand

// Client to server
case class MoveWindow(windows: Window) extends WsCommand

case class Rotate(angle: Long) extends WsCommand

// Server to client
case class RefreshWind(cells: Seq[Cell]) extends WsCommand

case class Cell(latitude: Double, longitude: Double, force: Double, direction: Double)

case class RefreshBoat(boats: Seq[Boat]) extends WsCommand

case class Boat(id: Long, latitude: Double, longitude: Double, angle: Long)

object WsCommand {
  def fromJson(json: JsValue): Option[WsCommand] = {
    ((json \ "command").toOption, (json \ "value").toOption) match {
      case (Some(command), Some(value)) =>
        command match {
          case JsString("moveWindow") => fromJsonMoveWindow(value)
          case JsString("rotate") => fromJsonRotate(value)
          case _ => None // ignore server commands
        }
      case _ => None
    }
  }

  def fromJsonMoveWindow(json: JsValue): Option[MoveWindow] = {
    (
      (json \ "latitude").toOption,
      (json \ "longitude").toOption,
      (json \ "width").toOption,
      (json \ "height").toOption
    ) match {
      case (Some(JsNumber(latitude)), Some(JsNumber(longitude)), Some(JsNumber(width)), Some(JsNumber(height))) =>
        Some(MoveWindow(Window(latitude.doubleValue(), longitude.doubleValue(), width.doubleValue(), height.doubleValue())))
      case _ => None
    }
  }

  def fromJsonRotate(json: JsValue): Option[Rotate] = {
    (json \ "angle").toOption match {
      case Some(JsNumber(angle)) =>
        Some(Rotate(angle.intValue()))
      case _ => None
    }
  }

  def toJson(command: WsCommand): Option[JsValue] = {
    command match {
      case command: RefreshWind => toJsonRefreshWind(command)
      case command: RefreshBoat => toJsonRefreshBoat(command)
      case _ => None // ignore client command
    }
  }

  def toJsonRefreshWind(command: RefreshWind): Option[JsValue] = {
    Some(JsArray(command.cells.map { cell =>
      JsObject(Map(
        "latitude" -> JsNumber(cell.latitude),
        "longitude" -> JsNumber(cell.longitude),
        "force" -> JsNumber(cell.force),
        "direction" -> JsNumber(cell.direction)
      ))
    }))
  }

  def toJsonRefreshBoat(command: RefreshBoat): Option[JsValue] = {
    Some(JsArray(command.boats.map { boat =>
      JsObject(Map(
        "id" -> JsNumber(boat.id),
        "latitude" -> JsNumber(boat.latitude),
        "longitude" -> JsNumber(boat.longitude),
        "angle" -> JsNumber(boat.angle)
      ))
    }))
  }
}