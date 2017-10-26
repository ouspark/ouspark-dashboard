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
        <.a(^.cls:="logo")(
          <.span(^.cls:="logo-mini")(
            <.b("O"),"SP"
          ),
          <.span(^.cls:="logo-lg")(
            <.b("Ouspark"), "Admin"
          )
        ),
        <.nav(^.cls:="navbar navbar-static-top")(
          <.a(^.href:="#", ^.cls:="sidebar-toggle", VdomAttr("data-toggle"):="push-menu", ^.role:="button")(
            <.span(^.cls:="sr-only")("Toggle navigation")
          ),
          <.div(^.cls:="navbar-custom-menu")(
            <.ul(^.cls:="nav navbar-nav")(
              P.menus.toTagMod { item =>
                <.li(^.cls:="grey dropdown-modal")(
                  <.a(^.cls:="dropdown-toggle", ^.href:="#")(
                    <.i(^.cls:="fa fa-dashboard-o"),
                    <.span(item.name)
                  ),
                  P.ctrl setOnClick item.route
                )
              },
              <.li(^.cls:="dropdown messages-menu")(
                <.a(^.href:="#", ^.cls:="dropdown-toggle", VdomAttr("data-toggle"):="dropdown")(
                  <.i(^.cls:="fa fa-envelope-o"),
                  <.span(^.cls:="label label-success")("4")
                ),
                <.ul(^.cls:="dropdown-menu")(
                  <.li(^.cls:="header")("You have 4 messages"),
                  <.li("Youuuuuu")
                )
              ),
              <.li(^.cls:="dropdown notifications-menu")(
                <.a(^.href:="#", ^.cls:="dropdown-toggle", VdomAttr("data-toggle"):="dropdown")(
                  <.i(^.cls:="fa fa-bell-o"),
                  <.span(^.cls:="label label-warning")("4")
                ),
                <.ul(^.cls:="dropdown-menu")(
                  <.li(^.cls:="header")("You have 4 notifications")
                )
              ),
              <.li(^.cls:="dropdown tasks-menu")(
                <.a(^.href:="#", ^.cls:="dropdown-toggle", VdomAttr("data-toggle"):="dropdown")(
                  <.i(^.cls:="fa fa-flag-o"),
                  <.span(^.cls:="label label-danger")("4")
                ),
                <.ul(^.cls:="dropdown-menu")(
                  <.li(^.cls:="header")("You have 4 tasks")
                )
              ),
              <.li(^.cls:="dropdown user user-menu")(
                <.a(^.href:="#", ^.cls:="dropdown-toggle", VdomAttr("data-toggle"):="dropdown")(
                  <.img(^.src:="img/user2-160x160.jpg", ^.cls:="user-image", ^.alt:="User Image"),
                  <.span(^.cls:="hidden-xs")("Spark Ou")
                ),
                <.ul(^.cls:="dropdown-menu")(

                )
              ),
              <.li()(
                <.a(^.href:="#", VdomAttr("data-toggle"):="control-sidebar")(
                  <.i(^.cls:="fa fa-gears")
                )
              )
            )
          )
        )
      )



//      div(id:="navbar", cls:="navbar navbar-default ace-save-state")(
//        div(cls:="navbar-container ace-save-state", id:="navbar-container")(
//          button(tpe:="button", cls:="navbar-toggle menu-toggler pull-left", id:="menu-toggler")(
//            span(cls:="sr-only")("Tonggle sidebar"),
//            span(cls:="icon-bar"),
//            span(cls:="icon-bar"),
//            span(cls:="icon-bar")
//          ),
//          div(cls:="navbar-header pull-left")(
//            a(href:="", cls:="navbar-brand")(
//              small(
//                i(cls:="fa fa-yelp"),
//                " Ouspark's Admin"
//              )
//            ),
//            P.ctrl setOnClick Home
//          ),
//          div(cls:="navbar-buttons navbar-header pull-right", role:="navigation")(
//            ul(cls:="nav ace-nav", id:="nav-generator")(
//              P.menus.toTagMod { item =>
//                li(cls:="grey dropdown-modal")(
//                  a(cls:="dropdown-toggle", href:="#")(
//                    i(cls:="ace-icon fa fa-tasks"),
//                    span(cls:="badge badge-grey")(item.name)
//                  ),
//                  P.ctrl setOnClick item.route
//                )
//              }
//            )
//          )
//        )
//      )

    }
    .build

  def apply(props: Props) = component(props)
}
