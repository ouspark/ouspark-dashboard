package com.ouspark.dashboard.pages

import japgolly.scalajs.react.ScalaComponent
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/25/2017.
  */
object HomePage {
  val component = ScalaComponent.builder
    .static("Home")(<.div(^.className:="class", "Home"))
    .build

  def apply() = component()
}
