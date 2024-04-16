"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPrometheusExporterMetricsEndpointV1 = void 0;
const cactus_common_1 = require("@hyperledger/cactus-common");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const cactus_core_1 = require("@hyperledger/cactus-core");
class GetPrometheusExporterMetricsEndpointV1 {
    constructor(opts) {
        this.opts = opts;
        const fnTag = "GetPrometheusExporterMetricsEndpointV1#constructor()";
        cactus_common_1.Checks.truthy(opts, `${fnTag} options`);
        cactus_common_1.Checks.truthy(opts.connector, `${fnTag} options.connector`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "get-prometheus-exporter-metrics-v1",
            level: opts.logLevel || "INFO",
        });
    }
    getAuthorizationOptionsProvider() {
        // TODO: make this an injectable dependency in the constructor
        return {
            get: async () => ({
                isProtected: true,
                requiredRoles: [],
            }),
        };
    }
    getExpressRequestHandler() {
        return this.handleRequest.bind(this);
    }
    get oasPath() {
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/get-prometheus-exporter-metrics"];
    }
    getPath() {
        return this.oasPath.get["x-hyperledger-cacti"].http.path;
    }
    getVerbLowerCase() {
        return this.oasPath.get["x-hyperledger-cacti"].http.verbLowerCase;
    }
    getOperationId() {
        return this.oasPath.get.operationId;
    }
    async registerExpress(expressApp) {
        await (0, cactus_core_1.registerWebServiceEndpoint)(expressApp, this);
        return this;
    }
    async handleRequest(req, res) {
        const fnTag = "GetPrometheusExporterMetrics#handleRequest()";
        const verbUpper = this.getVerbLowerCase().toUpperCase();
        this.log.debug(`${verbUpper} ${this.getPath()}`);
        try {
            const resBody = await this.opts.connector.getPrometheusExporterMetrics();
            res.status(200);
            res.send(resBody);
        }
        catch (ex) {
            this.log.error(`${fnTag} failed to serve request`, ex);
            res.status(500);
            res.statusMessage = ex.message;
            res.json({ error: ex.stack });
        }
    }
}
exports.GetPrometheusExporterMetricsEndpointV1 = GetPrometheusExporterMetricsEndpointV1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXByb21ldGhldXMtZXhwb3J0ZXItbWV0cmljcy1lbmRwb2ludC12MS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvd2ViLXNlcnZpY2VzL2dldC1wcm9tZXRoZXVzLWV4cG9ydGVyLW1ldHJpY3MtZW5kcG9pbnQtdjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsOERBTW9DO0FBUXBDLDJFQUEwQztBQUUxQywwREFBc0U7QUFTdEUsTUFBYSxzQ0FBc0M7SUFLakQsWUFDa0IsSUFBb0Q7UUFBcEQsU0FBSSxHQUFKLElBQUksQ0FBZ0Q7UUFFcEUsTUFBTSxLQUFLLEdBQUcsc0RBQXNELENBQUM7UUFFckUsc0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxVQUFVLENBQUMsQ0FBQztRQUN4QyxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxHQUFHLEdBQUcsOEJBQWMsQ0FBQyxXQUFXLENBQUM7WUFDcEMsS0FBSyxFQUFFLG9DQUFvQztZQUMzQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNO1NBQy9CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwrQkFBK0I7UUFDN0IsOERBQThEO1FBQzlELE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixXQUFXLEVBQUUsSUFBSTtnQkFDakIsYUFBYSxFQUFFLEVBQUU7YUFDbEIsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBRU0sd0JBQXdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQVcsT0FBTztRQUNoQixPQUFPLHNCQUFHLENBQUMsS0FBSyxDQUNkLG1HQUFtRyxDQUNwRyxDQUFDO0lBQ0osQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUMzRCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3BFLENBQUM7SUFFTSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZSxDQUMxQixVQUFtQjtRQUVuQixNQUFNLElBQUEsd0NBQTBCLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBWSxFQUFFLEdBQWE7UUFDN0MsTUFBTSxLQUFLLEdBQUcsOENBQThDLENBQUM7UUFDN0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqRCxJQUFJO1lBQ0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQ3pFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQjtRQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0NBQ0Y7QUExRUQsd0ZBMEVDIn0=