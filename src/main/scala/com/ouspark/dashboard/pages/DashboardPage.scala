package com.ouspark.dashboard.pages

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/24/2017.
  */
object DashboardPage {

  val component = ScalaComponent.builder[String]("Dashboard")
    .render_P { P =>
      <.div(^.cls:="content-wrapper", ^.minHeight:="901px")(
        <.section(^.cls:="content-header")(
          <.h1(P,
            <.small("Control panel")),
          <.ol(^.cls:="breadcrumb")(
            <.li(
              <.a(^.href:="#")(
                <.i(^.cls:="fa fa-dashboard"),
                "Home"
              )
            ),
            <.li(^.cls:="active")(P)
          )
        ),
        <.section(^.cls:="content")(
          <.div(^.cls:="row")(

          ),
          <.div(^.cls:="row")(

          )
        )
      )
    }
    .build

  def apply(content: String) = component(content)
}
