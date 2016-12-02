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
    ((json \ "command").asOpt[String], (json \ "value").toOption) match {
      case (Some(command), Some(value)) =>
        command match {
          case "moveWindow" => fromJsonMoveWindow(value)
          case "rotate" => fromJsonRotate(value)
          case "updatePlayer" => fromJsonUpdatePlayer(value)
          case _ => None // ignore server commands
        }
      case _ => None
    }
  }

  def fromJsonMoveWindow(json: JsValue): Option[MoveWindow] = {
    (
      (json \ "p1").toOption.flatMap(fromJsonExtractPoint),
      (json \ "p2").toOption.flatMap(fromJsonExtractPoint)
    ) match {
      case (Some(p1), Some(p2)) => Some(MoveWindow(Window(p1, p2)))
      case _ => None
    }
  }

  def fromJsonExtractPoint(json: JsValue): Option[Position] = {
    (
      (json \ "latitude").asOpt[Double],
      (json \ "longitude").asOpt[Double]
    ) match {
      case (Some(p1), Some(p2)) => Some(Position(p1, p2))
      case _ => None
    }
  }

  def fromJsonRotate(json: JsValue): Option[Rotate] =
    (json \ "angle").asOpt[Long].map(Rotate.apply)

  def fromJsonUpdatePlayer(json: JsValue): Option[UpdatePlayer] = {
    (
      (json \ "angle").asOpt[String],
      (json \ "color").asOpt[String]
    ) match {
      case (Some(name), Some(color)) =>
        Some(UpdatePlayer(name, color))
      case _ => None
    }
  }

  def toJson(command: WsCommand): Option[JsValue] = {
    command match {
      case command: RefreshWind => Some(toJsonRefreshWind(command))
      case command: RefreshBoat => Some(toJsonRefreshBoats(command))
      case _ => None // ignore client command
    }
  }

  def toJsonRefreshWind(command: RefreshWind): JsValue = Json.obj(
    "command" -> "refreshWind",
    "value" -> command.cells.map { cell =>
      Json.obj(
        "latitude" -> cell.latitude,
        "longitude" -> cell.longitude,
        "speed" -> cell.speed,
        "origin" -> cell.origin
      )
    }
  )

  def toJsonRefreshBoats(command: RefreshBoat): JsValue = Json.obj(
    "command" -> "refreshBoats",
    "value" -> command.boats.map { boat =>
      Json.obj(
        "name" -> boat.name,
        "color" -> boat.color,
        "latitude" -> boat.latitude,
        "longitude" -> boat.longitude,
        "angle" -> boat.angle
      )
    }
  )

}
