import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import fs from "fs";

const file = process.argv[2];
if (!file) throw new Error("Please provide a file path");

const outputFlag = process.argv[3];
if (outputFlag !== "-o")
	console.log(
		"No output file path provided, will output to test.json as default"
	);
const output = outputFlag === "-o" ? process.argv[4] : "test.json";

const loader = new PDFLoader(file);

const docs = await loader.load();

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
	name: "extractor",
	description:
		"Extracts fields from the input. You MUST use all the value inside, DO NOT add any additional value or edit current value. DO NOT remove any fields in the template. If field does not match, leave it null value, DO NOT remove the field or add extra text",
	parameters: {
		type: "object",
		properties: {
			기술명: {
				description:
					"Technology full name. Example: 산업용 비파괴측정용 고속 테라헤르츠영상시스템",
				type: "string",
			},
			구분: {
				description: "Classfication. Example: 주요연구분야",
				type: "string",
			},
			"기술 준비도 (TRL)": {
				description:
					"Technology readiness level. Example: Level 4 : 실험실 규모의 소재/부품/시스템 핵심성능 평가",
				type: "string",
			},
			목적: {
				description:
					"Purpose. Example: 특허이전, 기술·노하우 이전, 후속과제연계기타",
				type: "string",
			},
			기술개요: {
				description:
					"Technology overview. Example: 분광 이미징 가능한 국산화된 모듈...",
				type: "string",
			},
			기술요약: {
				description:
					"Technology summary. Example: 주파수가변테라헤르츠연속파를이용한분광이미징시스템으로...",
				type: "string",
			},
			"기술개발 현황": {
				description:
					"Technology development status. Example: 기존 기술은 크기가 크고 가격이 비쌈",
				type: "string",
			},
			"기술의 우수성": {
				description:
					"Excellence of technology. Example: 펄스 기반 시스템과 달리 수초...",
				type: "string",
			},
			"기술 적용(활용) 가능 분야": {
				type: "array",
				description: "Areas where technology can be applied (utilized)",
				items: {
					description: "Example: 식품 이물질 탐지",
					type: "string",
				},
			},
			"시장 현황": {
				type: "object",
				properties: {
					"세계시장 규모": {
						description:
							"World market size. Example: 2015년 90억 7,000만 달러 -> 2020년 113억 달러",
						type: "string",
					},
					"국내시장 규모": {
						description:
							"Domestic market size. Example: 2015년 3,373억 원 -> 2020년 4,576억원",
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
							description:
								"Full name of the invention. Please fill exactly the same as in the text, separate by a space. Example: Multiple distributed feedback laser devices",
							type: "string",
						},
						"특허 출원번호": {
							description: "Number of patent applications. Example: 12506073",
							type: "string",
						},
						"특허 등록번호": {
							description: "Number of patent registrators. Example: 07864824",
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
								description:
									"Name of the institution. Example: 한국전자통신연구원",
								type: "string",
							},
							이름: {
								description: "Name. Example: 박경현",
								type: "string",
							},
							부서: {
								description: "Department. Example: 테라헤르츠창의원천연구실",
								type: "string",
							},
							직급: {
								description: "Position. Example",
								type: "string",
							},
							연락처: {
								description: "Contact number. Example: 042-860-1343",
								type: "string",
							},
							email: {
								description: "Email. Example: khp@etri.re.kr",
								type: "string",
							},
						},
					},
					연구자: {
						description: "Researcher",
						type: "object",
						properties: {
							기관명: {
								description: "Name of the institution. Example: ㈜피앤아이비",
								type: "string",
							},
							이름: {
								description: "Name of reseacher. Example: 황인수",
								type: "string",
							},
							부서: {
								description: "Department. Example: 기술사업화1팀",
								type: "string",
							},
							직급: {
								description: "Position. Example: 이사",
								type: "string",
							},
							연락처: {
								description: "Contact number. Example: 070-8299-248",
								type: "string",
							},
							email: {
								description: "Email. Example: ishwang@pnibiz.com",
								type: "string",
							},
						},
					},
				},
			},
			소속: {
				description: "Location of this research. Example: 열에너지변환연구실",
				type: "string",
			},
			주요연구분야: {
				description: "Main research area. Example: 에너지 효율, 신재생에너지",
				type: "string",
			},
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
						description:
							"Technologies overview 1. Example: 태양전지모듈, 지열교환부 및 지열 히트펌프를...",
						type: "string",
					},
					l2: {
						description:
							"Technologies overview 2. Example: 열매체가 태양열과 지열을 모두 흡수한 후...",
						type: "string",
					},
					"l...": {
						description: "More technologies overviews",
					},
					"그림 1": {
						description:
							"Figure 1 name. Example: 지열 히트펌프시스템 난방 사이클",
						type: "string",
					},
					"그림 2": {
						description: "Figure 2 name. Example: PVT-GSHP 시스템의 구성",
						type: "string",
					},
					"그림 ...": {
						description: "More figure names",
					},
				},
			},
			"기술적인 차별성": {
				type: "object",
				description:
					"Technological differentiation. Or comparison. Please add all differentiation you see",
				properties: {
					"①": {
						description:
							"Differentiation 1. Example: 송풍기로 외기를 유입시켜 열 교환을 진행하는...",
						type: "string",
					},
					"②": {
						description:
							"Differentiation 2. Example: 외부 공기 대신 15℃의 지열이...",
						type: "string",
					},
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
						"No.": { description: "Number", type: "string" },
						출원국가: {
							description: "Country of application. Example: KR",
							type: "string",
						},
						우선일: {
							description: "Priority date. Example: 2012.11.02",
							type: "string",
						},
						출원번호: {
							description: "Application number. Example: 2012-0015832",
							type: "string",
						},
						"발명의 명칭": {
							description:
								"Title of the invention. Example: 태양에너지와 지열을 융합한 열-전기 복합 생산 시스템",
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
						논문명: {
							description:
								"Name of the paper. Example: 연료전지 지열히트펌프 마이크로제너레이션...",
							type: "string",
						},
						게재지: {
							description: "Publisher. Example: 설비공학논문집",
							type: "string",
						},
						연구결과: {
							description:
								"Research results. Example: 기존 설비 대비 대체 설비비용 산출/ 에너지 소비량에 따른 유지비용 산출...",
							type: "string",
						},
					},
				},
			},
		},
	},
};

extractionFunctionSchema.parameters.required = Object.keys(
	extractionFunctionSchema.parameters.properties
);

// Instantiate the ChatOpenAI class
const model = new ChatOpenAI({ model: "gpt-4o" });

// Create a new runnable, bind the function to the model, and pipe the output through the parser
const runnable = model
	.bind({
		functions: [extractionFunctionSchema],
		function_call: {
			name: "extractor",
		},
	})
	.pipe(parser);

function ensureFields(result, schema) {
	const output = {};
	const fields = schema.parameters.properties;

	for (const field in fields) {
		output[field] = result[field] !== undefined ? result[field] : null;
	}

	return output;
}

// Convert the docs array to an array of strings
const docsContent = docs.map((doc) => doc.pageContent);

// Invoke the runnable with an input
const result = await runnable.invoke(docsContent);

const ensuredResult = ensureFields(result, extractionFunctionSchema);

fs.writeFileSync(output, JSON.stringify(ensuredResult));
