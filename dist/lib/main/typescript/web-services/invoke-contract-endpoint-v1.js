"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvokeContractEndpointV1 = void 0;
const cactus_common_1 = require("@hyperledger/cactus-common");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const cactus_core_1 = require("@hyperledger/cactus-core");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
class InvokeContractEndpointV1 {
    constructor(opts) {
        this.opts = opts;
        const fnTag = "InvokeContractEndpointV1#constructor()";
        cactus_common_1.Checks.truthy(opts, `${fnTag} options`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "invoke-contract-endpoint-v1",
            level: opts.logLevel || "INFO",
        });
        this.apiUrl = opts.apiUrl;
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
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/invoke-contract"];
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
        const fnTag = "InvokeContractEndpointV1#handleRequest()";
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
        const res = await apiClient.invokeContractV1(req);
        return res.data;
    }
}
exports.InvokeContractEndpointV1 = InvokeContractEndpointV1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2tlLWNvbnRyYWN0LWVuZHBvaW50LXYxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vdHlwZXNjcmlwdC93ZWItc2VydmljZXMvaW52b2tlLWNvbnRyYWN0LWVuZHBvaW50LXYxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLDhEQU1vQztBQUVwQyxrRUFLc0M7QUFFdEMsMkVBQTBDO0FBRTFDLDBEQUFzRTtBQUN0RSw0RUFJK0M7QUFPL0MsTUFBYSx3QkFBd0I7SUFJbkMsWUFBNEIsSUFBc0M7UUFBdEMsU0FBSSxHQUFKLElBQUksQ0FBa0M7UUFDaEUsTUFBTSxLQUFLLEdBQUcsd0NBQXdDLENBQUM7UUFFdkQsc0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxVQUFVLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsR0FBRyxHQUFHLDhCQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3BDLEtBQUssRUFBRSw2QkFBNkI7WUFDcEMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTTtTQUMvQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDNUIsQ0FBQztJQUVELCtCQUErQjtRQUM3Qiw4REFBOEQ7UUFDOUQsT0FBTztZQUNMLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2hCLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixhQUFhLEVBQUUsRUFBRTthQUNsQixDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7SUFFTSx3QkFBd0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sc0JBQUcsQ0FBQyxLQUFLLENBQ2QsbUZBQW1GLENBQ3BGLENBQUM7SUFDSixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFTSxnQkFBZ0I7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDckUsQ0FBQztJQUVNLGNBQWM7UUFDbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDdkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQzFCLFVBQW1CO1FBRW5CLE1BQU0sSUFBQSx3Q0FBMEIsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFZLEVBQUUsR0FBYTtRQUM3QyxNQUFNLEtBQUssR0FBRywwQ0FBMEMsQ0FBQztRQUN6RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpELElBQUk7WUFDRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUztnQkFBRSxNQUFNLDRCQUE0QixDQUFDO1lBQ2xFLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkI7UUFBQyxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSywwQkFBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2RCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FDekIsR0FBNEI7UUFFNUIsTUFBTSxTQUFTLEdBQUcsSUFBSSwrQkFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBbEZELDREQWtGQyJ9