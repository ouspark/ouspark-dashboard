package com.ouspark.dashboard.components

import com.ouspark.dashboard.routes.Workspace
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._


/**
  * Created by spark.ou on 10/24/2017.
  */
object Sidebar {

  case class Props(menus: Vector[Workspace], selectedPage: Workspace, ctrl: RouterCtl[Workspace])

  val component = ScalaComponent.builder[Props]("Sidebar")
    .render_P { P =>
      <.aside(^.cls:="main-sidebar")(
        <.section(^.cls:="sidebar")(
          <.div(^.cls:="user-panel")(
            <.div(^.cls:="pull-left image")(
              <.img(^.src:="img/user2-160x160.jpg", ^.cls:="img-circle", ^.alt:="User Image")
            ),
            <.div(^.cls:="pull-left info")(
              <.p("Spark Ou"),
              <.a(^.href:="")(
                <.i(^.cls:="fa fa-circle text-success"),
                "Online"
              )
            )
          ),

          <.form(^.action:="#", ^.method:="get", ^.cls:="sidebar-form")(
            <.div(^.cls:="input-group")(
              <.input(^.tpe:="text", ^.name:="q", ^.cls:="form-control", ^.placeholder:="Search..."),
              <.span(^.cls:="input-group-btn")(
                <.button(^.tpe:="submit", ^.name:="search", ^.id:="search-btn", ^.cls:="btn btn-flat")(
                  <.i(^.cls:="fa fa-search")
                )
              )
            )
          ),

          <.ul(^.cls:="sidebar-menu", VdomAttr("data-widget"):="tree")(
            <.li(^.cls:="header")(
              "MAIN NAVIGATION"
            ),
            P.menus.toTagMod(
              item =>
                <.li((^.cls:="active").when(item == P.selectedPage), ^.cls:="treeview")(
                  <.a(^.href:="")(
                    <.i(^.cls:="fa fa-dashboard"),
                    <.span(item.title),
                    <.span(^.cls:="pull-right-container")(
                      <.i(^.cls:="fa fa-angle-left pull-right")
                    )
                  ),
                  P.ctrl setOnClick item
                )
            )
          )
        )
      )
    }
    .build

  def apply(props: Props) = component(props).vdomElement
}
