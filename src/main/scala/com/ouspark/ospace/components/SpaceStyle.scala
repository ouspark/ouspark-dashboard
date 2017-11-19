package com.ouspark.ospace
package components

/**
  * Created by ouspark on 18/11/2017.
  */
object SpaceStyle {

  val dashboard = SpaceStyle("fa fa-dashboard", "My Dashboard")
  val workspace = SpaceStyle("fa fa-steam", "My Workspace")
  val workspace_1 = SpaceStyle("fa fa-circle-o", "My Workspace - 1")
  val workspace_2 = SpaceStyle("fa fa-circle-o", "My Workspace - 2")


}

case class SpaceStyle(fa: String, sheaderName: String)
