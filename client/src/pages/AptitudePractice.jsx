
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AptitudePractice.css";

const API_URL = "http://localhost:5000/api/aptitude";

const CATEGORY_DETAILS = {
    "Numerical Reasoning": {
        icon: "",
        description: "Practice percentages, ratios, averages, and numerical problems.",
    },
    "Logical Reasoning": {
        icon: "",
        description: "Improve your ability to solve patterns, sequences, and logical problems.",
    },
    "Verbal Reasoning": {
        icon: "",
        description: "Practice grammar, vocabulary, sentence completion, and word meanings.",
    },
    "Analytical Reasoning": {
        icon: "",
        description: "Develop skills in interpreting information and solving analytical problems.",
    },
};

function AptitudePractice() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingCategory, setStartingCategory] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/categories`
                );

                setCategories(response.data.categories || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load aptitude categories. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleStartTest = async (category) => {
        setError("");

        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login");
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch {
            setError("Your saved login session is invalid. Please log in again.");
            return;
        }

        // Support common user ID property names.
        const userId = Number(
            user?.id ?? user?.user_id ?? user?.userId
        );

        if (!Number.isInteger(userId) || userId <= 0) {
            setError(
                "Your user ID could not be found. Please check the user object returned by your login API."
            );
            return;
        }

        try {
            setStartingCategory(category);

            const response = await axios.post(
                `${API_URL}/start`,
                {
                    userId,
                    category,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const assessmentId = response.data.assessment?.id;

            if (!assessmentId) {
                setError("The server did not return an assessment ID.");
                return;
            }

            // Keep the selected questions for the test page.
            sessionStorage.setItem(
                `aptitudeQuestions_${assessmentId}`,
                JSON.stringify(response.data.questions)
            );

            navigate(`/aptitude-test/${assessmentId}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to start the test. Please try again."
            );
        } finally {
            setStartingCategory("");
        }
    };

    return (
        <div className="aptitude-page">
            <div className="aptitude-header">
                <span className="aptitude-eyebrow">
                    CAREERBRIDGE PRACTICE CENTER
                </span>

                <h1>Aptitude Practice</h1>

                <p>
                    Strengthen your reasoning skills with focused practice.
                    Choose a category and test your knowledge.
                </p>
            </div>

            {error && (
                <div className="aptitude-error" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="aptitude-message">
                    Loading aptitude categories...
                </div>
            ) : (
                <div className="aptitude-category-grid">
                    {categories.map((item) => {
                        const details = CATEGORY_DETAILS[item.category];

                        return (
                            <article
                                className="aptitude-category-card"
                                key={item.category}
                            >
                                <div className="aptitude-category-icon">
                                    {details?.icon || ""}
                                </div>

                                <h2>{item.category}</h2>

                                <p>
                                    {details?.description ||
                                        "Practice questions and improve your reasoning skills."}
                                </p>

                                <div className="aptitude-question-count">
                                    <span>Available questions</span>
                                    <strong>{item.questionCount}</strong>
                                </div>

                                <button
                                    type="button"
                                    className="aptitude-start-button"
                                    disabled={
                                        item.questionCount < 5 ||
                                        startingCategory !== ""
                                    }
                                    onClick={() =>
                                        handleStartTest(item.category)
                                    }
                                >
                                    {startingCategory === item.category
                                        ? "Starting..."
                                        : item.questionCount < 5
                                        ? "Coming Soon"
                                        : "Start Practice"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AptitudePractice;
