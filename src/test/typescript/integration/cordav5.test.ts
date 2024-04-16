// // import test, { Test } from "tape-promise/tape";
// import { v4 as uuidv4 } from "uuid";
// import { v4 as internalIpV4 } from "internal-ip";
// import "jest-extended";
// import { Config as SshConfig } from "node-ssh";
// import {
//   CordaV5TestLedger,
//   Containers,
//   pruneDockerAllIfGithubAction,
//   CordaConnectorContainer,
// } from "@hyperledger/cactus-test-tooling";

// import { IListenOptions, LogLevelDesc, LoggerProvider, Servers } from "@hyperledger/cactus-common";
// import {
//   PluginLedgerConnectorCorda,
//   CordaVersion,
// } from "../../../main/typescript/plugin-ledger-connector-corda";
// import {
//   DefaultApi as CordaApi,
//   FlowStatusV5Response,
// } from "../../../main/typescript/generated/openapi/typescript-axios/index";
// import axios, { AxiosRequestConfig } from "axios";

// const testCase = "Tests are passing on the JVM side";
// const logLevel: LogLevelDesc = "TRACE";

// import https from "https";
// import exp from "constants";
// import { check } from "yargs";
// import { response } from "express";
// import { interval } from "rxjs";
// import { extractShortHash } from "./../../../../../cactus-test-tooling/src/main/typescript/corda/corda-v5-test-ledger";
// import express from "express";
// import bodyParser from "body-parser";
// import { AddressInfo } from "net";
// import { Configuration } from "@hyperledger/cactus-core-api";

// describe(testCase, () => {
//   const expressApp = express();
//   expressApp.use(bodyParser.json({ limit: "250mb" }));
//   const server = https.createServer(expressApp);
//   const logLevel: LogLevelDesc = "TRACE";
//   const level = "INFO";
//   const label = "corda run flow transaction test";
//   const log = LoggerProvider.getOrCreate({ level, label });
//   const ledger = new CordaV5TestLedger();
//   let addressInfo,
//     address: string,
//     port: number,
//     apiHost,
//     apiConfig,
//     apiClient: CordaApi;
//   expect(ledger).toBeTruthy();
//   beforeAll(async () => {
//     const pruning = pruneDockerAllIfGithubAction({ logLevel });
//     await expect(pruning).resolves.toBeTruthy();
//   });
//   afterAll(async () => {
//     await ledger.stop();
//     await ledger.destroy();
//   });
//   afterAll(async () => await Servers.shutdown(server));

//   afterAll(async () => {
//     await Containers.logDiagnostics({ logLevel });
//   });
//   afterAll(async () => {
//     const pruning = pruneDockerAllIfGithubAction({ logLevel });
//     await expect(pruning).resolves.toBeTruthy();
//   });
//   beforeAll(async () => {
//     await ledger.start();
//     const listenOptions: IListenOptions = {
//       hostname: "127.0.0.1",
//       port: 0,
//       server,
//     };
//     addressInfo = (await Servers.listen(listenOptions)) as AddressInfo;
//     ({ address, port } = addressInfo);
//     apiHost = `http://${address}:${port}`;
//     apiConfig = new Configuration({ basePath: apiHost });
//     apiClient = new CordaApi(apiConfig);
//   });

//   test(testCase, async () => {
//     const sshConfig = await ledger.getSshConfig();
//     const plugin = new PluginLedgerConnectorCorda({
//       instanceId: uuidv4(),
//       sshConfigAdminShell: sshConfig,
//       corDappsDir: "",
//       logLevel,
//       cordaVersion: CordaVersion.CORDA_V5,
//       apiUrl: "https://127.0.0.1:8888",
//     });
//     await plugin.getOrCreateWebServices();
//     await plugin.registerWebServices(expressApp);
//     const customHttpsAgent = new https.Agent({
//       // Configure your custom settings here
//       rejectUnauthorized: false, // Example: Allow self-signed certificates (use with caution)
//     });
//   });
//   test("Endpoint Testing", async () => {
//     const container = ledger.getContainer();
//     const cmd = ["./gradlew", "listVNodes"];
//     const timeout = 180000; // 3 minutes
//     const cwd = "/CSDE-cordapp-template-kotlin";
//     let shortHashID = await Containers.exec(
//       container,
//       cmd,
//       timeout,
//       logLevel,
//       cwd,
//     );

//     let shortHashAlice = "";
//     let shortHashBob = "";
//     let shortHashCharlie = "";
//     let shortHashDave = "";

//     shortHashAlice = extractShortHash(shortHashID, "Alice");
//     expect(shortHashAlice).toBeTruthy();
//     expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(
//       /Short hash ID for Alice:/,
//     );
//     console.log(`Short hash ID for Alice: ${shortHashAlice}`);

//     shortHashBob = extractShortHash(shortHashID, "Bob");
//     expect(shortHashBob).toBeTruthy();
//     expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(
//       /Short hash ID for Bob:/,
//     );
//     console.log(`Short hash ID for Bob: ${shortHashBob}`);

//     shortHashCharlie = extractShortHash(shortHashID, "Charlie");
//     expect(typeof shortHashCharlie === "string").toBe(true);
//     expect(shortHashCharlie).toBeTruthy();
//     expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(
//       /Short hash ID for Charlie:/,
//     );
//     console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);

//     shortHashDave = extractShortHash(shortHashID, "Dave");
//     expect(shortHashDave).toBeTruthy();
//     expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(
//       /Short hash ID for Dave:/,
//     );
//     console.log(`Short hash ID for Dave: ${shortHashDave}`);
//     const listCPI = await apiClient.listCPIV1();
//     expect(listCPI).toBeTruthy();
//   });
// });
