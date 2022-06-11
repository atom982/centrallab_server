var express = require("express");
var router = express.Router();

var dashboard = require("../controllers/DashboardController.js");

router.get("/dashboard/donut", dashboard.DonutChart);
router.get("/dashboard/bar", dashboard.VerticalBar);
router.get("/dashboard/info", dashboard.InfoWidgets);
router.get("/dashboard/line", dashboard.LineChart);
router.get("/dashboard/patients", dashboard.Patients);
// router.get("/evaluation/bubble", dashboard.BubbleChart);

// router.get("/dashboard/data", dashboard.dashboardData);

module.exports = router;
