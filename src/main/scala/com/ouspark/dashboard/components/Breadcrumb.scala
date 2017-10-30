package com.ouspark.dashboard.components

import com.ouspark.dashboard.routes.WorkspaceItem
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/30/2017.
  */
object Breadcrumb {

  val component = ScalaComponent.builder[WorkspaceItem]("Breadcrumb")
    .render_P { P =>
      <.section(^.cls:="content-header")(
        <.h1(P.title,
          <.small("Control panel")),
        <.ol(^.cls:="breadcrumb")(
          <.li(
            <.a(^.href:="#")(
              <.i(^.cls:="fa fa-dashboard"),
              "Home"
            )
          ),
          <.li(^.cls:="active")(P.title)
        )
      )
    }
    .build

  def apply(item: WorkspaceItem) = component(item)
}
