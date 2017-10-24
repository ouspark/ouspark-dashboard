package com.ouspark.dashboard.components

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.all._
/**
  * Created by spark.ou on 10/24/2017.
  */
object Navigation {

  val component = ScalaComponent.builder
    .static("Navigation")(
      div(id:="navbar", cls:="navbar navbar-default ace-save-state")(
        div(cls:="navbar-container ace-save-state", id:="navbar-container")(
          button(tpe:="button", cls:="navbar-toggle menu-toggler pull-left", id:="menu-toggler")(
            span(cls:="sr-only")("Tonggle sidebar"),
            span(cls:="icon-bar"),
            span(cls:="icon-bar"),
            span(cls:="icon-bar")
          ),
          div(cls:="navbar-header pull-left")(
            a(href:="google.com", cls:="navbar-brand")(
              small(
                i(cls:="fa fa-yelp"),
                " Ouspark's Admin"
              )
            )
          ),
          div(cls:="navbar-buttons navbar-header pull-right", role:="navigation")(

          )
        )
      )
    )
    .build

  def apply() = component()
}
