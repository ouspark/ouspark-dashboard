package com.ouspark.ospace.route

import com.ouspark.ospace.components.SpaceStyle
import com.ouspark.ospace.model.{SpaceModel, Spaces}
import com.thoughtworks.binding.Binding.{BindingSeq, Var}
import com.thoughtworks.binding.{Binding, Route}
import org.scalajs.dom.raw.Node

/**
  * Created by ouspark on 18/11/2017.
  */

trait Loc {
  def name: String
  def link: String = s"#${name}"
}

trait Space extends Loc {
  def spaceName: String
  def spaceConf: Option[SpaceStyle]
}

trait SpaceRender {
  def jss: Option[BindingSeq[Node]] = None
  def css: Option[BindingSeq[Node]] = None
  def render: Binding[Node]
  def install(): Unit = {}
}

object SpaceRoute {
  val home = Spaces.dashboard
  val routes = Spaces.spaces

  val route = Route.Hash[SpaceModel](home)(
    new Route.Format[SpaceModel] {
      override def unapply(hashText: String): Option[SpaceModel] = Some(routes.find(_.name == hashText.drop(1)).getOrElse(home))
      override def apply(state: SpaceModel): String = state.name
    }
  )

  route.watch()

  val spaces: Var[SpaceModel] = route.state
}


