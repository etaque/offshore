package models

import play.api.libs.json.{JsObject, _}

sealed trait WsCommand

// Client to server
case class MoveWindow(windows: Window) extends WsCommand

case class Rotate(angle: Long) extends WsCommand

case class UpdatePlayer(name: String, color: String) extends WsCommand

// Server to client
case class RefreshWind(cells: Seq[Cell]) extends WsCommand

case class Cell(latitude: Double, longitude: Double, speed: Double, origin: Double)

case class RefreshBoat(boats: Seq[Boat]) extends WsCommand

case class Boat(name: String, color: String, latitude: Double, longitude: Double, angle: Long)

object WsCommand {
  def fromJson(json: JsValue): Option[WsCommand] = {
    ((json \ "command").toOption, (json \ "value").toOption) match {
      case (Some(command), Some(value)) =>
        command match {
          case JsString("moveWindow") => fromJsonMoveWindow(value)
          case JsString("rotate") => fromJsonRotate(value)
          case JsString("updatePlayer") => fromJsonUpdatePlayer(value)
          case _ => None // ignore server commands
        }
      case _ => None
    }
  }

  def fromJsonMoveWindow(json: JsValue): Option[MoveWindow] = {
    (
      (json \ "p1").toOption,
      (json \ "p2").toOption
    ) match {
      case (Some(p1), Some(p2)) =>
        (fromJsonExtractPoint(p1), fromJsonExtractPoint(p2)) match {
          case (Some(p1), Some(p2)) => Some(MoveWindow(Window(p1, p2)))
          case _ => None
        }
      case _ => None
    }
  }

  def fromJsonExtractPoint(json: JsValue): Option[Position] = {
    (
      (json \ "latitude").toOption,
      (json \ "longitude").toOption
    ) match {
      case (Some(p1), Some(p2)) =>
        (p1, p2) match {
          case (JsNumber(p1), JsNumber(p2)) => Some(Position(p1.doubleValue(), p2.doubleValue()))
          case _ => None
        }
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

  def fromJsonUpdatePlayer(json: JsValue): Option[UpdatePlayer] = {
    (
      (json \ "angle").toOption ,
      (json \ "color").toOption
    ) match {
      case (Some(JsString(name)), Some(JsString(color))) =>
        Some(UpdatePlayer(name, color))
      case _ => None
    }
  }

  def toJson(command: WsCommand): Option[JsValue] = {
    command match {
      case command: RefreshWind => toJsonRefreshWind(command)
      case command: RefreshBoat => toJsonRefreshBoats(command)
      case _ => None // ignore client command
    }
  }

  def toJsonRefreshWind(command: RefreshWind): Option[JsValue] = {
    Some(JsObject(Map(
      "command" -> JsString("refreshWind"),
      "value" -> JsArray(command.cells.map { cell =>
        JsObject(Map(
          "latitude" -> JsNumber(cell.latitude),
          "longitude" -> JsNumber(cell.longitude),
          "speed" -> JsNumber(cell.speed),
          "origin" -> JsNumber(cell.origin)
        ))
      })
    )))
  }

  def toJsonRefreshBoats(command: RefreshBoat): Option[JsValue] = {
    Some(JsObject(Map(
      "command" -> JsString("refreshBoats"),
      "value" -> JsArray(command.boats.map { boat =>
        JsObject(Map(
          "name" -> JsString(boat.name),
          "color" -> JsString(boat.color),
          "latitude" -> JsNumber(boat.latitude),
          "longitude" -> JsNumber(boat.longitude),
          "angle" -> JsNumber(boat.angle)
        ))
      })
    )))
  }
}