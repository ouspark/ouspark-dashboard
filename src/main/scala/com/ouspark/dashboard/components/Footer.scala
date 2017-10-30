package com.ouspark.dashboard.components

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/30/2017.
  */
object Footer {

  val component = ScalaComponent.builder
    .static("Footer")(
      <.footer(^.cls:="main-footer")(
        <.div(^.cls:="pull-right hidden-xs")(
          <.b("Version"), " 0.0.1"
        ),
        <.strong("Copyright &copy; 2017")(
          <.a(^.href:="https://github.com/ouspark"),
          "."),
        "All rights reserved."
      )
    )
    .build

  def apply() = component()
}
