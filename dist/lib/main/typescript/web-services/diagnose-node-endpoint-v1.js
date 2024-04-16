"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnoseNodeEndpointV1 = void 0;
const cactus_common_1 = require("@hyperledger/cactus-common");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const cactus_core_1 = require("@hyperledger/cactus-core");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
class DiagnoseNodeEndpointV1 {
    constructor(opts) {
        this.opts = opts;
        const fnTag = "NetworkMapEndpointV1#constructor()";
        cactus_common_1.Checks.truthy(opts, `${fnTag} options`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "diagnose-node-endpoint-v1",
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
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/diagnose-node"];
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
        const fnTag = "DiagnoseNodeEndpointV1#handleRequest()";
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
        const res = await apiClient.diagnoseNodeV1(req);
        return res.data;
    }
}
exports.DiagnoseNodeEndpointV1 = DiagnoseNodeEndpointV1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2Utbm9kZS1lbmRwb2ludC12MS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvd2ViLXNlcnZpY2VzL2RpYWdub3NlLW5vZGUtZW5kcG9pbnQtdjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsOERBTW9DO0FBRXBDLGtFQUtzQztBQUV0QywyRUFBMEM7QUFFMUMsMERBQXNFO0FBQ3RFLDRFQUkrQztBQWEvQyxNQUFhLHNCQUFzQjtJQUlqQyxZQUE0QixJQUFvQztRQUFwQyxTQUFJLEdBQUosSUFBSSxDQUFnQztRQUM5RCxNQUFNLEtBQUssR0FBRyxvQ0FBb0MsQ0FBQztRQUVuRCxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxHQUFHLEdBQUcsOEJBQWMsQ0FBQyxXQUFXLENBQUM7WUFDcEMsS0FBSyxFQUFFLDJCQUEyQjtZQUNsQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNO1NBQy9CLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQsK0JBQStCO1FBQzdCLDhEQUE4RDtRQUM5RCxPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEIsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLGFBQWEsRUFBRSxFQUFFO2FBQ2xCLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVNLHdCQUF3QjtRQUM3QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxzQkFBRyxDQUFDLEtBQUssQ0FDZCxpRkFBaUYsQ0FDbEYsQ0FBQztJQUNKLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDNUQsQ0FBQztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUNyRSxDQUFDO0lBRU0sY0FBYztRQUNuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN2QyxDQUFDO0lBRU0sS0FBSyxDQUFDLGVBQWUsQ0FDMUIsVUFBbUI7UUFFbkIsTUFBTSxJQUFBLHdDQUEwQixFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQVksRUFBRSxHQUFhO1FBQzdDLE1BQU0sS0FBSyxHQUFHLHdDQUF3QyxDQUFDO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakQsSUFBSTtZQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTO2dCQUFFLE1BQU0sNEJBQTRCLENBQUM7WUFDbEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQjtRQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUN6QixHQUEwQjtRQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLCtCQUFhLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSw2QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBbEZELHdEQWtGQyJ9