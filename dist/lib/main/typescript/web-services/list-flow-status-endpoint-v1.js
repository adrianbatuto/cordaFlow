"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowStatusEndpointV1 = void 0;
const cactus_core_1 = require("@hyperledger/cactus-core");
const cactus_common_1 = require("@hyperledger/cactus-common");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
class FlowStatusEndpointV1 {
    get className() {
        return FlowStatusEndpointV1.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        cactus_common_1.Checks.truthy(options.connector, `${fnTag} options.connector`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "list-flow-status-endpoint-v1",
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
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/getFlow/{holdingIDShortHash}"];
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
        const fnTag = "FlowStatusEndpointV1#handleRequest()";
        this.log.debug(`POST ${this.getPath()}`);
        try {
            if (this.apiUrl === undefined)
                throw "apiUrl option is necessary";
            const body = await this.options.connector.startFlow(req.body);
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
exports.FlowStatusEndpointV1 = FlowStatusEndpointV1;
FlowStatusEndpointV1.CLASS_NAME = "FlowStatusEndpointV1";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1mbG93LXN0YXR1cy1lbmRwb2ludC12MS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvd2ViLXNlcnZpY2VzL2xpc3QtZmxvdy1zdGF0dXMtZW5kcG9pbnQtdjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBU0EsMERBQXNFO0FBRXRFLDhEQU9vQztBQVFwQywyRUFBMEM7QUFVMUMsTUFBYSxvQkFBb0I7SUFNL0IsSUFBVyxTQUFTO1FBQ2xCLE9BQU8sb0JBQW9CLENBQUMsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxZQUE0QixPQUFxQztRQUFyQyxZQUFPLEdBQVAsT0FBTyxDQUE4QjtRQUMvRCxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLGdCQUFnQixDQUFDO1FBRWhELHNCQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssVUFBVSxDQUFDLENBQUM7UUFDM0Msc0JBQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLEtBQUssb0JBQW9CLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsR0FBRyxHQUFHLDhCQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3BDLEtBQUssRUFBRSw4QkFBOEI7WUFDckMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksTUFBTTtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELCtCQUErQjtRQUM3QixPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEIsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLGFBQWEsRUFBRSxFQUFFO2FBQ2xCLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELElBQVcsT0FBTztRQUNoQixPQUFPLHNCQUFHLENBQUMsS0FBSyxDQUNkLGdHQUFnRyxDQUNqRyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUNJLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM1RCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3JFLENBQUM7SUFFTSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx3QkFBd0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sS0FBSyxDQUFDLGVBQWUsQ0FDMUIsVUFBbUI7UUFFbkIsTUFBTSxJQUFBLHdDQUEwQixFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQVksRUFBRSxHQUFhO1FBQzdDLE1BQU0sS0FBSyxHQUFHLHNDQUFzQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJO1lBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQUUsTUFBTSw0QkFBNEIsQ0FBQztZQUNsRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7O0FBOUVILG9EQStFQztBQTlFd0IsK0JBQVUsR0FBRyxzQkFBc0IsQ0FBQyJ9