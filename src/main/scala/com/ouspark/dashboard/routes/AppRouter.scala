package com.ouspark.dashboard.routes

import com.ouspark.dashboard.components.Navigation
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
  case class Items(items: Workspace) extends AppPage

  val config = RouterConfigDsl[AppPage].buildConfig { dsl =>
    import dsl._

    val workspaceRule: Rule = Workspace.routes.prefixPath_/("#workspace").pmap[AppPage](Items) {
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
    NavMenu("Workspace", Items(Workspace.DashItem))
  )
  def layout(c: RouterCtl[AppPage], r: Resolution[AppPage]) =
    <.div(
      Navigation(Navigation.Props(mainMenu, r.page, c)),
      r.render(),
      <.footer(^.cls:="main-footer")(
        <.div(^.cls:="pull-right hidden-xs")(
          <.b("Version"), " 0.0.1"
        ),
        <.strong("Copyright &copy; 2017")(
          <.a(^.href:="https://github.com/ouspark"),
          "."),
        "All rights reserved."
      ),
      <.aside(^.cls:="control-sidebar control-sidebar-dark")(
        <.ul(^.cls:="nav nav-tabs nav-justified control-sidebar-tabs")(
          <.li(
            <.a(^.href:="#control-sidebar-home-tab", VdomAttr("data-toggle"):="tab")(
              <.i(^.cls:="fa fa-home")
            )
          ),
          <.li(
            <.a(^.href:="#control-sidebar-settings-tab", VdomAttr("data-toggle"):="tab")(
              <.i(^.cls:="fa fa-gears")
            )
          )
        ),
        <.div(^.cls:="tab-content")(
          <.div(^.cls:="tab-pane", ^.id:="control-sidebar-home-tab"),
          <.div(^.cls:="tab-pane", ^.id:="control-sidebar-stats-tab"),
          <.div(^.cls:="tab-pane", ^.id:="control-sidebar-settings-tab")
        )
      ),
      <.div(^.cls:="control-sidebar-bg")
    )

  val baseUrl = BaseUrl.fromWindowOrigin / "ouspark/"

  val router = Router(baseUrl, config)

}
