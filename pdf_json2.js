import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import fs from "fs";

const loader = new PDFLoader("./data/ITGRT201802080221401430.pdf");

const docs = await loader.load();

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
	name: "extractor",
	description:
		"Extracts fields from the input. You MUST use all the value inside, DO NOT add any additional value or edit current value",
	inputType: "documents",
	parameters: {
		type: "object",
		properties: {
			기술명: {
				description: "Technology full name",
				type: "string",
			},
			"기술완성도(TLR)": {
				description: "Technology readiness level",
				type: "string",
			},
			기술요약: {
				description: "Technology summary",
				type: "string",
			},
			기술개요: {
				description: "Technology overview",
				type: "string",
			},
			"기술개발 현황": {
				description: "Technology development status",
				type: "string",
			},
			"기술의 우수성": {
				description: "Excellence of technology",
				type: "string",
			},
			"기술 적용(활용) 가능 분야": {
				type: "array",
				description: "Areas where technology can be applied (utilized)",
				items: {
					type: "string",
				},
			},
			"시장 현황": {
				type: "object",
				properties: {
					"세계시장 규모": {
						description: "World market size",
						type: "string",
					},
					"국내시장 규모": {
						description: "Domestic market size",
						type: "string",
					},
				},
			},
			"관련 지식재산권 현황": {
				type: "array",
				description: "Status of related intellectual property rights",
				items: {
					type: "object",
					properties: {
						"발명의 명칭": {
							description: "Full name of the invention",
							type: "string",
						},
						"특허 출원번호": {
							description: "Patent application number",
							type: "string",
						},
						"특허 등록번호": {
							description: "Patent registration number",
							type: "string",
						},
					},
				},
			},
			"기술 문의처": {
				type: "object",
				description: "Technology contact information",
				properties: {
					기술거래기관: {
						description: "Technology trading institution",
						type: "object",
						properties: {
							기관명: {
								description: "Name of the institution",
								type: "string",
							},
							이름: {
								description: "Name",
								type: "string",
							},
							부서: {
								description: "Department",
								type: "string",
							},
							직급: {
								description: "Position",
								type: "string",
							},
							연락처: {
								description: "Contact number",
								type: "string",
							},
							email: {
								description: "Email",
								type: "string",
							},
						},
					},
					연구자: {
						description: "Researcher",
						type: "object",
						properties: {
							기관명: {
								description: "Name of the institution",
								type: "string",
							},
							이름: {
								description: "Name",
								type: "string",
							},
							부서: {
								description: "Department",
								type: "string",
							},
							직급: {
								description: "Position",
								type: "string",
							},
							연락처: {
								description: "Contact number",
								type: "string",
							},
							email: {
								description: "Email",
								type: "string",
							},
						},
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

fs.writeFileSync("test2.json", JSON.stringify(result));
