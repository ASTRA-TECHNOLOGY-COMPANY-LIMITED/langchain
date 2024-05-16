import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import fs from "fs";

const loader = new PDFLoader("./data/ITGRT201412040937427430.pdf");

const docs = await loader.load();

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
	name: "extractor",
	description:
		"Extracts fields from the input. You MUST use all the value inside, DO NOT add any additional value or edit current value",
	parameters: {
		type: "object",
		properties: {
			구분: { description: "Division", type: "string" },
			"기술 준비도 (TRL)": {
				description: "Technology readiness",
				type: "string",
			},
			목적: { description: "Purpose", type: "string" },
			연구자: { description: "Researcher name", type: "string" },
			소속: { description: "Location of this research", type: "string" },
			주요연구분야: { description: "Main research area", type: "string" },
			연락처: {
				type: "object",
				properties: {
					Tel: { description: "Phone number", type: "string" },
					"E-mail": { description: "Email", type: "string" },
				},
			},
			"기술 개요": {
				type: "object",
				description:
					"Technologies overview, separate each line by sentences, an overview can only contain 1 sentence, also may include figure name. If so, please add all figure names you see.",
				properties: {
					l1: {
						description: "Technologies overview 1.",
						type: "string",
					},
					l2: {
						description: "Technologies overview 2.",
						type: "string",
					},
					"l...": {
						description: "More technologies overviews",
					},
					"그림 1": { description: "Figure 1 name", type: "string" },
					"그림 2": { description: "Figure 2 name", type: "string" },
					"그림 ...": {
						description: "More figure names",
					},
				},
			},
			"기술적인 차별성": {
				type: "object",
				description:
					"Technological differentiation. Or comparison. Please add all differentiation you see",
				example: {},
				properties: {
					"①": { description: "Differentiation 1", type: "string" },
					"...": {
						description: "...",
					},
				},
			},
			"관련 지적재산권": {
				type: "array",
				description: "Related intellectual property rights",
				items: {
					type: "object",
					properties: {
						"No.": { description: "Number", type: "number" },
						출원국가: { description: "Country of application", type: "string" },
						우선일: { description: "Priority date", type: "string" },
						출원번호: {
							description: "Application number. Example: 2012-0015832",
							type: "string",
						},
						"발명의 명칭": {
							description: "Title of the invention",
							type: "string",
						},
					},
				},
			},
			"연구 논문": {
				type: "array",
				description: "Related research papers",
				items: {
					type: "object",
					properties: {
						"No.": { description: "Number", type: "number" },
						논문명: { description: "Name of the paper", type: "string" },
						게재지: { description: "Publisher", type: "string" },
						연구결과: { description: "Research results", type: "string" },
					},
				},
			},
		},
	},
};

// Instantiate the ChatOpenAI class
const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });

// Create a new runnable, bind the function to the model, and pipe the output through the parser
const runnable = model
	.bind({
		functions: [extractionFunctionSchema],
		function_call: {
			name: "extractor",
		},
	})
	.pipe(parser);

// Convert the docs array to an array of strings
const docsContent = docs.map((doc) => doc.pageContent);

// Invoke the runnable with an input
const result = await runnable.invoke(docsContent);

fs.writeFileSync("test1.json", JSON.stringify(result));
