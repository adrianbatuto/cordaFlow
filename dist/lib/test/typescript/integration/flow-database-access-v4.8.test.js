"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape-promise/tape"));
const internal_ip_1 = require("internal-ip");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_test_tooling_2 = require("@hyperledger/cactus-test-tooling");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
const testCase = "Tests are passing on the JVM side";
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
        imageName: "ghcr.io/hyperledger/cactus-corda-4-8-all-in-one-flowdb",
        imageVersion: "2021-11-23--feat-1493",
        logLevel,
    });
    t.ok(ledger, "CordaTestLedger v4.8 instantaited OK");
    tape_1.default.onFinish(async () => {
        await ledger.stop();
        await ledger.destroy();
        await (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
    });
    const ledgerContainer = await ledger.start();
    t.ok(ledgerContainer, "CordaTestLedger v4.8 container truthy post-start() OK");
    await ledger.logDebugPorts();
    const partyARpcPort = await ledger.getRpcAPublicPort();
    const jarFiles = await ledger.pullCordappJars("BASIC_FLOW" /* SampleCordappEnum.BASIC_FLOW */);
    t.comment(`Fetched ${jarFiles.length} cordapp jars OK`);
    const internalIpOrUndefined = await (0, internal_ip_1.v4)();
    t.ok(internalIpOrUndefined, "Determined LAN IPv4 address successfully OK");
    const internalIp = internalIpOrUndefined;
    t.comment(`Internal IP (based on default gateway): ${internalIp}`);
    const partyARpcUsername = "user1";
    const partyARpcPassword = "password";
    const springAppConfig = {
        logging: {
            level: {
                root: "INFO",
                "net.corda": "INFO",
                "org.hyperledger.cactus": "DEBUG",
            },
        },
        cactus: {
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
    const flowsRes = await apiClient.listFlowsV1();
    t.ok(flowsRes.status === 200, "flowsRes.status === 200 OK");
    t.ok(flowsRes.data, "flowsRes.data truthy OK");
    t.ok(flowsRes.data.flowNames, "flowsRes.data.flowNames truthy OK");
    t.comment(`apiClient.listFlowsV1() => ${JSON.stringify(flowsRes.data)}`);
    const cordappDeploymentConfigs = [];
    const depReq = {
        jarFiles,
        cordappDeploymentConfigs,
    };
    const depRes = await apiClient.deployContractJarsV1(depReq);
    t.ok(depRes, "Jar deployment response truthy OK");
    t.equal(depRes.status, 200, "Jar deployment status code === 200 OK");
    t.ok(depRes.data, "Jar deployment response body truthy OK");
    t.ok(depRes.data.deployedJarFiles, "Jar deployment body deployedJarFiles OK");
    t.equal(depRes.data.deployedJarFiles.length, jarFiles.length, "Deployed jar file count equals count in request OK");
    const myToken = "myToken";
    const initialValue = 42;
    const finalValue = 11;
    // add a new token value
    const reqAdd = {
        timeoutMs: 60000,
        flowFullClassName: "net.corda.samples.flowdb.AddTokenValueFlow",
        flowInvocationType: index_1.FlowInvocationType.FlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.String",
                },
                primitiveValue: myToken,
            },
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.Integer",
                },
                primitiveValue: initialValue,
            },
        ],
    };
    const resAdd = await apiClient.invokeContractV1(reqAdd);
    t.ok(resAdd, "InvokeContractV1Request truthy OK");
    t.equal(resAdd.status, 200, "InvokeContractV1Request status code === 200 OK");
    // query a token value
    const reqQuery = {
        timeoutMs: 60000,
        flowFullClassName: "net.corda.samples.flowdb.QueryTokenValueFlow",
        flowInvocationType: index_1.FlowInvocationType.FlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.String",
                },
                primitiveValue: myToken,
            },
        ],
    };
    const resQuery = await apiClient.invokeContractV1(reqQuery);
    t.ok(resQuery, "InvokeContractV1Request truthy OK");
    t.equal(resQuery.status, 200, "InvokeContractV1Request status code === 200 OK");
    t.equal(resQuery.data.callOutput, initialValue.toString(), "token value is equal to initialValue OK");
    // update a token value
    const reqUpd = {
        timeoutMs: 60000,
        flowFullClassName: "net.corda.samples.flowdb.UpdateTokenValueFlow",
        flowInvocationType: index_1.FlowInvocationType.FlowDynamic,
        params: [
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.String",
                },
                primitiveValue: myToken,
            },
            {
                jvmTypeKind: index_1.JvmTypeKind.Primitive,
                jvmType: {
                    fqClassName: "java.lang.Integer",
                },
                primitiveValue: finalValue,
            },
        ],
    };
    const resUpd = await apiClient.invokeContractV1(reqUpd);
    t.ok(resUpd, "InvokeContractV1Request truthy OK");
    t.equal(resUpd.status, 200, "InvokeContractV1Request status code === 200 OK");
    // query a token value
    const resQueryFinal = await apiClient.invokeContractV1(reqQuery);
    t.ok(resQueryFinal, "InvokeContractV1Request truthy OK");
    t.equal(resQueryFinal.status, 200, "InvokeContractV1Request status code === 200 OK");
    t.equal(resQueryFinal.data.callOutput, finalValue.toString(), "token value is equal to finalValue OK");
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvdy1kYXRhYmFzZS1hY2Nlc3MtdjQuOC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9mbG93LWRhdGFiYXNlLWFjY2Vzcy12NC44LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2REFBK0M7QUFDL0MsNkNBQWlEO0FBRWpELDBFQUkwQztBQUUxQywwRUFHMEM7QUFFMUMsNkZBTzJFO0FBQzNFLGtFQUE2RDtBQUU3RCxNQUFNLFFBQVEsR0FBRyxtQ0FBbUMsQ0FBQztBQUNyRCxNQUFNLFFBQVEsR0FBaUIsT0FBTyxDQUFDO0FBRXZDLGNBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDeEIsTUFBTSxnQ0FBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLGNBQUksRUFBQyxTQUFTLEdBQUcsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFPLEVBQUUsRUFBRTtJQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFBLGtEQUE0QixFQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ1YsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFBLGNBQUksRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQU8sRUFBRSxFQUFFO0lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUkscUNBQWUsQ0FBQztRQUNqQyxTQUFTLEVBQUUsd0RBQXdEO1FBQ25FLFlBQVksRUFBRSx1QkFBdUI7UUFDckMsUUFBUTtLQUNULENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLHNDQUFzQyxD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