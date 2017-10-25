package com.ouspark.dashboard.routes

import com.ouspark.dashboard.pages.{DashboardPage, WorkspacePage}
import japgolly.scalajs.react.extra.router.RouterConfigDsl
import japgolly.scalajs.react.vdom.VdomElement


/**
  * Created by spark.ou on 10/25/2017.
  */
sealed abstract class Workspace(val title: String, val routerPath: String, val render: () => VdomElement)
object Workspace {

  case object DashItem extends Workspace("Dashboard", "dashboard", () => DashboardPage("Dashboard View").vdomElement)
  case object TableItem extends Workspace("Table", "table", () => DashboardPage("Table View").vdomElement)

  val menu = Vector(DashItem, TableItem)

  val routes = RouterConfigDsl[Workspace].buildRule { dsl =>
    import dsl._
    menu
      .map { i =>
        staticRoute(i.routerPath, i) ~> renderR(
          r => WorkspacePage(WorkspacePage.Props(i, r)))
      }
      .reduce(_ | _)
  }
}
