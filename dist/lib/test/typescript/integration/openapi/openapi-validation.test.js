"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape-promise/tape"));
const internal_ip_1 = require("internal-ip");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_test_tooling_2 = require("@hyperledger/cactus-test-tooling");
const index_1 = require("../../../../main/typescript/generated/openapi/typescript-axios/index");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const testCase = "openapi validation on corda JVM implementation";
const logLevel = "TRACE";
tape_1.default.onFailure(async () => {
    await cactus_test_tooling_1.Containers.logDiagnostics({ logLevel });
});
(0, tape_1.default)("BEFORE " + testCase, async (t) => {
    const pruning = (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
    await t.doesNotReject(pruning, "Pruning didn't throw OK");
    t.end();
});
(0, tape_1.default)(testCase, async (t) => {
    const ledger = new cactus_test_tooling_1.CordaTestLedger({
        imageName: "ghcr.io/hyperledger/cactus-corda-4-8-all-in-one-obligation",
        imageVersion: "2021-08-31--feat-889",
        logLevel,
    });
    t.ok(ledger, "CordaTestLedger instantaited OK");
    tape_1.default.onFinish(async () => {
        await ledger.stop();
        await ledger.destroy();
        await (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
    });
    const ledgerContainer = await ledger.start();
    t.ok(ledgerContainer, "CordaTestLedger container truthy post-start() OK");
    await ledger.logDebugPorts();
    const partyARpcPort = await ledger.getRpcAPublicPort();
    const cordappDeploymentConfigs = [];
    const jarFiles = await ledger.pullCordappJars("ADVANCED_OBLIGATION" /* SampleCordappEnum.ADVANCED_OBLIGATION */);
    t.comment(`Fetched ${jarFiles.length} cordapp jars OK`);
    const internalIpOrUndefined = await (0, internal_ip_1.v4)();
    t.ok(internalIpOrUndefined, "Determined LAN IPv4 address successfully OK");
    const internalIp = internalIpOrUndefined;
    t.comment(`Internal IP (based on default gateway): ${internalIp}`);
    const springAppConfig = {
        logging: {
            level: {
                root: "INFO",
                "org.hyperledger.cactus": "DEBUG",
            },
        },
        cactus: {
            corda: {
                node: { host: internalIp },
                // TODO: parse the gradle build files to extract the credentials?
                rpc: { port: partyARpcPort, username: "user1", password: "password" },
            },
        },
    };
    const springApplicationJson = JSON.stringify(springAppConfig);
    const envVarSpringAppJson = `SPRING_APPLICATION_JSON=${springApplicationJson}`;
    t.comment(envVarSpringAppJson);
    const connector = new cactus_test_tooling_2.CordaConnectorContainer({
        logLevel,
        imageName: "ghcr.io/hyperledger/cactus-connector-corda-server",
        imageVersion: "2021-11-23--feat-1493",
        envVars: [envVarSpringAppJson],
    });
    t.ok(cactus_test_tooling_2.CordaConnectorContainer, "CordaConnectorContainer instantiated OK");
    tape_1.default.onFinish(async () => {
        try {
            await connector.stop();
        }
        finally {
            await connector.destroy();
        }
    });
    const connectorContainer = await connector.start();
    t.ok(connectorContainer, "CordaConnectorContainer started OK");
    await connector.logDebugPorts();
    const apiUrl = await connector.getApiLocalhostUrl();
    const config = new cactus_core_api_1.Configuration({ basePath: apiUrl });
    const apiClient = new index_1.DefaultApi(config);
    const fDeploy = "deployContractJarsV1";
    const fInvoke = "invokeContractV1";
    const fDiagnose = "diagnoseNodeV1";
    const fFlows = "listFlowsV1";
    const fNetwork = "networkMapV1";
    const cOk = "without bad request error";
    const cWithoutParams = "not sending all required parameters";
    const cInvalidParams = "sending invalid parameters";
    (0, tape_1.default)(`${testCase} - ${fDeploy} - ${cOk}`, async (t2) => {
        var _a, _b, _c;
        const depReq = {
            jarFiles,
            cordappDeploymentConfigs,
        };
        const depRes = await apiClient.deployContractJarsV1(depReq);
        t2.ok(depRes, "Jar deployment response truthy OK");
        t2.ok(depRes.status === 200, "Jar deployment status code === 200 OK");
        t2.ok(depRes.data, "Jar deployment response body truthy OK");
        t2.ok((_a = depRes.data) === null || _a === void 0 ? void 0 : _a.deployedJarFiles, "Jar deployment body deployedJarFiles OK");
        t2.equal((_c = (_b = depRes.data) === null || _b === void 0 ? void 0 : _b.deployedJarFiles) === null || _c === void 0 ? void 0 : _c.length, jarFiles.length, "Deployed jar file count equals count in request OK");
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fFlows} - ${cOk}`, async (t2) => {
        const flowsRes = await apiClient.listFlowsV1();
        t2.ok(flowsRes.status === 200, "flowsRes.status === 200 OK");
        t2.ok(flowsRes.data, "flowsRes.data truthy OK");
        t2.ok(flowsRes.data.flowNames, "flowsRes.data.flowNames truthy OK");
        t2.comment(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes.data)}`);
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fDiagnose} - ${cOk}`, async (t2) => {
        const diagRes = await apiClient.diagnoseNodeV1();
        t2.ok(diagRes.status === 200, "diagRes.status === 200 OK");
        t2.ok(diagRes.data, "diagRes.data truthy OK");
        t2.ok(diagRes.data.nodeDiagnosticInfo, "nodeDiagnosticInfo truthy OK");
        t2.end();
    });
    let partyAPublicKey;
    let partyBPublicKey;
    (0, tape_1.default)(`${testCase} - ${fNetwork} - ${cOk}`, async (t2) => {
        const networkMapRes = await apiClient.networkMapV1();
        t2.ok(networkMapRes.status === 200, "networkMapRes.status === 200 OK");
        const partyA = networkMapRes.data.find((it) => it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantA"));
        partyAPublicKey = partyA === null || partyA === void 0 ? void 0 : partyA.legalIdentities[0].owningKey;
        const partyB = networkMapRes.data.find((it) => it.legalIdentities.some((it2) => it2.name.organisation === "ParticipantB"));
        partyBPublicKey = partyB === null || partyB === void 0 ? void 0 : partyB.legalIdentities[0].owningKey;
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fInvoke} - ${cOk}`, async (t2) => {
        const req = {
            flowFullClassName: "net.corda.samples.obligation.flows.IOUIssueFlow",
            flowInvocationType: index_1.FlowInvocationType.TrackedFlowDynamic,
            params: [
                {
                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                    jvmType: {
                        fqClassName: "net.corda.samples.obligation.states.IOUState",
                    },
                    jvmCtorArgs: [
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.Amount",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "long",
                                    },
                                    primitiveValue: 42,
                                },
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                                    jvmType: {
                                        fqClassName: "java.util.Currency",
                                        constructorName: "getInstance",
                                    },
                                    jvmCtorArgs: [
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "USD",
                                        },
                                    ],
                                },
                            ],
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
                                            primitiveValue: "ParticipantA",
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "London",
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "GB",
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
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.algorithm,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.format,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.encoded,
                                        },
                                    ],
                                },
                            ],
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
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.algorithm,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.format,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.encoded,
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.Amount",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "long",
                                    },
                                    primitiveValue: 1,
                                },
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                                    jvmType: {
                                        fqClassName: "java.util.Currency",
                                        constructorName: "getInstance",
                                    },
                                    jvmCtorArgs: [
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "USD",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.UniqueIdentifier",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "java.lang.String",
                                    },
                                    primitiveValue: "7fc2161e-f8d0-4c86-a596-08326bdafd56",
                                },
                            ],
                        },
                    ],
                },
            ],
            timeoutMs: 60000,
        };
        const res = await apiClient.invokeContractV1(req);
        t2.ok(res, "InvokeContractV1Request truthy OK");
        t2.ok(res.status === 200, "InvokeContractV1Request status code === 200 OK");
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fDeploy} - ${cWithoutParams}`, async (t2) => {
        var _a, _b;
        try {
            const depReq = {
                jarFiles,
            };
            await apiClient.deployContractJarsV1(depReq);
            t2.fail(`${fDeploy} - ${cWithoutParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "Deploy contract response status code === 400 OK");
        }
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fInvoke} - ${cWithoutParams}`, async (t2) => {
        var _a, _b;
        try {
            const req = {
                flowFullClassName: "net.corda.samples.obligation.flows.IOUIssueFlow",
                flowInvocationType: index_1.FlowInvocationType.TrackedFlowDynamic,
                timeoutMs: 60000,
            };
            await apiClient.invokeContractV1(req);
            t2.fail(`${fInvoke} - ${cWithoutParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "Invoke contract response status code === 400 OK");
        }
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fDeploy} - ${cInvalidParams}`, async (t2) => {
        var _a, _b;
        try {
            const depReq = {
                jarFiles,
                cordappDeploymentConfigs,
                fake: 4,
            };
            await apiClient.deployContractJarsV1(depReq);
            t2.fail(`${fDeploy} - ${cInvalidParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "Deploy contract response status code === 400 OK");
        }
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fFlows} - ${cInvalidParams}`, async (t2) => {
        var _a, _b;
        try {
            const req = { fake: 4 };
            await apiClient.listFlowsV1(req);
            t2.fail(`${fFlows} - ${cInvalidParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "List flows response status code === 400 OK");
        }
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fDiagnose} - ${cInvalidParams}`, async (t2) => {
        var _a, _b;
        try {
            const req = { fake: 4 };
            await apiClient.diagnoseNodeV1(req);
            t2.fail(`${fDiagnose} - ${cInvalidParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "Diagnose node response status code === 400 OK");
        }
        t2.end();
    });
    (0, tape_1.default)(`${testCase} - ${fInvoke} - ${cInvalidParams}`, async (t2) => {
        var _a, _b;
        const req = {
            flowFullClassName: "net.corda.samples.obligation.flows.IOUIssueFlow",
            flowInvocationType: index_1.FlowInvocationType.TrackedFlowDynamic,
            params: [
                {
                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                    jvmType: {
                        fqClassName: "net.corda.samples.obligation.states.IOUState",
                    },
                    jvmCtorArgs: [
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.Amount",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "long",
                                    },
                                    primitiveValue: 42,
                                },
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                                    jvmType: {
                                        fqClassName: "java.util.Currency",
                                        constructorName: "getInstance",
                                    },
                                    jvmCtorArgs: [
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "USD",
                                        },
                                    ],
                                },
                            ],
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
                                            primitiveValue: "ParticipantA",
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "London",
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "GB",
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
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.algorithm,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.format,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyAPublicKey === null || partyAPublicKey === void 0 ? void 0 : partyAPublicKey.encoded,
                                        },
                                    ],
                                },
                            ],
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
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.algorithm,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.format,
                                        },
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: partyBPublicKey === null || partyBPublicKey === void 0 ? void 0 : partyBPublicKey.encoded,
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.Amount",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "long",
                                    },
                                    primitiveValue: 1,
                                },
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Reference,
                                    jvmType: {
                                        fqClassName: "java.util.Currency",
                                        constructorName: "getInstance",
                                    },
                                    jvmCtorArgs: [
                                        {
                                            jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                            jvmType: {
                                                fqClassName: "java.lang.String",
                                            },
                                            primitiveValue: "USD",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            jvmTypeKind: index_1.JvmTypeKind.Reference,
                            jvmType: {
                                fqClassName: "net.corda.core.contracts.UniqueIdentifier",
                            },
                            jvmCtorArgs: [
                                {
                                    jvmTypeKind: index_1.JvmTypeKind.Primitive,
                                    jvmType: {
                                        fqClassName: "java.lang.String",
                                    },
                                    primitiveValue: "7fc2161e-f8d0-4c86-a596-08326bdafd56",
                                },
                            ],
                        },
                    ],
                },
            ],
            timeoutMs: 60000,
            fake: 4,
        };
        try {
            await apiClient.invokeContractV1(req);
            t2.fail(`${fInvoke} - ${cInvalidParams}: should fail`);
        }
        catch (e) {
            t2.equal((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status, 400, "Invoke contract response status code === 400 OK");
        }
        t2.end();
    });
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFwaS12YWxpZGF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdGVzdC90eXBlc2NyaXB0L2ludGVncmF0aW9uL29wZW5hcGkvb3BlbmFwaS12YWxpZGF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2REFBK0M7QUFDL0MsNkNBQWlEO0FBRWpELDBFQUkwQztBQUUxQywwRUFHMEM7QUFFMUMsZ0dBVThFO0FBQzlFLGtFQUE2RDtBQUU3RCxNQUFNLFFBQVEsR0FBRyxnREFBZ0QsQ0FBQztBQUNsRSxNQUFNLFFBQVEsR0FBaUIsT0FBTyxDQUFDO0FBRXZDLGNBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDeEIsTUFBTSxnQ0FBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLGNBQUksRUFBQyxTQUFTLEdBQUcsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFPLEVBQUUsRUFBRTtJQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFBLGtEQUE0QixFQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ1YsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLGNBQUksRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQU8sRUFBRSxFQUFFO0lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUkscUNBQWUsQ0FBQztRQUNqQyxTQUFTLEVBQUUsNERBQTREO1FBQ3ZFLFlBQVksRUFBRSxzQkFBc0I7UUFDcEMsUUFBUTtLQUNULENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLGlDQUFpQyxDQUFD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