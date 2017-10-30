package com.ouspark.dashboard.routes

import com.ouspark.dashboard.components.{Footer, Navigation, PageSetting}
import com.ouspark.dashboard.models.NavMenu
import com.ouspark.dashboard.pages.HomePage
import japgolly.scalajs.react.extra.router.{BaseUrl, Redirect, Resolution, Router, RouterConfigDsl, RouterCtl}
import japgolly.scalajs.react.vdom.html_<^._

/**
  * Created by spark.ou on 10/24/2017.
  */
object AppRouter {

  sealed trait AppPage
  object Home extends AppPage
  case class Items(items: WorkspaceItem) extends AppPage

  val config = RouterConfigDsl[AppPage].buildConfig { dsl =>
    import dsl._

    val workspaceRule: Rule = WorkspaceItem.routes.prefixPath_/("#workspace").pmap[AppPage](Items) {
      case Items(p) => p
    }
    (trimSlashes
      | staticRoute(root, Home) ~> render(HomePage())
      | workspaceRule)
      .notFound(redirectToPage(Home)(Redirect.Replace))
      .renderWith(layout)
  }

  val mainMenu = Vector(
    NavMenu("Home", Home),
    NavMenu("Workspace", Items(WorkspaceItem.DashItem))
  )
  def layout(c: RouterCtl[AppPage], r: Resolution[AppPage]) =
    <.div(
      Navigation(Navigation.Props(mainMenu, r.page, c)),
      r.render(),
      Footer(),
      PageSetting()
    )

  val baseUrl = BaseUrl.fromWindowOrigin / "ouspark/"

  val router = Router(baseUrl, config)

}
