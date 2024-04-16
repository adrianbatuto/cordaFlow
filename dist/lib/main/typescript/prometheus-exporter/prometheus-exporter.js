"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusExporter = void 0;
const prom_client_1 = __importStar(require("prom-client"));
const metrics_1 = require("./metrics");
class PrometheusExporter {
    constructor(prometheusExporterOptions) {
        this.prometheusExporterOptions = prometheusExporterOptions;
        this.transactions = { counter: 0 };
        this.metricsPollingIntervalInMin =
            prometheusExporterOptions.pollingIntervalInMin || 1;
        this.registry = new prom_client_1.Registry();
    }
    addCurrentTransaction() {
        this.transactions.counter++;
        metrics_1.totalTxCount
            .labels(metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT)
            .set(this.transactions.counter);
    }
    async getPrometheusMetrics() {
        const result = await this.registry.getSingleMetricAsString(metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT);
        return result;
    }
    startMetricsCollection() {
        this.registry.registerMetric(metrics_1.totalTxCount);
        prom_client_1.default.collectDefaultMetrics({ register: this.registry });
    }
}
exports.PrometheusExporter = PrometheusExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWV0aGV1cy1leHBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvcHJvbWV0aGV1cy1leHBvcnRlci9wcm9tZXRoZXVzLWV4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQW1EO0FBRW5ELHVDQUF3RTtBQU14RSxNQUFhLGtCQUFrQjtJQUs3QixZQUNrQix5QkFBcUQ7UUFBckQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE0QjtRQUp2RCxpQkFBWSxHQUFpQixFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQU0xRCxJQUFJLENBQUMsMkJBQTJCO1lBQzlCLHlCQUF5QixDQUFDLG9CQUFvQixJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksc0JBQVEsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFTSxxQkFBcUI7UUFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixzQkFBWTthQUNULE1BQU0sQ0FBQyx1Q0FBNkIsQ0FBQzthQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sS0FBSyxDQUFDLG9CQUFvQjtRQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQ3hELHVDQUE2QixDQUM5QixDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVNLHNCQUFzQjtRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxzQkFBWSxDQUFDLENBQUM7UUFDM0MscUJBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBQ0Y7QUEvQkQsZ0RBK0JDIn0=