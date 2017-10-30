package com.ouspark.dashboard.routes

import com.ouspark.dashboard.components.Content
import com.ouspark.dashboard.pages.{DashboardPage, WorkspacePage}
import japgolly.scalajs.react.extra.router.RouterConfigDsl
import japgolly.scalajs.react.vdom.VdomElement
import japgolly.scalajs.react.vdom.html_<^._


/**
  * Created by spark.ou on 10/25/2017.
  */
sealed abstract class WorkspaceItem(val title: String, val routerPath: String)
sealed case class WorkspaceContent(item: WorkspaceItem, render: () => VdomElement)
object WorkspaceItem {

  case object DashItem extends WorkspaceItem("Dashboard", "dashboard")
  case object TableItem extends WorkspaceItem("Table", "table")
  case object Game1 extends WorkspaceItem("Game#1", "game_1")
  case object Game2 extends WorkspaceItem("Game#2", "game_2")

  val dashContent =  () => Content(DashItem).vdomElement

  def getContent(item: WorkspaceItem) = Content(item).vdomElement

  val games = Vector(Game1, Game2)
  val menu = Vector(DashItem, TableItem, Game1, Game2)
  val contents = Vector()

  val routes = RouterConfigDsl[WorkspaceItem].buildRule { dsl =>
    import dsl._
    menu
      .map { i =>
        staticRoute(i.routerPath, i) ~> renderR(
          r => WorkspacePage(WorkspacePage.Props(i, r))
        )
      }
      .reduce(_ | _)
  }

}
