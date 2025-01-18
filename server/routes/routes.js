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
  const { startDate, endDate, locationId, stationId} = req.query;

  if (!startDate || !endDate || !locationId || !stationId) {
    return res.status(400).json({ error: "Missing input parameters" });
  }

  try {
    const response = await axios.get(NOAA_API_URL, {
      headers: { token: NOAA_API_TOKEN },
      params: {
        datasetid: "GSOM",
        datatypeid: "TEMP",
        startdate: startDate,
        enddate: endDate,
        locationid: locationId,
        stationid: stationId,
        units: "metric",
        limit: 1000,
      },
    });

    const solarData = response.data.results;

    res.json(solarData);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});
// frontend API routes

router.get("/api/solar-irradience", (req, res) => {});

router.get("/api/solar-output", (req, res) => {});

router.get("/api/total-energy-demand", (req, res) => {});

router.get("/api/energy-demand", (req, res) => {});

module.exports = router;
