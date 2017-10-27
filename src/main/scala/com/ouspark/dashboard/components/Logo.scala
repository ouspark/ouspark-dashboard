package com.ouspark.dashboard.components

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/27/2017.
  */
object Logo {

  val component = ScalaComponent.builder
    .static("Logo")(
      <.a(^.cls:="logo")(
        <.span(^.cls:="logo-mini")(
          <.b("O"),"sp"
        ),
        <.span(^.cls:="logo-lg")(
          <.b("Ouspark"), "Admin"
        )
      )
    )
    .build

  def apply() = component().vdomElement
}
