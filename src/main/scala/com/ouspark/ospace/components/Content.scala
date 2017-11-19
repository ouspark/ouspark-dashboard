package com.ouspark.ospace
package components

import com.ouspark.ospace.route.{SpaceRoute}
import com.thoughtworks.binding.Binding.BindingSeq
import com.thoughtworks.binding.{Binding, dom}
import org.scalajs.dom.raw.Node

/**
  * Created by ouspark on 18/11/2017.
  */
object Content {

  @dom
  def render: Binding[BindingSeq[Node]] = {
    val space = { SpaceRoute.spaces.bind }
    val spaceConf = { space.spaceConf.getOrElse(SpaceStyle.dashboard) }

    <section class="content-header">
      <h1>
        { space.spaceName }
        <small>{ spaceConf.sheaderName }</small>
      </h1>
      <ol class="breadcrumb">
        <li><a href={ SpaceRoute.home.link }><i class={ SpaceRoute.home.spaceConf.get.fa }></i> Home</a></li>
        <li class="active">{ space.spaceName }</li>
      </ol>
    </section>
    <section class="content">
      <!-- Info boxes -->
      <div class="row">
        { space.content.get.render.bind }
      </div>
    </section>
  }

}
