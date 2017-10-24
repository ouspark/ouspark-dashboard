package com.ouspark.dashboard

import com.ouspark.dashboard.routes.AppRouter
import org.scalajs.dom

import scala.scalajs.js.JSApp
import scala.scalajs.js.annotation.JSExport

/**
  * Created by spark.ou on 10/24/2017.
  */

object DashApp extends JSApp {

  @JSExport
  override def main() = {
    AppRouter.router().renderIntoDOM(dom.document.body)
  }
}
