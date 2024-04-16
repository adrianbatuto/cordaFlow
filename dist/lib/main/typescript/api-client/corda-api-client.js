"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CordaApiClient = exports.CordaApiClientOptions = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const cactus_common_1 = require("@hyperledger/cactus-common");
const typescript_axios_1 = require("../generated/openapi/typescript-axios");
const configuration_1 = require("../generated/openapi/typescript-axios/configuration");
const DEFAULT_POLL_RATE_MS = 5000;
class CordaApiClientOptions extends configuration_1.Configuration {
}
exports.CordaApiClientOptions = CordaApiClientOptions;
/**
 * ApiClient to call remote Corda connector.
 */
class CordaApiClient extends typescript_axios_1.DefaultApi {
    get className() {
        return CordaApiClient.CLASS_NAME;
    }
    constructor(options) {
        super(options);
        this.options = options;
        const fnTag = `${this.className}#constructor()`;
        cactus_common_1.Checks.truthy(options, `${fnTag} arg options`);
        const level = this.options.logLevel || "INFO";
        const label = this.className;
        this.log = cactus_common_1.LoggerProvider.getOrCreate({ level, label });
        this.log.debug(`Created ${this.className} OK.`);
        this.log.debug(`basePath=${this.options.basePath}`);
    }
    /**
     * Send low-level HTTP API startMonitorV1 to the connector to start monitoring queue for specified client.
     * Errors are pushed to RxJs subject.
     *
     * @param subject RxJs subject associated with this monitoring request.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    async sendStartMonitorRequest(subject, clientAppId, stateName) {
        const reportError = (err) => {
            this.log.warn("Error in startMonitorV1:", err);
            subject.error(`startMonitorV1 for '${stateName}' transactions failed`);
        };
        try {
            const startMonRes = await this.startMonitorV1({
                clientAppId: clientAppId,
                stateFullClassName: stateName,
            });
            if (startMonRes.status != 200 || !startMonRes.data.success) {
                reportError(`Wrong response: status ${startMonRes.status}, success ${startMonRes.data.success}, msg ${startMonRes.data.msg}`);
            }
            else {
                this.log.info(`Monitoring for ${stateName} transactions started.`);
            }
        }
        catch (err) {
            reportError(err);
        }
    }
    /**
     * Function to perform single request to read and confirm retrieval of transactions from the connector.
     * Should be executed periodically (i.e. connector should be polled for new transactions).
     * New transactions are pushed into the subject.
     *
     * @param subject RxJs subject associated with this monitoring request.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    async pollTransactionsLogin(subject, clientAppId, stateName) {
        try {
            const response = await this.getMonitorTransactionsV1({
                clientAppId: clientAppId,
                stateFullClassName: stateName,
            });
            if (response.status != 200 || !response.data.success) {
                throw new Error(`Poll error: ${response.data.msg}`);
            }
            if (response.data.stateFullClassName != stateName) {
                throw new Error(`Received class name mismatch! ${stateName} != ${response.data.stateFullClassName}`);
            }
            if (!response.data.tx) {
                this.log.debug("No new transactions, continue...");
                return;
            }
            const readTxIdx = response.data.tx.map((tx) => tx.index);
            await this.clearMonitorTransactionsV1({
                clientAppId: clientAppId,
                stateFullClassName: stateName,
                txIndexes: readTxIdx === null || readTxIdx === void 0 ? void 0 : readTxIdx.filter(Boolean),
            });
            response.data.tx.forEach((tx) => subject.next(tx));
        }
        catch (err) {
            this.log.warn("Monitor poll error for state", stateName);
            subject.error(err);
        }
    }
    /**
     * Should be called to stop monitoring on the connector.
     * Calling this will remove all pending transactions (that were not read yet)!
     *
     * @param monitor Monitoring interval set with `setTimeout`.
     * @param clientAppId Client application ID to identify monitoring queue on the connector.
     * @param stateName Corda state to monitor.
     */
    finalizeMonitoring(monitor, clientAppId, stateName) {
        this.log.info("Unsubscribe from the monitoring...");
        clearInterval(monitor);
        this.stopMonitorV1({
            clientAppId: clientAppId,
            stateFullClassName: stateName,
        })
            .then((stopMonRes) => {
            if (stopMonRes.status != 200 || !stopMonRes.data.success) {
                this.log.warn("Error response from stopMonitorV1:", stopMonRes.data.msg);
            }
            else {
                this.log.info(`Monitoring for ${stateName} transactions stopped.`);
            }
        })
            .catch((err) => {
            this.log.warn("Error when calling stopMonitorV1:", err);
        });
    }
    /**
     * Watch new transactions (state changes) on the corda ledger.
     *
     * @param options.stateFullClassName Corda state to monitor
     * @param options.clientAppId Calling app ID. Each monitoring queue on the connector is associated with a client ID.
     * @param options.pollRate How often poll the connector for new transactions. Defaults to 5s
     *
     * @returns RxJS observable of transactions.
     */
    async watchBlocksAsyncV1(options) {
        var _a;
        cactus_common_1.Checks.truthy(options, "watchBlocksV1 missing options");
        cactus_common_1.Checks.nonBlankString(options.stateFullClassName, "watchBlocksV1 stateFullClassName empty");
        cactus_common_1.Checks.nonBlankString(options.clientAppId, "watchBlocksV1 clientAppId empty");
        const pollRate = (_a = options.pollRate) !== null && _a !== void 0 ? _a : DEFAULT_POLL_RATE_MS;
        this.log.debug("Using monitoring poll rate:", pollRate);
        const subject = new rxjs_1.ReplaySubject(0);
        // Start monitoring
        await this.sendStartMonitorRequest(subject, options.clientAppId, options.stateFullClassName);
        // Periodically poll
        const monitoringInterval = setInterval(() => this.pollTransactionsLogin(subject, options.clientAppId, options.stateFullClassName), pollRate);
        // Share and finalize monitoring when not listened to anymore
        return subject.pipe((0, operators_1.finalize)(() => this.finalizeMonitoring(monitoringInterval, options.clientAppId, options.stateFullClassName)), (0, operators_1.share)());
    }
}
exports.CordaApiClient = CordaApiClient;
CordaApiClient.CLASS_NAME = "CordaApiClient";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZGEtYXBpLWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3R5cGVzY3JpcHQvYXBpLWNsaWVudC9jb3JkYS1hcGktY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUFpRDtBQUNqRCw4Q0FBaUQ7QUFDakQsOERBS29DO0FBRXBDLDRFQUcrQztBQUMvQyx1RkFBb0Y7QUFFcEYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFhbEMsTUFBYSxxQkFBc0IsU0FBUSw2QkFBYTtDQUV2RDtBQUZELHNEQUVDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLGNBQ1gsU0FBUSw2QkFBVTtJQU9sQixJQUFXLFNBQVM7UUFDbEIsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDO0lBQ25DLENBQUM7SUFFRCxZQUE0QixPQUE4QjtRQUN4RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFEVyxZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUV4RCxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLGdCQUFnQixDQUFDO1FBQ2hELHNCQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLEtBQUssY0FBYyxDQUFDLENBQUM7UUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDO1FBQzlDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyw4QkFBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsTUFBTSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsT0FB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