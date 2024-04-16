"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowStatusResponseEndpointV1 = void 0;
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const cactus_core_1 = require("@hyperledger/cactus-core");
const cactus_common_1 = require("@hyperledger/cactus-common");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
class FlowStatusResponseEndpointV1 {
    get className() {
        return FlowStatusResponseEndpointV1.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        cactus_common_1.Checks.truthy(options.connector, `${fnTag} options.connector`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "list-flow-status-response-endpoint-v1",
            level: options.logLevel || "INFO",
        });
        this.apiUrl = options.apiUrl;
    }
    getAuthorizationOptionsProvider() {
        return {
            get: async () => ({
                isProtected: true,
                requiredRoles: [],
            }),
        };
    }
    get oasPath() {
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/flow/{holdingIDShortHash}/{clientRequestID}"];
    }
    /**
     * Returns the endpoint path to be used when installing the endpoint into the
     * API server of Cactus.
     */
    getPath() {
        return this.oasPath.get["x-hyperledger-cactus"].http.path;
    }
    getVerbLowerCase() {
        return this.oasPath.get["x-hyperledger-cactus"].http.verbLowerCase;
    }
    getOperationId() {
        return this.oasPath.get.operationId;
    }
    getExpressRequestHandler() {
        return this.handleRequest.bind(this);
    }
    async registerExpress(expressApp) {
        await (0, cactus_core_1.registerWebServiceEndpoint)(expressApp, this);
        return this;
    }
    async handleRequest(req, res) {
        const fnTag = "sFlowStatusResponseEndpointV1#constructor()";
        const verbUpper = this.getVerbLowerCase().toUpperCase();
        this.log.debug(`${verbUpper} ${this.getPath()}`);
        try {
            if (this.apiUrl === undefined)
                throw "apiUrl option is necessary";
            const body = await this.callInternalContainer(req.body);
            res.status(200);
            res.json(body);
        }
        catch (ex) {
            this.log.error(`${fnTag} failed to serve request`, ex);
            res.status(500);
            res.statusMessage = ex.message;
            res.json({ error: ex.stack });
        }
    }
    // to remove
    async callInternalContainer(req) {
        const apiConfig = new cactus_core_api_1.Configuration({ basePath: this.apiUrl });
        const apiClient = new typescript_axios_1.DefaultApi(apiConfig);
        const res = await apiClient.flowStatusResponse(this.options.holdingIDShortHash, this.options.clientRequestID, req);
        return res.data;
    }
}
exports.FlowStatusResponseEndpointV1 = FlowStatusResponseEndpointV1;
FlowStatusResponseEndpointV1.CLASS_NAME = "FlowStatusResponseEndpointV1";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWZsb3ctc3RhdHVzLXJlc3BvbnNlLWVuZHBvaW50LXYxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vdHlwZXNjcmlwdC93ZWItc2VydmljZXMvZ2V0LWZsb3ctc3RhdHVzLXJlc3BvbnNlLWVuZHBvaW50LXYxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLGtFQUtzQztBQUV0QywwREFBc0U7QUFFdEUsOERBTW9DO0FBRXBDLDRFQUcrQztBQUUvQywyRUFBMEM7QUFXMUMsTUFBYSw0QkFBNEI7SUFLdkMsSUFBVyxTQUFTO1FBQ2xCLE9BQU8sNEJBQTRCLENBQUMsVUFBVSxDQUFDO0lBQ2pELENBQUM7SUFFRCxZQUE0QixPQUE2QztRQUE3QyxZQUFPLEdBQVAsT0FBTyxDQUFzQztRQUN2RSxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLGdCQUFnQixDQUFDO1FBRWhELHNCQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssVUFBVSxDQUFDLENBQUM7UUFDM0Msc0JBQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLEtBQUssb0JBQW9CLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsR0FBRyxHQUFHLDhCQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3BDLEtBQUssRUFBRSx1Q0FBdUM7WUFDOUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksTUFBTTtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELCtCQUErQjtRQUM3QixPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEIsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLGFBQWEsRUFBRSxFQUFFO2FBQ2xCLENBQUM7U0FDSCxDQUFDO0lBQ0os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