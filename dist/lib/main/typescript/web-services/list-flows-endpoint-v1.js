"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListFlowsEndpointV1 = void 0;
const cactus_common_1 = require("@hyperledger/cactus-common");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const cactus_core_1 = require("@hyperledger/cactus-core");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
class ListFlowsEndpointV1 {
    get className() {
        return ListFlowsEndpointV1.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "list-flows-endpoint-v1",
            level: options.logLevel || "INFO",
        });
        this.apiUrl = options.apiUrl;
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
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/list-flows"];
    }
    getPath() {
        return this.oasPath.post["x-hyperledger-cacti"].http.path;
    }
    getVerbLowerCase() {
        return this.oasPath.post["x-hyperledger-cacti"].http.verbLowerCase;
    }
    getOperationId() {
        return this.oasPath.post.operationId;
    }
    async registerExpress(expressApp) {
        await (0, cactus_core_1.registerWebServiceEndpoint)(expressApp, this);
        return this;
    }
    async handleRequest(req, res) {
        const fnTag = "ListFlowsEndpointV1#handleRequest()";
        const verbUpper = this.getVerbLowerCase().toUpperCase();
        this.log.debug(`${verbUpper} ${this.getPath()}`);
        try {
            if (this.apiUrl === undefined)
                throw "apiUrl option is necessary";
            const resBody = await this.callInternalContainer(req.body);
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
    async callInternalContainer(req) {
        const apiConfig = new cactus_core_api_1.Configuration({ basePath: this.apiUrl });
        const apiClient = new typescript_axios_1.DefaultApi(apiConfig);
        const res = await apiClient.listFlowsV1(req);
        return res.data;
    }
}
exports.ListFlowsEndpointV1 = ListFlowsEndpointV1;
ListFlowsEndpointV1.CLASS_NAME = "ListFlowsEndpointV1";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1mbG93cy1lbmRwb2ludC12MS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvd2ViLXNlcnZpY2VzL2xpc3QtZmxvd3MtZW5kcG9pbnQtdjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsOERBTW9DO0FBRXBDLGtFQUtzQztBQUV0QywyRUFBMEM7QUFFMUMsMERBQXNFO0FBQ3RFLDRFQUkrQztBQWMvQyxNQUFhLG1CQUFtQjtJQU05QixJQUFXLFNBQVM7UUFDbEIsT0FBTyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7SUFDeEMsQ0FBQztJQUVELFlBQTRCLE9BQW9DO1FBQXBDLFlBQU8sR0FBUCxPQUFPLENBQTZCO1FBQzlELE1BQU0sS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsZ0JBQWdCLENBQUM7UUFFaEQsc0JBQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsS0FBSyxVQUFVLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsR0FBRyxHQUFHLDhCQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3BDLEtBQUssRUFBRSx3QkFBd0I7WUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksTUFBTTtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELCtCQUErQjtRQUM3Qiw4REFBOEQ7UUFDOUQsT0FBTztZQUNMLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2hCLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixhQUFhLEVBQUUsRUFBRTthQUNsQixDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7SUFFTSx3QkFBd0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sc0JBQUcsQ0FBQyxLQUFLLENBQ2QsOEVBQThFLENBQy9FLENBQUM7SUFDSixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFTSxnQkFBZ0I7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDckUsQ0FBQztJQUVNLGNBQWM7UUFDbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDdkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQzFCLFVBQW1CO1FBRW5CLE1BQU0sSUFBQSx3Q0FBMEIsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFZLEVBQUUsR0FBYTtRQUM3QyxNQUFNLEtBQUssR0FBRyxxQ0FBcUMsQ0FBQztRQUNwRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELElBQUk7WUFDRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUztnQkFBRSxNQUFNLDRCQUE0QixDQUFDO1lBQ2xFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkI7UUFBQyxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSywwQkFBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2RCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FDekIsR0FBdUI7UUFFdkIsTUFBTSxTQUFTLEdBQUcsSUFBSSwrQkFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQ2xCLENBQUM7O0FBdEZILGtEQXVGQztBQXRGd0IsOEJBQVUsR0FBRyxxQkFBcUIsQ0FBQyJ9