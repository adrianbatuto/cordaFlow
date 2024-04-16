"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCPIEndpointV1 = void 0;
const cactus_core_1 = require("@hyperledger/cactus-core");
const cactus_common_1 = require("@hyperledger/cactus-common");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const https_1 = __importDefault(require("https"));
class ListCPIEndpointV1 {
    get className() {
        return ListCPIEndpointV1.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "list-cpi-endpoint-v1",
            level: options.logLevel || "INFO",
        });
        this.apiUrl = options.apiUrl;
    }
    getAuthorizationOptionsProvider() {
        return {
            get: async () => ({
                isProtected: true,
                requiredRoles: [],
                httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }),
            }),
        };
    }
    get oasPath() {
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/listCPI"];
    }
    /**
     * Returns the endpoint path to be used when installing the endpoint into the
     * API server of Cactus.
     */
    getPath() {
        return this.oasPath.get["x-hyperledger-cactus"].https.path;
    }
    getVerbLowerCase() {
        return this.oasPath.get["x-hyperledger-cactus"].https.verbLowerCase;
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
        const fnTag = "GetCPIResponseV1#constructor()";
        const verbUpper = this.getVerbLowerCase().toUpperCase();
        this.log.debug(`${verbUpper} ${this.getPath()}`);
        try {
            if (this.apiUrl === undefined)
                throw "apiUrl option is necessary";
            const body = await this.options.connector.listCPI();
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
}
exports.ListCPIEndpointV1 = ListCPIEndpointV1;
ListCPIEndpointV1.CLASS_NAME = "ListCPIEndpointV1";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWNwaS1lbmRwb2ludC12MS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvd2ViLXNlcnZpY2VzL2dldC1jcGktZW5kcG9pbnQtdjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBUUEsMERBQXNFO0FBRXRFLDhEQU1vQztBQU9wQywyRUFBMEM7QUFDMUMsa0RBQTBCO0FBUTFCLE1BQWEsaUJBQWlCO0lBTTVCLElBQVcsU0FBUztRQUNsQixPQUFPLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsWUFBNEIsT0FBa0M7UUFBbEMsWUFBTyxHQUFQLE9BQU8sQ0FBMkI7UUFDNUQsTUFBTSxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxnQkFBZ0IsQ0FBQztRQUVoRCxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxHQUFHLEdBQUcsOEJBQWMsQ0FBQyxXQUFXLENBQUM7WUFDcEMsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixLQUFLLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxNQUFNO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDO0lBRUQsK0JBQStCO1FBQzdCLE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixXQUFXLEVBQUUsSUFBSTtnQkFDakIsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLFVBQVUsRUFBRSxJQUFJLGVBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUMzRCxDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxzQkFBRyxDQUFDLEtBQUssQ0FDZCwyRUFBMkUsQ0FDNUUsQ0FBQztJQUNKLENBQUM7SUFFRDs7O09BR0c7SUFDSSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztJQUN0RSxDQUFDO0lBRU0sY0FBYztRQUNuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUN0QyxDQUFDO0lBRU0sd0JBQXdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQzFCLFVBQW1CO1FBRW5CLE1BQU0sSUFBQSx3Q0FBMEIsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFZLEVBQUUsR0FBYTtRQUM3QyxNQUFNLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQztRQUMvQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpELElBQUk7WUFDRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUztnQkFBRSxNQUFNLDRCQUE0QixDQUFDO1lBQ2xFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7O0FBbEZILDhDQW1GQztBQWxGd0IsNEJBQVUsR0FBRyxtQkFBbUIsQ0FBQyJ9