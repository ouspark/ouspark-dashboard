package com.ouspark.dashboard.routes

import com.ouspark.dashboard.components.Navigation
import com.ouspark.dashboard.pages.DashboardPage
import japgolly.scalajs.react.extra.router.{BaseUrl, Redirect, Resolution, Router, RouterConfigDsl, RouterCtl}
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/24/2017.
  */
object AppRouter {

  sealed trait AppPage
  object Dashboard extends AppPage
  object Tables extends AppPage

  val config = RouterConfigDsl[AppPage].buildConfig { dsl =>
    import dsl._
    (trimSlashes
        | staticRoute(root, Dashboard) ~> render(DashboardPage()))
      .notFound(redirectToPage(Dashboard)(Redirect.Replace))
      .renderWith(layout)

  }

  def layout(c: RouterCtl[AppPage], r: Resolution[AppPage]) =
    <.div(
      Navigation(),
      r.render()
    )

  val baseUrl = BaseUrl.fromWindowOrigin / "dashboard/"

  val router = Router(baseUrl, config)

}
