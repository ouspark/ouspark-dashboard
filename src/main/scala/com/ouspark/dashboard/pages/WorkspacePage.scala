package com.ouspark.dashboard.pages

import com.ouspark.dashboard.components.Sidebar
import com.ouspark.dashboard.routes.Workspace
import japgolly.scalajs.react.extra.router.RouterCtl
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.all._

/**
  * Created by spark.ou on 10/25/2017.
  */
object WorkspacePage {

  case class Props(selectedPage: Workspace, c: RouterCtl[Workspace])
  def apply(props: Props) = component(props).vdomElement
  val component = ScalaComponent.builder[Props]("WorkspacePage")
    .render_P { P =>
      div(cls:="main-container ace-save-state", id:="main-container")(
        script(tpe:="text/javascript")(
          "try{ace.settings.loadState('main-container')} catch(e){}"
        ),
        Sidebar(Sidebar.Props(Workspace.menu, P.selectedPage, P.c)),
        div(cls:="main-content")(
          div(cls:="main-content-inner")(
            P.selectedPage.render()
          )
        )
      )
    }
    .build
}
