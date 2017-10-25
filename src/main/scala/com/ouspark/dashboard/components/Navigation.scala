package com.ouspark.dashboard.components

import com.ouspark.dashboard.models.NavMenu
import com.ouspark.dashboard.routes.AppRouter.{AppPage, Home}
import japgolly.scalajs.react._
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react.vdom.all._

/**
  * Created by spark.ou on 10/24/2017.
  */
object Navigation {

  case class Props(menus: Vector[NavMenu], selectedPage: AppPage, ctrl: RouterCtl[AppPage])

  val component = ScalaComponent.builder[Props]("Navigation")
    .render_P { P =>
      div(id:="navbar", cls:="navbar navbar-default ace-save-state")(
        div(cls:="navbar-container ace-save-state", id:="navbar-container")(
          button(tpe:="button", cls:="navbar-toggle menu-toggler pull-left", id:="menu-toggler")(
            span(cls:="sr-only")("Tonggle sidebar"),
            span(cls:="icon-bar"),
            span(cls:="icon-bar"),
            span(cls:="icon-bar")
          ),
          div(cls:="navbar-header pull-left")(
            a(href:="", cls:="navbar-brand")(
              small(
                i(cls:="fa fa-yelp"),
                " Ouspark's Admin"
              )
            ),
            P.ctrl setOnClick Home
          ),
          div(cls:="navbar-buttons navbar-header pull-right", role:="navigation")(
            ul(cls:="nav ace-nav", id:="nav-generator")(
              P.menus.toTagMod { item =>
                li(cls:="grey dropdown-modal")(
                  a(cls:="dropdown-toggle", href:="#")(
                    i(cls:="ace-icon fa fa-tasks"),
                    span(cls:="badge badge-grey")(item.name)
                  ),
                  P.ctrl setOnClick item.route
                )
              }
            )
          )
        )
      )

    }
    .build

  def apply(props: Props) = component(props)
}
