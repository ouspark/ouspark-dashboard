package com.ouspark.dashboard.components

import com.ouspark.dashboard.routes.Workspace
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.all._


/**
  * Created by spark.ou on 10/24/2017.
  */
object Sidebar {

  case class Props(menus: Vector[Workspace], selectedPage: Workspace, ctrl: RouterCtl[Workspace])

  val component = ScalaComponent.builder[Props]("Sidebar")
    .render_P { P =>
      div(id:="sidebar", cls:="sidebar responsive ace-save-state")(
        script(tpe:="text/javascript")(
          "try{ace.settings.loadState('sidebar')} catch(e) {}"
        ),
        div(cls:="sidebar-shortcuts", id:="sidebar-shortcuts")(
          div(cls:="sidebar-shortcuts-large", id:="sidebar-shortcuts-large")(
            button(cls:="btn btn-success")(
              i(cls:="ace-icon fa fa-signal")
            ),
            button(cls:="btn btn-info")(
              i(cls:="ace-icon fa fa-pencil")
            ),
            button(cls:="btn btn-warning")(
              i(cls:="ace-icon fa fa-users")
            ),
            button(cls:="btn btn-danger")(
              i(cls:="ace-icon fa fa-cogs")
            )
          ),
          div(cls:="sidebar-shortcuts-mini", id:="sidebar-shortcuts-mini")(
            span(cls:="btn btn-success"),
            span(cls:="btn btn-info"),
            span(cls:="btn btn-warning"),
            span(cls:="btn btn-danger")
          )
        ),
        ul(cls:="nav nav-list")(
          P.menus.toTagMod(
            item =>
              li((cls:="active").when(item == P.selectedPage))(
                a(href:="")(
                  i(cls:="menu-icon fa fa-tachometer"),
                  span(cls:="menu-text")(item.title)
                ),
                b(cls:="arrow").when(item == P.selectedPage),
                P.ctrl setOnClick item
              )
          )
        ),
        div(cls:="sidebar-toggle sidebar-collapse", id:="sidebar-collapse")(
          i(id:="sidebar-toggle-icon", cls:="ace-icon fa fa-angle-double-left ace-save-state"
            , VdomAttr("data-icon1"):="ace-icon fa fa-angle-double-left", VdomAttr("data-icon2"):="ace-icon fa fa-angle-double-right")
        )
      )
    }
    .build

  def apply(props: Props) = component(props)
}
