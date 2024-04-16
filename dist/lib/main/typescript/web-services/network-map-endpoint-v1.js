"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMapEndpointV1 = void 0;
const cactus_common_1 = require("@hyperledger/cactus-common");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const cactus_core_1 = require("@hyperledger/cactus-core");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
class NetworkMapEndpointV1 {
    constructor(opts) {
        this.opts = opts;
        const fnTag = "NetworkMapEndpointV1#constructor()";
        cactus_common_1.Checks.truthy(opts, `${fnTag} options`);
        this.log = cactus_common_1.LoggerProvider.getOrCreate({
            label: "network-map-endpoint-v1",
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
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/network-map"];
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
        const fnTag = "NetworkMapEndpointV1#handleRequest()";
        const verbUpper = this.getVerbLowerCase().toUpperCase();
        this.log.debug(`${verbUpper} ${this.getPath()}`);
        try {
            if (this.apiUrl === undefined)
                throw "apiUrl option is necessary";
            const resBody = await this.callInternalContainer();
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
    async callInternalContainer() {
        const apiConfig = new cactus_core_api_1.Configuration({ basePath: this.apiUrl });
        const apiClient = new typescript_axios_1.DefaultApi(apiConfig);
        const res = await apiClient.networkMapV1();
        return res.data;
    }
}
exports.NetworkMapEndpointV1 = NetworkMapEndpointV1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay1tYXAtZW5kcG9pbnQtdjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90eXBlc2NyaXB0L3dlYi1zZXJ2aWNlcy9uZXR3b3JrLW1hcC1lbmRwb2ludC12MS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSw4REFNb0M7QUFFcEMsa0VBS3NDO0FBRXRDLDJFQUEwQztBQUUxQywwREFBc0U7QUFDdEUsNEVBQTZFO0FBYTdFLE1BQWEsb0JBQW9CO0lBSS9CLFlBQTRCLElBQWtDO1FBQWxDLFNBQUksR0FBSixJQUFJLENBQThCO1FBQzVELE1BQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO1FBRW5ELHNCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssVUFBVSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLEdBQUcsR0FBRyw4QkFBYyxDQUFDLFdBQVcsQ0FBQztZQUNwQyxLQUFLLEVBQUUseUJBQXlCO1lBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU07U0FDL0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFFRCwrQkFBK0I7UUFDN0IsOERBQThEO1FBQzlELE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixXQUFXLEVBQUUsSUFBSTtnQkFDakIsYUFBYSxFQUFFLEVBQUU7YUFDbEIsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBRU0sd0JBQXdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQVcsT0FBTztRQUNoQixPQUFPLHNCQUFHLENBQUMsS0FBSyxDQUNkLCtFQUErRSxDQUNoRixDQUFDO0lBQ0osQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM1RCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3JFLENBQUM7SUFFTSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZSxDQUMxQixVQUFtQjtRQUVuQixNQUFNLElBQUEsd0NBQTBCLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBWSxFQUFFLEdBQWE7UUFDN0MsTUFBTSxLQUFLLEdBQUcsc0NBQXNDLENBQUM7UUFDckQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqRCxJQUFJO1lBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQUUsTUFBTSw0QkFBNEIsQ0FBQztZQUNsRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ25ELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQjtRQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixNQUFNLFNBQVMsR0FBRyxJQUFJLCtCQUFhLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSw2QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztJQUNsQixDQUFDO0NBQ0Y7QUFoRkQsb0RBZ0ZDIn0=