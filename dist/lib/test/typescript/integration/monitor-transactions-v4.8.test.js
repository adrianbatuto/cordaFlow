"use strict";
/**
 * Test state change monitoring interface in Kotlin Corda v4 connector component.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Contants: Log Levels
const testLogLevel = "debug";
const sutLogLevel = "info";
// Contants: Test ledger
const ledgerImageName = "ghcr.io/hyperledger/cactus-corda-4-8-all-in-one-obligation";
const ledgerImageVersion = "2022-03-31-28f0cbf--1956";
const partyARpcUsername = "user1";
const partyARpcPassword = "password";
const partyBRpcUsername = partyARpcUsername;
const partyBRpcPassword = partyARpcPassword;
const stateToMonitor = "net.corda.samples.example.states.IOUState";
const flowToInvoke = "net.corda.samples.example.flows.ExampleFlow$Initiator";
const testAppId = "monitor-transactions-test-app";
// Contants: Kotlin connector server
const kotlinServerImageName = "ghcr.io/hyperledger/cactus-connector-corda-server";
const kotlinServerImageVersion = "2022-05-26-0ff7407--pr-2021";
require("jest-extended");
const internal_ip_1 = require("internal-ip");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_common_1 = require("@hyperledger/cactus-common");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const corda_api_client_1 = require("../../../main/typescript/api-client/corda-api-client");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
// Unit Test logger setup
const log = cactus_common_1.LoggerProvider.getOrCreate({
    label: "kotlin-server-monitor-transactions-v4.8.test",
    level: testLogLevel,
});
//////////////////////////////////
// Helper Functions
//////////////////////////////////
async function deployContract(apiClient, ledger, rpcPort, internalIp) {
    log.info("deployContract() called...");
    const sshConfig = await ledger.getSshConfig();
    const corDappsDirPartyA = await ledger.getCorDappsDirPartyA();
    const cdcA = {
        cordappDir: corDappsDirPartyA,
        cordaNodeStartCmd: "supervisorctl start corda-a",
        cordaJarPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantA/corda.jar",
        nodeBaseDirPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantA/",
        rpcCredentials: {
            hostname: internalIp,
            port: rpcPort,
            username: partyARpcUsername,
            password: partyARpcPassword,
        },
        sshCredentials: {
            hostKeyEntry: "foo",
            hostname: internalIp,
            password: "root",
            port: sshConfig.port,
            username: sshConfig.username,
        },
    };
    const partyBRpcPort = await ledger.getRpcBPublicPort();
    const corDappsDirPartyB = await ledger.getCorDappsDirPartyB();
    const cdcB = {
        cordappDir: corDappsDirPartyB,
        cordaNodeStartCmd: "supervisorctl start corda-b",
        cordaJarPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantB/corda.jar",
        nodeBaseDirPath: "/samples-kotlin/Advanced/obligation-cordapp/build/nodes/ParticipantB/",
        rpcCredentials: {
            hostname: internalIp,
            port: partyBRpcPort,
            username: partyBRpcUsername,
            password: partyBRpcPassword,
        },
        sshCredentials: {
            hostKeyEntry: "foo",
            hostname: internalIp,
            password: "root",
            port: sshConfig.port,
            username: sshConfig.username,
        },
    };
    const cordappDeploymentConfigs = [cdcA, cdcB];
    log.debug("cordappDeploymentConfigs:", cordappDeploymentConfigs);
    const jarFiles = await ledger.pullCordappJars("BASIC_CORDAPP" /* SampleCordappEnum.BASIC_CORDAPP */);
    expect(jarFiles).toBeTruthy();
    const deployRes = await apiClient.deployContractJarsV1({
        jarFiles,
        cordappDeploymentConfigs,
    });
    expect(deployRes.data.deployedJarFiles.length).toBeGreaterThan(0);
    const flowsRes = await apiClient.listFlowsV1();
    expect(flowsRes.data.flowNames).toContain(flowToInvoke);
}
async function invokeContract(apiClient, publicKey) {
    const req = {
        timeoutMs: 60000,
        flowFullClassName: flowToInvoke,
        flowInvocationType: index_1.FlowInvocationType.FlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.Integer",
                },
                primitiveValue: 42,
            },
            {
                jvmTypeKind: index_1.JvmTypeKind.Reference,
                jvmType: {
                    fqClassName: "net.corda.core.identity.Party",
                },
                jvmCtorArgs: [
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "net.corda.core.identity.CordaX500Name",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "ParticipantB",
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "New York",
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: "US",
                            },
                        ],
                    },
                    {
                        jvmTypeKind: index_1.JvmTypeKind.Reference,
                        jvmType: {
                            fqClassName: "org.hyperledger.cactus.plugin.ledger.connector.corda.server.impl.PublicKeyImpl",
                        },
                        jvmCtorArgs: [
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: publicKey === null || publicKey === void 0 ? void 0 : publicKey.algorithm,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: publicKey === null || publicKey === void 0 ? void 0 : publicKey.format,
                            },
                            {
                                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                jvmType: {
                                    fqClassName: "java.lang.String",
                                },
                                primitiveValue: publicKey === null || publicKey === void 0 ? void 0 : publicKey.encoded,
                            },
                        ],
                    },
                ],
            },
        ],
    };
    const res = await apiClient.invokeContractV1(req);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data.success).toBeTrue();
}
//////////////////////////////////
// Monitor Tests
//////////////////////////////////
describe("Monitor Tests", () => {
    let ledger;
    let connector;
    let apiClient;
    let partyBPublicKey;
    beforeAll(async () => {
        log.info("Prune Docker...");
        await (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel: testLogLevel });
        ledger = new cactus_test_tooling_1.CordaTestLedger({
            imageName: ledgerImageName,
            imageVersion: ledgerImageVersion,
            logLevel: testLogLevel,
        });
        const ledgerContainer = await ledger.start();
        expect(ledgerContainer).toBeTruthy();
        log.debug("Corda ledger started...");
        await ledger.logDebugPorts();
        const partyARpcPort = await ledger.getRpcAPublicPort();
        const internalIp = (await (0, internal_ip_1.v4)());
        expect(internalIp).toBeTruthy();
        log.info("Internal IP (based on default gateway):", internalIp);
        const springAppConfig = {
            logging: {
                level: {
                    root: "info",
                    "net.corda": "info",
                    "org.hyperledger.cactus": sutLogLevel,
                },
            },
            cactus: {
                threadCount: 2,
                sessionExpireMinutes: 10,
                corda: {
                    node: { host: internalIp },
                    rpc: {
                        port: partyARpcPort,
                        username: partyARpcUsername,
                        password: partyARpcPassword,
                    },
                },
            },
        };
        const springApplicationJson = JSON.stringify(springAppConfig);
        const envVarSpringAppJson = `SPRING_APPLICATION_JSON=${springApplicationJson}`;
        log.debug(envVarSpringAppJson);
        connector = new cactus_test_tooling_1.CordaConnectorContainer({
            logLevel: sutLogLevel,
            imageName: kotlinServerImageName,
            imageVersion: kotlinServerImageVersion,
            envVars: [envVarSpringAppJson],
        });
        expect(connector).toBeTruthy();
        await connector.start();
        await connector.logDebugPorts();
        const apiUrl = await connector.getApiLocalhostUrl();
        const config = new cactus_core_api_1.Configuration({ basePath: apiUrl });
        apiClient = new corda_api_client_1.CordaApiClient(config);
        expect(apiClient).toBeTruthy();
        await deployContract(apiClient, ledger, partyARpcPort, internalIp);
        log.info("Fetching network map for Corda network...");
        const networkMapRes = await apiClient.networkMapV1();
        expect(networkMapRes.data).toBeTruthy();
        const partyB = networkMapRes.data.find((it) => it.legalIdentities.some((li) => li.name.organisation === "ParticipantB"));
        partyBPublicKey = partyB === null || partyB === void 0 ? void 0 : partyB.legalIdentities[0].owningKey;
        expect(partyBPublicKey).toBeTruthy();
    });
    afterAll(async () => {
        if (ledger) {
            await ledger.stop();
            await ledger.destroy();
        }
        if (connector) {
            await connector.stop();
            await connector.destroy();
        }
    });
    describe("Low-level StartMonitor and StopMonitor tests", () => {
        afterEach(async () => {
            // Stop monitor
            await apiClient.stopMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
        });
        test("Transactions can be read repeatedly until cleared or monitoring stop", async () => {
            var _a, _b, _c;
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Get transactions before invoke - should be 0
            const resGetTxPre = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxPre.status).toBe(200);
            expect(resGetTxPre.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTxPre.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(0);
            // Invoke transactions
            const transactionCount = 3;
            for (let i = 0; i < transactionCount; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions after invoke
            const resGetTxPost = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxPost.status).toBe(200);
            expect(resGetTxPost.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_b = resGetTxPost.data.tx) === null || _b === void 0 ? void 0 : _b.length).toBe(transactionCount);
            const seenIndexes = new Set();
            (_c = resGetTxPost.data.tx) === null || _c === void 0 ? void 0 : _c.forEach((tx) => {
                expect(tx.index).toBeTruthy();
                // Expect indexes to be unique
                expect(seenIndexes).not.toContain(tx.index);
                seenIndexes.add(tx.index);
                expect(tx.data).toBeTruthy();
            });
            // Get transactions after already reading all current ones - should be the same as before
            const resGetTxPostRead = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxPostRead.status).toBe(200);
            expect(resGetTxPostRead.data.stateFullClassName).toEqual(stateToMonitor);
            expect(resGetTxPostRead.data.tx).toEqual(resGetTxPost.data.tx);
        });
        test("Received transactions can be cleared so they can't be read anymore", async () => {
            var _a, _b, _c;
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Invoke transactions
            const transactionCount = 3;
            for (let i = 0; i < transactionCount; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions after invoke
            const resGetTx = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTx.status).toBe(200);
            expect(resGetTx.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTx.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(transactionCount);
            // Clear seen transactions
            const readTxIdx = (_b = resGetTx.data.tx) === null || _b === void 0 ? void 0 : _b.map((tx) => tx.index);
            const resClearTx = await apiClient.clearMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
                txIndexes: readTxIdx,
            });
            expect(resClearTx.status).toBe(200);
            expect(resClearTx.data.success).toBeTrue();
            // Get transactions after clear - should be 0
            const resGetTxPostClear = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxPostClear.status).toBe(200);
            expect(resGetTxPostClear.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_c = resGetTxPostClear.data.tx) === null || _c === void 0 ? void 0 : _c.length).toBe(0);
        });
        test("Sending startMonitor repeatedly doesn't affect monitor results", async () => {
            var _a;
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Invoke first transactions
            const firstTransactionCount = 3;
            for (let i = 0; i < firstTransactionCount; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Start monitor once again
            const resMonitorAgain = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorAgain.status).toBe(200);
            expect(resMonitorAgain.data.success).toBeTrue();
            // Invoke second transactions
            const secondTransactionCount = 3;
            for (let i = 0; i < secondTransactionCount; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get final transactions
            const resGetTx = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTx.status).toBe(200);
            expect(resGetTx.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTx.data.tx) === null || _a === void 0 ? void 0 : _a.length).toEqual(firstTransactionCount + secondTransactionCount);
        });
        test("Monitoring restart after previous stop works", async () => {
            var _a;
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Invoke transactions
            const transactionCount = 3;
            for (let i = 0; i < transactionCount; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Stop Monitor
            const resStopMonitor = await apiClient.stopMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resStopMonitor.status).toBe(200);
            expect(resStopMonitor.data.success).toBeTrue();
            // Restart Monitor
            const resMonitorRestart = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorRestart.status).toBe(200);
            expect(resMonitorRestart.data.success).toBeTrue();
            // Invoke transactions after restart
            const transactionCountAfterRestart = 2;
            for (let i = 0; i < transactionCountAfterRestart; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions should return only new transactions
            const resGetTxPostRestart = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxPostRestart.status).toBe(200);
            expect(resGetTxPostRestart.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTxPostRestart.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(transactionCountAfterRestart);
        });
        test("Monitor returns only transactions after monitor was started, not previous ones", async () => {
            var _a;
            // Invoke initial transactions
            const transactionCountFirst = 5;
            for (let i = 0; i < transactionCountFirst; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Invoke transactions after start
            const transactionCountAfterStart = 2;
            for (let i = 0; i < transactionCountAfterStart; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions
            const resGetTx = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTx.status).toBe(200);
            expect(resGetTx.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTx.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(transactionCountAfterStart);
        });
        test("Start monitoring with unknown state returns error", async () => {
            const unknownState = "foo.bar.non.existent";
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: unknownState,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeFalse();
            expect(resMonitor.data.msg).toContain(unknownState);
        });
        test("Stop monitoring with unknown state does nothing and returns success", async () => {
            // Stop monitor
            const resStopMon = await apiClient.stopMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: "foo.bar.non.existent",
            });
            expect(resStopMon.status).toBe(200);
            expect(resStopMon.data.success).toBeTrue();
        });
        test("Reading / clearing transactions without monitor running returns an error", async () => {
            // Get transactions before start monitor
            const resGet = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGet.status).toBe(200);
            expect(resGet.data.success).toBeFalse();
            expect(resGet.data.msg).toBeTruthy();
            expect(resGet.data.stateFullClassName).toBeFalsy();
            expect(resGet.data.tx).toBeFalsy();
            // Clear transactions before start monitor
            const resClear = await apiClient.clearMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
                txIndexes: ["1", "2"],
            });
            expect(resClear.status).toBe(200);
            expect(resClear.data.success).toBeFalse();
            expect(resClear.data.msg).toBeTruthy();
        });
        test("Reading / clearing unknown state returns an error", async () => {
            // Start monitor
            const resMonitor = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitor.status).toBe(200);
            expect(resMonitor.data.success).toBeTrue();
            // Get transactions of unknown state
            const resGet = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: "foo.bar.non.existent",
            });
            expect(resGet.status).toBe(200);
            expect(resGet.data.success).toBeFalse();
            expect(resGet.data.msg).toBeTruthy();
            expect(resGet.data.stateFullClassName).toBeFalsy();
            expect(resGet.data.tx).toBeFalsy();
            // Clear transactions of unknown state
            const resClear = await apiClient.clearMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: "foo.bar.non.existent",
                txIndexes: ["1", "2"],
            });
            expect(resClear.status).toBe(200);
            expect(resClear.data.msg).toBeTruthy();
            expect(resClear.data.success).toBeFalse();
        });
    });
    describe("Multiple clients tests", () => {
        const anotherAppId = "anotherTestApp";
        afterEach(async () => {
            // Stop Monitors
            await apiClient.stopMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            await apiClient.stopMonitorV1({
                clientAppId: anotherAppId,
                stateFullClassName: stateToMonitor,
            });
        });
        test("State change can be read by all listening clients separately", async () => {
            var _a, _b, _c;
            // Start monitor for first client
            const resMonitorFirst = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorFirst.status).toBe(200);
            expect(resMonitorFirst.data.success).toBeTrue();
            // Start monitor for second client
            const resMonitorAnother = await apiClient.startMonitorV1({
                clientAppId: anotherAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorAnother.status).toBe(200);
            expect(resMonitorAnother.data.success).toBeTrue();
            // Invoke transactions
            const transactionCountAfterStart = 3;
            for (let i = 0; i < transactionCountAfterStart; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions for first client
            const resGetTxFirstClient = await apiClient.getMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxFirstClient.status).toBe(200);
            expect(resGetTxFirstClient.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTxFirstClient.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(transactionCountAfterStart);
            // Clear transactions seen by the first client
            const readTxIdx = (_b = resGetTxFirstClient.data.tx) === null || _b === void 0 ? void 0 : _b.map((tx) => tx.index);
            const resClearTx = await apiClient.clearMonitorTransactionsV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
                txIndexes: readTxIdx,
            });
            expect(resClearTx.status).toBe(200);
            expect(resClearTx.data.success).toBeTrue();
            // Get transactions for second client - should have all transactions available
            const resGetTxSecondClient = await apiClient.getMonitorTransactionsV1({
                clientAppId: anotherAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxSecondClient.status).toBe(200);
            expect(resGetTxSecondClient.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_c = resGetTxSecondClient.data.tx) === null || _c === void 0 ? void 0 : _c.length).toBe(transactionCountAfterStart);
        });
        test("State change unsubscribe doesn't affect other client monitors", async () => {
            var _a;
            // Start monitor for first client
            const resMonitorFirst = await apiClient.startMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorFirst.status).toBe(200);
            expect(resMonitorFirst.data.success).toBeTrue();
            // Start monitor for second client
            const resMonitorAnother = await apiClient.startMonitorV1({
                clientAppId: anotherAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resMonitorAnother.status).toBe(200);
            expect(resMonitorAnother.data.success).toBeTrue();
            // Invoke transactions
            const transactionCountAfterStart = 3;
            for (let i = 0; i < transactionCountAfterStart; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Stop first client monitoring
            await apiClient.stopMonitorV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
            });
            // Invoke transactions for second client only
            const transactionCountOnlySecondClient = 4;
            for (let i = 0; i < transactionCountOnlySecondClient; i++) {
                await invokeContract(apiClient, partyBPublicKey);
            }
            // Get transactions for second client
            const resGetTxSecondClient = await apiClient.getMonitorTransactionsV1({
                clientAppId: anotherAppId,
                stateFullClassName: stateToMonitor,
            });
            expect(resGetTxSecondClient.status).toBe(200);
            expect(resGetTxSecondClient.data.stateFullClassName).toEqual(stateToMonitor);
            expect((_a = resGetTxSecondClient.data.tx) === null || _a === void 0 ? void 0 : _a.length).toBe(transactionCountAfterStart + transactionCountOnlySecondClient);
        });
    });
    describe("watchBlocks tests", () => {
        // watchBlocks tests are async, don't wait so long if something goes wrong
        const watchBlockTestTimeout = 5 * 60 * 1000; // 5 minutes
        test("watchBlocksAsyncV1 reports all transactions", async () => {
            const transactionCount = 10;
            const observable = await apiClient.watchBlocksAsyncV1({
                clientAppId: testAppId,
                stateFullClassName: stateToMonitor,
                pollRate: 1000,
            });
            let sub;
            const monitor = new Promise((resolve, reject) => {
                let transactionsReceived = 0;
                sub = observable.subscribe({
                    next(tx) {
                        let error;
                        log.debug("Received transaction from monitor:", tx);
                        if (tx.index === undefined || !tx.data) {
                            error = `Wrong transaction format - idx ${tx.index} data ${tx.data}`;
                        }
                        transactionsReceived++;
                        if (error) {
                            log.error(error);
                            reject(error);
                        }
                        if (transactionsReceived === transactionCount) {
                            log.info(`Read all ${transactionCount} transactions - OK`);
                            resolve();
                        }
                    },
                    error(err) {
                        log.error("watchBlocksAsyncV1 failed:", err);
                        reject(err);
                    },
                });
            }).finally(() => sub === null || sub === void 0 ? void 0 : sub.unsubscribe());
            // Invoke transactions
            for (let i = 0; i < transactionCount; i++) {
                invokeContract(apiClient, partyBPublicKey);
            }
            await monitor;
        }, watchBlockTestTimeout);
        test("Running watchBlocksAsyncV1 with unknown state report an error on rxjs subject", async () => {
            const observable = await apiClient.watchBlocksAsyncV1({
                clientAppId: testAppId,
                stateFullClassName: "foo.bar.unknown",
            });
            let sub;
            await new Promise((resolve, reject) => {
                sub = observable.subscribe({
                    next() {
                        reject("Monitor reported new transaction when it should fail.");
                    },
                    error(err) {
                        log.info("watchBlocksAsyncV1 error reported as expected:", err);
                        resolve();
                    },
                });
            }).finally(() => sub === null || sub === void 0 ? void 0 : sub.unsubscribe());
        }, watchBlockTestTimeout);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvci10cmFuc2FjdGlvbnMtdjQuOC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9tb25pdG9yLXRyYW5zYWN0aW9ucy12NC44LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILHVCQUF1QjtBQUN2QixNQUFNLFlBQVksR0FBaUIsT0FBTyxDQUFDO0FBQzNDLE1BQU0sV0FBVyxHQUFpQixNQUFNLENBQUM7QUFFekMsd0JBQXdCO0FBQ3hCLE1BQU0sZUFBZSxHQUNuQiw0REFBNEQsQ0FBQztBQUMvRCxNQUFNLGtCQUFrQixHQUFHLDBCQUEwQixDQUFDO0FBQ3RELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0FBQ2xDLE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDO0FBQ3JDLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7QUFDNUMsTUFBTSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztBQUM1QyxNQUFNLGNBQWMsR0FBRywyQ0FBMkMsQ0FBQztBQUNuRSxNQUFNLFlBQVksR0FBRyx1REFBdUQsQ0FBQztBQUM3RSxNQUFNLFNBQVMsR0FBRywrQkFBK0IsQ0FBQztBQUVsRCxvQ0FBb0M7QUFDcEMsTUFBTSxxQkFBcUIsR0FDekIsbURBQW1ELENBQUM7QUFDdEQsTUFBTSx3QkFBd0IsR0FBRyw2QkFBNkIsQ0FBQztBQUUvRCx5QkFBdUI7QUFDdkIsNkNBQWlEO0FBRWpELDBFQUswQztBQUMxQyw4REFJb0M7QUFDcEMsNkZBTTJFO0FBQzNFLDJGQUFzRjtBQUN0RixrRUFBNkQ7QUFHN0QseUJBQXlCO0FBQ3pCLE1BQU0sR0FBRyxHQUFXLDhCQUFjLENBQUMsV0FBVyxDQUFDO0lBQzdDLEtBQUssRUFBRSw4Q0FBOEM7SUFDckQsS0FBSyxFQUFFLFlBQVk7Q0FDcEIsQ0FBQyxDQUFDO0FBRUgsa0NBQWtDO0FBQ2xDLG1CQUFtQjtBQUNuQixrQ0FBa0M7QUFFbEMsS0FBSyxVQUFVLGNBQWMsQ0FDM0IsU0FBeUIsRUFDekIsTUFBdUIsRUFDdkIsT0FBZSxFQUNmLFVBQWtCO0lBRWxCLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUV2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM5QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFFOUQsTUFBTSxJQUFJLEdBQTRCO1FBQ3BDLFVBQVUsRUFBRSxpQkFBaUI7UUFDN0IsaUJBQWlCLEVBQUUsNkJBQTZCO1FBQ2hELFlBQVksRUFDVixnRkFBZ0Y7UUFDbEYsZUFBZSxFQUNiLHVFQUF1RTtRQUN6RSxjQUFjLEVBQUU7WUFDZCxRQUFRLEVBQUUsVUFBVTtZQUNwQixJQUFJLEVBQUUsT0FBTztZQUNiLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsUUFBUSxFQUFFLGlCQUFpQjtTQUM1QjtRQUNELGNBQWMsRUFBRTtZQUNkLFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBYztZQUM5QixRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQWtCO1NBQ3ZDO0tBQ0YsQ0FBQztJQUVGLE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdkQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBRTlELE1BQU0sSUFBSSxHQUE0QjtRQUNwQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCLGlCQUFpQixFQUFFLDZCQUE2QjtRQUNoRCxZQUFZLEVBQ1YsZ0ZBQWdGO1FBQ2xGLGVBQWUsRUFDYix1RUFBdUU7UUFDekUsY0FBYyxFQUFFO1lBQ2QsUUFBUSxFQUFFLFVBQVU7WUFDcEIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixRQUFRLEVBQUUsaUJBQWlCO1NBQzVCO1FBQ0QsY0FBYyxFQUFFO1lBQ2QsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLFVBQVU7WUFDcEIsUUFBUSxFQUFFLE1BQU07WUFDaEIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFjO1lBQzlCLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBa0I7U0FDdkM7S0FDRixDQUFDO0lBRUYsTUFBTSx3QkFBd0IsR0FBOEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekUsR0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBRWpFLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsdURBRTVDLENBQUM7SUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUMsb0JBQW9CLENBQUM7UUFDckQsUUFBUTtRQUNSLHdCQUF3QjtLQUN6QixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLFNBQXlCLEVBQUUsU0FBb0I7SUFDM0UsTUFBTSxHQUFHLEdBQTRCO1FBQ25DLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLGlCQUFpQixFQUFFLFlBQVk7UUFDL0Isa0JBQWtCLEVBQUUsMEJBQWtCLENBQUMsV0FBVztRQUNsRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dCQUNsQyxPQUFPLEVBQUU7b0JBQ1AsV0FBVyxFQUFFLG1CQUFtQjtpQkFDakM7Z0JBQ0QsY0FBYyxFQUFFLEVBQUU7YUFDbkI7WUFDRDtnQkFDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dCQUNsQyxPQUFPLEVBQUU7b0JBQ1AsV0FBVyxFQUFFLCtCQUErQjtpQkFDN0M7Z0JBQ0QsV0FBVyxFQUFFO29CQUNYO3dCQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7d0JBQ2xDLE9BQU8sRUFBRTs0QkFDUCxXQUFXLEVBQUUsdUNBQXVDO3lCQUNyRDt3QkFDRCxXQUFXLEVBQUU7NEJBQ1g7Z0NBQ0UsV0FBVyxFQUFFLG1CQUFXLENBQUMsU0FBUztnQ0FDbEMsT0FBTyxFQUFFO29DQUNQLFdBQVcsRUFBRSxrQkFBa0I7aUNBQ2hDO2dDQUNELGNBQWMsRUFBRSxjQUFjOzZCQUMvQjs0QkFDRDtnQ0FDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dDQUNsQyxPQUFPLEVBQUU7b0NBQ1AsV0FBVyxFQUFFLGtCQUFrQjtpQ0FDaEM7Z0NBQ0QsY0FBYyxFQUFFLFVBQVU7NkJBQzNCOzRCQUNEO2dDQUNFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLFNBQVM7Z0NBQ2xDLE9BQU8sRUFBRTtvQ0FDUCxXQUFXLEVBQUUsa0JBQWtCO2lDQUNoQztnQ0FDRCxjQUFjLEVBQUUsSUFBSTs2QkFDckI7eUJBQ0Y7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsV0FBVyxFQUFFLG1CQUFXLENBQUMsU0FBUzt3QkFDbEMsT0FBTyxFQUFFOzRCQUNQLFdBQVcsRUFDVCxnRkFBZ0Y7eUJBQ25GO3dCQUNELFdBQVcsRUFBRTs0QkFDWDtnQ0FDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dDQUNsQyxPQUFPLEVBQUU7b0NBQ1AsV0FBVyxFQUFFLGtCQUFrQjtpQ0FDaEM7Z0NBQ0QsY0FBYyxFQUFFLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxTQUFTOzZCQUNyQzs0QkFDRDtnQ0FDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dDQUNsQyxPQUFPLEVBQUU7b0NBQ1AsV0FBVyxFQUFFLGtCQUFrQjtpQ0FDaEM7Z0NBQ0QsY0FBYyxFQUFFLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxNQUFNOzZCQUNsQzs0QkFDRDtnQ0FDRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxTQUFTO2dDQUNsQyxPQUFPLEVBQUU7b0NBQ1AsV0FBVyxFQUFFLGtCQUFrQjtpQ0FDaEM7Z0NBQ0QsY0FBYyxFQUFFLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxPQUFPOzZCQUNuQzt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDb0MsQ0FBQztJQUV4QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdEMsQ0FBQztBQUVELGtDQUFrQztBQUNsQyxnQkFBZ0I7QUFDaEIsa0NBQWtDO0FBRWxDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO0lBQzdCLElBQUksTUFBdUIsQ0FBQztJQUM1QixJQUFJLFNBQWtDLENBQUM7SUFDdkMsSUFBSSxTQUF5QixDQUFDO0lBQzlCLElBQUksZUFBMEIsQ0FBQztJQUUvQixTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sSUFBQSxrREFBNEIsRUFBQyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sR0FBRyxJQUFJLHFDQUFlLENBQUM7WUFDM0IsU0FBUyxFQUFFLGVBQWU7WUFDMUIsWUFBWSxFQUFFLGtCQUFrQjtZQUNoQyxRQUFRLEVBQUUsWUFBWTtTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFNLGVBQWUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBRXJDLE1BQU0sTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdCLE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFdkQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUEsZ0JBQVksR0FBRSxDQUFXLENBQUM7UUFDcEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFaEUsTUFBTSxlQUFlLEdBQUc7WUFDdEIsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsTUFBTTtvQkFDbkIsd0JBQXdCLEVBQUUsV0FBVztpQkFDdEM7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTixXQUFXLEVBQUUsQ0FBQztnQkFDZCxvQkFBb0IsRUFBRSxFQUFFO2dCQUN4QixLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtvQkFDMUIsR0FBRyxFQUFFO3dCQUNILElBQUksRUFBRSxhQUFhO3dCQUNuQixRQUFRLEVBQUUsaUJBQWlCO3dCQUMzQixRQUFRLEVBQUUsaUJBQWlCO3FCQUM1QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQztRQUNGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RCxNQUFNLG1CQUFtQixHQUFHLDJCQUEyQixxQkFBcUIsRUFBRSxDQUFDO1FBQy9FLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUUvQixTQUFTLEdBQUcsSUFBSSw2Q0FBdUIsQ0FBQztZQUN0QyxRQUFRLEVBQUUsV0FBVztZQUNyQixTQUFTLEVBQUUscUJBQXFCO1lBQ2hDLFlBQVksRUFBRSx3QkFBd0I7WUFDdEMsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUM7U0FDL0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRS9CLE1BQU0sU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLE1BQU0sU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSwrQkFBYSxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDdkQsU0FBUyxHQUFHLElBQUksaUNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFL0IsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFbkUsR0FBRyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sYUFBYSxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUM1QyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssY0FBYyxDQUFDLENBQ3pFLENBQUM7UUFDRixlQUFlLEdBQUcsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsU0FBc0IsQ0FBQztRQUNwRSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDbEIsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN4QjtRQUVELElBQUksU0FBUyxFQUFFO1lBQ2IsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkIsTUFBTSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7UUFDNUQsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ25CLGVBQWU7WUFDZixNQUFNLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQzVCLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNFQUFzRSxFQUFFLEtBQUssSUFBSSxFQUFFOztZQUN0RixnQkFBZ0I7WUFDaEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUNoRCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzQywrQ0FBK0M7WUFDL0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQzNELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxNQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUMsc0JBQXNCO1lBQ3RCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDekMsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsZ0NBQWdDO1lBQ2hDLE1BQU0sWUFBWSxHQUFHLE1BQU0sU0FBUyxDQUFDLHdCQUF3QixDQUFDO2dCQUM1RCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsTUFBQSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsMENBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUN0QyxNQUFBLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsOEJBQThCO2dCQUM5QixNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQWUsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDO1lBRUgseUZBQXlGO1lBQ3pGLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ2hFLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9FQUFvRSxFQUFFLEtBQUssSUFBSSxFQUFFOztZQUNwRixnQkFBZ0I7WUFDaEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUNoRCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzQyxzQkFBc0I7WUFDdEIsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxNQUFNLGNBQWMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDbEQ7WUFFRCxnQ0FBZ0M7WUFDaEMsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ3hELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxNQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUV4RCwwQkFBMEI7WUFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsMENBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsMEJBQTBCLENBQUM7Z0JBQzVELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2dCQUNsQyxTQUFTLEVBQUUsU0FBcUI7YUFDakMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFM0MsNkNBQTZDO1lBQzdDLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ2pFLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRSxNQUFNLENBQUMsTUFBQSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0VBQWdFLEVBQUUsS0FBSyxJQUFJLEVBQUU7O1lBQ2hGLGdCQUFnQjtZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2hELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTNDLDRCQUE0QjtZQUM1QixNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELDJCQUEyQjtZQUMzQixNQUFNLGVBQWUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ3JELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhELDZCQUE2QjtZQUM3QixNQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQztZQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELHlCQUF5QjtZQUN6QixNQUFNLFFBQVEsR0FBRyxNQUFNLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDeEQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLE1BQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLDBDQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FDdEMscUJBQXFCLEdBQUcsc0JBQXNCLENBQy9DLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxLQUFLLElBQUksRUFBRTs7WUFDOUQsZ0JBQWdCO1lBQ2hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDaEQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFM0Msc0JBQXNCO1lBQ3RCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDekMsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsZUFBZTtZQUNmLE1BQU0sY0FBYyxHQUFHLE1BQU0sU0FBUyxDQUFDLGFBQWEsQ0FBQztnQkFDbkQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFL0Msa0JBQWtCO1lBQ2xCLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUN2RCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFbEQsb0NBQW9DO1lBQ3BDLE1BQU0sNEJBQTRCLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyw0QkFBNEIsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckQsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsdURBQXVEO1lBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ25FLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FDekQsY0FBYyxDQUNmLENBQUM7WUFDRixNQUFNLENBQUMsTUFBQSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQzlDLDRCQUE0QixDQUM3QixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0ZBQWdGLEVBQUUsS0FBSyxJQUFJLEVBQUU7O1lBQ2hHLDhCQUE4QjtZQUM5QixNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELGdCQUFnQjtZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2hELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTNDLGtDQUFrQztZQUNsQyxNQUFNLDBCQUEwQixHQUFHLENBQUMsQ0FBQztZQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsMEJBQTBCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELG1CQUFtQjtZQUNuQixNQUFNLFFBQVEsR0FBRyxNQUFNLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDeEQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLE1BQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLDBDQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ25FLE1BQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDO1lBRTVDLGdCQUFnQjtZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2hELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxZQUFZO2FBQ2pDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxRUFBcUUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNyRixlQUFlO1lBQ2YsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsYUFBYSxDQUFDO2dCQUMvQyxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsc0JBQXNCO2FBQzNDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBFQUEwRSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFGLHdDQUF3QztZQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDdEQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVuQywwQ0FBMEM7WUFDMUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsMEJBQTBCLENBQUM7Z0JBQzFELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2dCQUNsQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2FBQ3RCLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ25FLGdCQUFnQjtZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ2hELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTNDLG9DQUFvQztZQUNwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztnQkFDdEQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLHNCQUFzQjthQUMzQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRW5DLHNDQUFzQztZQUN0QyxNQUFNLFFBQVEsR0FBRyxNQUFNLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQztnQkFDMUQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLHNCQUFzQjtnQkFDMUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzthQUN0QixDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztRQUV0QyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDbkIsZ0JBQWdCO1lBQ2hCLE1BQU0sU0FBUyxDQUFDLGFBQWEsQ0FBQztnQkFDNUIsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxTQUFTLENBQUMsYUFBYSxDQUFDO2dCQUM1QixXQUFXLEVBQUUsWUFBWTtnQkFDekIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4REFBOEQsRUFBRSxLQUFLLElBQUksRUFBRTs7WUFDOUUsaUNBQWlDO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDckQsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEQsa0NBQWtDO1lBQ2xDLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUN2RCxXQUFXLEVBQUUsWUFBWTtnQkFDekIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFbEQsc0JBQXNCO1lBQ3RCLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRywwQkFBMEIsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkQsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsb0NBQW9DO1lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ25FLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FDekQsY0FBYyxDQUNmLENBQUM7WUFDRixNQUFNLENBQUMsTUFBQSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQzlDLDBCQUEwQixDQUMzQixDQUFDO1lBRUYsOENBQThDO1lBQzlDLE1BQU0sU0FBUyxHQUFHLE1BQUEsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsMENBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsMEJBQTBCLENBQUM7Z0JBQzVELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2dCQUNsQyxTQUFTLEVBQUUsU0FBcUI7YUFDakMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFM0MsOEVBQThFO1lBQzlFLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUM7Z0JBQ3BFLFdBQVcsRUFBRSxZQUFZO2dCQUN6QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FDMUQsY0FBYyxDQUNmLENBQUM7WUFDRixNQUFNLENBQUMsTUFBQSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRSwwQ0FBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQy9DLDBCQUEwQixDQUMzQixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0RBQStELEVBQUUsS0FBSyxJQUFJLEVBQUU7O1lBQy9FLGlDQUFpQztZQUNqQyxNQUFNLGVBQWUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUM7Z0JBQ3JELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhELGtDQUFrQztZQUNsQyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQztnQkFDdkQsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLGtCQUFrQixFQUFFLGNBQWM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWxELHNCQUFzQjtZQUN0QixNQUFNLDBCQUEwQixHQUFHLENBQUMsQ0FBQztZQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsMEJBQTBCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELCtCQUErQjtZQUMvQixNQUFNLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQzVCLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQztZQUVILDZDQUE2QztZQUM3QyxNQUFNLGdDQUFnQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0NBQWdDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pELE1BQU0sY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNsRDtZQUVELHFDQUFxQztZQUNyQyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sU0FBUyxDQUFDLHdCQUF3QixDQUFDO2dCQUNwRSxXQUFXLEVBQUUsWUFBWTtnQkFDekIsa0JBQWtCLEVBQUUsY0FBYzthQUNuQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQzFELGNBQWMsQ0FDZixDQUFDO1lBQ0YsTUFBTSxDQUFDLE1BQUEsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsMENBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUMvQywwQkFBMEIsR0FBRyxnQ0FBZ0MsQ0FDOUQsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLDBFQUEwRTtRQUMxRSxNQUFNLHFCQUFxQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsWUFBWTtRQUV6RCxJQUFJLENBQ0YsNkNBQTZDLEVBQzdDLEtBQUssSUFBSSxFQUFFO1lBQ1QsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFFNUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxTQUFTLENBQUMsa0JBQWtCLENBQUM7Z0JBQ3BELFdBQVcsRUFBRSxTQUFTO2dCQUN0QixrQkFBa0IsRUFBRSxjQUFjO2dCQUNsQyxRQUFRLEVBQUUsSUFBSTthQUNmLENBQUMsQ0FBQztZQUVILElBQUksR0FBNkIsQ0FBQztZQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7Z0JBRTdCLEdBQUcsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO29CQUN6QixJQUFJLENBQUMsRUFBRTt3QkFDTCxJQUFJLEtBQXlCLENBQUM7d0JBRTlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBRXBELElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFOzRCQUN0QyxLQUFLLEdBQUcsa0NBQWtDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO3lCQUN0RTt3QkFFRCxvQkFBb0IsRUFBRSxDQUFDO3dCQUV2QixJQUFJLEtBQUssRUFBRTs0QkFDVCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNqQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQ2Y7d0JBRUQsSUFBSSxvQkFBb0IsS0FBSyxnQkFBZ0IsRUFBRTs0QkFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLGdCQUFnQixvQkFBb0IsQ0FBQyxDQUFDOzRCQUMzRCxPQUFPLEVBQUUsQ0FBQzt5QkFDWDtvQkFDSCxDQUFDO29CQUNELEtBQUssQ0FBQyxHQUFHO3dCQUNQLEdBQUcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzdDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZCxDQUFDO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUVyQyxzQkFBc0I7WUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsTUFBTSxPQUFPLENBQUM7UUFDaEIsQ0FBQyxFQUNELHFCQUFxQixDQUN0QixDQUFDO1FBRUYsSUFBSSxDQUNGLCtFQUErRSxFQUMvRSxLQUFLLElBQUksRUFBRTtZQUNULE1BQU0sVUFBVSxHQUFHLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixDQUFDO2dCQUNwRCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsa0JBQWtCLEVBQUUsaUJBQWlCO2FBQ3RDLENBQUMsQ0FBQztZQUVILElBQUksR0FBNkIsQ0FBQztZQUNsQyxNQUFNLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMxQyxHQUFHLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztvQkFDekIsSUFBSTt3QkFDRixNQUFNLENBQUMsdURBQXVELENBQUMsQ0FBQztvQkFDbEUsQ0FBQztvQkFDRCxLQUFLLENBQUMsR0FBRzt3QkFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUNoRSxPQUFPLEVBQUUsQ0FBQztvQkFDWixDQUFDO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDLEVBQ0QscUJBQXFCLENBQ3RCLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=