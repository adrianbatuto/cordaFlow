"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployContractJarsEndpoint = void 0;
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const cactus_core_1 = require("@hyperledger/cactus-core");
const cactus_common_1 = require("@hyperledger/cactus-common");
const api_1 = require("../generated/openapi/typescript-axios/api");
const openapi_json_1 = __importDefault(require("../../json/openapi.json"));
const K_DEFAULT_AUTHORIZATION_OPTIONS = {
    isProtected: true,
    requiredRoles: [],
};
class DeployContractJarsEndpoint {
    get className() {
        return DeployContractJarsEndpoint.CLASS_NAME;
    }
    constructor(options) {
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} options`);
        cactus_common_1.Checks.truthy(options.sshConfigAdminShell, `${fnTag} options.sshConfig`);
        const level = options.logLevel || "INFO";
        const label = "deploy-contract-jars-endpoint";
        this.log = cactus_common_1.LoggerProvider.getOrCreate({ level, label });
        this.authorizationOptionsProvider =
            options.authorizationOptionsProvider ||
                cactus_core_1.AuthorizationOptionsProvider.of(K_DEFAULT_AUTHORIZATION_OPTIONS, level);
        this.log.debug(`Instantiated ${this.className} OK`);
        this.apiUrl = options.apiUrl;
    }
    getAuthorizationOptionsProvider() {
        return this.authorizationOptionsProvider;
    }
    get oasPath() {
        return openapi_json_1.default.paths["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/deploy-contract-jars"];
    }
    /**
     * Returns the `operationId` that connects this endpoint to it's definition in
     * the openapi-spec.ts file.
     */
    get operationId() {
        return this.oasPath.post.operationId;
    }
    /**
     * Returns the endpoint path to be used when installing the endpoint into the
     * API server of Cactus.
     */
    getPath() {
        return this.oasPath.post["x-hyperledger-cacti"].http.path;
    }
    getVerbLowerCase() {
        return this.oasPath.post["x-hyperledger-cacti"].http.verbLowerCase;
    }
    getOperationId() {
        return this.oasPath.post.operationId;
    }
    getExpressRequestHandler() {
        return this.handleRequest.bind(this);
    }
    async registerExpress(expressApp) {
        await (0, cactus_core_1.registerWebServiceEndpoint)(expressApp, this);
        return this;
    }
    async handleRequest(req, res) {
        const fnTag = `${this.className}#handleRequest()`;
        const verb = this.getVerbLowerCase();
        const thePath = this.getPath();
        this.log.debug(`${verb} ${thePath} handleRequest()`);
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
            res.json({
                error: ex === null || ex === void 0 ? void 0 : ex.message,
                // FIXME do not include stack trace
                errorStack: ex === null || ex === void 0 ? void 0 : ex.stack,
            });
        }
    }
    async callInternalContainer(req) {
        const apiConfig = new cactus_core_api_1.Configuration({ basePath: this.apiUrl });
        const apiClient = new api_1.DefaultApi(apiConfig);
        const res = await apiClient.deployContractJarsV1(req);
        return res.data;
    }
}
exports.DeployContractJarsEndpoint = DeployContractJarsEndpoint;
DeployContractJarsEndpoint.CLASS_NAME = "DeployContractJarsEndpoint";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LWNvbnRyYWN0LWphcnMtZW5kcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi90eXBlc2NyaXB0L3dlYi1zZXJ2aWNlcy9kZXBsb3ktY29udHJhY3QtamFycy1lbmRwb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQSxrRUFJc0M7QUFFdEMsMERBR2tDO0FBRWxDLDhEQU1vQztBQUlwQyxtRUFJbUQ7QUFFbkQsMkVBQTBDO0FBWTFDLE1BQU0sK0JBQStCLEdBQTBCO0lBQzdELFdBQVcsRUFBRSxJQUFJO0lBQ2pCLGFBQWEsRUFBRSxFQUFFO0NBQ2xCLENBQUM7QUFFRixNQUFhLDBCQUEwQjtJQU9yQyxJQUFXLFNBQVM7UUFDbEIsT0FBTywwQkFBMEIsQ0FBQyxVQUFVLENBQUM7SUFDL0MsQ0FBQztJQUVELFlBQTRCLE9BQXVDO1FBQXZDLFlBQU8sR0FBUCxPQUFPLENBQWdDO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsZ0JBQWdCLENBQUM7UUFFaEQsc0JBQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsS0FBSyxVQUFVLENBQUMsQ0FBQztRQUMzQyxzQkFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxLQUFLLG9CQUFvQixDQUFDLENBQUM7UUFFekUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7UUFDekMsTUFBTSxLQUFLLEdBQUcsK0JBQStCLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsR0FBRyw4QkFBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyw0QkFBNEI7WUFDL0IsT0FBTyxDQUFDLDRCQUE0QjtnQkFDcEMsMENBQTRCLENBQUMsRUFBRSxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELCtCQUErQjtRQUM3QixPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sc0JBQUcsQ0FBQyxLQUFLLENBQ2Qsd0ZBQXdGLENBQ3pGLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBVyxXQUFXO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDNUQsQ0FBQztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUNyRSxDQUFDO0lBRU0sY0FBYztRQUNuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN2QyxDQUFDO0lBRU0sd0JBQXdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQzFCLFVBQW1CO1FBRW5CLE1BQU0sSUFBQSx3Q0FBMEIsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFZLEVBQUUsR0FBYTtRQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLGtCQUFrQixDQUFDO1FBRWxELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxPQUFPLGtCQUFrQixDQUFDLENBQUM7UUFFckQsSUFBSTtZQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTO2dCQUFFLE1BQU0sNEJBQTRCLENBQUM7WUFDbEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQjtRQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDUCxLQUFLLEVBQUUsRUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLE9BQU87Z0JBQ2xCLG1DQUFtQztnQkFDbkMsVUFBVSxFQUFFLEVBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxLQUFLO2FBQ3RCLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FDekIsR0FBZ0M7UUFFaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSwrQkFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sU0FBUyxHQUFHLElBQUksZ0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQzs7QUF4R0gsZ0VBeUdDO0FBeEd3QixxQ0FBVSxHQUFHLDRCQUE0QixDQUFDIn0=