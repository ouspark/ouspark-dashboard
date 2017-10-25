package com.ouspark.dashboard.pages

import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.PackageBase.VdomAttr
import japgolly.scalajs.react.vdom.all._
/**
  * Created by spark.ou on 10/24/2017.
  */
object DashboardPage {

  val component = ScalaComponent.builder[String]("Dashboard")
    .render_P { P =>
      div(cls:="breadcrumbs ace-save-state", id:="breadcrumbs")(
        ul(cls:="breadcrumb")(
          li(
            i(cls:="ace-icon fa fa-home home-icon"),
            a(href:="#")("Home")
          ),
          li(cls:="active")(P)
        ),
        div(cls:="nav-search", id:="nav-search")(
          form(cls:="form-search")(
            span(cls:="input-icon")(
              input(tpe:="text", placeholder:="Search...", cls:="nav-search-input", id:="nav-search-input", VdomAttr("autoComplete"):="off"),
              i(cls:="ace-icon fa fa-search nav-search-icon")
            )
          )
        )
      )
    }
    .build

  def apply(content: String) = component(content)
}
