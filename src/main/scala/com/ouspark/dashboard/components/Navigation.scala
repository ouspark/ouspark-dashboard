package com.ouspark.dashboard.components

import com.ouspark.dashboard.models.NavMenu
import com.ouspark.dashboard.routes.AppRouter.{AppPage, Home}
import japgolly.scalajs.react._
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/24/2017.
  */
object Navigation {

  case class Props(menus: Vector[NavMenu], selectedPage: AppPage, ctrl: RouterCtl[AppPage])

  val component = ScalaComponent.builder[Props]("Navigation")
    .render_P { P =>
      <.header(^.cls:="main-header")(
        Logo(),
        Notification(P)
      )
    }
    .build

  def apply(props: Props) = component(props)
}
