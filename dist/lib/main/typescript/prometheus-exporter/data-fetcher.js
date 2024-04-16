"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectMetrics = void 0;
const metrics_1 = require("./metrics");
async function collectMetrics(transactions) {
    metrics_1.totalTxCount.labels(metrics_1.K_CACTUS_CORDA_TOTAL_TX_COUNT).set(transactions.counter);
}
exports.collectMetrics = collectMetrics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1mZXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vdHlwZXNjcmlwdC9wcm9tZXRoZXVzLWV4cG9ydGVyL2RhdGEtZmV0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSx1Q0FBd0U7QUFFakUsS0FBSyxVQUFVLGNBQWMsQ0FDbEMsWUFBMEI7SUFFMUIsc0JBQVksQ0FBQyxNQUFNLENBQUMsdUNBQTZCLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUFKRCx3Q0FJQyJ9