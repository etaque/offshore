name := "offshore"

resolvers ++= Seq(
  "Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/",
  "Unidata UCAR" at "https://artifacts.unidata.ucar.edu/content/repositories/unidata-releases/",
  "GeoToolkit" at "http://maven.geotoolkit.org/"
)

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  ws,
  jdbc,
  evolutions,
  "com.typesafe.play" %% "anorm" % "2.4.0",
  "postgresql" % "postgresql" % "9.1-901.jdbc4",
  "org.mindrot" % "jbcrypt" % "0.3m",
  "edu.ucar" % "grib" % "8.0.29",
  "commons-io" % "commons-io" % "2.4"
)

play.sbt.PlayScala.projectSettings

scalacOptions += "-feature"

// offline := true

// skip in update := true
