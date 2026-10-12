
const express = require("express");
const axios = require("axios");

const router = express.Router();

// =========================================================
// JUDGE0 CONFIGURATION
// =========================================================

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST;

const LANGUAGE_IDS = {
    Python: 71,
    JavaScript: 63,
    Java: 62,
    "C++": 54,
};

// =========================================================
// TEST CASES FOR ALL 10 PROBLEMS
// Inputs are supplied as structured JSON values.
// =========================================================

const TEST_CASES = {
    1: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],

    2: [
        { input: { s: "career" }, expected: "reerac" },
        { input: { s: "hello" }, expected: "olleh" },
        { input: { s: "a" }, expected: "a" },
        { input: { s: "" }, expected: "" },
    ],

    3: [
        {
            input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
            expected: 6,
        },
        { input: { nums: [1] }, expected: 1 },
        { input: { nums: [-5] }, expected: -5 },
        { input: { nums: [-3, -2, -7] }, expected: -2 },
        { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
    ],

    4: [
        { input: { x: 121 }, expected: true },
        { input: { x: -121 }, expected: false },
        { input: { x: 10 }, expected: false },
        { input: { x: 0 }, expected: true },
    ],

    5: [
        { input: { s: "()[]{}" }, expected: true },
        { input: { s: "(]" }, expected: false },
        { input: { s: "([{}])" }, expected: true },
        { input: { s: "(" }, expected: false },
        { input: { s: "" }, expected: true },
    ],

    6: [
        {
            input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
            expected: 4,
        },
        {
            input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 },
            expected: -1,
        },
        { input: { nums: [5], target: 5 }, expected: 0 },
        { input: { nums: [1, 3, 5, 7], target: 7 }, expected: 3 },
    ],

    7: [
        {
            input: { nums1: [1, 3, 5], nums2: [2, 4, 6] },
            expected: [1, 2, 3, 4, 5, 6],
        },
        {
            input: { nums1: [1, 2], nums2: [3, 4] },
            expected: [1, 2, 3, 4],
        },
        {
            input: { nums1: [], nums2: [1, 2] },
            expected: [1, 2],
        },
    ],

    8: [
        { input: { s: "abcabcbb" }, expected: 3 },
        { input: { s: "bbbbb" }, expected: 1 },
        { input: { s: "pwwkew" }, expected: 3 },
        { input: { s: "" }, expected: 0 },
        { input: { s: "abcdef" }, expected: 6 },
    ],

    9: [
        { input: { n: 4 }, expected: 5 },
        { input: { n: 1 }, expected: 1 },
        { input: { n: 2 }, expected: 2 },
        { input: { n: 5 }, expected: 8 },
    ],

    10: [
        {
            input: { nums: [100, 4, 200, 1, 3, 2] },
            expected: 4,
        },
        {
            input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] },
            expected: 9,
        },
        { input: { nums: [] }, expected: 0 },
        { input: { nums: [1, 2, 0, 1] }, expected: 3 },
        { input: { nums: [5] }, expected: 1 },
    ],
};

// =========================================================
// OUTPUT NORMALIZATION
// =========================================================

function normalizeOutput(value) {
    return String(value ?? "")
        .trim()
        .replace(/\s+/g, "");
}

function json(value) {
    return JSON.stringify(value);
}

// =========================================================
// BUILD EXECUTABLE PROGRAMS
//
// Python and JavaScript: function snippets + test harness.
// Java and C++: Solution class + executable main method.
//
// Function names match CodingAssessment.jsx.
// =========================================================

function buildSourceCode(problemId, language, code, input) {
    const id = Number(problemId);

    const py = {
        1: `print(two_sum(${json(input.nums)}, ${input.target}))`,
        2: `print(reverse_string(${json(input.s)}))`,
        3: `print(max_subarray(${json(input.nums)}))`,
        4: `print(str(is_palindrome(${input.x})).lower())`,
        5: `print(str(is_valid(${json(input.s)})).lower())`,
        6: `print(search(${json(input.nums)}, ${input.target}))`,
        7: `print(merge_sorted(${json(input.nums1)}, ${json(input.nums2)}))`,
        8: `print(length_of_longest_substring(${json(input.s)}))`,
        9: `print(climb_stairs(${input.n}))`,
        10: `print(longest_consecutive(${json(input.nums)}))`,
    };

    const js = {
        1: `console.log(JSON.stringify(twoSum(${json(input.nums)}, ${input.target})));`,
        2: `console.log(reverseString(${json(input.s)}));`,
        3: `console.log(maxSubarray(${json(input.nums)}));`,
        4: `console.log(isPalindrome(${input.x}));`,
        5: `console.log(isValid(${json(input.s)}));`,
        6: `console.log(search(${json(input.nums)}, ${input.target}));`,
        7: `console.log(JSON.stringify(mergeSorted(${json(input.nums1)}, ${json(input.nums2)})));`,
        8: `console.log(lengthOfLongestSubstring(${json(input.s)}));`,
        9: `console.log(climbStairs(${input.n}));`,
        10: `console.log(longestConsecutive(${json(input.nums)}));`,
    };

    if (language === "Python") {
        return `${code}\n\n${py[id]}`;
    }

    if (language === "JavaScript") {
        return `${code}\n\n${js[id]}`;
    }

    // Java and C++ require a separate executable harness.
    const javaCalls = {
        1: `System.out.println(Arrays.toString(new Solution().twoSum(new int[]{${input.nums.join(",")}}, ${input.target})));`,
        2: `System.out.println(new Solution().reverseString(${JSON.stringify(input.s)}));`,
        3: `System.out.println(new Solution().maxSubArray(new int[]{${input.nums.join(",")}}));`,
        4: `System.out.println(new Solution().isPalindrome(${input.x}));`,
        5: `System.out.println(new Solution().isValid(${JSON.stringify(input.s)}));`,
        6: `System.out.println(new Solution().search(new int[]{${input.nums.join(",")}}, ${input.target}));`,
        7: `System.out.println(Arrays.toString(new Solution().mergeSorted(new int[]{${input.nums1.join(",")}}, new int[]{${input.nums2.join(",")}})));`,
        8: `System.out.println(new Solution().lengthOfLongestSubstring(${JSON.stringify(input.s)}));`,
        9: `System.out.println(new Solution().climbStairs(${input.n}));`,
        10: `System.out.println(new Solution().longestConsecutive(new int[]{${(input.nums || []).join(",")}}));`,
    };

    const cppCalls = {
        1: `auto r = Solution().twoSum(vector<int>{${input.nums.join(",")}}, ${input.target}); cout << "["; for (int i=0;i<(int)r.size();i++){if(i)cout<<", ";cout<<r[i];} cout<<"]";`,
        2: `cout << Solution().reverseString(${JSON.stringify(input.s)});`,
        3: `cout << Solution().maxSubArray(vector<int>{${input.nums.join(",")}});`,
        4: `cout << (Solution().isPalindrome(${input.x}) ? "true" : "false");`,
        5: `cout << (Solution().isValid(${JSON.stringify(input.s)}) ? "true" : "false");`,
        6: `cout << Solution().search(vector<int>{${input.nums.join(",")}}, ${input.target});`,
        7: `auto r = Solution().mergeSorted(vector<int>{${input.nums1.join(",")}}, vector<int>{${input.nums2.join(",")}}); cout << "["; for (int i=0;i<(int)r.size();i++){if(i)cout<<", ";cout<<r[i];} cout<<"]";`,
        8: `cout << Solution().lengthOfLongestSubstring(${JSON.stringify(input.s)});`,
        9: `cout << Solution().climbStairs(${input.n});`,
        10: `cout << Solution().longestConsecutive(vector<int>{${(input.nums || []).join(",")}});`,
    };

    if (language === "Java") {
        return `import java.util.*;\n${code}\n\nclass Main {\n public static void main(String[] args) {\n  ${javaCalls[id]}\n }\n}`;
    }

    if (language === "C++") {
        return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_set>\n#include <unordered_map>\nusing namespace std;\n${code}\n\nint main() {\n ${cppCalls[id]}\n return 0;\n}`;
    }

    throw new Error("Unsupported language.");
}

// =========================================================
// POST /api/coding/run
// POST /api/coding/submit
// =========================================================

router.post("/:mode", async (req, res) => {
    try {
        const { mode } = req.params;
        const { problemId, language, code } = req.body;

        if (!["run", "submit"].includes(mode)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid execution mode.",
            });
        }

        const id = Number(problemId);

        if (
            !Number.isInteger(id) ||
            !TEST_CASES[id] ||
            !LANGUAGE_IDS[language] ||
            typeof code !== "string" ||
            !code.trim()
        ) {
            return res.status(400).json({
                status: "error",
                message: "A valid problem, language, and solution are required.",
            });
        }

        if (!JUDGE0_URL) {
            return res.status(500).json({
                status: "error",
                message: "Set JUDGE0_URL in your backend .env file.",
            });
        }

        const headers = {
            "Content-Type": "application/json",
        };

        if (JUDGE0_API_KEY) {
            headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
        }

        if (JUDGE0_HOST) {
            headers["X-RapidAPI-Host"] = JUDGE0_HOST;
        }

        const baseUrl = JUDGE0_URL.replace(/\/+$/, "");
        const cases = TEST_CASES[id];
        const casesToRun = mode === "run" ? cases.slice(0, 1) : cases;
        const results = [];

        for (const test of casesToRun) {
            const sourceCode = buildSourceCode(
                id,
                language,
                code,
                test.input
            );

            const response = await axios.post(
                `${baseUrl}/submissions?base64_encoded=false&wait=true`,
                {
                    language_id: LANGUAGE_IDS[language],
                    source_code: sourceCode,
                    stdin: "",
                },
                {
                    headers,
                    timeout: 30000,
                }
            );

            const data = response.data;
            const statusId = data.status?.id;
            const stdout = data.stdout || "";
            const stderr = data.stderr || "";
            const compileOutput = data.compile_output || "";

            const expectedOutput =
                typeof test.expected === "string"
                    ? test.expected
                    : json(test.expected);

            const passed =
                statusId === 3 &&
                normalizeOutput(stdout) ===
                    normalizeOutput(expectedOutput);

            results.push({
                status: data.status?.description || "Unknown",
                statusId,
                input: test.input,
                expectedOutput,
                stdout,
                stderr,
                compile_output: compileOutput,
                time: data.time ?? null,
                memory: data.memory ?? null,
                passed,
            });

            if (statusId !== 3 && statusId !== 4) {
                break;
            }
        }

        const passedTests = results.filter((item) => item.passed).length;
        const totalTests = results.length;
        const accepted =
            totalTests === casesToRun.length &&
            passedTests === totalTests;

        const executionError = results.some(
            (item) => item.statusId !== 3 && item.statusId !== 4
        );

        let status = accepted ? "accepted" : "wrong_answer";
        let title = accepted ? "Accepted" : "Wrong Answer";

        if (executionError) {
            status = "error";
            title = "Execution failed";
        }

        return res.json({
            status,
            title,
            message: `${passedTests} of ${totalTests} test cases passed.`,
            passedTests,
            totalTests,
            executionTime:
                results.reduce(
                    (total, item) => total + Number(item.time || 0),
                    0
                ) * 1000,
            testResults: results,
            stdout: results.map((item) => item.stdout).join("\n"),
            stderr: results
                .map((item) => item.stderr || item.compile_output)
                .filter(Boolean)
                .join("\n"),
        });
    } catch (error) {
        console.error(
            "Coding execution error:",
            error.response?.data || error.message
        );

        if (error.code === "ECONNABORTED") {
            return res.status(504).json({
                status: "error",
                message: "Execution timed out. Please try again.",
            });
        }

        return res.status(502).json({
            status: "error",
            message:
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "The execution service could not process your request.",
        });
    }
});

module.exports = router;
