package com.ouspark.dashboard.pages

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/24/2017.
  */
object DashboardPage {

  val component = ScalaComponent.builder
    .static("Dashboard")(<.div(^.className:="class", "Dashboard"))
    .build

  def apply() = component()
}
