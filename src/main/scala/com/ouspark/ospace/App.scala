package com.ouspark.ospace

import com.ouspark.ospace.components._
import com.thoughtworks.binding.Binding.BindingSeq
import com.thoughtworks.binding.{Binding, dom}
import org.scalajs.dom.{Node, document}

import scala.scalajs.js
import scala.scalajs.js.JSApp

/**
  * Created by ouspark on 18/11/2017.
  */

object App extends JSApp {
  val $ = js.Dynamic.global.$

  override def main(): Unit = {
    dom.render(document.getElementById("wrapper"), wrapper)

    $("#sidebar-menu").attr("data-widget", "tree")
  }

  @dom
  def wrapper: Binding[BindingSeq[Node]] = {

    <header class="main-header">
      { Header.render.bind }
    </header>
    <aside class="main-sidebar">
      { Sidebar.render.bind }
    </aside>
    <div class="content-wrapper">
      { Content.render.bind }
    </div>
    <footer class="main-footer">
      { Footer.render.bind }
    </footer>
    <aside class="control-sidebar control-sidebar-dark">
      { SidebarCtrl.render.bind }
    </aside>
    <div class="control-sidebar-bg"></div>
  }

}


