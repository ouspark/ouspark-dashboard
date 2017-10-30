package com.ouspark.dashboard.components

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/30/2017.
  */
object PageSetting {

  val component = ScalaComponent.builder
    .static("PageSetting")(
      <.div(
        <.aside(^.cls:="control-sidebar control-sidebar-dark")(
          <.ul(^.cls:="nav nav-tabs nav-justified control-sidebar-tabs")(
            <.li(
              <.a(^.href:="#control-sidebar-home-tab", VdomAttr("data-toggle"):="tab")(
                <.i(^.cls:="fa fa-home")
              )
            ),
            <.li(
              <.a(^.href:="#control-sidebar-settings-tab", VdomAttr("data-toggle"):="tab")(
                <.i(^.cls:="fa fa-gears")
              )
            )
          ),
          <.div(^.cls:="tab-content")(
            <.div(^.cls:="tab-pane", ^.id:="control-sidebar-home-tab"),
            <.div(^.cls:="tab-pane", ^.id:="control-sidebar-stats-tab"),
            <.div(^.cls:="tab-pane", ^.id:="control-sidebar-settings-tab")
          )
        ),
        <.div(^.cls:="control-sidebar-bg")
      )
    )
    .build

  def apply() = component()
}
