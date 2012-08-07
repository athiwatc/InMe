package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

	def index = Action { request =>
	request.session.get("token").map { token =>
	Ok(views.html.index(token))
	}.getOrElse {
		Ok(views.html.index(""))
	}

	}

	def settoken(token: String) = Action { 
		Redirect("/").withSession({"token" -> token})
	}

	def logout() = Action {
		Redirect("/").withNewSession
	}

}