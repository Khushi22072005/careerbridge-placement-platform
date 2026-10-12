
const codingProblems = [
    // ==================== ARRAYS ====================
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Arrays",
        description: "Given an array of integers nums and an integer target, return the indices of two numbers whose sum equals target.",
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
        constraints: "2 <= nums.length <= 10^4",
        starterCode: {
            Python: "def two_sum(nums, target):\n    pass",
            JavaScript: "function twoSum(nums, target) {\n    // Your code\n}",
            Java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
            { input: "[3,2,4]\n6", expectedOutput: "[1,2]" }
        ]
    },
    {
        id: 2,
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        topic: "Arrays",
        description: "Given daily stock prices, find the maximum profit possible from one buy and one later sell. Return 0 if no profit is possible.",
        example: "Input: [7,1,5,3,6,4]\nOutput: 5",
        constraints: "1 <= prices.length <= 10^5",
        starterCode: {
            Python: "def max_profit(prices):\n    pass",
            JavaScript: "function maxProfit(prices) {\n    // Your code\n}",
            Java: "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
            { input: "[7,6,4,3,1]", expectedOutput: "0" }
        ]
    },
    {
        id: 3,
        title: "Contains Duplicate",
        difficulty: "Easy",
        topic: "Arrays",
        description: "Return true if any value appears at least twice in the integer array; otherwise return false.",
        example: "Input: [1,2,3,1]\nOutput: true",
        constraints: "1 <= nums.length <= 10^5",
        starterCode: {
            Python: "def contains_duplicate(nums):\n    pass",
            JavaScript: "function containsDuplicate(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};"
        },
        testCases: [
            { input: "[1,2,3,1]", expectedOutput: "true" },
            { input: "[1,2,3,4]", expectedOutput: "false" }
        ]
    },
    {
        id: 4,
        title: "Maximum Subarray",
        difficulty: "Medium",
        topic: "Arrays",
        description: "Find the contiguous subarray with the largest sum and return that sum.",
        example: "Input: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
        constraints: "1 <= nums.length <= 10^5",
        starterCode: {
            Python: "def max_subarray(nums):\n    pass",
            JavaScript: "function maxSubarray(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
            { input: "[1]", expectedOutput: "1" }
        ]
    },
    {
        id: 5,
        title: "Product of Array Except Self",
        difficulty: "Medium",
        topic: "Arrays",
        description: "Return an array where each element is the product of all input elements except the element at that index. Do not use division.",
        example: "Input: [1,2,3,4]\nOutput: [24,12,8,6]",
        constraints: "2 <= nums.length <= 10^5",
        starterCode: {
            Python: "def product_except_self(nums):\n    pass",
            JavaScript: "function productExceptSelf(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" }
        ]
    },
    {
        id: 6,
        title: "Trapping Rain Water",
        difficulty: "Hard",
        topic: "Arrays",
        description: "Given non-negative bar heights, calculate how much rainwater can be trapped between the bars.",
        example: "Input: [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
        constraints: "1 <= height.length <= 2 * 10^4",
        starterCode: {
            Python: "def trap(height):\n    pass",
            JavaScript: "function trap(height) {\n    // Your code\n}",
            Java: "class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" }
        ]
    },

    // ==================== STRINGS ====================
    {
        id: 7,
        title: "Reverse a String",
        difficulty: "Easy",
        topic: "Strings",
        description: "Return the input string with its characters in reverse order.",
        example: 'Input: "career"\nOutput: "reerac"',
        constraints: "The input contains a sequence of characters.",
        starterCode: {
            Python: "def reverse_string(s):\n    pass",
            JavaScript: "function reverseString(s) {\n    // Your code\n}",
            Java: "class Solution {\n    public String reverseString(String s) {\n        return \"\";\n    }\n}",
            "C++": "class Solution {\npublic:\n    string reverseString(string s) {\n        return \"\";\n    }\n};"
        },
        testCases: [
            { input: '"career"', expectedOutput: '"reerac"' },
            { input: '"hello"', expectedOutput: '"olleh"' }
        ]
    },
    {
        id: 8,
        title: "Valid Palindrome",
        difficulty: "Easy",
        topic: "Strings",
        description: "Check whether a string is a palindrome after converting letters to lowercase and ignoring non-alphanumeric characters.",
        example: 'Input: "A man, a plan, a canal: Panama"\nOutput: true',
        constraints: "1 <= s.length <= 2 * 10^5",
        starterCode: {
            Python: "def is_palindrome(s):\n    pass",
            JavaScript: "function isPalindrome(s) {\n    // Your code\n}",
            Java: "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};"
        },
        testCases: [
            { input: '"A man, a plan, a canal: Panama"', expectedOutput: "true" },
            { input: '"race a car"', expectedOutput: "false" }
        ]
    },
    {
        id: 9,
        title: "Valid Anagram",
        difficulty: "Easy",
        topic: "Strings",
        description: "Determine whether two strings contain the same characters with the same frequencies.",
        example: 'Input: s = "anagram", t = "nagaram"\nOutput: true',
        constraints: "The strings contain lowercase English letters.",
        starterCode: {
            Python: "def is_anagram(s, t):\n    pass",
            JavaScript: "function isAnagram(s, t) {\n    // Your code\n}",
            Java: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};"
        },
        testCases: [
            { input: '"anagram"\n"nagaram"', expectedOutput: "true" },
            { input: '"rat"\n"car"', expectedOutput: "false" }
        ]
    },
    {
        id: 10,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        topic: "Strings",
        description: "Return the length of the longest substring containing no repeated characters.",
        example: 'Input: "abcabcbb"\nOutput: 3',
        constraints: "0 <= s.length <= 5 * 10^4",
        starterCode: {
            Python: "def length_of_longest_substring(s):\n    pass",
            JavaScript: "function lengthOfLongestSubstring(s) {\n    // Your code\n}",
            Java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: '"abcabcbb"', expectedOutput: "3" },
            { input: '"bbbbb"', expectedOutput: "1" }
        ]
    },
    {
        id: 11,
        title: "Group Anagrams",
        difficulty: "Medium",
        topic: "Strings",
        description: "Group strings that are anagrams of one another.",
        example: 'Input: ["eat","tea","tan","ate","nat","bat"]\nOutput: Groups of anagrams',
        constraints: "1 <= strs.length <= 10^4",
        starterCode: {
            Python: "def group_anagrams(strs):\n    pass",
            JavaScript: "function groupAnagrams(strs) {\n    // Your code\n}",
            Java: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: "Groups of anagrams" }
        ]
    },
    {
        id: 12,
        title: "Minimum Window Substring",
        difficulty: "Hard",
        topic: "Strings",
        description: "Find the shortest substring of s containing every character in t, including character frequencies.",
        example: 'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"',
        constraints: "1 <= s.length, t.length <= 10^5",
        starterCode: {
            Python: "def min_window(s, t):\n    pass",
            JavaScript: "function minWindow(s, t) {\n    // Your code\n}",
            Java: "class Solution {\n    public String minWindow(String s, String t) {\n        return \"\";\n    }\n}",
            "C++": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        return \"\";\n    }\n};"
        },
        testCases: [
            { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"' }
        ]
    },

    // ==================== SEARCHING & SORTING ====================
    {
        id: 13,
        title: "Binary Search",
        difficulty: "Easy",
        topic: "Searching & Sorting",
        description: "Find the index of target in a sorted array. Return -1 if it does not exist.",
        example: "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
        constraints: "The array is sorted in ascending order.",
        starterCode: {
            Python: "def search(nums, target):\n    pass",
            JavaScript: "function search(nums, target) {\n    // Your code\n}",
            Java: "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};"
        },
        testCases: [
            { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4" },
            { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1" }
        ]
    },
    {
        id: 14,
        title: "Merge Sorted Array",
        difficulty: "Easy",
        topic: "Searching & Sorting",
        description: "Merge two sorted arrays into one sorted array.",
        example: "Input: [1,2,3], [2,5,6]\nOutput: [1,2,2,3,5,6]",
        constraints: "Both input arrays are sorted in ascending order.",
        starterCode: {
            Python: "def merge_sorted(nums1, nums2):\n    pass",
            JavaScript: "function mergeSorted(nums1, nums2) {\n    // Your code\n}",
            Java: "class Solution {\n    public int[] mergeSorted(int[] nums1, int[] nums2) {\n        return new int[]{};\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<int> mergeSorted(vector<int>& nums1, vector<int>& nums2) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: "[1,2,3]\n[2,5,6]", expectedOutput: "[1,2,2,3,5,6]" }
        ]
    },
    {
        id: 15,
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        topic: "Searching & Sorting",
        description: "Search for target in a rotated sorted array of distinct values. Return its index or -1.",
        example: "Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4",
        constraints: "All array values are distinct.",
        starterCode: {
            Python: "def search_rotated(nums, target):\n    pass",
            JavaScript: "function searchRotated(nums, target) {\n    // Your code\n}",
            Java: "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};"
        },
        testCases: [
            { input: "[4,5,6,7,0,1,2]\n0", expectedOutput: "4" }
        ]
    },
    {
        id: 16,
        title: "Sort Colors",
        difficulty: "Medium",
        topic: "Searching & Sorting",
        description: "Sort an array containing only 0, 1, and 2 in-place.",
        example: "Input: [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]",
        constraints: "The array contains only 0, 1, and 2.",
        starterCode: {
            Python: "def sort_colors(nums):\n    pass",
            JavaScript: "function sortColors(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public void sortColors(int[] nums) {\n    }\n}",
            "C++": "class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n    }\n};"
        },
        testCases: [
            { input: "[2,0,2,1,1,0]", expectedOutput: "[0,0,1,1,2,2]" }
        ]
    },

    // ==================== HASHING ====================
    {
        id: 17,
        title: "Top K Frequent Elements",
        difficulty: "Medium",
        topic: "Hashing",
        description: "Return the k most frequent elements in an integer array.",
        example: "Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]",
        constraints: "1 <= nums.length <= 10^5",
        starterCode: {
            Python: "def top_k_frequent(nums, k):\n    pass",
            JavaScript: "function topKFrequent(nums, k) {\n    // Your code\n}",
            Java: "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        return new int[]{};\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: "[1,1,1,2,2,3]\n2", expectedOutput: "[1,2]" }
        ]
    },
    {
        id: 18,
        title: "Longest Consecutive Sequence",
        difficulty: "Hard",
        topic: "Hashing",
        description: "Find the length of the longest sequence of consecutive integers in an unsorted array.",
        example: "Input: [100,4,200,1,3,2]\nOutput: 4",
        constraints: "0 <= nums.length <= 10^5",
        starterCode: {
            Python: "def longest_consecutive(nums):\n    pass",
            JavaScript: "function longestConsecutive(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public int longestConsecutive(int[] nums) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[100,4,200,1,3,2]", expectedOutput: "4" }
        ]
    },

    // ==================== LINKED LISTS ====================
    {
        id: 19,
        title: "Reverse Linked List",
        difficulty: "Easy",
        topic: "Linked Lists",
        description: "Reverse a singly linked list and return its new head.",
        example: "Input: [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
        constraints: "The list may be empty.",
        starterCode: {
            Python: "def reverse_list(head):\n    pass",
            JavaScript: "function reverseList(head) {\n    // Your code\n}",
            Java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return head;\n    }\n}",
            "C++": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return head;\n    }\n};"
        },
        testCases: [
            { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" }
        ]
    },
    {
        id: 20,
        title: "Linked List Cycle",
        difficulty: "Easy",
        topic: "Linked Lists",
        description: "Determine whether a linked list contains a cycle.",
        example: "Input: head = [3,2,0,-4], cycle position = 1\nOutput: true",
        constraints: "The list may be empty.",
        starterCode: {
            Python: "def has_cycle(head):\n    pass",
            JavaScript: "function hasCycle(head) {\n    // Your code\n}",
            Java: "class Solution {\n    public boolean hasCycle(ListNode head) {\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool hasCycle(ListNode* head) {\n        return false;\n    }\n};"
        },
        testCases: [
            { input: "List with cycle", expectedOutput: "true" }
        ]
    },
    {
        id: 21,
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        topic: "Linked Lists",
        description: "Merge two sorted linked lists into one sorted linked list.",
        example: "Input: [1,2,4], [1,3,4]\nOutput: [1,1,2,3,4,4]",
        constraints: "Both lists are sorted.",
        starterCode: {
            Python: "def merge_two_lists(list1, list2):\n    pass",
            JavaScript: "function mergeTwoLists(list1, list2) {\n    // Your code\n}",
            Java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return null;\n    }\n}",
            "C++": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return nullptr;\n    }\n};"
        },
        testCases: [
            { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]" }
        ]
    },

    // ==================== STACKS & QUEUES ====================
    {
        id: 22,
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stacks & Queues",
        description: "Determine whether brackets in a string are correctly opened and closed in the right order.",
        example: 'Input: "()[]{}"\nOutput: true',
        constraints: "1 <= s.length <= 10^4",
        starterCode: {
            Python: "def is_valid(s):\n    pass",
            JavaScript: "function isValid(s) {\n    // Your code\n}",
            Java: "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
            "C++": "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};"
        },
        testCases: [
            { input: '"()[]{}"', expectedOutput: "true" },
            { input: '"(]"', expectedOutput: "false" }
        ]
    },
    {
        id: 23,
        title: "Min Stack",
        difficulty: "Medium",
        topic: "Stacks & Queues",
        description: "Design a stack supporting push, pop, top, and retrieving the minimum element in constant time.",
        example: "Operations: push(-2), push(0), push(-3), getMin()\nOutput: -3",
        constraints: "Operations include push, pop, top, and getMin.",
        starterCode: {
            Python: "class MinStack:\n    def __init__(self):\n        pass\n\n    def push(self, val):\n        pass\n\n    def pop(self):\n        pass\n\n    def top(self):\n        pass\n\n    def get_min(self):\n        pass",
            JavaScript: "class MinStack {\n    constructor() {}\n    push(val) {}\n    pop() {}\n    top() {}\n    getMin() {}\n}",
            Java: "class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}",
            "C++": "class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};"
        },
        testCases: [
            { input: "push(-2), push(0), push(-3), getMin()", expectedOutput: "-3" }
        ]
    },
    {
        id: 24,
        title: "Largest Rectangle in Histogram",
        difficulty: "Hard",
        topic: "Stacks & Queues",
        description: "Find the largest rectangular area that can be formed within a histogram.",
        example: "Input: [2,1,5,6,2,3]\nOutput: 10",
        constraints: "1 <= heights.length <= 10^5",
        starterCode: {
            Python: "def largest_rectangle_area(heights):\n    pass",
            JavaScript: "function largestRectangleArea(heights) {\n    // Your code\n}",
            Java: "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[2,1,5,6,2,3]", expectedOutput: "10" }
        ]
    },

    // ==================== RECURSION ====================
    {
        id: 25,
        title: "Fibonacci Number",
        difficulty: "Easy",
        topic: "Recursion",
        description: "Return the nth Fibonacci number, where F(0) = 0 and F(1) = 1.",
        example: "Input: n = 6\nOutput: 8",
        constraints: "0 <= n <= 30",
        starterCode: {
            Python: "def fib(n):\n    pass",
            JavaScript: "function fib(n) {\n    // Your code\n}",
            Java: "class Solution {\n    public int fib(int n) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int fib(int n) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "6", expectedOutput: "8" },
            { input: "2", expectedOutput: "1" }
        ]
    },
    {
        id: 26,
        title: "Pow(x, n)",
        difficulty: "Medium",
        topic: "Recursion",
        description: "Calculate x raised to the power n.",
        example: "Input: x = 2.0, n = 10\nOutput: 1024.0",
        constraints: "-100.0 < x < 100.0",
        starterCode: {
            Python: "def my_pow(x, n):\n    pass",
            JavaScript: "function myPow(x, n) {\n    // Your code\n}",
            Java: "class Solution {\n    public double myPow(double x, int n) {\n        return 0.0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    double myPow(double x, int n) {\n        return 0.0;\n    }\n};"
        },
        testCases: [
            { input: "2.0\n10", expectedOutput: "1024.0" }
        ]
    },

    // ==================== TREES ====================
    {
        id: 27,
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        topic: "Trees",
        description: "Return the maximum depth of a binary tree.",
        example: "Input: [3,9,20,null,null,15,7]\nOutput: 3",
        constraints: "The tree may be empty.",
        starterCode: {
            Python: "def max_depth(root):\n    pass",
            JavaScript: "function maxDepth(root) {\n    // Your code\n}",
            Java: "class Solution {\n    public int maxDepth(TreeNode root) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[3,9,20,null,null,15,7]", expectedOutput: "3" }
        ]
    },
    {
        id: 28,
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        topic: "Trees",
        description: "Return the values of a binary tree grouped by level from top to bottom.",
        example: "Input: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
        constraints: "The tree may be empty.",
        starterCode: {
            Python: "def level_order(root):\n    pass",
            JavaScript: "function levelOrder(root) {\n    // Your code\n}",
            Java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        return new ArrayList<>();\n    }\n}",
            "C++": "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};"
        },
        testCases: [
            { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" }
        ]
    },
    {
        id: 29,
        title: "Binary Tree Maximum Path Sum",
        difficulty: "Hard",
        topic: "Trees",
        description: "Find the maximum sum of a non-empty path in a binary tree. A path can begin and end at any nodes.",
        example: "Input: [1,2,3]\nOutput: 6",
        constraints: "The tree contains at least one node.",
        starterCode: {
            Python: "def max_path_sum(root):\n    pass",
            JavaScript: "function maxPathSum(root) {\n    // Your code\n}",
            Java: "class Solution {\n    public int maxPathSum(TreeNode root) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[1,2,3]", expectedOutput: "6" }
        ]
    },

    // ==================== DYNAMIC PROGRAMMING ====================
    {
        id: 30,
        title: "Climbing Stairs",
        difficulty: "Easy",
        topic: "Dynamic Programming",
        description: "You can climb one or two steps at a time. Return the number of distinct ways to reach step n.",
        example: "Input: n = 3\nOutput: 3",
        constraints: "1 <= n <= 45",
        starterCode: {
            Python: "def climb_stairs(n):\n    pass",
            JavaScript: "function climbStairs(n) {\n    // Your code\n}",
            Java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "2", expectedOutput: "2" },
            { input: "3", expectedOutput: "3" }
        ]
    },
    {
        id: 31,
        title: "House Robber",
        difficulty: "Medium",
        topic: "Dynamic Programming",
        description: "Find the maximum amount that can be robbed without robbing two adjacent houses.",
        example: "Input: [2,7,9,3,1]\nOutput: 12",
        constraints: "1 <= nums.length <= 100",
        starterCode: {
            Python: "def rob(nums):\n    pass",
            JavaScript: "function rob(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public int rob(int[] nums) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[2,7,9,3,1]", expectedOutput: "12" }
        ]
    },
    {
        id: 32,
        title: "Longest Increasing Subsequence",
        difficulty: "Medium",
        topic: "Dynamic Programming",
        description: "Return the length of the longest strictly increasing subsequence in an integer array.",
        example: "Input: [10,9,2,5,3,7,101,18]\nOutput: 4",
        constraints: "1 <= nums.length <= 2500",
        starterCode: {
            Python: "def length_of_lis(nums):\n    pass",
            JavaScript: "function lengthOfLIS(nums) {\n    // Your code\n}",
            Java: "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: "[10,9,2,5,3,7,101,18]", expectedOutput: "4" }
        ]
    },
    {
        id: 33,
        title: "Edit Distance",
        difficulty: "Hard",
        topic: "Dynamic Programming",
        description: "Find the minimum number of insertions, deletions, and replacements required to convert one word into another.",
        example: 'Input: word1 = "horse", word2 = "ros"\nOutput: 3',
        constraints: "0 <= word1.length, word2.length <= 500",
        starterCode: {
            Python: "def min_distance(word1, word2):\n    pass",
            JavaScript: "function minDistance(word1, word2) {\n    // Your code\n}",
            Java: "class Solution {\n    public int minDistance(String word1, String word2) {\n        return 0;\n    }\n}",
            "C++": "class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        return 0;\n    }\n};"
        },
        testCases: [
            { input: '"horse"\n"ros"', expectedOutput: "3" }
        ]
    }
];

export default codingProblems;
