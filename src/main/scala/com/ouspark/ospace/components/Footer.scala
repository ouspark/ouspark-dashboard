package com.ouspark.ospace
package components

import com.thoughtworks.binding.Binding.BindingSeq
import com.thoughtworks.binding.{Binding, dom}
import org.scalajs.dom.raw.Node

/**
  * Created by ouspark on 18/11/2017.
  */
object Footer {

  @dom
  def render: Binding[BindingSeq[Node]] = {

    <div class="pull-right hidden-xs">
      <b>Version</b> 0.1.0
    </div>
      <strong>Copyright &copy; 2017 <a href="https://ouspark.github.io">Ouspark</a>.</strong>
      <p>All rights reserved.</p>
  }
}
