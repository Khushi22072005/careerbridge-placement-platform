
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CodingAssessment.css";

const API_BASE_URL = "http://localhost:5000/api";

const LANGUAGES = ["Python", "JavaScript", "Java", "C++"];

const PROBLEMS = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Arrays",
        description:
            "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
        example: "Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]",
        constraints: "2 <= nums.length <= 10^4\nEach input has exactly one solution.",
        starterCode: {
            Python: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n",
            JavaScript: "function twoSum(nums, target) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
            "C++": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
        },
    },
    {
        id: 2,
        title: "Reverse a String",
        difficulty: "Easy",
        topic: "Strings",
        description: "Given a string, return the string with its characters in reverse order.",
        example: 'Input: "career"\nOutput: "reerac"',
        constraints: "The input contains a sequence of characters.",
        starterCode: {
            Python: "def reverse_string(s):\n    # Write your solution here\n    pass\n",
            JavaScript: "function reverseString(s) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public String reverseString(String s) {\n        // Write your solution here\n        return \"\";\n    }\n}",
            "C++": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string reverseString(string s) {\n        // Write your solution here\n        return \"\";\n    }\n};",
        },
    },
    {
        id: 3,
        title: "Maximum Subarray",
        difficulty: "Medium",
        topic: "Arrays",
        description: "Find the contiguous subarray with the largest sum and return that sum.",
        example: "Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
        constraints: "1 <= nums.length <= 10^5",
        starterCode: {
            Python: "def max_subarray(nums):\n    # Write your solution here\n    pass\n",
            JavaScript: "function maxSubarray(nums) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "C++": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};",
        },
    },
    {
        id: 4,
        title: "Palindrome Number",
        difficulty: "Easy",
        topic: "Math",
        description: "Return true if an integer reads the same forward and backward; otherwise return false.",
        example: "Input: x = 121\nOutput: true",
        constraints: "-2^31 <= x <= 2^31 - 1",
        starterCode: {
            Python: "def is_palindrome(x):\n    # Write your solution here\n    pass\n",
            JavaScript: "function isPalindrome(x) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n};",
        },
    },
    {
        id: 5,
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stack",
        description: "Determine whether every opening bracket in a string has the correct matching closing bracket.",
        example: 'Input: s = "()[]{}"\nOutput: true',
        constraints: "1 <= s.length <= 10^4",
        starterCode: {
            Python: "def is_valid(s):\n    # Write your solution here\n    pass\n",
            JavaScript: "function isValid(s) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
            "C++": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};",
        },
    },
    {
        id: 6,
        title: "Binary Search",
        difficulty: "Easy",
        topic: "Searching",
        description: "Given a sorted array and a target, return its index or -1 if the target is not present.",
        example: "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
        constraints: "1 <= nums.length <= 10^4\nThe array is sorted in ascending order.",
        starterCode: {
            Python: "def search(nums, target):\n    # Write your solution here\n    pass\n",
            JavaScript: "function search(nums, target) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
            "C++": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};",
        },
    },
    {
        id: 7,
        title: "Merge Sorted Arrays",
        difficulty: "Medium",
        topic: "Arrays",
        description: "Merge two sorted integer arrays into one sorted array.",
        example: "Input: nums1 = [1,3,5], nums2 = [2,4,6]\nOutput: [1,2,3,4,5,6]",
        constraints: "Both input arrays are sorted in ascending order.",
        starterCode: {
            Python: "def merge_sorted(nums1, nums2):\n    # Write your solution here\n    pass\n",
            JavaScript: "function mergeSorted(nums1, nums2) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int[] mergeSorted(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
            "C++": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> mergeSorted(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return {};\n    }\n};",
        },
    },
    {
        id: 8,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        topic: "Sliding Window",
        description: "Return the length of the longest substring that contains no repeated characters.",
        example: 'Input: s = "abcabcbb"\nOutput: 3',
        constraints: "0 <= s.length <= 5 * 10^4",
        starterCode: {
            Python: "def length_of_longest_substring(s):\n    # Write your solution here\n    pass\n",
            JavaScript: "function lengthOfLongestSubstring(s) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "C++": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};",
        },
    },
    {
        id: 9,
        title: "Climbing Stairs",
        difficulty: "Easy",
        topic: "Dynamic Programming",
        description: "You can climb one or two steps at a time. Return the number of distinct ways to reach step n.",
        example: "Input: n = 4\nOutput: 5",
        constraints: "1 <= n <= 45",
        starterCode: {
            Python: "def climb_stairs(n):\n    # Write your solution here\n    pass\n",
            JavaScript: "function climbStairs(n) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};",
        },
    },
    {
        id: 10,
        title: "Longest Consecutive Sequence",
        difficulty: "Hard",
        topic: "Hash Set",
        description: "Return the length of the longest sequence of consecutive integers in an unsorted array.",
        example: "Input: nums = [100,4,200,1,3,2]\nOutput: 4",
        constraints: "0 <= nums.length <= 10^5",
        starterCode: {
            Python: "def longest_consecutive(nums):\n    # Write your solution here\n    pass\n",
            JavaScript: "function longestConsecutive(nums) {\n    // Write your solution here\n}\n",
            Java: "class Solution {\n    public int longestConsecutive(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "C++": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};",
        },
    },
];

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}

function CodingAssessment() {
    const navigate = useNavigate();

    const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
    const [difficulty, setDifficulty] = useState("All");
    const [language, setLanguage] = useState("Python");
    const [code, setCode] = useState(PROBLEMS[0].starterCode.Python);
    const [activeTab, setActiveTab] = useState("description");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [solvedProblems, setSolvedProblems] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("codingSolvedProblems") || "[]"
            );
        } catch {
            return [];
        }
    });

    const filteredProblems = useMemo(
        () =>
            difficulty === "All"
                ? PROBLEMS
                : PROBLEMS.filter(
                      (problem) => problem.difficulty === difficulty
                  ),
        [difficulty]
    );

    const chooseProblem = (problem) => {
        setSelectedProblem(problem);
        setCode(problem.starterCode[language]);
        setResult(null);
        setError("");
        setActiveTab("description");
    };

    const changeLanguage = (nextLanguage) => {
        setLanguage(nextLanguage);
        setCode(selectedProblem.starterCode[nextLanguage]);
        setResult(null);
        setError("");
    };

    const executeCode = async (mode) => {
        if (loading) return;

        if (!code.trim()) {
            setError("Please write your solution before continuing.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);
            setActiveTab("results");

            const response = await fetch(
                `${API_BASE_URL}/coding/${mode}`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        problemId: selectedProblem.id,
                        language,
                        code,
                        mode,
                    }),
                }
            );

            const data = await readResponse(response);

            setResult(data);

            const status = String(
                data.status || data.verdict || ""
            ).toLowerCase();

            if (
                mode === "submit" &&
                ["accepted", "success", "passed"].includes(status)
            ) {
                setSolvedProblems((previous) => {
                    const updated = previous.includes(selectedProblem.id)
                        ? previous
                        : [...previous, selectedProblem.id];

                    localStorage.setItem(
                        "codingSolvedProblems",
                        JSON.stringify(updated)
                    );

                    return updated;
                });
            }
        } catch (err) {
            setError(
                err.message ||
                "Unable to connect to the coding execution service."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetCode = () => {
        setCode(selectedProblem.starterCode[language]);
        setResult(null);
        setError("");
    };

    const getVerdict = () => {
        if (!result) return "";

        const status = String(
            result.status || result.verdict || ""
        ).toLowerCase();

        if (["accepted", "success", "passed"].includes(status)) {
            return "Accepted";
        }

        if (["wrong_answer", "wrong answer"].includes(status)) {
            return "Wrong Answer";
        }

        if (status.includes("time")) return "Time Limit Exceeded";
        if (status.includes("compile")) return "Compilation Error";
        if (status.includes("runtime")) return "Runtime Error";

        return result.title || result.message || "Execution Result";
    };

    return (
        <div className="coding-page">
            <header className="coding-header">
                <button
                    className="coding-back"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="coding-brand">
                    <span className="coding-brand-icon">&lt;/&gt;</span>
                    <div>
                        <strong>CareerBridge</strong>
                        <span>Coding Assessment</span>
                    </div>
                </div>

                <div className="coding-problems-count">
                    {solvedProblems.length}/{PROBLEMS.length} Solved
                </div>
            </header>

            <main className="coding-layout">
                <aside className="coding-sidebar">
                    <div className="coding-sidebar-heading">
                        <h2>Practice Problems</h2>
                        <p>Build your programming skills</p>
                    </div>

                    <label
                        className="coding-filter-label"
                        htmlFor="difficulty-filter"
                    >
                        Difficulty
                    </label>

                    <select
                        id="difficulty-filter"
                        value={difficulty}
                        onChange={(event) =>
                            setDifficulty(event.target.value)
                        }
                    >
                        <option value="All">All difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <div className="coding-problem-list">
                        {filteredProblems.map((problem) => (
                            <button
                                type="button"
                                key={problem.id}
                                className={`coding-problem-item ${
                                    selectedProblem.id === problem.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => chooseProblem(problem)}
                            >
                                <div className="coding-problem-title">
                                    <span>{problem.id}.</span>
                                    <strong>{problem.title}</strong>
                                </div>

                                <span
                                    className={`difficulty-text ${problem.difficulty.toLowerCase()}`}
                                >
                                    {problem.difficulty}
                                    {solvedProblems.includes(problem.id)
                                        ? " · ✓ Solved"
                                        : ""}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="coding-workspace">
                    <div className="coding-tabs">
                        <button
                            type="button"
                            className={
                                activeTab === "description" ? "active" : ""
                            }
                            onClick={() => setActiveTab("description")}
                        >
                            Problem
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "results" ? "active" : ""
                            }
                            onClick={() => setActiveTab("results")}
                        >
                            Results
                        </button>
                    </div>

                    {activeTab === "description" ? (
                        <div className="coding-description">
                            <h1>
                                {selectedProblem.id}. {selectedProblem.title}
                            </h1>

                            <span
                                className={`difficulty-pill ${selectedProblem.difficulty.toLowerCase()}`}
                            >
                                {selectedProblem.difficulty}
                            </span>

                            <span className="coding-topic">
                                {selectedProblem.topic}
                            </span>

                            <h3>Problem Description</h3>
                            <p>{selectedProblem.description}</p>

                            <h3>Example</h3>
                            <pre className="coding-example">
                                {selectedProblem.example}
                            </pre>

                            <h3>Constraints</h3>
                            <pre className="coding-constraints">
                                {selectedProblem.constraints}
                            </pre>

                            <div className="coding-info">
                                <strong>Before you submit</strong>
                                <p>
                                    Consider edge cases and test your
                                    solution. The backend must execute
                                    your code to provide a real verdict.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="coding-results">
                            {loading ? (
                                <>
                                    <div className="loading-spinner" />
                                    <h2>
                                        {result ? "Submitting..." : "Running your code..."}
                                    </h2>
                                    <p>
                                        Please wait while the execution
                                        service processes your solution.
                                    </p>
                                </>
                            ) : error ? (
                                <>
                                    <span className="coding-results-icon">!</span>
                                    <h2>Execution failed</h2>
                                    <p>{error}</p>
                                </>
                            ) : result ? (
                                <>
                                    <span className="coding-results-icon">
                                        {["accepted", "success", "passed"].includes(
                                            String(
                                                result.status ||
                                                result.verdict ||
                                                ""
                                            ).toLowerCase()
                                        )
                                            ? "✓"
                                            : "!"}
                                    </span>

                                    <h2>{getVerdict()}</h2>

                                    <p>
                                        {result.message ||
                                            result.stderr ||
                                            result.output ||
                                            "The execution service returned a result."}
                                    </p>

                                    {result.passedTests !== undefined && (
                                        <p>
                                            Test cases passed:{" "}
                                            <strong>{result.passedTests}</strong>
                                            {result.totalTests !== undefined &&
                                                ` / ${result.totalTests}`}
                                        </p>
                                    )}

                                    {result.executionTime !== undefined && (
                                        <p>
                                            Execution time:{" "}
                                            {result.executionTime} ms
                                        </p>
                                    )}

                                    {result.testResults && (
                                        <div className="coding-test-results">
                                            <h3>Test Case Results</h3>

                                            {result.testResults.map(
                                                (test, index) => (
                                                    <div
                                                        className="coding-test-row"
                                                        key={test.id || index}
                                                    >
                                                        <strong>
                                                            Test Case {index + 1}
                                                        </strong>
                                                        <span>
                                                            {test.passed
                                                                ? "Passed"
                                                                : "Failed"}
                                                        </span>
                                                        {test.message && (
                                                            <p>{test.message}</p>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {result.stdout && (
                                        <pre className="coding-example">
                                            {result.stdout}
                                        </pre>
                                    )}

                                    {result.stderr && (
                                        <pre className="coding-example">
                                            {result.stderr}
                                        </pre>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="coding-results-icon">i</span>
                                    <h2>No results yet</h2>
                                    <p>
                                        Run your code or submit your solution
                                        to see the execution results here.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </section>

                <section className="coding-editor-panel">
                    <div className="coding-editor-header">
                        <div>
                            <h2>Code Editor</h2>
                            <p>Write your solution below</p>
                        </div>

                        <select
                            aria-label="Programming language"
                            value={language}
                            onChange={(event) =>
                                changeLanguage(event.target.value)
                            }
                        >
                            {LANGUAGES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="coding-editor">
                        <div className="coding-editor-toolbar">
                            <span>
                                <span className="editor-dot"></span>
                                main.
                                {language === "Python"
                                    ? "py"
                                    : language === "JavaScript"
                                    ? "js"
                                    : language === "Java"
                                    ? "java"
                                    : "cpp"}
                            </span>
                            <span>Editable</span>
                        </div>

                        <textarea
                            aria-label="Code editor"
                            spellCheck="false"
                            autoCapitalize="off"
                            autoCorrect="off"
                            value={code}
                            onChange={(event) => {
                                setCode(event.target.value);
                                setResult(null);
                                setError("");
                            }}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="coding-editor-notice" role="alert">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="coding-editor-actions">
                        <button
                            type="button"
                            className="coding-run-button"
                            onClick={() => executeCode("run")}
                            disabled={loading}
                        >
                            {loading ? "Running..." : "▶ Run Code"}
                        </button>

                        <button
                            type="button"
                            className="coding-submit-button"
                            onClick={() => executeCode("submit")}
                            disabled={loading}
                        >
                            {loading
                                ? "Processing..."
                                : "Submit Solution →"}
                        </button>

                        <button
                            type="button"
                            className="coding-run-button"
                            onClick={resetCode}
                            disabled={loading}
                        >
                            Reset Code
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CodingAssessment;
