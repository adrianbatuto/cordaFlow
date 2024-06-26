"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalTxCount = exports.K_CACTUS_CORDA_TOTAL_TX_COUNT = void 0;
const prom_client_1 = require("prom-client");
exports.K_CACTUS_CORDA_TOTAL_TX_COUNT = "cactus_corda_total_tx_count";
exports.totalTxCount = new prom_client_1.Gauge({
    registers: [],
    name: exports.K_CACTUS_CORDA_TOTAL_TX_COUNT,
    help: "Total transactions executed",
    labelNames: ["type"],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvcHJvbWV0aGV1cy1leHBvcnRlci9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFvQztBQUV2QixRQUFBLDZCQUE2QixHQUFHLDZCQUE2QixDQUFDO0FBRTlELFFBQUEsWUFBWSxHQUFHLElBQUksbUJBQUssQ0FBQztJQUNwQyxTQUFTLEVBQUUsRUFBRTtJQUNiLElBQUksRUFBRSxxQ0FBNkI7SUFDbkMsSUFBSSxFQUFFLDZCQUE2QjtJQUNuQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUM7Q0FDckIsQ0FBQyxDQUFDIn0=