(ns hack.core-test
  (:require [clojure.test :refer :all]
            [hack.core :refer :all]))

(deftest test-alu
  (testing "ALU"
    (is (= 0 1))))
