package controllers

import actors.UserActor
import play.api.mvc.Controller
import play.api.mvc._
import play.api.Play.current
import play.api.libs.json.JsValue


object Websocket extends Controller {

  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => out =>

    UserActor.props(out, s"Player ${scala.util.Random.nextInt}")
  }
}
