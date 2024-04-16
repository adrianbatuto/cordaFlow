"use strict";
// import test, { Test } from "tape-promise/tape";
// import { v4 as uuidv4 } from "uuid";
// import "jest-extended";
// import {
//   CordaV5TestLedger,
//   Containers,
//   pruneDockerAllIfGithubAction,
// } from "@hyperledger/cactus-test-tooling";
// import { LogLevelDesc } from "@hyperledger/cactus-common";
// import {
//   PluginLedgerConnectorCorda,
//   CordaVersion,
// } from "../../../main/typescript/plugin-ledger-connector-corda";
// import { DefaultApi } from "../../../main/typescript/generated/openapi/typescript-axios/index";
// import axios, { AxiosRequestConfig } from "axios";
// const testCase = "Tests are passing on the JVM side";
// const logLevel: LogLevelDesc = "TRACE";
// import https from "https";
// test.onFailure(async () => {
//   await Containers.logDiagnostics({ logLevel });
// });
// test("BEFORE " + testCase, async (t: Test) => {
//   const pruning = pruneDockerAllIfGithubAction({ logLevel });
//   await t.doesNotReject(pruning, "Pruning didn't throw OK");
//   t.end();
// });
// test("can get past logs of an account", async (t: Test) => {
//   const logLevel: LogLevelDesc = "TRACE";
//   const cordaV5TestLedger = new CordaV5TestLedger();
//   await cordaV5TestLedger.start();
//   t.ok(cordaV5TestLedger, "cordaV5TestLedger started OK");
//   test.onFinish(async () => {
//     await cordaV5TestLedger.stop();
//     await cordaV5TestLedger.destroy();
//   });
//   const sshConfig = await cordaV5TestLedger.getSshConfig();
//   const connector: PluginLedgerConnectorCorda = new PluginLedgerConnectorCorda({
//     instanceId: uuidv4(),
//     sshConfigAdminShell: sshConfig,
//     corDappsDir: "",
//     logLevel,
//     cordaVersion: CordaVersion.CORDA_V5,
//     apiUrl: "https://127.0.0.1:8888",
//   });
//   const apiUrl = "https://127.0.0.1:8888";
//   await connector.getOrCreateWebServices();
//   const customHttpsAgent = new https.Agent({
//     // Configure your custom settings here
//     rejectUnauthorized: false, // Example: Allow self-signed certificates (use with caution)
//   });
//   const username = "admin";
//   const password = "admin";
//   const axiosConfig: AxiosRequestConfig = {
//     baseURL: apiUrl,
//     headers: {
//       Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
//         "base64",
//       )}`,
//     },
//     httpsAgent: customHttpsAgent,
//   };
//   const axiosInstance = axios.create(axiosConfig);
//   const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
//   const container = cordaV5TestLedger.getContainer();
//   const cmd = ["./gradlew", "listVNodes"];
//   const timeout = 180000; // 3 minutes
//   const cwd = "/CSDE-cordapp-template-kotlin";
//   const shortHashID = await Containers.exec(
//     container,
//     cmd,
//     timeout,
//     logLevel,
//     cwd,
//   );
//   function extractShortHash(name: string) {
//     const regex = new RegExp(`MyCorDapp\\s*([A-Z0-9]*)\\s*CN=${name}`);
//     const match = shortHashID.match(regex);
//     if (match) {
//       return match[1];
//     } else {
//       return "err";
//     }
//   }
//   const shortHashBob = extractShortHash("Bob");
//   t.ok(shortHashBob, `Short hash ID for Bob: ${shortHashBob}`);
//   const shortHashDave = extractShortHash("Dave");
//   t.ok(shortHashDave, `Short hash ID for Dave: ${shortHashDave}`);
//   const shortHashCharlie = extractShortHash("Charlie");
//   t.ok(shortHashCharlie, `Short hash ID for Charlie: ${shortHashCharlie}`);
//   const shortHashAlice = extractShortHash("Alice");
//   t.ok(shortHashAlice, `Short hash ID for Alice: ${shortHashAlice}`);
//   const request = {
//     clientRequestId: "test-1",
//     flowClassName:
//       "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
//     requestBody: {
//       chatName: "Test-1",
//       otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
//       message: "Testing",
//     },
//   };
//   const listCPI = await apiClient.listCPIV1();
//   t.ok(listCPI, "getCPIResponse truthy OK");
//   const startflow = await apiClient.startFlowParameters(
//     shortHashCharlie,
//     request,
//   );
//   t.ok(startflow.status, "startFlowParameters endpoint OK");
//   await waitProcess(5);
//   await waitForStatusChange(shortHashCharlie, "test-1");
//   const checkflow = await apiClient.flowStatusResponse(
//     shortHashCharlie,
//     "test-1",
//   );
//   t.ok(checkflow.status, "flowStatusResponse endpoint OK");
//   t.equal(checkflow.data.flowStatus, "COMPLETED", "flowStatus is COMPLETED");
//   t.equal(checkflow.data.flowError, null, "flowError should be null");
//   // Follow the flow as per https://docs.r3.com/en/platform/corda/5.0/developing-applications/getting-started/utxo-ledger-example-cordapp/running-the-chat-cordapp.html
//   test("Simulate a conversation between Alice and Bob", async (t) => {
//     //1. Alice creates a new chat
//     const aliceCreateChat = {
//       clientRequestId: "create-1",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
//       requestBody: {
//         chatName: "Chat with Bob",
//         otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
//         message: "Hello Bob",
//       },
//     };
//     let startflowChat = await apiClient.startFlowParameters(
//       shortHashAlice,
//       aliceCreateChat,
//     );
//     t.ok(startflowChat.status, "startflowChat OK");
//     await waitProcess(5);
//     const checkflow = await apiClient.flowStatusResponse(
//       shortHashAlice,
//       "create-1",
//     );
//     t.ok(checkflow.status, "flowStatusResponse OK");
//     await waitForStatusChange(shortHashAlice, "create-1");
//     //2. Bob lists his chats
//     const bobListChats = {
//       clientRequestId: "list-1",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
//       requestBody: {},
//     };
//     startflowChat = await apiClient.startFlowParameters(
//       shortHashBob,
//       bobListChats,
//     );
//     await waitProcess(10);
//     const flowData = await waitForStatusChange(shortHashBob, "list-1");
//     const flowResult =
//       flowData !== null && flowData !== undefined ? flowData.flowResult : null;
//     const chatWithBobId = (() => {
//       if (typeof flowResult === "string") {
//         const parseFlowResult = JSON.parse(flowResult);
//         const chatWithBobObj = parseFlowResult.find(
//           (item: { chatName: string }) => item.chatName === "Chat with Bob",
//         );
//         return chatWithBobObj && "id" in chatWithBobObj
//           ? chatWithBobObj.id
//           : undefined;
//       }
//     })();
//     //3. Bob updates chat twice
//     const bobUpdate1 = {
//       clientRequestId: "update-1",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//       requestBody: {
//         id: chatWithBobId,
//         message: "Hi Alice",
//       },
//     };
//     await apiClient.startFlowParameters(shortHashBob, bobUpdate1);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashBob, "update-1");
//     const bobUpdate2 = {
//       clientRequestId: "update-2",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//       requestBody: {
//         id: chatWithBobId,
//         message: "How are you today?",
//       },
//     };
//     await apiClient.startFlowParameters(shortHashBob, bobUpdate2);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashBob, "update-2");
//     //4. Alice lists chat
//     const aliceListsChat = {
//       clientRequestId: "list-2",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
//       requestBody: {},
//     };
//     await apiClient.startFlowParameters(shortHashAlice, aliceListsChat);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashAlice, "list-2");
//     //5. Alice checks the history of the chat with Bob
//     const aliceHistoryRequest = {
//       clientRequestId: "get-1",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
//       requestBody: {
//         id: chatWithBobId,
//         numberOfRecords: "4",
//       },
//     };
//     await apiClient.startFlowParameters(shortHashAlice, aliceHistoryRequest);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashAlice, "get-1");
//     //6. Alice replies to Bob
//     const aliceReply = {
//       clientRequestId: "update-4",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
//       requestBody: {
//         id: chatWithBobId,
//         message: "I am very well thank you",
//       },
//     };
//     await apiClient.startFlowParameters(shortHashAlice, aliceReply);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashAlice, "update-4");
//     //7. Bob gets the chat history
//     const bobHistoryRequest = {
//       clientRequestId: "get-2",
//       flowClassName:
//         "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
//       requestBody: {
//         id: chatWithBobId,
//         numberOfRecords: "2",
//       },
//     };
//     await apiClient.startFlowParameters(shortHashBob, bobHistoryRequest);
//     await waitProcess(5);
//     await waitForStatusChange(shortHashBob, "get-2");
//   });
//   test("Negative Test, invalid flow class name", async (t: Test) => {
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
//       t.fail("Expected an error for an invalid flow name but it succeeded.");
//     } catch (error) {
//       t.pass("Failed as expected for an invalid flow name.");
//     }
//   });
//   test("Negative Test, invalid username and password ", async (t: Test) => {
//     const apiUrl = "https://127.0.0.1:8888";
//     const username = "invalidUsername";
//     const password = "invalidPassword";
//     const axiosConfig: AxiosRequestConfig = {
//       baseURL: apiUrl,
//       headers: {
//         Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
//           "base64",
//         )}`,
//       },
//     };
//     const axiosInstance = axios.create(axiosConfig);
//     const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
//     try {
//       await apiClient.listCPIV1();
//       t.fail("Expected an error for unauthorized access but it succeeded.");
//     } catch (error) {
//       t.pass("Failed as expected for unauthorized access.");
//     }
//   });
//   // function to wait for the status to change to COMPLETED
//   async function waitForStatusChange(shortHash: string, flowName: string) {
//     try {
//       let checkFlowObject = await apiClient.flowStatusResponse(
//         shortHash,
//         flowName,
//       );
//       if (checkFlowObject.data.flowStatus === "COMPLETED") {
//         return checkFlowObject.data;
//       } else if (checkFlowObject.data.flowStatus === "RUNNING") {
//         await new Promise((resolve) => setTimeout(resolve, 20000));
//         await waitForStatusChange(shortHash, flowName);
//       }
//     } catch (error) {
//       console.error(
//         "An error occurred while waiting for status change:",
//         error,
//       );
//     }
//   }
//   //Function to add a delay
//   function waitProcess(seconds: number) {
//     return new Promise<void>((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, seconds * 1000);
//     });
//   }
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZGEtdjUtZmxvdy10ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rlc3QvdHlwZXNjcmlwdC9pbnRlZ3JhdGlvbi9jb3JkYS12NS1mbG93LXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtEQUFrRDtBQUNsRCx1Q0FBdUM7QUFDdkMsMEJBQTBCO0FBRTFCLFdBQVc7QUFDWCx1QkFBdUI7QUFDdkIsZ0JBQWdCO0FBQ2hCLGtDQUFrQztBQUNsQyw2Q0FBNkM7QUFFN0MsNkRBQTZEO0FBQzdELFdBQVc7QUFDWCxnQ0FBZ0M7QUFDaEMsa0JBQWtCO0FBQ2xCLG1FQUFtRTtBQUNuRSxrR0FBa0c7QUFDbEcscURBQXFEO0FBRXJELHdEQUF3RDtBQUN4RCwwQ0FBMEM7QUFFMUMsNkJBQTZCO0FBRTdCLCtCQUErQjtBQUMvQixtREFBbUQ7QUFDbkQsTUFBTTtBQUVOLGtEQUFrRDtBQUNsRCxnRUFBZ0U7QUFDaEUsK0RBQStEO0FBQy9ELGFBQWE7QUFDYixNQUFNO0FBRU4sK0RBQStEO0FBQy9ELDRDQUE0QztBQUM1Qyx1REFBdUQ7QUFDdkQscUNBQXFDO0FBQ3JDLDZEQUE2RDtBQUU3RCxnQ0FBZ0M7QUFDaEMsc0NBQXNDO0FBQ3RDLHlDQUF5QztBQUN6QyxRQUFRO0FBQ1IsOERBQThEO0FBQzlELG1GQUFtRjtBQUNuRiw0QkFBNEI7QUFDNUIsc0NBQXNDO0FBQ3RDLHVCQUF1QjtBQUN2QixnQkFBZ0I7QUFDaEIsMkNBQTJDO0FBQzNDLHdDQUF3QztBQUN4QyxRQUFRO0FBQ1IsNkNBQTZDO0FBRTdDLDhDQUE4QztBQUU5QywrQ0FBK0M7QUFDL0MsNkNBQTZDO0FBQzdDLCtGQUErRjtBQUMvRixRQUFRO0FBRVIsOEJBQThCO0FBQzlCLDhCQUE4QjtBQUM5Qiw4Q0FBOEM7QUFDOUMsdUJBQXVCO0FBQ3ZCLGlCQUFpQjtBQUNqQixpRkFBaUY7QUFDakYsb0JBQW9CO0FBQ3BCLGFBQWE7QUFDYixT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