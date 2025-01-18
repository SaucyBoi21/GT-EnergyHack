const axios = require("axios");
const express = require("express");
const router = express.Router();

require("dotenv").config();

const NOAA_API_URL = "https://www.ncei.noaa.gov/cdo-web/api/v2/data";
const NOAA_API_TOKEN = process.env.NOAA_API_TOKEN;
const UNITS = "metric";

router.get("/api/token", (req, res) => {
  res.send(NOAA_API_TOKEN);
});

// weather API routes
router.get("/noaa/solar-irradience", async (req, res) => {
  const { startDate, endDate, locationId} = req.query;

  if (!startDate || !endDate || !locationId) {
    return res.status(400).json({ error: "Missing input parameters" });
  }

  try {
    const responseTAVG = await axios.get(NOAA_API_URL, {
      headers: { token: NOAA_API_TOKEN },
      params: {
        datasetid: "GSOM",
        datatypeid: "TAVG",
        startdate: startDate,
        enddate: endDate,
        locationId: locationId,
      },
    });

    const responsePRCP = await axios.get(NOAA_API_URL, {
      headers: { token: NOAA_API_TOKEN },
      params: {
        datasetid: "GSOM",
        datatypeid: "PRCP",
        startdate: startDate,
        enddate: endDate,
        locationId: locationId,
      },
    });

    const responseAWND = await axios.get(NOAA_API_URL, {
      headers: { token: NOAA_API_TOKEN },
      params: {
        datasetid: "GSOM",
        datatypeid: "AWND",
        startdate: startDate,
        enddate: endDate,
        locationId: locationId,
      },
    });

    const solarData = {"TAVG": responseTAVG.data.results, "PRCP": responsePRCP.data.results, "AWND": responseAWND.data.results};

    res.json(solarData);
  } catch (e) {
    console.log(e.response);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});
// frontend API routes

router.get("/api/solar-irradience", (req, res) => {});

router.get("/api/solar-output", (req, res) => {});

router.get("/api/total-energy-demand", (req, res) => {});

router.get("/api/energy-demand", (req, res) => {});

module.exports = router;
