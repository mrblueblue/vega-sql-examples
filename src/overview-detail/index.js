import Thrifty from "thrifty"
import {createDataGraph} from "mapd-data-layer/lib"

const style = {
  base: {
    encode: {
      "labels": {
        "interactive": true,
        "update": {
          "fill": {"value": "#a7a7a7"},
        }
      },
      "ticks": {
        "update": {
          "stroke": {"value": "#a7a7a7"}
        }
      },
      "domain": {
        "update": {
          "stroke": {"value": "#a7a7a7"}
        }
      }
    }
  }
}

const connection = new Thrifty({
  protocol: "https",
  host: "metis.mapd.com",
  port: "443",
  dbName: "mapd",
  user: "mapd",
  password: "HyperInteractive"
})

const graph = createDataGraph(connection)

const rootNode = graph.data("flights_donotmodify")

const focusNode = rootNode.data({
  transform: [
    {
      type: "aggregate",
      fields: ["*"],
      ops: ["count"],
      as: ["y"],
      groupby: {
        type: "project",
        expr: {
          type: "date_trunc",
          unit: "day",
          field: "dep_timestamp"
        },
        as: "x"
      }
    },
    {
      type: "sort",
      field: ["x"]
    },
    {
      type: "filter",
      id: "test",
      expr: {
        type: "between",
        field: "dep_timestamp",
        left: "TIMESTAMP(0) '1987-10-01 00:03:00'",
        right: "TIMESTAMP(0) '2008-12-31 23:59:00'"
      }
    }
  ]
})

const LINE_VEGA_SPEC = {
  $schema: "https://vega.github.io/schema/vega/v3.0.json",
  width: 720,
  height: 480,
  padding: 5,
  title: "# Records by Departure Month",
  signals: [
    {
      "name": "detailDomain"
    },
  ],

  data: [
    {
      name: "line-data",
      values: [],
      parse: { x: 'utc:"%Y"' }
    }
  ],

  marks: [
    {
      "type": "group",
      "name": "detail",
      "encode": {
        "enter": {
          "height": {"value": 390},
          "width": {"value": 720}
        }
      },
      "scales": [
        {
          "name": "xDetail",
          "type": "time",
          "range": "width",
          "domain": {"data": "line-data", "field": "x"},
          "domainRaw": {"signal": "detailDomain"}
        },
        {
          "name": "yDetail",
          "type": "linear",
          "range": [390, 0],
          "domain": {"data": "line-data", "field": "y"},
          "nice": true, "zero": true
        }
      ],
      "axes": [
        {"orient": "bottom", "scale": "xDetail", ...style.base},
        {"orient": "left", "scale": "yDetail", grid: true, ...style.base}
      ],
      "marks": [
        {
          "type": "group",
          "encode": {
            "enter": {
              "height": {"field": {"group": "height"}},
              "width": {"field": {"group": "width"}},
              "clip": {"value": true}
            }
          },
          "marks": [
            {
              "type": "line",
              "from": {"data": "line-data"},
              "encode": {
                "update": {
                  "x": {"scale": "xDetail", "field": "x"},
                  "y": {"scale": "yDetail", "field": "y"},
                  "stroke": {value: "#00AEEF"}
                }
              }
            }
          ]
        },
        {
          "type": "group",
          "name": "overview",
          "encode": {
            "enter": {
              "x": {"value": 0},
              "y": {"value": 430},
              "height": {"value": 70},
              "width": {"value": 720},
              "fill": {"value": "transparent"}
            }
          },
          "signals": [
            {
              "name": "brush", "value": 0,
              "on": [
                {
                  "events": "@overview:mousedown",
                  "update": "[x(), x()]"
                },
                {
                  "events": "[@overview:mousedown, window:mouseup] > window:mousemove!",
                  "update": "[brush[0], clamp(x(), 0, width)]"
                },
                {
                  "events": {"signal": "delta"},
                  "update": "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
                }
              ]
            },
            {
              "name": "anchor", "value": null,
              "on": [{"events": "@brush:mousedown", "update": "slice(brush)"}]
            },
            {
              "name": "xdown", "value": 0,
              "on": [{"events": "@brush:mousedown", "update": "x()"}]
            },
            {
              "name": "delta", "value": 0,
              "on": [
                {
                  "events": "[@brush:mousedown, window:mouseup] > window:mousemove!",
                  "update": "x() - xdown"
                }
              ]
            },
            {
              "name": "detailDomain",
              "push": "outer",
              "on": [
                {
                  "events": {"signal": "brush"},
                  "update": "span(brush) ? invert('xOverview', brush) : null"
                }
              ]
            }
          ],
          "scales": [
            {
              "name": "xOverview",
              "type": "time",
              "range": "width",
              "domain": {"data": "line-data", "field": "x"}
            },
            {
              "name": "yOverview",
              "type": "linear",
              "range": [70, 0],
              "domain": {"data": "line-data", "field": "y"},
              "nice": true, "zero": true
            }
          ],
          "axes": [
            {"orient": "bottom", "scale": "xOverview", ...style.base}
          ],
          "marks": [
            {
              "type": "line",
              "interactive": false,
              "from": {"data": "line-data"},
              "encode": {
                "update": {
                  "x": {"scale": "xOverview", "field": "x"},
                  "y": {"scale": "yOverview", "field": "y"},
                  "stroke": {value: "#00AEEF"}
                }
              }
            },
            {
              "type": "rect",
              "name": "brush",
              "encode": {
                "enter": {
                  "y": {"value": 0},
                  "height": {"value": 70},
                  "fill": {"value": "#333"},
                  "fillOpacity": {"value": 0.2}
                },
                "update": {
                  "x": {"signal": "brush[0]"},
                  "x2": {"signal": "brush[1]"}
                }
              }
            },
            {
              "type": "rect",
              "interactive": false,
              "encode": {
                "enter": {
                  "y": {"value": 0},
                  "height": {"value": 70},
                  "width": {"value": 1},
                  "fill": {"value": "firebrick"}
                },
                "update": {
                  "x": {"signal": "brush[0]"}
                }
              }
            },
            {
              "type": "rect",
              "interactive": false,
              "encode": {
                "enter": {
                  "y": {"value": 0},
                  "height": {"value": 70},
                  "width": {"value": 1},
                  "fill": {"value": "firebrick"}
                },
                "update": {
                  "x": {"signal": "brush[1]"}
                }
              }
            }
          ]
        }
      ]
    },
  ]
};

connection
  .connect()
  .then(focusNode.values)
  .then((data) => {
    LINE_VEGA_SPEC.data[0].values = data;
    const extent = [data[0].x, data[data.length - 1].x];
    const scale = d3.scaleTime().domain(extent).range([0, 500]);
    const runtime = vega.parse(LINE_VEGA_SPEC);
    const view = new vega.View(runtime);

    view
    .initialize(document.querySelector("#focus"))
    .logLevel(vega.Warn)
    .renderer("svg")
    .run();

  //   const binRow = d3.select("#focus")
  //    .append("div")
  //    .attr("class", "bin-row")
  //    .style("left", 10 + "px")
   //
  //   const binRowItems = binRow
  //    .selectAll(".bin-row-item")
  //    .data(["auto", "1y"])
  //    .enter()
   //
  //  binRowItems
  //     .append("div")
  //     .attr("class", "bin-row-item")
  //     .text(d => d)
  })
