This widget will display a detailed list of release environments for the configured pipeline.  Under each environment or stage it will show the artifact build id and date that the current release was created.  If the current release for the environment was successful then it will display with a check and a green theme, for a rejected or failed release a cross and red theme will be used, finally for a partially succeeded release an exclamation mark with an orange theme will be shown.  Click on the environment to be taken directly to the current release.

The following widget is showing the "Metro" release pipeline.  It has 2 stages called Demo and Design, the current release for the Demo stage was deployed on Wednesday 18th January 2017 10:16AM but failed deployment with an artifact build id of 2.220.19332.1.  The Design stage successfully deployed the artifact with a build id of 2.220.18030.1 on Wednesday 18th January 2017 at 10:16AM.

![Example 3x1 widget](/img/screenshot-widget.png)

The widget will scale depending on the size selected in the configuration.

![Example 2x2 widget](/img/screenshot-widget2.png)

In the configuration you can select the release pipeline from the current project to use and the widget size.

![Configuration](/img/screenshot-configuration.png)