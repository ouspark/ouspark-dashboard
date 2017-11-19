package com.ouspark

import com.thoughtworks.binding.Binding

/**
  * Created by ouspark on 18/11/2017.
  */
package object ospace {
  implicit def makeIntellijHappy[T <: org.scalajs.dom.raw.Node](x: scala.xml.Node): Binding[T] =
    throw new AssertionError("This should never execute")
  implicit def makeIntellijHappy1[T <: org.scalajs.dom.raw.Node](x: scala.xml.NodeBuffer): Binding[T] =
    throw new AssertionError("This should never execute.")
}
