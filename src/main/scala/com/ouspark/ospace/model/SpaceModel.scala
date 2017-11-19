package com.ouspark.ospace.model

import com.ouspark.ospace.components.SpaceStyle
import com.ouspark.ospace.route.{Space, SpaceRender}
import com.ouspark.ospace.spaces.{Dashboard, Workspace}


/**
  * Created by ouspark on 18/11/2017.
  */
case class SpaceModel(name: String, spaceName: String, spaceConf: Option[SpaceStyle] = None, content: Option[SpaceRender] = None) extends Space

object Spaces {
  val nonespace = SpaceModel("none", "None", None, None)
  val dashboard = SpaceModel("dashboard", "Dashboard", Some(SpaceStyle.dashboard), Some(Dashboard))
  val workspace_1 = SpaceModel("workspace_1", "Workspace_1", Some(SpaceStyle.workspace_1), Some(Workspace))
  val workspace_2 = SpaceModel("workspace_2", "Workspace_2", Some(SpaceStyle.workspace_2), Some(Workspace))

  val spaces = List(dashboard, workspace_1, workspace_2)
}
