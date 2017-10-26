package com.ouspark.dashboard.pages

import japgolly.scalajs.react.ScalaComponent
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/25/2017.
  */
object HomePage {
  val component = ScalaComponent.builder
    .static("Home")(
      <.div(
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
            )
          )
        ),
        <.div(^.cls:="content-wrapper", ^.minHeight:="901px")(
          <.section(^.cls:="content-header")(
            "Home"
          )
        )
      )
    )
    .build

  def apply() = component()

  case class Props()

}
