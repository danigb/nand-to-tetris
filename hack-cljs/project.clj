(defproject hack "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.494"]]
  :source-paths ["src/clj"]
  :plugins [[lein-cljsbuild "1.1.5"]]
  :cljsbuild {
              :builds [
                       {:compiler {
                                    :output-to "resources/public/hack.js",
                                    :optimizations :whitespace,
                                    :pretty-print true},
                                    :source-paths ["src/cljs"]}]})
