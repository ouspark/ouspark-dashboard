package com.ouspark.ospace
package components

import com.ouspark.ospace.model.{SpaceModel, Spaces}
import com.ouspark.ospace.route.SpaceRoute
import com.thoughtworks.binding.Binding.{BindingSeq, Constants}
import com.thoughtworks.binding.{Binding, dom}
import org.scalajs.dom.raw.Node

/**
  * Created by ouspark on 18/11/2017.
  */
object Sidebar {

  @dom
  def render: Binding[Node] = {

    <section class="sidebar">
      <div class="user-panel">
        <div class="pull-left image">
          <img src="asset/images/user2-160x160.jpg" class="img-circle" alt="User Image"/>
        </div>
        <div class="pull-left info">
          <p>Alexander Pierce</p>
          <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
        </div>
      </div>
      <form action="#" method="get" class="sidebar-form">
        <div class="input-group">
          <input type="text" name="q" class="form-control" placeholder="Search..."/>
            <span class="input-group-btn">
              <button type="submit" name="search" id="search-btn" class="btn btn-flat">
                <i class="fa fa-search"></i>
              </button>
            </span>
          </div>
        </form>
        <ul class="sidebar-menu" id="sidebar-menu">
          { renderLis(lis).bind }
        </ul>
    </section>
  }


  @dom
  def renderLis(lis: Seq[LiNode]): Binding[BindingSeq[Node]] = {
    Constants(lis: _*).map { li =>
      if (li.isHeader) {
        <li class="header">{ li.headerName.get }</li>
      } else {
        val space = { li.space }
        if (li.childs.isEmpty) {
          val cls = { if (space.name.contains(SpaceRoute.spaces.bind.name)) "active" else "" }
          <li class={ cls }><a href={ space.link }><i class={ space.spaceConf.get.fa }></i>
            <span>{ space.spaceName } </span></a>
          </li>
        } else {
          val cls = { if (SpaceRoute.spaces.bind.name.startsWith(space.name)) "active treeview" else "treeview" }
          <li class={ cls }>
            <a href="#"><i class={ space.spaceConf.get.fa }></i><span>{ space.spaceName }</span>
              <span class="pull-right-container">
                <i class="fa fa-angle-left pull-right"></i>
              </span>
            </a>
            <ul class="treeview-menu">
              { renderLis(li.childs.get).bind }
            </ul>
          </li>
        }
      }
    }
  }

  val workspace_1 = LiNode(Spaces.workspace_1)
  val workspace_2 = LiNode(Spaces.workspace_2)
  val workspaceModel = SpaceModel("workspace", "Workspace", Some(SpaceStyle.workspace), None)
  val workspace = LiNode(workspaceModel, false, None, Some(List(workspace_1, workspace_2)))
  val navigation = LiNode(Spaces.nonespace, true, Some("MAIN NAVIGATION"))
  val dashboard = LiNode(Spaces.dashboard)

  val lis = List(dashboard, navigation, workspace)

}



case class LiNode(space: SpaceModel, isHeader: Boolean = false, headerName: Option[String] = None, childs: Option[Seq[LiNode]] = None)

