"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import test, { Test } from "tape-promise/tape";
const uuid_1 = require("uuid");
require("jest-extended");
const cactus_test_tooling_1 = require("@hyperledger/cactus-test-tooling");
const cactus_common_1 = require("@hyperledger/cactus-common");
const plugin_ledger_connector_corda_1 = require("../../../main/typescript/plugin-ledger-connector-corda");
const index_1 = require("../../../main/typescript/generated/openapi/typescript-axios/index");
const logLevel = "TRACE";
const http_1 = __importDefault(require("http"));
const corda_v5_test_ledger_1 = require("./../../../../../cactus-test-tooling/src/main/typescript/corda/corda-v5-test-ledger");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cactus_core_api_1 = require("@hyperledger/cactus-core-api");
describe("Corda Setup", () => {
    const cordaV5TestLedger = new cactus_test_tooling_1.CordaV5TestLedger();
    test("On Failure", async () => {
        const logDiagnosticsSpy = jest.spyOn(cactus_test_tooling_1.Containers, "logDiagnostics");
    });
    expect(cordaV5TestLedger).toBeTruthy();
    let apiClient;
    const expressApp = (0, express_1.default)();
    const server = http_1.default.createServer(expressApp);
    let plugin;
    beforeAll(async () => {
        const pruning = (0, cactus_test_tooling_1.pruneDockerAllIfGithubAction)({ logLevel });
        await pruning;
        expressApp.use(body_parser_1.default.json({ limit: "250mb" }));
        const sshConfig = await cordaV5TestLedger.getSshConfig();
        plugin = new plugin_ledger_connector_corda_1.PluginLedgerConnectorCorda({
            instanceId: (0, uuid_1.v4)(),
            sshConfigAdminShell: sshConfig,
            corDappsDir: "",
            logLevel,
            cordaVersion: plugin_ledger_connector_corda_1.CordaVersion.CORDA_V5,
            apiUrl: "https://127.0.0.1:8888",
        });
        const listenOptions = {
            hostname: "127.0.0.1",
            port: 0,
            server,
        };
        const addressInfo = (await cactus_common_1.Servers.listen(listenOptions));
        const { address, port } = addressInfo;
        const apiHost = `http://${address}:${port}`;
        const config = new cactus_core_api_1.Configuration({ basePath: apiHost });
        // await plugin.getOrCreateWebServices();
        await plugin.registerWebServices(expressApp);
        apiClient = new index_1.DefaultApi(config);
    });
    test("can get past logs of an account", async () => {
        await cordaV5TestLedger.start();
        expect(cordaV5TestLedger).toBeTruthy();
    });
    afterAll(async () => {
        await cordaV5TestLedger.stop();
        await cordaV5TestLedger.destroy();
        await cactus_common_1.Servers.shutdown(server);
    });
    let shortHashID;
    it("Get container", async () => {
        const container = cordaV5TestLedger.getContainer();
        const cmd = ["./gradlew", "listVNodes"];
        const timeout = 180000; // 3 minutes
        const cwd = "/CSDE-cordapp-template-kotlin";
        shortHashID = await cactus_test_tooling_1.Containers.exec(container, cmd, timeout, logLevel, cwd);
    });
    describe("Endpoint Testing", () => {
        let shortHashAlice = "";
        let shortHashBob = "";
        let shortHashCharlie = "";
        let shortHashDave = "";
        it("Extract short hash for Alice", () => {
            shortHashAlice = (0, corda_v5_test_ledger_1.extractShortHash)(shortHashID, "Alice");
            expect(shortHashAlice).toBeTruthy();
            expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(/Short hash ID for Alice:/);
            console.log(`Short hash ID for Alice: ${shortHashAlice}`);
        });
        it("Extract short hash for Bob", () => {
            shortHashBob = (0, corda_v5_test_ledger_1.extractShortHash)(shortHashID, "Bob");
            expect(shortHashBob).toBeTruthy();
            expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(/Short hash ID for Bob:/);
            console.log(`Short hash ID for Bob: ${shortHashBob}`);
        });
        it("Extract short hash for Charlie", () => {
            shortHashCharlie = (0, corda_v5_test_ledger_1.extractShortHash)(shortHashID, "Charlie");
            expect(typeof shortHashCharlie === "string").toBe(true);
            expect(shortHashCharlie).toBeTruthy();
            expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(/Short hash ID for Charlie:/);
            console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);
        });
        it("Extract short hash for Dave", () => {
            shortHashDave = (0, corda_v5_test_ledger_1.extractShortHash)(shortHashID, "Dave");
            expect(shortHashDave).toBeTruthy();
            expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(/Short hash ID for Dave:/);
            console.log(`Short hash ID for Dave: ${shortHashDave}`);
        });
        it("CPI test", async () => {
            const listCPI = await apiClient.listCPIV1();
            expect(listCPI).toBeTruthy();
        });
        it("StartFlow test", async () => {
            const request = {
                clientRequestId: "test-1",
                flowClassName: "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
                requestBody: {
                    chatName: "Test-1",
                    otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
                    message: "Testing",
                    numberOfRecords: "1",
                },
            };
            console.log("checking shorthash " + shortHashCharlie);
            const startflow = await apiClient.startFlowV1(request);
            expect(startflow).toBeTruthy();
            // const test1Response = await pollEndpointUntilCompleted(
            //   shortHashCharlie,
            //   "test-1",
            // );
            // expect(test1Response).toBeTruthy();
        });
        // test("Simulate conversation between Alice and Bob", async () => {
        //   //1. Alice creates a new chat
        //   const aliceCreateChat = {
        //     clientRequestId: "create-1",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
        //     requestBody: {
        //       chatName: "Chat with Bob",
        //       otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
        //       message: "Hello Bob",
        //     },
        //   };
        //   let startflowChat = await apiClient.startFlowParameters(
        //     shortHashAlice,
        //     aliceCreateChat,
        //   );
        //   expect(startflowChat).toBeTruthy();
        //   const aliceCreateResponse = await pollEndpointUntilCompleted(
        //     shortHashAlice,
        //     "create-1",
        //   );
        //   expect(aliceCreateResponse).toBeTruthy();
        //   //2. Bob lists his chats
        //   const bobListChats = {
        //     clientRequestId: "list-1",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
        //     requestBody: {},
        //   };
        //   startflowChat = await apiClient.startFlowParameters(
        //     shortHashBob,
        //     bobListChats,
        //   );
        //   expect(startflowChat).toBeTruthy();
        //   const flowData = await pollEndpointUntilCompleted(shortHashBob, "list-1");
        //   expect(flowData).toBeTruthy();
        //   const flowResult =
        //     flowData !== null && flowData !== undefined
        //       ? flowData.flowResult
        //       : null;
        //   const chatWithBobId = (() => {
        //     if (typeof flowResult === "string") {
        //       const parseFlowResult = JSON.parse(flowResult);
        //       const chatWithBobObj = parseFlowResult.find(
        //         (item: { chatName: string }) => item.chatName === "Chat with Bob",
        //       );
        //       return chatWithBobObj && "id" in chatWithBobObj
        //         ? chatWithBobObj.id
        //         : undefined;
        //     }
        //   })();
        //   // //3. Bob updates chat twice
        //   const bobUpdate1 = {
        //     clientRequestId: "update-1",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        //     requestBody: {
        //       id: chatWithBobId,
        //       message: "Hi Alice",
        //     },
        //   };
        //   await apiClient.startFlowParameters(shortHashBob, bobUpdate1);
        //   const bobUpdate1Response = await pollEndpointUntilCompleted(
        //     shortHashBob,
        //     "update-1",
        //   );
        //   expect(bobUpdate1Response).toBeTruthy();
        //   const bobUpdate2 = {
        //     clientRequestId: "update-2",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        //     requestBody: {
        //       id: chatWithBobId,
        //       message: "How are you today?",
        //     },
        //   };
        //   await apiClient.startFlowParameters(shortHashBob, bobUpdate2);
        //   const bobUpdate2Response = await pollEndpointUntilCompleted(
        //     shortHashBob,
        //     "update-2",
        //   );
        //   expect(bobUpdate2Response).toBeTruthy();
        //   //4. Alice lists chat
        //   const aliceListsChat = {
        //     clientRequestId: "list-2",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
        //     requestBody: {},
        //   };
        //   await apiClient.startFlowParameters(shortHashAlice, aliceListsChat);
        //   const aliceList2Response = await pollEndpointUntilCompleted(
        //     shortHashAlice,
        //     "list-2",
        //   );
        //   expect(aliceList2Response).toBeTruthy();
        //   //5. Alice checks the history of the chat with Bob
        //   const aliceHistoryRequest = {
        //     clientRequestId: "get-1",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
        //     requestBody: {
        //       id: chatWithBobId,
        //       numberOfRecords: "4",
        //     },
        //   };
        //   await apiClient.startFlowParameters(shortHashAlice, aliceHistoryRequest);
        //   const aliceHistoryResponse = await pollEndpointUntilCompleted(
        //     shortHashAlice,
        //     "get-1",
        //   );
        //   expect(aliceHistoryResponse).toBeTruthy();
        //   //6. Alice replies to Bob
        //   const aliceReply = {
        //     clientRequestId: "update-4",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        //     requestBody: {
        //       id: chatWithBobId,
        //       message: "I am very well thank you",
        //     },
        //   };
        //   await apiClient.startFlowParameters(shortHashAlice, aliceReply);
        //   const aliceReplyResponse = await pollEndpointUntilCompleted(
        //     shortHashAlice,
        //     "update-4",
        //   );
        //   expect(aliceReplyResponse).toBeTruthy();
        //   //7. Bob gets the chat history
        //   const bobHistoryRequest = {
        //     clientRequestId: "get-2",
        //     flowClassName:
        //       "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
        //     requestBody: {
        //       id: chatWithBobId,
        //       numberOfRecords: "2",
        //     },
        //   };
        //   await apiClient.startFlowParameters(shortHashBob, bobHistoryRequest);
        //   const bobHistoryResponse = await pollEndpointUntilCompleted(
        //     shortHashBob,
        //     "get-2",
        //   );
        //   expect(bobHistoryResponse).toBeTruthy();
        // });
        // describe("Negative Testing", () => {
        //   it("Invalid username and password", async () => {
        //     const apiUrl = "https://127.0.0.1:8888";
        //     const username = "invalidUsername";
        //     const password = "invalidPassword";
        //     const axiosConfig: AxiosRequestConfig = {
        //       baseURL: apiUrl,
        //       headers: {
        //         Authorization: `Basic ${Buffer.from(
        //           `${username}:${password}`,
        //           "base64",
        //         )}`,
        //       },
        //     };
        //     const axiosInstance = axios.create(axiosConfig);
        //     const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
        //     try {
        //       await apiClient.listCPIV1();
        //       fail("Expected an error for unauthorized access but it succeeded.");
        //     } catch (error) {
        //       expect(error).toBeDefined();
        //       expect(error.message).toContain("Invalid");
        //     }
        //   });
        //   it("Negative Test, invalid flow class name", async () => {
        //     const invalidFlowName = "nonExistentFlow";
        //     const shortHash = shortHashBob;
        //     const request = {
        //       clientRequestId: "test-1",
        //       flowClassName: invalidFlowName,
        //       requestBody: {
        //         chatName: "Test-1",
        //         otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
        //         message: "Testing",
        //       },
        //     };
        //     try {
        //       await apiClient.startFlowParameters(shortHash, request);
        //       fail("Expected an error for unauthorized access but it succeeded.");
        //     } catch (error) {
        //       expect(error).toBeDefined();
        //       expect(error.message).toContain("Request failed");
        //     }
        //   });
        // });
    });
    // async function pollEndpointUntilCompleted(
    //   shortHash: string,
    //   chatName: string,
    //   interval = 5000,
    //   maxAttempts = 10,
    // ) {
    //   return new Promise<FlowStatusV5Response>(async (resolve, reject) => {
    //     let attempts = 0;
    //     async function poll() {
    //       attempts++;
    //       try {
    //         const response = await apiClient.flowStatusResponse(
    //           shortHash,
    //           chatName,
    //         );
    //         if (response.status === 200) {
    //           if (response.data.flowStatus === "COMPLETED") {
    //             resolve(response.data);
    //           } else {
    //             setTimeout(poll, interval);
    //           }
    //         } else if (attempts < maxAttempts) {
    //           setTimeout(poll, interval);
    //         } else {
    //           reject(
    //             new Error(
    //               `Max attempts (${maxAttempts}) reached. Unable to get status 200.`,
    //             ),
    //           );
    //         }
    //       } catch (error) {
    //         setTimeout(poll, interval);
    //       }
    //     }
    //     poll();
    //   });
    // }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamVzdC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9qZXN0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBa0Q7QUFDbEQsK0JBQW9DO0FBQ3BDLHlCQUF1QjtBQUN2QiwwRUFJMEM7QUFFMUMsOERBSW9DO0FBQ3BDLDBHQUdnRTtBQUNoRSw2RkFHMkU7QUFFM0UsTUFBTSxRQUFRLEdBQWlCLE9BQU8sQ0FBQztBQUV2QyxnREFBd0I7QUFDeEIsOEhBQXVIO0FBQ3ZILHNEQUE4QjtBQUM5Qiw4REFBcUM7QUFFckMsa0VBQTZEO0FBRTdELFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSx1Q0FBaUIsRUFBRSxDQUFDO0lBQ2xELElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDNUIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRSxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3ZDLElBQUksU0FBcUIsQ0FBQztJQUMxQixNQUFNLFVBQVUsR0FBRyxJQUFBLGlCQUFPLEdBQUUsQ0FBQztJQUM3QixNQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLElBQUksTUFBa0MsQ0FBQztJQUN2QyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBQSxrREFBNEIsRUFBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0QsTUFBTSxPQUFPLENBQUM7UUFDZCxVQUFVLENBQUMsR0FBRyxDQUFDLHFCQUFVLENBQUMsSUFBSSxD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