package com.ouspark.dashboard.components

import com.ouspark.dashboard.routes.WorkspaceItem
import japgolly.scalajs.react._
import japgolly.scalajs.react.vdom.html_<^._
/**
  * Created by spark.ou on 10/30/2017.
  */
object Content {

  val component = ScalaComponent.builder[WorkspaceItem]("Content")
    .render_P { P =>
      <.div(^.cls:="content-wrapper", ^.minHeight:="901px")(
        Breadcrumb(P),
        <.section(^.cls:="content")(
          <.div(^.cls:="row")(

          ),
          <.div(^.cls:="row")(

          )
        )
      )
    }
    .build

  def apply(item: WorkspaceItem) = component(item)

}
