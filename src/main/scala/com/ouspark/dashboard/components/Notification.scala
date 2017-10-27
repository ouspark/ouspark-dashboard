package com.ouspark.dashboard.components

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^.{<, _}
/**
  * Created by spark.ou on 10/27/2017.
  */
case class MsgItem(msg: String)
case class MsgSection(liCls: String, icon: String, labelCls: String, messages: Seq[MsgItem] = List(MsgItem("You have xx messages")))
object Notification {
  val msgSection = MsgSection("dropdown message-menu", "fa fa-envelope-o", "label label-success")
  val notifySection = MsgSection("dropdown notifications-menu", "fa fa-bell-o", "label label-warning")
  val taskSection = MsgSection("dropdown tasks-menu", "fa fa-flag-o", "label label-danger")

  val sections = Vector(msgSection, notifySection, taskSection)

  val navMsgEles = sections.toTagMod { item =>
    <.li(^.cls:=item.liCls)(
      <.a(^.href:="#", ^.cls:="dropdown-toggle", VdomAttr("data-toggle"):="dropdown")(
        <.i(^.cls:=item.icon),
        <.span(^.cls:=item.labelCls)("4")
      ),
      <.ul(^.cls:="dropdown-menu")(
        <.li(^.cls:="header")(s"You have ${item.messages.length} messages")
      )
    )
  }

  def apply(props: Navigation.Props) = component(props)
  val component = ScalaComponent.builder[Navigation.Props]("Notifications")
    .render_P { P =>
      <.nav(^.cls:="navbar navbar-static-top")(
        <.a(^.href:="#", ^.cls:="sidebar-toggle", VdomAttr("data-toggle"):="push-menu", ^.role:="button")(
          <.span(^.cls:="sr-only")("Toggle navigation")
        ),
        <.div(^.cls:="navbar-custom-menu")(
          <.ul(^.cls:="nav navbar-nav")(
            navMsgEles,
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
        ),
        <.div(^.cls:="navbar-custom-menu")(
          <.ul(^.cls:="nav navbar-nav")(
            P.menus.toTagMod { item =>
              <.li(
                <.a(^.cls:="dropdown-toggle", ^.href:="#")(
                  <.span(item.name)
                ),
                P.ctrl setOnClick item.route
              )
            }
          )
        )
      )
    }
    .build
}
