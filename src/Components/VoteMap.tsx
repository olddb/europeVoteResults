"use client";
import "./VoteMap.css";

import * as d3 from "d3";
import * as GeoJSON from "geojson";
import * as pc from "d3-parliament-chart";
import ReactDom from "next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.development"; // Counter alias nextjs v14
import { MutableRefObject, useEffect, useRef } from "react";

let currentCountry = {};

const OneParty = ({ party }) => {
  return (
    <div className="one-party">
      <div className="left">
        <p>{party.partyName}</p>
      </div>
      <div className="right">
        <div
          className="pourcent"
          style={{
            width: Math.ceil(+party.score * 3) + "px",
            backgroundColor: party.color,
          }}
        ></div>
        <p>{party.score + "%"}</p>
      </div>
    </div>
  );
};

const TooltipData = (country: Object) =>
  ReactDom.renderToString(
    <div>
      <div className="country-name">{country.name}</div>
      <div className="party-container">
        {country.results.map((party: object) => (
          <OneParty party={party} key={party.partyName} />
        ))}
      </div>
    </div>
  );

export default function VoteMap() {
  const svgMapRef = useRef(null);
  const svgParliamentRef = useRef(null);

  useEffect(() => {
    drawMap(svgMapRef);
    drawParliament(svgParliamentRef);
  });

  const drawMap = (svgMapRef: MutableRefObject<null>) => {
    let width = 800,
      height = 500;

    let svg = d3
      .select(svgMapRef.current)
      .attr("width", width)
      .attr("height", height);

    let europeProjection = d3
      .geoMercator()
      .center([13, 52])
      .scale(width / 1.7)
      .translate([width / 2, height / 2]);

    let pathGenerator: d3.GeoPath;

    const geoJsonUrl =
      "https://gist.githubusercontent.com/spiker830/3eab0cb407031bf9f2286f98b9d0558a/raw/7edae936285e77be675366550e20f9166bed0ed5/europe_features.json";

    pathGenerator = d3.geoPath().projection(europeProjection);

    const Tooltip = d3
      .select(".map-container")
      .append("div")
      .style("opacity", 0)
      .attr("id", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("border-color", "#f2e4cb")
      .style("position", "fixed")
      .style("z-index", "1")
      .style("padding", "5px");

    d3.json(geoJsonUrl).then((geojson) => {
      svg
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("id", (x) => x.properties?.name)
        .attr("d", pathGenerator)
        .attr("stroke", "white")
        .attr("fill", (x) => {
          const countryVotesData = votesData.filter(
            (v) => v.name === x.properties?.name
          )[0];
          return !countryVotesData || !countryVotesData.ueMember
            ? "#f2e4cb"
            : countryVotesData.results[0].color;
        })
        .style("cursor", "pointer")
        .style("opacity", 0.7)
        .on("mousemove", mousemove)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    });

    function mousemove(d) {
      Tooltip.style("left", d.clientX + 7 + "px").style(
        "top",
        d.clientY + "px"
      );
    }
    function mouseover(d) {
      const currentCountry = votesData.find((v) => v.name === d.target.id);
      if (!currentCountry) return;
      d3.select(this).style("opacity", 1);
      Tooltip.html(TooltipData(currentCountry));
      Tooltip.style("z-index", 1).style("opacity", 1);
    }
    function mouseout(d) {
      d3.select(this).transition("all 0.1s ease-out").style("opacity", 0.7);
      Tooltip.style("z-index", -1).style("opacity", 0);
    }
  };

  const drawParliament = (svgParliamentRef: MutableRefObject<null>) => {
    // d3.csv("./meps_9_40_en.csv").then((data) => console.log(data));
    // d3.csv("./meps_9_40_en.csv", function (data) {
    //   console.log("🚀 ~ d3.csv ~ data:", data);
    // });

    d3.select(svgParliamentRef.current).call(
      pc
        .parliamentChart()
        .width(800)
        .aggregatedData([
          { seats: 40, color: "#636cbb" },
          { seats: 30, color: "#26d050" },
          { seats: 50, color: "#315cee" },
        ])
    );
  };

  return (
    <div>
      <div className="main-title">
        <h1>Élections Européennes de 2024</h1>
      </div>
      <div className="row-map-container">
        <div className="text-container">
          <h2>Carte des résultats</h2>
          <p className="instruction">-Survolez pour explorer les résultats</p>
          <p className="instruction">
            -Les pays ont la couleur du parti ayant fait le meilleur score
          </p>
        </div>
        <div className="map-container">
          <svg ref={svgMapRef} />
        </div>
      </div>
      <div>
        <div className="parliament-container">
          <svg ref={svgParliamentRef} />
        </div>
      </div>
    </div>
  );
}

const votesData = [
  {
    name: "Netherlands",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Slovenia",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Ireland",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Estonia",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Austria",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Belgium",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Bulgaria",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Croatia",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Hungary",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Czech Republic",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Denmark",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Finland",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Greece",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Latvia",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Italy",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Lithuania",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Luxembourg",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Romania",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Poland",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Portugal",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Slovakia",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Spain",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
  {
    name: "Sweden",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "France",
    ueMember: 1,
    results: [
      {
        partyName: "Prenez le pouvoir",
        score: 23.34,
        seats: 23,
        color: "#046096",
      },
      {
        partyName: "Renaissance",
        score: 22.42,
        seats: 23,
        color: "#1254D8",
      },
      {
        partyName: "Europe écologie",
        score: 13.48,
        seats: 13,
        color: "#77B308",
      },
      {
        partyName: "Union de la droite et du centre",
        score: 8.48,
        seats: 8,
        color: "#514B96",
      },
      {
        partyName: "La france insoumise",
        score: 6.31,
        seats: 6,
        color: "#DF3743",
      },
    ],
  },
  {
    name: "Germany",
    ueMember: 1,
    results: [
      {
        partyName: "CDU/CSU",
        score: 28.86,
        seats: 29,
        color: "#002C5B",
      },
      {
        partyName: "Alliance 90 / Les Verts",
        score: 20.53,
        seats: 21,
        color: "#1D9C2C",
      },
      {
        partyName: "Parti social-démocrate",
        score: 15.82,
        seats: 16,
        color: "#DC2C23",
      },
      {
        partyName: "Alternative für Deutschland",
        score: 10.97,
        seats: 11,
        color: "#1BA5E2",
      },
      {
        partyName: "Die Linke",
        score: 5.5,
        seats: 5,
        color: "#DC0000",
      },
    ],
  },
];
