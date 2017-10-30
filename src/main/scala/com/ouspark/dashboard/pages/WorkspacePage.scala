package com.ouspark.dashboard.pages

import com.ouspark.dashboard.components.Sidebar
import com.ouspark.dashboard.routes.WorkspaceItem
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/25/2017.
  */
object WorkspacePage {

  case class Props(selectedPage: WorkspaceItem, c: RouterCtl[WorkspaceItem])
  def apply(props: Props) = component(props).vdomElement
  val component = ScalaComponent.builder[Props]("WorkspacePage")
    .render_P { P =>
      <.div(^.height:="auto")(
        Sidebar(Sidebar.Props(WorkspaceItem.menu, P.selectedPage, P.c)),
        WorkspaceItem.getContent(P.selectedPage)
      )
    }
    .build
}
